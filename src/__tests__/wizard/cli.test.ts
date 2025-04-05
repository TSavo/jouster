import { SetupWizard } from '../../wizard/setup-wizard';

// Mock the SetupWizard class
jest.mock('../../wizard/setup-wizard', () => ({
  SetupWizard: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock process.argv and process.cwd
const originalArgv = process.argv;
const originalCwd = process.cwd;

describe('CLI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.argv
    process.argv = ['node', 'jouster-setup'];
    
    // Mock process.cwd
    process.cwd = jest.fn().mockReturnValue('/mock/project/root');
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    // Restore process.argv and process.cwd
    process.argv = originalArgv;
    process.cwd = originalCwd;
    
    // Restore console.log
    jest.restoreAllMocks();
  });
  
  it('should run the wizard in non-interactive mode by default', async () => {
    // Import the CLI module (which will execute the main function)
    await import('../../wizard/cli');
    
    // Verify that SetupWizard was called with the correct arguments
    expect(SetupWizard).toHaveBeenCalledWith('/mock/project/root', false);
    
    // Verify that run was called
    expect(SetupWizard.mock.results[0].value.run).toHaveBeenCalled();
  });
  
  it('should run the wizard in interactive mode when --interactive flag is provided', async () => {
    // Set process.argv to include --interactive flag
    process.argv = ['node', 'jouster-setup', '--interactive'];
    
    // Import the CLI module (which will execute the main function)
    await import('../../wizard/cli');
    
    // Verify that SetupWizard was called with the correct arguments
    expect(SetupWizard).toHaveBeenCalledWith('/mock/project/root', true);
    
    // Verify that run was called
    expect(SetupWizard.mock.results[0].value.run).toHaveBeenCalled();
  });
  
  it('should run the wizard in interactive mode when -i flag is provided', async () => {
    // Set process.argv to include -i flag
    process.argv = ['node', 'jouster-setup', '-i'];
    
    // Import the CLI module (which will execute the main function)
    await import('../../wizard/cli');
    
    // Verify that SetupWizard was called with the correct arguments
    expect(SetupWizard).toHaveBeenCalledWith('/mock/project/root', true);
    
    // Verify that run was called
    expect(SetupWizard.mock.results[0].value.run).toHaveBeenCalled();
  });
  
  it('should show help message when --help flag is provided', async () => {
    // Set process.argv to include --help flag
    process.argv = ['node', 'jouster-setup', '--help'];
    
    // Import the CLI module (which will execute the main function)
    await import('../../wizard/cli');
    
    // Verify that SetupWizard was not called
    expect(SetupWizard).not.toHaveBeenCalled();
    
    // Verify that console.log was called with help message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Jouster Setup Wizard')
    );
  });
  
  it('should show help message when -h flag is provided', async () => {
    // Set process.argv to include -h flag
    process.argv = ['node', 'jouster-setup', '-h'];
    
    // Import the CLI module (which will execute the main function)
    await import('../../wizard/cli');
    
    // Verify that SetupWizard was not called
    expect(SetupWizard).not.toHaveBeenCalled();
    
    // Verify that console.log was called with help message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Jouster Setup Wizard')
    );
  });
});
