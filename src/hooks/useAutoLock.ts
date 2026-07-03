import { useEffect, useRef, useCallback } from 'react';

interface UseAutoLockOptions {
  timeout?: number;
  onLock: () => void;
}

export function useAutoLock({ timeout = 300000, onLock }: UseAutoLockOptions) {
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(onLock, timeout);
  }, [timeout, onLock]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
      } else {
        resetTimer();
      }
    };

    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer, clearTimer]);

  return { resetTimer, clearTimer };
}