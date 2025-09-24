import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/supabase';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { auth } from '../utils/auth';
import AdminPanel from './AdminPanel';
import ThemeToggle from './ThemeToggle';

const LazyImage = ({ src, alt, onClick, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Failed to load</div>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover cursor-pointer transition-all duration-300 hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onClick={onClick}
        />
      )}
    </div>
  );
};

const PhotoCard = ({ photo, onImageClick }) => {
  const optimizedUrl = getOptimizedImageUrl(photo.cloudinary_url, {
    width: 400,
    height: 300,
    quality: 'auto'
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card overflow-hidden group"
    >
      <div className="aspect-w-4 aspect-h-3">
        <LazyImage
          src={optimizedUrl}
          alt={photo.title}
          onClick={() => onImageClick(photo)}
          className="h-64"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
          {photo.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {photo.description || 'No description'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {formatDate(photo.created_at)}
        </p>
      </div>
    </motion.div>
  );
};

const Gallery = ({ onImageClick, onLogout, onPhotosLoaded }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const isAdmin = auth.isAdmin();

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getPhotos();
      setPhotos(data);
      // Pass photos to parent component for modal navigation
      if (onPhotosLoaded) {
        onPhotosLoaded(data);
      }
    } catch (err) {
      setError('Failed to load photos. Please try again.');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  }, [onPhotosLoaded]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                📸 PhotoShare
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                    🛡️ Admin
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle className="mr-2" />
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="btn-primary bg-red-500 hover:bg-red-600 mr-2"
                >
                  🛡️ Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchPhotos}
                className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 underline"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No photos yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start building your collection by uploading your first photo!
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Photos ({photos.length})
              </h2>
            </div>

            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            photos={photos}
            onPhotoUpdate={fetchPhotos}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
