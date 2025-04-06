/**
 * Interface for logging
 */
export interface ILogger {
  /**
   * Log an informational message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  log(message: string, ...args: any[]): void;

  /**
   * Log an error message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  error(message: string, ...args: any[]): void;

  /**
   * Log a warning message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  warn(message: string, ...args: any[]): void;

  /**
   * Log a debug message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  debug(message: string, ...args: any[]): void;
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements ILogger {
  private prefix: string;

  /**
   * Creates a new console logger
   * 
   * @param prefix Prefix for log messages
   */
  constructor(prefix: string = '') {
    this.prefix = prefix ? `[${prefix}] ` : '';
  }

  /**
   * Log an informational message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  public log(message: string, ...args: any[]): void {
    console.log(`${this.prefix}${message}`, ...args);
  }

  /**
   * Log an error message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  public error(message: string, ...args: any[]): void {
    console.error(`${this.prefix}${message}`, ...args);
  }

  /**
   * Log a warning message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  public warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix}${message}`, ...args);
  }

  /**
   * Log a debug message
   * 
   * @param message Message to log
   * @param args Additional arguments
   */
  public debug(message: string, ...args: any[]): void {
    console.debug(`${this.prefix}${message}`, ...args);
  }
}

/**
 * Silent logger implementation
 */
export class SilentLogger implements ILogger {
  public log(message: string, ...args: any[]): void {}
  public error(message: string, ...args: any[]): void {}
  public warn(message: string, ...args: any[]): void {}
  public debug(message: string, ...args: any[]): void {}
}
