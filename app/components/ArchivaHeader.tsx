import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ArchivaHeader = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center text-[#6366F1] hover:text-[#4F46E5] transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="flex items-center"
            >
              <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] via-[#9333EA] to-[#4F46E5]">
                ARCHIVA
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ArchivaHeader;
