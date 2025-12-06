import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Spinner = ({ size = 'md', color = 'border-primary-600' }:SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-b-2'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${color}`}></div>
  );
};

export default Spinner;