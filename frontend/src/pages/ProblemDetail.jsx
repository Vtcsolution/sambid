import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import ZoomableImage from '../components/ZoomableImage';
import { getVideoEmbed } from '../utils/videoEmbed';

const API = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// Growing circle size per timeline point - small first point, larger toward
// the consequence, matching the escalating-stakes sketch.
const CIRCLE_SIZES = ['w-3 h-3', 'w-4 h-4', 'w-6 h-6', 'w-8 h-8'];

export default function ProblemDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/problems/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProblem(d.data); else setError('Problem not found.'); })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  if (error || !problem) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">{error || 'Problem not found.'}</p>
        <Link to="/problems" className="text-indigo-600 hover:underline">← Back to Problems</Link>
      </div>
    </div>
  );

  const ctaHref  = isAuthenticated ? '/dashboard' : '/signup';
  const ctaLabel = isAuthenticated ? 'Go to Dashboard' : 'Try It Free';
  const embed = getVideoEmbed(problem.video);

  return (
    <div className="bg-white overflow-hidden">
      <SEOHead
        title={`${problem.title} | Sambid`}
        description={problem.subtitle}
        canonical={`https://sambid.co/problems/${problem.slug}`}
      />

      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Link to="/problems" className="inline-flex items-center gap-1 text-indigo-300 hover:text-white text-sm mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Problems
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {problem.num}
            </span>
            <span className="text-indigo-300 text-sm font-semibold uppercase tracking-wide">Problem {parseInt(problem.num, 10)} of 17</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            {problem.title}
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl">{problem.subtitle}</p>
        </div>
      </section>

      {/* Video section */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-indigo-50/30 shadow-lg" style={{ aspectRatio: '16/9' }}>
            {embed && embed !== 'direct' ? (
              <iframe src={embed} className="w-full h-full" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={problem.title} />
            ) : problem.videoThumbnail ? (
              <ZoomableImage src={problem.videoThumbnail} alt={problem.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-indigo-400 text-sm font-medium">Video coming soon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Escalating timeline */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pl-10">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-indigo-200" />
            {(problem.timelinePoints || []).map((point, i) => {
              const size = CIRCLE_SIZES[Math.min(i, CIRCLE_SIZES.length - 1)];
              return (
                <div key={i} className="relative mb-8 last:mb-0">
                  <span
                    className={`absolute -left-10 top-0.5 rounded-full border-2 border-indigo-500 bg-white ${size}`}
                    style={{ marginLeft: (24 - parseInt(size.match(/\d+/)?.[0] || '4', 10) * 2) / 2 }}
                  />
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{point}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-10 sm:py-14 bg-indigo-50/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 mb-4">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{problem.solveTitle || 'How Sambid Solves It'}</h2>
          </div>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{problem.solve}</p>
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 py-14 sm:py-16">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Stop losing contracts to this.</h2>
          <p className="text-indigo-100 mb-6">Try Sambid free - no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={ctaHref} className="inline-flex items-center justify-center px-7 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105">
              {ctaLabel} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/problems" className="inline-flex items-center justify-center px-7 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
              See All 17 Problems
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
