/**
 * Frontend logging utility for Lab View application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  sessionId: string;
  url?: string;
  userAgent?: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private sessionId: string;
  private userId?: string;
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 1000;
  private isProduction: boolean;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.sessionId = this.generateSessionId();
    this.isProduction = import.meta.env.PROD;
    
    // Initialize session
    this.info('Logger initialized', 'Logger', {
      sessionId: this.sessionId,
      logLevel: LogLevel[this.logLevel],
      isProduction: this.isProduction
    });

    // Set up error capturing
    this.setupGlobalErrorHandlers();
    
    // Periodically save logs to localStorage
    setInterval(() => this.saveLogsToStorage(), 30000); // Every 30 seconds
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      default: return this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled Error', 'GlobalErrorHandler', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', 'GlobalErrorHandler', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.info(`User logged in: ${userId}`, 'Auth');
  }

  clearUserId(): void {
    if (this.userId) {
      this.info(`User logged out: ${this.userId}`, 'Auth');
    }
    this.userId = undefined;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      data,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined
    };
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (level < this.logLevel) return;

    const entry = this.createLogEntry(level, message, context, data);
    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Console output with styling
    this.logToConsole(entry);

    // Send critical errors to backend
    if (level >= LogLevel.ERROR) {
      this.sendLogToBackend(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, data } = entry;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] ${context || 'App'}:`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`🔍 ${prefix}`, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ ${prefix}`, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ ${prefix}`, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`❌ ${prefix}`, message, data || '');
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  private async sendLogToBackend(entry: LogEntry): Promise<void> {
    try {
      // Only send errors to backend to avoid spam
      if (entry.level >= LogLevel.ERROR) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frontend_log: entry,
            source: 'frontend'
          })
        });

        if (!response.ok) {
          console.warn('Failed to send log to backend:', response.statusText);
        }
      }
    } catch (error) {
      console.warn('Error sending log to backend:', error);
    }
  }

  private saveLogsToStorage(): void {
    try {
      const recentLogs = this.logs.slice(-100); // Keep last 100 logs
      localStorage.setItem('labview_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  // Public logging methods
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  // Utility methods
  logApiCall(method: string, url: string, status: number, duration: number, error?: string): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${status} (${duration}ms)`;
    
    this.log(level, message, 'API', {
      method,
      url,
      status,
      duration,
      error
    });
  }

  logUserAction(action: string, details?: unknown): void {
    this.info(`User action: ${action}`, 'UserAction', details);
  }

  logPageView(path: string): void {
    this.info(`Page view: ${path}`, 'Navigation');
  }

  logUploadStart(filename: string, size: number): void {
    this.info(`Upload started: ${filename} (${(size / 1024 / 1024).toFixed(2)}MB)`, 'Upload');
  }

  logUploadComplete(filename: string, duration: number): void {
    this.info(`Upload completed: ${filename} in ${(duration / 1000).toFixed(2)}s`, 'Upload');
  }

  logUploadError(filename: string, error: string): void {
    this.error(`Upload failed: ${filename}`, 'Upload', { error });
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Export logs for support
  exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      userId: this.userId,
      exported: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('labview_logs');
    this.info('Logs cleared', 'Logger');
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const debug = (message: string, context?: string, data?: unknown) => logger.debug(message, context, data);
export const info = (message: string, context?: string, data?: unknown) => logger.info(message, context, data);
export const warn = (message: string, context?: string, data?: unknown) => logger.warn(message, context, data);
export const error = (message: string, context?: string, data?: unknown) => logger.error(message, context, data);

// Development helper
if (!import.meta.env.PROD) {
  (window as any).labViewLogger = logger;
  console.info('🔧 Lab View Logger attached to window.labViewLogger for debugging');
}