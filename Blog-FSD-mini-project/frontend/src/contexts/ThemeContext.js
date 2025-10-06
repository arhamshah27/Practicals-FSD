import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mood, setMood] = useState('happy');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedMood = localStorage.getItem('mood');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
    
    if (savedMood) {
      setMood(savedMood);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.setProperty('--toast-bg', '#1e293b');
      document.body.style.setProperty('--toast-color', '#f8fafc');
      document.body.style.setProperty('--toast-border', '#475569');
    } else {
      root.classList.remove('dark');
      document.body.style.setProperty('--toast-bg', '#ffffff');
      document.body.style.setProperty('--toast-color', '#1e293b');
      document.body.style.setProperty('--toast-border', '#e2e8f0');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save mood to localStorage
  useEffect(() => {
    localStorage.setItem('mood', mood);
  }, [mood]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Set mood
  const setUserMood = (newMood) => {
    setMood(newMood);
  };

  // Get mood-based color scheme
  const getMoodColors = () => {
    const moodColors = {
      happy: {
        primary: '#ff6600',
        secondary: '#fbbf24',
        accent: '#f59e0b'
      },
      stressed: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#8b5cf6'
      },
      motivated: {
        primary: '#059669',
        secondary: '#34d399',
        accent: '#10b981'
      },
      calm: {
        primary: '#0891b2',
        secondary: '#67e8f9',
        accent: '#06b6d4'
      },
      energetic: {
        primary: '#dc2626',
        secondary: '#f87171',
        accent: '#ef4444'
      },
      neutral: {
        primary: '#6b7280',
        secondary: '#9ca3af',
        accent: '#9ca3af'
      }
    };
    
    return moodColors[mood] || moodColors.neutral;
  };

  const value = {
    theme,
    mood,
    toggleTheme,
    setSpecificTheme,
    setUserMood,
    getMoodColors,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
