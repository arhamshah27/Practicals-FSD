import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-gray-500',
    white: 'border-white',
    dark: 'border-dark-500'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`spinner ${colorClasses[color]} ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
