import { ConsoleLogger, SilentLogger } from '../../utils/logger.interface';

describe('ConsoleLogger', () => {
  let originalConsoleLog: any;
  let originalConsoleError: any;
  let originalConsoleWarn: any;
  let originalConsoleDebug: any;
  let mockConsoleLog: jest.Mock;
  let mockConsoleError: jest.Mock;
  let mockConsoleWarn: jest.Mock;
  let mockConsoleDebug: jest.Mock;

  beforeEach(() => {
    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleDebug = console.debug;

    // Create mock functions
    mockConsoleLog = jest.fn();
    mockConsoleError = jest.fn();
    mockConsoleWarn = jest.fn();
    mockConsoleDebug = jest.fn();

    // Replace console methods with mocks
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    console.debug = mockConsoleDebug;
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
  });

  describe('constructor', () => {
    it('should create a logger with no prefix', () => {
      const logger = new ConsoleLogger();
      logger.log('Test message');
      expect(mockConsoleLog).toHaveBeenCalledWith('Test message');
    });

    it('should create a logger with a prefix', () => {
      const logger = new ConsoleLogger('Test');
      logger.log('Test message');
      expect(mockConsoleLog).toHaveBeenCalledWith('[Test] Test message');
    });
  });

  describe('log', () => {
    it('should log a message with no additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      logger.log('Test message');
      expect(mockConsoleLog).toHaveBeenCalledWith('[Test] Test message');
    });

    it('should log a message with additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      const arg1 = { key: 'value' };
      const arg2 = [1, 2, 3];
      logger.log('Test message', arg1, arg2);
      expect(mockConsoleLog).toHaveBeenCalledWith('[Test] Test message', arg1, arg2);
    });
  });

  describe('error', () => {
    it('should log an error message with no additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      logger.error('Error message');
      expect(mockConsoleError).toHaveBeenCalledWith('[Test] Error message');
    });

    it('should log an error message with additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      const error = new Error('Test error');
      logger.error('Error message', error);
      expect(mockConsoleError).toHaveBeenCalledWith('[Test] Error message', error);
    });
  });

  describe('warn', () => {
    it('should log a warning message with no additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      logger.warn('Warning message');
      expect(mockConsoleWarn).toHaveBeenCalledWith('[Test] Warning message');
    });

    it('should log a warning message with additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      const warning = { code: 'WARN001', message: 'Test warning' };
      logger.warn('Warning message', warning);
      expect(mockConsoleWarn).toHaveBeenCalledWith('[Test] Warning message', warning);
    });
  });

  describe('debug', () => {
    it('should log a debug message with no additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      logger.debug('Debug message');
      expect(mockConsoleDebug).toHaveBeenCalledWith('[Test] Debug message');
    });

    it('should log a debug message with additional arguments', () => {
      const logger = new ConsoleLogger('Test');
      const debugInfo = { timestamp: Date.now(), context: 'test' };
      logger.debug('Debug message', debugInfo);
      expect(mockConsoleDebug).toHaveBeenCalledWith('[Test] Debug message', debugInfo);
    });
  });
});

describe('SilentLogger', () => {
  let originalConsoleLog: any;
  let originalConsoleError: any;
  let originalConsoleWarn: any;
  let originalConsoleDebug: any;
  let mockConsoleLog: jest.Mock;
  let mockConsoleError: jest.Mock;
  let mockConsoleWarn: jest.Mock;
  let mockConsoleDebug: jest.Mock;

  beforeEach(() => {
    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleDebug = console.debug;

    // Create mock functions
    mockConsoleLog = jest.fn();
    mockConsoleError = jest.fn();
    mockConsoleWarn = jest.fn();
    mockConsoleDebug = jest.fn();

    // Replace console methods with mocks
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    console.debug = mockConsoleDebug;
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
  });

  describe('log', () => {
    it('should not log any messages', () => {
      const logger = new SilentLogger();
      logger.log('Test message');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log any messages with additional arguments', () => {
      const logger = new SilentLogger();
      const arg1 = { key: 'value' };
      const arg2 = [1, 2, 3];
      logger.log('Test message', arg1, arg2);
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should not log any error messages', () => {
      const logger = new SilentLogger();
      logger.error('Error message');
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should not log any error messages with additional arguments', () => {
      const logger = new SilentLogger();
      const error = new Error('Test error');
      logger.error('Error message', error);
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should not log any warning messages', () => {
      const logger = new SilentLogger();
      logger.warn('Warning message');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should not log any warning messages with additional arguments', () => {
      const logger = new SilentLogger();
      const warning = { code: 'WARN001', message: 'Test warning' };
      logger.warn('Warning message', warning);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should not log any debug messages', () => {
      const logger = new SilentLogger();
      logger.debug('Debug message');
      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });

    it('should not log any debug messages with additional arguments', () => {
      const logger = new SilentLogger();
      const debugInfo = { timestamp: Date.now(), context: 'test' };
      logger.debug('Debug message', debugInfo);
      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });
  });
});
