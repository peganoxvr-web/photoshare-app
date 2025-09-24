import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { auth } from './utils/auth';
import { theme } from './utils/theme';
import Login from './components/Login';
import Gallery from './components/Gallery';
import UploadForm from './components/UploadForm';
import ImageModal from './components/ImageModal';
import FloatingUploadButton from './components/FloatingUploadButton';
import FloatingAdminButton from './components/FloatingAdminButton';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Check authentication status and initialize theme on mount
  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    theme.initTheme();
  }, []);

  // Handle login
  const handleLogin = (role) => {
    setIsAuthenticated(true);
    // Role is already stored in localStorage by auth.authenticate()
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle image click
  const handleImageClick = (photo) => {
    setSelectedPhoto(photo);
  };

  // Handle modal navigation
  const getCurrentPhotoIndex = () => {
    return photos.findIndex(p => p.id === selectedPhoto?.id);
  };

  const handleNextPhoto = () => {
    const currentIndex = getCurrentPhotoIndex();
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  const handlePrevPhoto = () => {
    const currentIndex = getCurrentPhotoIndex();
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  const hasNext = getCurrentPhotoIndex() < photos.length - 1;
  const hasPrev = getCurrentPhotoIndex() > 0;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <Gallery 
        key={refreshTrigger} // Force re-render when photos are uploaded
        onImageClick={handleImageClick}
        onLogout={handleLogout}
        onPhotosLoaded={setPhotos} // Pass photos to App component
      />
      
      <FloatingUploadButton onClick={() => setShowUploadForm(true)} />
      
      {auth.isAdmin() && (
        <FloatingAdminButton onClick={() => setShowAdminPanel(true)} />
      )}

      <AnimatePresence>
        {showUploadForm && (
          <UploadForm
            onClose={() => setShowUploadForm(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && auth.isAdmin() && (
          <AdminPanel
            photos={photos}
            onPhotoUpdate={handleUploadSuccess}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhoto && (
          <ImageModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNext={handleNextPhoto}
            onPrev={handlePrevPhoto}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
