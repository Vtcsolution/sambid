import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2 } from 'lucide-react';

// Shows the full image (never cropped) inside its container, with a click-to-
// expand fullscreen view. Use anywhere a screenshot was being cut off by
// object-cover on a fixed-aspect-ratio box.
export default function ZoomableImage({ src, alt = '', className = '', containerClassName = '' }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      <div
        className={`relative w-full h-full overflow-hidden cursor-zoom-in group ${containerClassName}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View full image: ${alt}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 ${className}`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" /> View full image
          </div>
        </div>
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[92vw] max-h-[92vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}
