import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSmile, 
  FiFrown, 
  FiZap, 
  FiHeart, 
  FiCoffee,
  FiChevronDown
} from 'react-icons/fi';

const MoodSelector = ({ currentMood, onMoodChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const moods = [
    { 
      value: 'happy', 
      label: 'Happy', 
      icon: FiSmile, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    { 
      value: 'stressed', 
      label: 'Stressed', 
      icon: FiFrown, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    { 
      value: 'motivated', 
      label: 'Motivated', 
      icon: FiZap, 
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    { 
      value: 'calm', 
      label: 'Calm', 
      icon: FiHeart, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    { 
      value: 'energetic', 
      label: 'Energetic', 
      icon: FiCoffee, 
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  const currentMoodData = moods.find(mood => mood.value === currentMood) || moods[0];

  const handleMoodChange = (mood) => {
    onMoodChange(mood);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md ${currentMoodData.bgColor} ${currentMoodData.borderColor}`}
      >
        <currentMoodData.icon className={`h-4 w-4 ${currentMoodData.color}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentMoodData.label}
        </span>
        <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-2 z-50"
          >
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodChange(mood.value)}
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200 ${
                  currentMood === mood.value ? 'bg-gray-100 dark:bg-dark-700' : ''
                }`}
              >
                <mood.icon className={`h-4 w-4 ${mood.color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mood.label}
                </span>
                {currentMood === mood.value && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodSelector;
