import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const API = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

const ANIM_CSS = `
@keyframes _fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
.reveal.in { opacity: 1; transform: translateY(0); }
`;

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div ref={ref} className={`reveal${inView ? ' in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/problems`)
      .then(r => r.json())
      .then(d => { if (d.success) setProblems(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white overflow-hidden">
      <style>{ANIM_CSS}</style>
      <SEOHead
        title="17 Federal Contracting Problems, Solved | Sambid"
        description="Every real problem small businesses face winning federal contracts, and exactly how Sambid solves each one - wrong NAICS codes, missed deadlines, bidding blind, and more."
        keywords="federal contracting problems, SAM.gov problems, government contract mistakes, win government contracts, federal bid problems"
        canonical="https://sambid.co/problems"
      />

      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <AlertCircle className="w-4 h-4 mr-2 text-indigo-300" />
            <span className="text-xs sm:text-sm font-medium">17 Problems. 17 Solutions.</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-5 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Every Problem Costing You Federal Contracts
          </h1>
          <p className="text-base sm:text-xl text-indigo-100 max-w-2xl mx-auto">
            We talked to real contractors and found the same 17 problems, over and over. Here's every one of them, and exactly how Sambid solves it.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {problems.map((p, i) => (
                <FadeIn key={p.slug} delay={Math.min(i * 40, 300)}>
                  <Link
                    to={`/problems/${p.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-indigo-100/70 hover:bg-indigo-50/40 transition-colors px-5 sm:px-6 py-5 h-full"
                  >
                    <span className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {p.num}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug group-hover:text-indigo-700 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{p.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-300 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
