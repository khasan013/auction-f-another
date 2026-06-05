import { useState, useEffect } from 'react';

const pad = (n) => String(n).padStart(2, '0');

export const useCountdown = (endTime, options = {}) => {
  const { tickMs = 1000 } = options;

  const calcTimeLeft = () => {
    if (!endTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff,
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(calcTimeLeft());
      return undefined;
    }

    setTimeLeft(calcTimeLeft());
    const intervalId = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (t.isExpired) clearInterval(intervalId);
    }, tickMs);

    return () => clearInterval(intervalId);
  }, [endTime, tickMs]);

  const format = () => {
    if (timeLeft.isExpired) return 'Ended';
    if (timeLeft.days > 0) return `${timeLeft.days}d ${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m`;
    if (timeLeft.hours > 0) return `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;
    return `${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;
  };

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000; // < 5 min

  return { ...timeLeft, format, isUrgent };
};
