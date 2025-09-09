import { motion } from 'framer-motion';
import { useEffect } from 'react';

const PageNotFound = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Roboto:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleReturnHome = () => (window.location.href = '/');
  const handleExploreCollections = () => (window.location.href = '/collections');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const floatingVariants = {
    y: [-10, 10, -10],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  };

  const pulseVariants = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        fontFamily: "'Roboto', sans-serif",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      {/* Decorative Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 opacity-20"
        animate={pulseVariants}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 opacity-15"
        animate={floatingVariants}
      />
      <motion.div
        className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 opacity-10"
        animate={pulseVariants}
        transition={{ delay: 1 }}
      />

      {/* Main Content */}
      <motion.div
        className="max-w-4xl mx-auto px-6 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={itemVariants}>
          <h1
            className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            404
          </h1>
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <h2
            className="text-4xl md:text-5xl font-semibold text-gray-800 mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Oops! Page Not Found
          </h2>
        </motion.div>

        <motion.div className="mb-12" variants={itemVariants}>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            It seems you've wandered into uncharted luxury territory. The page you're looking for
            couldn't be found. Let's guide you back to elegance.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleReturnHome}
            className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-48"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            Return Home
          </motion.button>

          <motion.button
            onClick={handleExploreCollections}
            className="px-8 py-4 bg-transparent border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 min-w-48"
            whileHover={{ scale: 1.05, borderColor: '#6b7280' }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Collections
          </motion.button>
        </motion.div>

        <motion.div className="mt-16" variants={itemVariants}>
          <p className="text-sm text-gray-500 font-light">
            Need assistance? Our luxury concierge is here to help you find exactly what you're
            looking for.
          </p>
        </motion.div>
      </motion.div>

      {/* Subtle Brand Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
    </div>
  );
};

export default PageNotFound;
