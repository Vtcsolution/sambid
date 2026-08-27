// Shared styled email preview — used by both AdminCampaigns and the Prospect
// Outreach modal so every admin email tool shows the same "how recipients
// see it" rendering: logo header, bold text, bullet points.
//
// topMatches: the real "Top 5 Matched Opportunities" data for whoever is
// currently being previewed — a platform user (AdminCampaigns, matched by
// NAICS + match score, may be title-locked on trial/free) or a fetched
// company (Prospect Outreach modal, matched by NAICS only, never locked).
// Every campaign/outreach email auto-appends this block server-side, so
// showing it here with real fetched data (not a mock) lets the admin see
// exactly what that recipient will get. undefined = not fetched yet.
function MatchCard({ opp }) {
  const due = opp.dueDate
    ? new Date(opp.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const snippet = (opp.description || '').slice(0, 150);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 mb-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-gray-900 leading-snug">
          {opp.locked ? <span className="text-gray-400">🔒 Matched contract — details locked</span> : opp.title}
        </p>
        {typeof opp.matchScore === 'number' && (
          <span className="shrink-0 bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{opp.matchScore}%</span>
        )}
      </div>
      {!opp.locked && <p className="text-xs text-gray-400 mt-1">🏛️ {opp.agency}</p>}
      {!opp.locked && snippet && (
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{snippet}{(opp.description || '').length > 150 ? '…' : ''}</p>
      )}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[11px] text-gray-500">
        {opp.naicsCode && <span className="bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">NAICS {opp.naicsCode}</span>}
        {opp.setAside && <span className="bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded">{opp.setAside}</span>}
        <span>Due <strong className="text-red-500">{due}</strong></span>
      </div>
    </div>
  );
}

export default function EmailPreview({ subject, body, fromName, userName, signOff, topMatches, matchesLoading, segmentMode }) {
  const firstName = (userName || '').split(' ')[0] || 'there';
  const lines = (body || '').split('\n');

  const renderLine = (line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;

    const bullet = /^([•\-*·]|\d+[.)]) (.+)/.exec(t);
    if (bullet) return (
      <div key={i} className="flex items-start gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
        <span className="text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: bullet[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
      </div>
    );

    const urlMatch = t.match(/https?:\/\/\S+/);
    const isCtaLine = /^(→|👉|🔗|Click here|Log in|Visit|Upgrade|Access|Get started)/i.test(t) && urlMatch;
    if (isCtaLine) return (
      <div key={i} className="text-center my-4">
        <span className="inline-block bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg">
          {t.replace(/https?:\/\/\S+/g, '').replace(/^(→|👉|🔗)/, '').trim() || 'Open Dashboard →'}
        </span>
      </div>
    );

    return (
      <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2"
        dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
    );
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      {/* Subject preview */}
      <div className="bg-white rounded-lg px-4 py-2.5 mb-3 border border-gray-200">
        <p className="text-xs text-gray-400 mb-0.5">Subject</p>
        <p className="text-sm font-semibold text-gray-900">{subject || '(no subject)'}</p>
      </div>

      {/* Email card */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {/* Email header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-center">
          <div className="inline-flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Sambid" className="w-8 h-8 rounded-lg" />
            <span className="text-white font-bold text-base">{fromName || 'Sambid'}</span>
          </div>
          <p className="text-white/70 text-xs mt-1">Federal Contract Intelligence</p>
        </div>

        {/* Email body */}
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">Hi {firstName},</p>
          <div>{lines.map((l, i) => renderLine(l, i))}</div>
          {signOff && (
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-line">{signOff}</p>
          )}

          {/* Auto-appended matched opportunities — every campaign/outreach email gets this */}
          {matchesLoading && (
            <p className="text-xs text-gray-400 mt-4">Loading matched opportunities for {firstName}…</p>
          )}
          {!matchesLoading && Array.isArray(topMatches) && topMatches.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wide mb-1">
                Top {topMatches.length} Matched Opportunities
              </p>
              <p className="text-xs text-gray-500 mb-2">Auto-added below every send — real data for {firstName}</p>
              {topMatches.map(opp => <MatchCard key={opp.id} opp={opp} />)}
            </div>
          )}
          {!matchesLoading && Array.isArray(topMatches) && topMatches.length === 0 && (
            <p className="text-xs text-gray-400 mt-4 italic">
              No live matched opportunities for {firstName} right now — the matched-opportunities section won't be added to this email.
            </p>
          )}
          {segmentMode && (
            <p className="text-xs text-indigo-500 mt-4 italic">
              ✨ Every recipient in this segment will also get their own "Top 5 Matched Opportunities" section, personalized to their NAICS codes — pick a single user above to preview real data.
            </p>
          )}

          <hr className="border-gray-100 my-4" />
          <p className="text-xs text-gray-400 text-center">
            © 2025 Sambid · <span className="text-indigo-500">Manage preferences</span> · <span className="text-indigo-500">Dashboard</span>
          </p>
        </div>
      </div>
    </div>
  );
}
