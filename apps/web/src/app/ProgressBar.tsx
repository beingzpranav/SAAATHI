import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const RouteProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(75), 100);
    const timer2 = setTimeout(() => {
      setProgress(100);
      const timer3 = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer3);
    }, 250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname]);

  if (!isVisible && progress === 100) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#C4562B] dark:bg-[#D86A3E] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
