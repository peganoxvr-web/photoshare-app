import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/supabase';
import { deleteFromCloudinary } from '../utils/cloudinary';

const AdminPanel = ({ photos, onPhotoUpdate, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeletePhoto = async (photo) => {
    setIsDeleting(photo.id);
    try {
      // Delete from Cloudinary
      await deleteFromCloudinary(photo.public_id);
      
      // Delete from Supabase
      await db.deletePhoto(photo.id);
      
      // Update UI
      onPhotoUpdate();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                🛡️ لوحة الإدارة
              </h2>
              <p className="text-red-100 mt-1">إدارة جميع الصور في الموقع</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{photos.length}</div>
              <div className="text-gray-600">إجمالي الصور</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {photos.filter(p => p.description).length}
              </div>
              <div className="text-gray-600">صور مع وصف</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Date().toLocaleDateString('ar')}
              </div>
              <div className="text-gray-600">تاريخ اليوم</div>
            </div>
          </div>
        </div>

        {/* Photos List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <h3 className="text-xl font-bold mb-4">جميع الصور</h3>
          
          {photos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              لا توجد صور بعد
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    {/* Image thumbnail */}
                    <img
                      src={photo.cloudinary_url}
                      alt={photo.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    {/* Photo info */}
                    <div className="flex-1 text-right">
                      <h4 className="font-medium text-gray-900">{photo.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {photo.description || 'بدون وصف'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {formatDate(photo.created_at)}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setSelectedPhoto(photo)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(photo.id)}
                        disabled={isDeleting === photo.id}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {isDeleting === photo.id ? 'حذف...' : 'حذف'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-right">
                ⚠️ تأكيد الحذف
              </h3>
              <p className="text-gray-600 mb-6 text-right">
                هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    const photo = photos.find(p => p.id === showDeleteConfirm);
                    if (photo) handleDeletePhoto(photo);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  حذف نهائي
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <EditPhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onUpdate={onPhotoUpdate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Edit Photo Modal Component
const EditPhotoModal = ({ photo, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('العنوان مطلوب');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      await db.updatePhoto(photo.id, {
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
      setError('فشل في تحديث الصورة. حاول مرة أخرى.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">تعديل الصورة</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Photo preview */}
          <div className="mb-4">
            <img
              src={photo.cloudinary_url}
              alt={photo.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                العنوان *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field text-right"
                placeholder="عنوان الصورة"
                required
                disabled={isUpdating}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                الوصف
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="input-field resize-none text-right"
                placeholder="وصف الصورة (اختياري)"
                disabled={isUpdating}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-right"
              >
                {error}
              </motion.div>
            )}

            <div className="flex space-x-3 space-x-reverse pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="flex-1 btn-secondary"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isUpdating || !formData.title.trim()}
                className={`flex-1 btn-primary ${
                  isUpdating || !formData.title.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;
