// Shared styled email preview — used by both AdminCampaigns and the Prospect
// Outreach modal so every admin email tool shows the same "how recipients
// see it" rendering: logo header, bold text, bullet points.
export default function EmailPreview({ subject, body, fromName, userName, signOff }) {
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
          <hr className="border-gray-100 my-4" />
          <p className="text-xs text-gray-400 text-center">
            © 2025 Sambid · <span className="text-indigo-500">Manage preferences</span> · <span className="text-indigo-500">Dashboard</span>
          </p>
        </div>
      </div>
    </div>
  );
}
