import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, MessageSquareHeart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { testimonialAPI } from '../services/api';

function Stars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
      {t.videoUrl ? (
        <video src={t.videoUrl} controls poster={t.imageUrl || undefined} className="w-full aspect-video bg-slate-950 object-cover" />
      ) : t.imageUrl ? (
        <img src={t.imageUrl} alt={t.clientName} className="w-full aspect-video object-cover" loading="lazy" />
      ) : null}

      <div className="p-6 flex flex-col flex-1">
        <Quote className="w-7 h-7 text-indigo-200 mb-3" />
        <p className="text-gray-700 leading-relaxed flex-1">{t.quote}</p>
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{t.clientName}</p>
            {(t.role || t.company) && (
              <p className="text-sm text-gray-500 truncate">
                {t.role}{t.role && t.company ? ', ' : ''}{t.company}
              </p>
            )}
          </div>
          <Stars rating={t.rating} />
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    testimonialAPI.getAll()
      .then(res => {
        setEnabled(res.data.enabled !== false);
        setTestimonials(res.data.data || []);
      })
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Client Testimonials | Sambid"
        description="Hear from businesses winning federal contracts with Sambid's AI-powered SAM.gov matching, proposal writing, and bid analysis tools."
        canonical="https://sambid.co/testimonials"
      />

      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-5">
            <MessageSquareHeart className="w-4 h-4 mr-2 text-indigo-300" />
            <span className="text-xs sm:text-sm font-medium">Real results from real contractors</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent leading-tight">
            What Our Clients Say
          </h1>
          <p className="text-base sm:text-xl text-indigo-100 leading-relaxed">
            Businesses using Sambid to find, win, and deliver federal contracts.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : !enabled || testimonials.length === 0 ? (
            <div className="text-center py-20 text-gray-400 max-w-md mx-auto">
              <MessageSquareHeart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600">Client stories coming soon</p>
              <p className="text-sm mt-1">Check back shortly — we're gathering feedback from businesses using Sambid.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => <TestimonialCard key={t._id} t={t} />)}
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 sm:py-20">
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to win your next federal contract?</h2>
          <p className="text-indigo-100 mb-7">Start your free trial and see why contractors trust Sambid.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
