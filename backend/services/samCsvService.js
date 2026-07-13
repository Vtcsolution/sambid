// backend/services/samCsvService.js
//
// Description backfill from SAM.gov's PUBLIC daily CSV extract.
//
// Why: the v2 search API returns each record's description as a URL, and
// resolving it costs 1 API call per record. Personal SAM.gov keys have a tiny
// daily quota (observed ~10-25 calls/day/key), so per-record resolution can
// never keep up. But SAM.gov also publishes "Contract Opportunities Full CSV"
// every night — a public S3 file with NO api key and NO quota that contains
// the FULL description text for every notice. This service streams that file
// and fills in the description for every record still holding a URL.
//
// File: ~300-600MB, updated daily ~03:30 UTC. Streamed + parsed row by row —
// memory stays flat regardless of file size.

import axios from 'axios';
import Opportunity from '../models/Opportunity.js';

const CSV_URL =
  'https://s3.amazonaws.com/falextracts/Contract%20Opportunities/datagov/ContractOpportunitiesFullCSV.csv';

const URL_DESC = /^https?:\/\/.*api\.sam\.gov/;

// Minimal RFC-4180 streaming CSV parser. Handles quoted fields, embedded
// commas/newlines, and "" escapes. Calls onRow(fields) per complete row.
const createCsvStreamParser = (onRow) => {
  let field = '';
  let row = [];
  let inQuotes = false;
  let prevQuote = false; // saw a quote while inQuotes — might be escape or close

  const endField = () => { row.push(field); field = ''; };
  const endRow = () => {
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) onRow(row);
    row = [];
  };

  return {
    write(chunk) {
      for (let i = 0; i < chunk.length; i++) {
        const c = chunk[i];
        if (inQuotes) {
          if (prevQuote) {
            prevQuote = false;
            if (c === '"') { field += '"'; continue; }   // escaped quote
            inQuotes = false;                              // closing quote — fall through
            if (c === ',') { endField(); continue; }
            if (c === '\n') { endField(); endRow(); continue; }
            if (c === '\r') { continue; }
            field += c; continue;                          // malformed but tolerate
          }
          if (c === '"') { prevQuote = true; continue; }
          field += c;
        } else {
          if (c === '"') { inQuotes = true; continue; }
          if (c === ',') { endField(); continue; }
          if (c === '\n') { endField(); endRow(); continue; }
          if (c === '\r') { continue; }
          field += c;
        }
      }
    },
    end() {
      if (prevQuote) inQuotes = false;
      if (field !== '' || row.length) { endField(); endRow(); }
    },
  };
};

const cleanDescription = (raw) =>
  String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 15000);

// ─── Main backfill ────────────────────────────────────────────────────────────
// Streams the public CSV and sets `description` for every Opportunity whose
// description is still an api.sam.gov URL. Matches by noticeId. Zero API quota.
export const backfillDescriptionsFromCsv = async () => {
  // 1. Which records need a description? (noticeId → _id)
  const pending = await Opportunity.find(
    { description: { $regex: URL_DESC }, noticeId: { $exists: true, $ne: '' } },
    { _id: 1, noticeId: 1 }
  ).lean();

  if (!pending.length) {
    console.log('📄 CSV backfill: no records with unresolved descriptions — skipping');
    return { matched: 0, updated: 0, pending: 0 };
  }
  const wanted = new Map(pending.map(p => [String(p.noticeId).toLowerCase().replace(/-/g, ''), p._id]));
  console.log(`\n📄 CSV BACKFILL — ${wanted.size} records need descriptions`);
  console.log(`   Downloading SAM.gov public daily extract (no API key, no quota)...`);

  // 2. Stream the CSV
  const res = await axios.get(CSV_URL, { responseType: 'stream', timeout: 120000 });

  let header = null;
  let idxNotice = -1;
  let idxDesc = -1;
  let rowsSeen = 0;
  let matched = 0;
  let ops = [];
  const flushes = [];

  const flush = () => {
    if (!ops.length) return;
    const batch = ops;
    ops = [];
    flushes.push(Opportunity.bulkWrite(batch, { ordered: false }).catch(e =>
      console.warn('  ⚠️ CSV backfill batch error:', e.message)));
  };

  const parser = createCsvStreamParser((row) => {
    if (!header) {
      header = row.map(h => h.replace(/^﻿/, '').trim());
      idxNotice = header.indexOf('NoticeId');
      idxDesc = header.indexOf('Description');
      if (idxNotice === -1 || idxDesc === -1) {
        throw new Error(`CSV columns not found (NoticeId=${idxNotice}, Description=${idxDesc})`);
      }
      return;
    }
    rowsSeen++;
    const noticeId = String(row[idxNotice] || '').toLowerCase().replace(/-/g, '');
    if (!noticeId || !wanted.has(noticeId)) return;
    const desc = cleanDescription(row[idxDesc]);
    if (desc.length < 5) return;
    ops.push({
      updateOne: {
        filter: { _id: wanted.get(noticeId), description: { $regex: URL_DESC } },
        update: { $set: { description: desc } },
      },
    });
    wanted.delete(noticeId); // first occurrence wins; shrinks the map as we go
    matched++;
    if (ops.length >= 500) flush();
    if (matched % 500 === 0) console.log(`  📄 Progress: ${matched} descriptions matched (rows scanned: ${rowsSeen})`);
  });

  await new Promise((resolve, reject) => {
    res.data.setEncoding('utf8');
    res.data.on('data', (chunk) => {
      try { parser.write(chunk); } catch (e) { res.data.destroy(); reject(e); }
    });
    res.data.on('end', () => { try { parser.end(); resolve(); } catch (e) { reject(e); } });
    res.data.on('error', reject);
  });

  flush();
  await Promise.all(flushes);

  console.log(`   ✅ CSV backfill done — rows scanned: ${rowsSeen}, descriptions filled: ${matched}, still missing: ${wanted.size}`);
  return { matched, updated: matched, pending: wanted.size };
};
