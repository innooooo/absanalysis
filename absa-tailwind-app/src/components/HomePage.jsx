import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

const HomePage = () => {
  const navigateTo = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white overflow-hidden px-6 py-10">
      
      {/* Floating Background Phones */}
      <motion.div
        className="absolute top-10 left-10 text-blue-300 opacity-30"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        <Smartphone size={60} />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-blue-200 opacity-30"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      >
        <Smartphone size={50} />
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        className="font-bold text-4xl md:text-6xl text-center text-gray-800 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Aspect-Based Sentiment Analysis System
      </motion.h1>

      {/* Subheading */}
      <motion.p
        className="text-lg md:text-2xl text-center text-gray-600 mb-10 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Gain a deeper understanding of what customers truly think about mobile phones. 
        Highlight key features like camera quality, battery life, and display performance — 
        giving you clear, targeted insights that matter most.
      </motion.p>

      {/* Navigation Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <button 
          onClick={() => navigateTo('/upload')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition-transform"
        >
          Upload Reviews
        </button>
      </motion.div>

    </div>
  );
};

export default HomePage;
