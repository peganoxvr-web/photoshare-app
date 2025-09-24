import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

// Create Supabase client
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Database operations
export const db = {
  // Get all photos ordered by created date (newest first)
  async getPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
    
    return data;
  },

  // Add a new photo
  async addPhoto(photoData) {
    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          title: photoData.title,
          description: photoData.description || null,
          cloudinary_url: photoData.cloudinary_url,
          public_id: photoData.public_id,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
    
    return data[0];
  },

  // Delete a photo
  async deletePhoto(id) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
    
    return true;
  },

  // Update a photo
  async updatePhoto(id, photoData) {
    const { data, error } = await supabase
      .from('photos')
      .update({
        title: photoData.title,
        description: photoData.description
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
    
    return data[0];
  },

  // Get photo by ID
  async getPhotoById(id) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
    
    return data;
  }
};

/*
Database schema for Supabase:

CREATE TABLE photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  cloudinary_url text NOT NULL,
  public_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're using a single password)
CREATE POLICY "Allow all operations" ON photos
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);
*/
