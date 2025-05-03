import React, { useEffect, useState } from 'react';

const LoadingSkeleton = () => {
  const setActiveBarIndex = useState(0)[1];
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const targetWidths = [90, 85, 80, 90, 70, 60, 40, 85, 50, 40, 35, 30, 15, 5];
  
  useEffect(() => {
    // Show bars sequentially
    const interval = setInterval(() => {
      setActiveBarIndex(prevIndex => {
        if (prevIndex < targetWidths.length) {
          setBarWidths(prev => {
            const newWidths = [...prev];
            newWidths[prevIndex] = targetWidths[prevIndex];
            return newWidths;
          });
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div role="status" className=" w-full lg:px-20 py-10">
        {barWidths.map((width, index) => (
          <div 
            key={index} 
            className="h-2 animate-pulse bg-gray-200 rounded-full  mb-2.5 transition-all duration-500 ease-out"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;