import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToCloudinary } from '../utils/cloudinary';
import { db } from '../utils/supabase';

const UploadForm = ({ onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
        setError('');
      } else {
        setError('Please select a valid image file');
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.title.trim()) {
      setError('Please select an image and provide a title');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      // Step 1: Upload to Cloudinary
      setUploadProgress('Uploading image...');
      const cloudinaryResult = await uploadToCloudinary(selectedFile);
      
      // Step 2: Save metadata to Supabase
      setUploadProgress('Saving photo details...');
      const photoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cloudinary_url: cloudinaryResult.url,
        public_id: cloudinaryResult.public_id
      };
      
      await db.addPhoto(photoData);
      
      // Success!
      setUploadProgress('Complete!');
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Photo</h2>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose Image *
              </label>
              
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Click to select or drag & drop</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Give your photo a title"
                required
                disabled={isUploading}
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="input-field resize-none"
                placeholder="Add a description for your photo"
                disabled={isUploading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                  {uploadProgress}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile || !formData.title.trim()}
                className={`flex-1 btn-primary ${
                  isUploading || !selectedFile || !formData.title.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadForm;
