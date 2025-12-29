import logger, { logInfo, logError, logWarn, logDebug } from '../../src/config/logger';

describe('Logger Configuration', () => {
  it('should have Winston logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBeDefined();
  });

  it('should export logInfo function', () => {
    expect(typeof logInfo).toBe('function');
  });

  it('should export logError function', () => {
    expect(typeof logError).toBe('function');
  });

  it('should export logWarn function', () => {
    expect(typeof logWarn).toBe('function');
  });

  it('should export logDebug function', () => {
    expect(typeof logDebug).toBe('function');
  });

  it('should log info messages without errors', () => {
    expect(() => logInfo('Test info message')).not.toThrow();
  });

  it('should log error messages without throwing', () => {
    const testError = new Error('Test error');
    expect(() => logError('Test error message', testError)).not.toThrow();
  });
});
