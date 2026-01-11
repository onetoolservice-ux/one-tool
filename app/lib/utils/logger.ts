/**
 * Logger Utility
 * 
 * Environment-aware logging that only logs in development mode
 * Prevents sensitive information leakage in production
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info';

function shouldLog(): boolean {
  return process.env.NODE_ENV === 'development';
}

export const logger = {
  log: (...args: any[]) => {
    if (shouldLog()) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but in production send to error tracking service
    if (shouldLog()) {
      console.error(...args);
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // TODO: Integrate with error tracking service
    }
  },
  
  warn: (...args: any[]) => {
    if (shouldLog()) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (shouldLog()) {
      console.info(...args);
    }
  },
};
