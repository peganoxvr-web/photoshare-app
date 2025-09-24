import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToCloudinary } from '../utils/cloudinary';
import { db } from '../utils/supabase';

const UploadForm = ({ onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length !== files.length) {
        setError('Some files are not valid images. Only image files will be uploaded.');
      } else {
        setError('');
      }
      
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        
        // Create preview URLs for all selected files
        const previews = [];
        let processedFiles = 0;
        
        validFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews[index] = e.target.result;
            processedFiles++;
            
            if (processedFiles === validFiles.length) {
              setPreviewUrls(previews);
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length !== files.length) {
        setError('Some files are not valid images. Only image files will be processed.');
      } else {
        setError('');
      }
      
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        
        // Create preview URLs for all dropped files
        const previews = [];
        let processedFiles = 0;
        
        validFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews[index] = e.target.result;
            processedFiles++;
            
            if (processedFiles === validFiles.length) {
              setPreviewUrls(previews);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = file.name.split('.')[0]; // Get filename without extension
        
        try {
          // Step 1: Upload to Cloudinary
          setUploadProgress(`Uploading image ${i + 1}/${selectedFiles.length}: ${fileName}`);
          const cloudinaryResult = await uploadToCloudinary(file);
          
          // Step 2: Save metadata to Supabase
          setUploadProgress(`Saving details ${i + 1}/${selectedFiles.length}: ${fileName}`);
          const photoData = {
            title: formData.title.trim() || fileName, // Use title or filename as fallback
            description: formData.description.trim(),
            cloudinary_url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id
          };
          
          await db.addPhoto(photoData);
          successCount++;
          
        } catch (fileError) {
          console.error(`Error uploading ${fileName}:`, fileError);
          failCount++;
        }
      }
      
      // Show results
      if (successCount > 0) {
        setUploadProgress(`Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''}!`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onUploadSuccess();
        onClose();
      }
      
      if (failCount > 0) {
        setError(`${failCount} photo${failCount > 1 ? 's' : ''} failed to upload. ${successCount > 0 ? 'Others uploaded successfully.' : ''}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photos. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Photos</h2>
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
                Choose Images
              </label>
              
              {previewUrls.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Click to select or drag & drop multiple images</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple files</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            const newUrls = previewUrls.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                            setPreviewUrls(newUrls);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                  >
                    + Add more images
                  </button>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Give your photos a common title (or leave empty to use filename)"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If left empty, each photo will use its filename as the title
              </p>
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
                placeholder="Add a common description for all photos"
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
                disabled={isUploading || selectedFiles.length === 0}
                className={`flex-1 btn-primary ${
                  isUploading || selectedFiles.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isUploading 
                  ? 'Uploading...' 
                  : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`
                }
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadForm;
