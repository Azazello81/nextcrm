'use client';

import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
  showText?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Загрузка...',
  fullScreen = false,
  className = '',
  spinnerClassName = '',
  textClassName = '',
  showText = true,
  speed = 'normal'
}: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: { 
      spinner: 'w-8 h-8 border-2',
      text: 'text-sm'
    },
    md: { 
      spinner: 'w-12 h-12 border-3',
      text: 'text-base'
    },
    lg: { 
      spinner: 'w-16 h-16 border-4',
      text: 'text-lg'
    },
    xl: { 
      spinner: 'w-20 h-20 border-4',
      text: 'text-xl'
    }
  };

  const speedConfig = {
    slow: 2,
    normal: 1,
    fast: 0.5
  };

  const containerClasses = `flex flex-col items-center justify-center ${className}`;
  const spinnerClasses = `${sizeConfig[size].spinner} rounded-full border-accent border-t-transparent ${spinnerClassName}`;
  const textClasses = `mt-4 ${sizeConfig[size].text} ${textClassName || 'text-secondary'}`;

  const spinnerContent = (
    <div className={containerClasses.trim()}>
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: speedConfig[speed],
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className={spinnerClasses.trim()}
        aria-label="Загрузка"
        role="status"
      />
      {showText && text && (
        <div className={textClasses.trim()}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}