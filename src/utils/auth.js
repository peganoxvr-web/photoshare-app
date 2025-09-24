import { CONFIG } from '../config';

// Authentication system with admin support
export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('photoshare_authenticated') === 'true';
  },

  // Check if user is admin
  isAdmin: () => {
    return localStorage.getItem('photoshare_admin') === 'true';
  },

  // Get user role
  getUserRole: () => {
    if (auth.isAdmin()) return 'admin';
    if (auth.isAuthenticated()) return 'user';
    return 'guest';
  },

  // Authenticate user with password
  authenticate: (password) => {
    // Check admin password first
    if (password === CONFIG.ADMIN_PASSWORD) {
      localStorage.setItem('photoshare_authenticated', 'true');
      localStorage.setItem('photoshare_admin', 'true');
      return { success: true, role: 'admin' };
    }
    
    // Check regular user password
    if (password === CONFIG.APP_PASSWORD) {
      localStorage.setItem('photoshare_authenticated', 'true');
      localStorage.removeItem('photoshare_admin'); // Make sure admin is not set
      return { success: true, role: 'user' };
    }
    
    return { success: false, role: null };
  },

  // Log out user
  logout: () => {
    localStorage.removeItem('photoshare_authenticated');
    localStorage.removeItem('photoshare_admin');
  }
};
