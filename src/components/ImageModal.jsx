import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const ImageModal = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!photo) return null;

  const optimizedUrl = getOptimizedImageUrl(photo.cloudinary_url, {
    width: 1200,
    height: 800,
    quality: 'auto'
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation buttons */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Previous image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Next image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-7xl max-h-full mx-4 flex flex-col lg:flex-row bg-black rounded-lg overflow-hidden"
        >
          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              src={optimizedUrl}
              alt={photo.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-80 bg-white dark:bg-gray-800 p-6 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {photo.title}
            </h2>
            
            {photo.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {photo.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uploaded</h3>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(photo.created_at)}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Use arrow keys or buttons to navigate between photos. Press ESC to close.
                </p>
                
                <div className="flex space-x-3">
                  <a
                    href={photo.cloudinary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm"
                  >
                    View Full Size
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(photo.cloudinary_url);
                      // You could add a toast notification here
                    }}
                    className="btn-secondary text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile navigation indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden">
          <div className="flex space-x-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
              >
                ← Prev
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
