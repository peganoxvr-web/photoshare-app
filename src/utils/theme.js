// Theme management utilities
export const theme = {
  // Get current theme from localStorage
  getTheme: () => {
    const savedTheme = localStorage.getItem('photoshare_theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference if no saved theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  },

  // Set theme and save to localStorage
  setTheme: (newTheme) => {
    localStorage.setItem('photoshare_theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Toggle between light and dark theme
  toggleTheme: () => {
    const currentTheme = theme.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    theme.setTheme(newTheme);
    return newTheme;
  },

  // Initialize theme on app load
  initTheme: () => {
    const currentTheme = theme.getTheme();
    theme.setTheme(currentTheme);
    return currentTheme;
  },

  // Check if current theme is dark
  isDark: () => {
    return theme.getTheme() === 'dark';
  }
};
