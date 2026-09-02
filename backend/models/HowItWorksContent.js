import mongoose from 'mongoose';

// Single-document store for the public /how-it-works page - every section is
// admin-editable (hero copy, the 5-item comparison, the AI engine strip, and
// all 17 pain points including their video/thumbnail). There is only ever
// one document; the controller upserts against a fixed key.
const flowItemSchema = new mongoose.Schema({
  label: { type: String, default: '' },
  kind:  { type: String, default: 'in' }, // 'in' | 'out' | 'eng' | 'gold'
  sep:   { type: String, default: '' },   // set instead of label for a separator like '→' or '+'
}, { _id: false });

const howItWorksContentSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true }, // singleton lock

  hero: {
    badge:     { type: String, default: 'Intelligence Brief: Expert Edition' },
    titleLine1: { type: String, default: 'Federal BD Intelligence.' },
    titleLine2: { type: String, default: 'Automated.' },
    subtitle:  { type: String, default: '' },
  },

  compareSection: {
    tag:      { type: String, default: 'The Problem We Solve' },
    title:    { type: String, default: 'What Changes When You Use Sambid' },
    subtitle: { type: String, default: '' },
    items: [{
      topic:  { type: String, default: '' },
      before: { type: String, default: '' },
      after:  { type: String, default: '' },
      icon:   { type: String, default: 'Zap' }, // lucide-react icon name, looked up on the frontend
    }],
    summaryLine: { type: String, default: '' },
  },

  aiEngineSection: {
    tag:      { type: String, default: 'The Intelligence Layer' },
    title:    { type: String, default: 'One AI Engine Powers All 17 Workflows' },
    subtitle: { type: String, default: '' },
    flow: [flowItemSchema],
  },

  painPointsSection: {
    tag:      { type: String, default: '17 Problems. 17 Solutions.' },
    title:    { type: String, default: 'What Is Costing You Contracts' },
    subtitle: { type: String, default: '' },
  },

  painPoints: [{
    num:            { type: String, default: '' },
    title:          { type: String, default: '' },
    pain:           { type: String, default: '' },
    solve:          { type: String, default: '' },
    flow:           [flowItemSchema],
    video:          { type: String, default: '' },
    videoThumbnail: { type: String, default: '' },
  }],

  closing: {
    title: { type: String, default: 'The Bottom Line for Expert Contractors' },
    text:  { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('HowItWorksContent', howItWorksContentSchema);
