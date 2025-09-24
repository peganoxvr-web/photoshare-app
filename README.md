# PhotoShare - A Beautiful Photo Sharing Web App

A modern, responsive photo-sharing application built with React, TailwindCSS, Supabase, and Cloudinary. Perfect for sharing memories with friends using a simple password-protected interface.

## ✨ Features

- 🔐 **Dual Authentication** - Separate passwords for users and admin
- 🛡️ **Admin Panel** - Complete management system for admins
- 📱 **Responsive Design** - Beautiful on mobile and desktop
- ⚡ **Fast Image Loading** - Lazy loading with optimized Cloudinary URLs
- 🖼️ **Image Gallery** - Grid layout with smooth animations
- 🔍 **Lightbox Modal** - Full-size image viewing with navigation
- ⬆️ **Easy Upload** - Drag & drop or click to upload multiple photos at once
- 📝 **Flexible Titles** - Optional titles with automatic fallback to filenames
- 🗑️ **Photo Management** - Edit titles, descriptions, and delete photos (Admin only)
- 📊 **Statistics Dashboard** - View photo counts and analytics (Admin only)
- 🌙 **Dark Mode** - Automatic theme switching with system preference detection
- 🎨 **Modern UI** - Clean design with Framer Motion animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TailwindCSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudinary
- **Styling**: TailwindCSS with custom animations

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Services

You'll need to set up Supabase and Cloudinary accounts:

#### Supabase Setup:
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Create the photos table using this SQL:

```sql
CREATE TABLE photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  cloudinary_url text NOT NULL,
  public_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations
CREATE POLICY "Allow all operations" ON photos
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);
```

#### Cloudinary Setup:
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name and API key from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Create a new unsigned upload preset
   - Set folder if desired (optional)

### 3. Update Configuration

Edit `src/config.js` with your actual credentials:

```js
export const CONFIG = {
  SUPABASE_URL: "your-supabase-url",
  SUPABASE_ANON_KEY: "your-supabase-anon-key", 
  CLOUDINARY_CLOUD_NAME: "your-cloud-name",
  CLOUDINARY_UPLOAD_PRESET: "your-upload-preset",
  CLOUDINARY_API_KEY: "your-api-key",
  // User password (for friends)
  APP_PASSWORD: "MY_SECRET_PASSWORD",
  // Admin password (for management)
  ADMIN_PASSWORD: "ADMIN_PASSWORD_HERE"
};
```

### 4. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.jsx              # Password authentication (user/admin)
│   ├── Gallery.jsx            # Main photo gallery with admin features
│   ├── UploadForm.jsx         # Image upload form
│   ├── ImageModal.jsx         # Lightbox for full-size images
│   ├── AdminPanel.jsx         # Admin management dashboard
│   ├── FloatingUploadButton.jsx # FAB for quick upload
│   └── FloatingAdminButton.jsx # FAB for admin panel
├── utils/
│   ├── auth.js               # Authentication utilities with admin support
│   ├── supabase.js           # Database operations (CRUD)
│   └── cloudinary.js         # Image upload/delete utilities
├── config.js                 # Configuration file (includes admin password)
├── App.js                    # Main app component with admin integration
├── index.js                  # App entry point
└── index.css                 # Styles with Tailwind
```

## 🎨 Customization

### Changing Colors
Edit the primary colors in `tailwind.config.js`:

```js
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',  // Main color
    600: '#2563eb',
    700: '#1d4ed8'
  }
}
```

### Password
Change the password in `src/config.js`:

```js
APP_PASSWORD: "YOUR_NEW_PASSWORD"
```

## 📱 Usage

### For Regular Users:
1. **Login**: Enter the user password
2. **View Photos**: Browse the gallery grid
3. **Upload Single**: Click the + button and select one photo
4. **Upload Multiple**: Hold Ctrl/Cmd and select multiple photos at once
5. **Optional Titles**: Leave title empty to use filename, or add custom title
6. **View Full Size**: Click any photo for lightbox view
7. **Navigation**: Use arrow keys or buttons in lightbox

### For Admins:
1. **Login**: Enter the admin password
2. **Admin Panel**: Click "Admin Panel" button or the floating 🛡️ button
3. **Manage Photos**: View all photos with statistics
4. **Edit Photos**: Click "تعديل" to modify title and description
5. **Delete Photos**: Click "حذف" to permanently remove photos
6. **Monitor Usage**: View photo counts and upload statistics

### 🛡️ Admin Features:
- **Complete Photo Management**: Edit titles, descriptions, and delete photos
- **Statistics Dashboard**: View total photos, photos with descriptions, etc.
- **Bulk Operations**: Manage multiple photos efficiently
- **Arabic Interface**: Admin panel supports Arabic language
- **Secure Access**: Separate admin password for enhanced security

### 🌙 Dark Mode Features:
- **Automatic Detection**: Follows system theme preference by default
- **Manual Toggle**: Click the 🌙/☀️ button to switch themes
- **Persistent Choice**: Remembers your theme preference
- **Smooth Transitions**: Beautiful animations when switching themes
- **All Components**: Every part of the app supports dark mode

## 🔧 Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📄 License

MIT License - feel free to use for personal projects!

## 🤝 Contributing

This is a complete, ready-to-use photo sharing app. Feel free to customize it for your needs!
