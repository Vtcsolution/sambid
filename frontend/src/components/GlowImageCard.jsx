import { Play } from 'lucide-react';
import ZoomableImage from './ZoomableImage';

// Soft colored blur glowing behind a rounded screenshot card - used on the
// home page's "7 Phases" section and every FeatureShowcase step visual, so
// the whole site's screenshot presentation is one consistent, premium style.
const GLOW_THEMES = {
  indigo: { a: '99,102,241', b: '56,189,248' },  // indigo -> sky blue
  purple: { a: '168,85,247', b: '236,72,153' },  // purple -> pink
  amber:  { a: '245,158,11', b: '239,68,68' },   // amber -> red
  teal:   { a: '20,184,166', b: '99,102,241' },  // teal -> indigo
};

export default function GlowImageCard({ src, alt = '', theme = 'indigo', title, videoSrc, posterSrc, embedUrl }) {
  const c = GLOW_THEMES[theme] || GLOW_THEMES.indigo;
  const glow = {
    background:
      `radial-gradient(55% 55% at 25% 15%, rgba(${c.a},0.55), transparent 70%),` +
      `radial-gradient(50% 50% at 85% 90%, rgba(${c.b},0.5), transparent 70%)`,
  };

  // Image case: these screenshots already have their own glowing rounded
  // card + transparent margin baked into the PNG, so the wrapper here must
  // stay transparent - a solid background would fill that margin with an
  // ugly box instead of letting the page (and the blur glow behind) show
  // through. Video/embed/placeholder cases still need an opaque frame since
  // they have no such margin of their own.
  // No hardcoded max-width here - sizing is the caller's job: a side-by-side
  // grid column naturally constrains it small, while a full-width wrapper
  // (no cap) lets it read as the large, dominant showcase image.
  if (src) {
    return (
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-6 sm:-inset-8 rounded-[2.5rem] blur-3xl opacity-80 pointer-events-none"
          style={glow}
        />
        <div className="relative">
          <ZoomableImage src={src} alt={alt} natural />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 sm:-inset-10 rounded-[2.5rem] blur-3xl opacity-80 pointer-events-none"
        style={glow}
      />
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-slate-950"
        style={{ aspectRatio: '16/9' }}
      >
        {embedUrl ? (
          <iframe src={embedUrl} className="w-full h-full" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen title={title || alt} />
        ) : videoSrc ? (
          <video className="w-full h-full object-cover" controls poster={posterSrc} preload="none">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.05) 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Play className="w-7 h-7 text-white" style={{ marginLeft: '3px' }} />
              </div>
              {title && <p className="text-white/80 text-sm font-medium">{title}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
