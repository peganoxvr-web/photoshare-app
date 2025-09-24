import { CONFIG } from '../config';

// Upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: CONFIG.CLOUDINARY_API_KEY,
        })
      }
    );

    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Generate optimized image URLs
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto'
  } = options;

  // Transform the Cloudinary URL to include optimization parameters
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/`
  );
};
