import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LiveTimestampProps {
  timestamp: string;
  format?: 'relative' | 'absolute' | 'smart';
  className?: string;
  showSeconds?: boolean;
}

export const LiveTimestamp = ({ 
  timestamp, 
  format = 'smart', 
  className,
  showSeconds = false 
}: LiveTimestampProps) => {
  const [displayTime, setDisplayTime] = useState('');
  const [updateInterval, setUpdateInterval] = useState(60000); // Default 1 minute

  useEffect(() => {
    const updateTime = () => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      let displayText = '';
      let nextUpdateInterval = 60000; // Default 1 minute

      if (format === 'absolute') {
        displayText = date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: showSeconds ? '2-digit' : undefined
        });
        nextUpdateInterval = showSeconds ? 1000 : 60000;
      } else if (format === 'relative') {
        if (diffInSeconds < 30) {
          displayText = 'Vừa xong';
          nextUpdateInterval = 1000;
        } else if (diffInSeconds < 60) {
          displayText = `${diffInSeconds} giây trước`;
          nextUpdateInterval = 1000;
        } else if (diffInMinutes < 60) {
          displayText = `${diffInMinutes} phút trước`;
          nextUpdateInterval = 60000;
        } else if (diffInHours < 24) {
          displayText = `${diffInHours} giờ trước`;
          nextUpdateInterval = 3600000; // 1 hour
        } else if (diffInDays < 7) {
          displayText = `${diffInDays} ngày trước`;
          nextUpdateInterval = 86400000; // 1 day
        } else if (diffInWeeks < 4) {
          displayText = `${diffInWeeks} tuần trước`;
          nextUpdateInterval = 604800000; // 1 week
        } else if (diffInMonths < 12) {
          displayText = `${diffInMonths} tháng trước`;
          nextUpdateInterval = 2629746000; // 1 month
        } else {
          displayText = `${diffInYears} năm trước`;
          nextUpdateInterval = 31556952000; // 1 year
        }
      } else { // smart format
        const isToday = date.toDateString() === now.toDateString();
        const isThisWeek = diffInDays < 7;
        const isThisYear = date.getFullYear() === now.getFullYear();

        if (diffInSeconds < 30) {
          displayText = 'Vừa xong';
          nextUpdateInterval = 1000;
        } else if (diffInSeconds < 60) {
          displayText = `${diffInSeconds}s`;
          nextUpdateInterval = 1000;
        } else if (diffInMinutes < 60) {
          displayText = `${diffInMinutes}p`;
          nextUpdateInterval = 60000;
        } else if (isToday) {
          displayText = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
          nextUpdateInterval = 60000;
        } else if (isThisWeek) {
          displayText = date.toLocaleDateString('vi-VN', { weekday: 'short' }) + 
                      ' ' + date.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
          nextUpdateInterval = 3600000;
        } else if (isThisYear) {
          displayText = date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short'
          });
          nextUpdateInterval = 86400000;
        } else {
          displayText = date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          nextUpdateInterval = 86400000;
        }
      }

      setDisplayTime(displayText);
      setUpdateInterval(nextUpdateInterval);
    };

    // Initial update
    updateTime();

    // Set up interval for updates
    const interval = setInterval(updateTime, updateInterval);

    return () => clearInterval(interval);
  }, [timestamp, format, showSeconds, updateInterval]);

  return (
    <span 
      className={cn("text-xs text-muted-foreground", className)}
      title={new Date(timestamp).toLocaleString('vi-VN')}
    >
      {displayTime}
    </span>
  );
};

// Hook for live time updates
export const useLiveTime = (refreshInterval: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return currentTime;
};

// Component for displaying elapsed time since a timestamp
export const ElapsedTime = ({ 
  startTime, 
  className 
}: { 
  startTime: string; 
  className?: string; 
}) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
      
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      if (hours > 0) {
        setElapsed(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return <span className={className}>{elapsed}</span>;
};
