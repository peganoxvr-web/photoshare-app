import React from 'react';
import { motion } from 'framer-motion';

const FloatingAdminButton = ({ onClick }) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className="fixed bottom-20 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
      aria-label="Admin Panel"
      title="لوحة الإدارة"
    >
      <motion.div
        className="text-lg transition-transform group-hover:scale-110"
        whileHover={{ rotate: 15 }}
      >
        🛡️
      </motion.div>
    </motion.button>
  );
};

export default FloatingAdminButton;
