// @ts-nocheck
import { jest } from '@jest/globals';

// Mock child_process module
export const exec = jest.fn().mockImplementation((command, callback) => {
  if (command.includes('gh --version')) {
    callback(null, { stdout: 'gh version 2.0.0' });
  } else if (command.includes('gh issue create')) {
    callback(null, { stdout: 'https://github.com/owner/repo/issues/123' });
  } else if (command.includes('gh issue close')) {
    callback(null, { stdout: 'Issue closed' });
  } else if (command.includes('gh issue reopen')) {
    callback(null, { stdout: 'Issue reopened' });
  } else if (command.includes('gh issue comment')) {
    callback(null, { stdout: 'Comment added' });
  } else if (command.includes('git --version')) {
    callback(null, { stdout: 'git version 2.30.0' });
  } else if (command.includes('git rev-parse --abbrev-ref HEAD')) {
    callback(null, { stdout: 'main' });
  } else if (command.includes('git rev-parse HEAD')) {
    callback(null, { stdout: '1234567890abcdef' });
  } else if (command.includes('git log -1 --pretty="%s"')) {
    callback(null, { stdout: 'Test commit message' });
  } else if (command.includes('git log -1 --pretty="%an"')) {
    callback(null, { stdout: 'Test Author' });
  } else {
    callback(new Error(`Command not mocked: ${command}`));
  }
});

export const execSync = jest.fn().mockImplementation((command) => {
  if (command.includes('gh --version')) {
    return Buffer.from('gh version 2.0.0');
  } else if (command.includes('git --version')) {
    return Buffer.from('git version 2.30.0');
  } else if (command.includes('git rev-parse --abbrev-ref HEAD')) {
    return Buffer.from('main');
  } else if (command.includes('git rev-parse HEAD')) {
    return Buffer.from('1234567890abcdef');
  } else if (command.includes('git log -1 --pretty="%s"')) {
    return Buffer.from('Test commit message');
  } else if (command.includes('git log -1 --pretty="%an"')) {
    return Buffer.from('Test Author');
  } else {
    throw new Error(`Command not mocked: ${command}`);
  }
});

// Export the mock
export default {
  exec,
  execSync
};

// Add a dummy test to avoid Jest error
describe('Child Process Mock', () => {
  it('should provide mock child process functions', () => {
    expect(exec).toBeDefined();
    expect(execSync).toBeDefined();
  });
});
