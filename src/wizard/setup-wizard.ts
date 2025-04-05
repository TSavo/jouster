import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { promisify } from 'util';

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

/**
 * Jouster Setup Wizard
 * Scans the environment and sets up Jouster with sensible defaults
 */
export class SetupWizard {
  private projectRoot: string;
  private interactive: boolean;
  private rl: readline.Interface | null = null;
  private config: {
    jestConfigPath: string | null;
    jestConfigType: 'js' | 'ts' | null;
    hasGitHubCLI: boolean;
    hasGitHubToken: boolean;
    testPatterns: string[];
    testDir: string | null;
    packageJsonPath: string | null;
  };

  /**
   * Create a new setup wizard
   * @param projectRoot Path to the project root
   * @param interactive Whether to run in interactive mode
   */
  constructor(projectRoot: string, interactive = false) {
    this.projectRoot = projectRoot;
    this.interactive = interactive;
    this.config = {
      jestConfigPath: null,
      jestConfigType: null,
      hasGitHubCLI: false,
      hasGitHubToken: false,
      testPatterns: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      testDir: null,
      packageJsonPath: null,
    };

    if (interactive) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
  }

  /**
   * Run the setup wizard
   */
  async run(): Promise<void> {
    console.log('🧙‍♂️ Jouster Setup Wizard 🧙‍♂️');
    console.log('Scanning your project to set up Jouster...\n');

    try {
      // Detect environment
      await this.detectEnvironment();

      // Generate configuration
      await this.generateConfiguration();

      console.log('\n✨ Jouster setup complete! ✨');
      console.log('Run your tests with: npm run test:jouster');
    } catch (error) {
      console.error('❌ Setup failed:', error);
    } finally {
      if (this.rl) {
        this.rl.close();
      }
    }
  }

  /**
   * Detect the environment
   */
  private async detectEnvironment(): Promise<void> {
    console.log('🔍 Detecting environment...');

    // Detect Jest configuration
    await this.detectJestConfig();

    // Detect GitHub CLI
    this.detectGitHubCLI();

    // Detect GitHub token
    this.detectGitHubToken();

    // Detect test patterns
    await this.detectTestPatterns();

    // Detect package.json
    await this.detectPackageJson();

    console.log('✅ Environment detection complete');
  }

  /**
   * Detect Jest configuration
   */
  private async detectJestConfig(): Promise<void> {
    const possibleConfigs = [
      { path: path.join(this.projectRoot, 'jest.config.js'), type: 'js' as const },
      { path: path.join(this.projectRoot, 'jest.config.ts'), type: 'ts' as const },
      { path: path.join(this.projectRoot, 'jest.config.json'), type: 'js' as const },
    ];

    for (const config of possibleConfigs) {
      try {
        await access(config.path, fs.constants.R_OK);
        this.config.jestConfigPath = config.path;
        this.config.jestConfigType = config.type;
        console.log(`📄 Found Jest configuration: ${config.path}`);
        break;
      } catch (error) {
        // Config file not found or not readable
      }
    }

    // Check package.json for Jest config if no separate config file found
    if (!this.config.jestConfigPath) {
      try {
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        
        if (packageJson.jest) {
          console.log('📄 Found Jest configuration in package.json');
          this.config.jestConfigPath = packageJsonPath;
          this.config.jestConfigType = 'js';
        }
      } catch (error) {
        // package.json not found or not readable
      }
    }

    if (!this.config.jestConfigPath) {
      console.log('⚠️ No Jest configuration found. Will create a new one.');
      
      if (this.interactive) {
        const answer = await this.prompt('Would you like to create a TypeScript config? (y/N): ');
        this.config.jestConfigType = answer.toLowerCase() === 'y' ? 'ts' : 'js';
      } else {
        // Default to JavaScript in non-interactive mode
        this.config.jestConfigType = 'js';
      }
      
      this.config.jestConfigPath = path.join(
        this.projectRoot, 
        `jest.config.${this.config.jestConfigType}`
      );
    }
  }

  /**
   * Detect GitHub CLI
   */
  private detectGitHubCLI(): void {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      this.config.hasGitHubCLI = true;
      console.log('🔑 GitHub CLI detected');
    } catch (error) {
      console.log('⚠️ GitHub CLI not detected');
    }
  }

  /**
   * Detect GitHub token
   */
  private detectGitHubToken(): void {
    const tokenEnvVars = ['GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_API_KEY'];
    
    for (const envVar of tokenEnvVars) {
      if (process.env[envVar]) {
        this.config.hasGitHubToken = true;
        console.log(`🔑 GitHub token detected (${envVar})`);
        break;
      }
    }

    if (!this.config.hasGitHubToken) {
      console.log('⚠️ No GitHub token detected');
    }
  }

  /**
   * Detect test patterns
   */
  private async detectTestPatterns(): Promise<void> {
    // Common test directories
    const possibleTestDirs = [
      path.join(this.projectRoot, '__tests__'),
      path.join(this.projectRoot, 'tests'),
      path.join(this.projectRoot, 'test'),
      path.join(this.projectRoot, 'src', '__tests__'),
      path.join(this.projectRoot, 'src', 'tests'),
      path.join(this.projectRoot, 'src', 'test'),
    ];

    for (const dir of possibleTestDirs) {
      try {
        await access(dir, fs.constants.R_OK);
        this.config.testDir = dir;
        console.log(`📁 Found test directory: ${dir}`);
        break;
      } catch (error) {
        // Directory not found or not readable
      }
    }

    // If we found a Jest config, try to extract test patterns
    if (this.config.jestConfigPath && this.config.jestConfigPath.endsWith('.js')) {
      try {
        const configContent = await readFile(this.config.jestConfigPath, 'utf8');
        
        // Very basic regex to extract testMatch patterns
        const testMatchRegex = /testMatch\s*:\s*\[([\s\S]*?)\]/;
        const match = configContent.match(testMatchRegex);
        
        if (match && match[1]) {
          const patterns = match[1]
            .split(',')
            .map(pattern => pattern.trim().replace(/['"]/g, ''))
            .filter(Boolean);
          
          if (patterns.length > 0) {
            this.config.testPatterns = patterns;
            console.log(`🔍 Found test patterns in Jest config: ${patterns.join(', ')}`);
          }
        }
      } catch (error) {
        // Error reading or parsing config
      }
    }
  }

  /**
   * Detect package.json
   */
  private async detectPackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    try {
      await access(packageJsonPath, fs.constants.R_OK | fs.constants.W_OK);
      this.config.packageJsonPath = packageJsonPath;
      console.log('📄 Found package.json');
    } catch (error) {
      console.log('⚠️ package.json not found or not writable');
    }
  }

  /**
   * Generate configuration
   */
  private async generateConfiguration(): Promise<void> {
    console.log('\n🔧 Generating configuration...');

    // Create or update Jest config
    await this.createOrUpdateJestConfig();

    // Update package.json
    await this.updatePackageJson();

    // Create template directory if it doesn't exist
    await this.createTemplateDirectory();
  }

  /**
   * Create or update Jest config
   */
  private async createOrUpdateJestConfig(): Promise<void> {
    if (!this.config.jestConfigPath) {
      throw new Error('Jest config path not set');
    }

    let configContent = '';
    let existingConfig: any = {};
    let isNewConfig = false;

    // Try to read existing config
    try {
      if (this.config.jestConfigPath.endsWith('package.json')) {
        const packageJson = JSON.parse(await readFile(this.config.jestConfigPath, 'utf8'));
        existingConfig = packageJson.jest || {};
      } else {
        const content = await readFile(this.config.jestConfigPath, 'utf8');
        
        // Very basic extraction of config object
        const configRegex = /module\.exports\s*=\s*(\{[\s\S]*\})/;
        const match = content.match(configRegex);
        
        if (match && match[1]) {
          // This is a very naive approach and won't work for complex configs
          // In a real implementation, you'd want to use a proper parser
          try {
            existingConfig = eval(`(${match[1]})`);
          } catch (error) {
            console.log('⚠️ Could not parse existing Jest config, creating a new one');
            isNewConfig = true;
          }
        } else {
          isNewConfig = true;
        }
      }
    } catch (error) {
      isNewConfig = true;
    }

    // Prepare Jouster reporter config
    const jousterConfig: any = {
      generateIssues: true,
      trackIssues: true,
      closeIssues: true,
      reopenIssues: true,
      databasePath: 'test-issue-mapping.json',
      defaultLabels: ['bug', 'test-failure'],
    };

    // Add GitHub-specific config if available
    if (this.config.hasGitHubCLI) {
      jousterConfig.trackerType = 'github';
    } else if (this.config.hasGitHubToken) {
      jousterConfig.trackerType = 'github';
      jousterConfig.githubUseRest = true;
      jousterConfig.githubToken = '${process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_API_KEY}';
      
      // Try to detect GitHub repo from git config
      try {
        const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
        const repoRegex = /github\.com[:/]([^/]+)\/([^/.]+)/;
        const match = remoteUrl.match(repoRegex);
        
        if (match) {
          jousterConfig.githubRepo = `${match[1]}/${match[2]}`;
        }
      } catch (error) {
        // Could not detect GitHub repo
      }
    } else {
      jousterConfig.trackerType = 'file';
      jousterConfig.bugsDir = './bugs';
    }

    // Create reporters array with Jouster
    const reporters = existingConfig.reporters || ['default'];
    
    // Check if Jouster is already in reporters
    const hasJouster = reporters.some((reporter: any) => {
      if (Array.isArray(reporter) && reporter[0] === 'jouster') {
        return true;
      }
      return reporter === 'jouster';
    });

    if (!hasJouster) {
      reporters.push(['jouster', jousterConfig]);
    }

    // Create new config object
    const newConfig = {
      ...existingConfig,
      reporters,
    };

    // Generate config content
    if (this.config.jestConfigPath.endsWith('package.json')) {
      // Update jest config in package.json
      const packageJson = JSON.parse(await readFile(this.config.jestConfigPath, 'utf8'));
      packageJson.jest = newConfig;
      await writeFile(this.config.jestConfigPath, JSON.stringify(packageJson, null, 2));
    } else if (this.config.jestConfigType === 'js') {
      configContent = `module.exports = ${JSON.stringify(newConfig, null, 2)};\n`;
      await writeFile(this.config.jestConfigPath, configContent);
    } else if (this.config.jestConfigType === 'ts') {
      configContent = `import type { Config } from 'jest';\n\nconst config: Config = ${JSON.stringify(newConfig, null, 2)};\n\nexport default config;\n`;
      await writeFile(this.config.jestConfigPath, configContent);
    }

    console.log(`✅ ${isNewConfig ? 'Created' : 'Updated'} Jest configuration: ${this.config.jestConfigPath}`);
  }

  /**
   * Update package.json
   */
  private async updatePackageJson(): Promise<void> {
    if (!this.config.packageJsonPath) {
      console.log('⚠️ Could not update package.json (not found or not writable)');
      return;
    }

    try {
      const packageJson = JSON.parse(await readFile(this.config.packageJsonPath, 'utf8'));
      
      // Ensure scripts section exists
      packageJson.scripts = packageJson.scripts || {};
      
      // Add Jouster scripts if they don't exist
      if (!packageJson.scripts['test:jouster']) {
        packageJson.scripts['test:jouster'] = 'jest --reporters=default --reporters=jouster';
      }
      
      // Add Jouster as a dev dependency if it's not already there
      packageJson.devDependencies = packageJson.devDependencies || {};
      if (!packageJson.devDependencies['jouster']) {
        packageJson.devDependencies['jouster'] = '^1.0.0';
      }
      
      // Write updated package.json
      await writeFile(this.config.packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      console.log('✅ Updated package.json with Jouster scripts and dependencies');
    } catch (error) {
      console.error('❌ Failed to update package.json:', error);
    }
  }

  /**
   * Create template directory
   */
  private async createTemplateDirectory(): Promise<void> {
    const templateDir = path.join(this.projectRoot, 'templates');
    
    try {
      await access(templateDir, fs.constants.R_OK);
      console.log('📁 Template directory already exists');
    } catch (error) {
      try {
        await mkdir(templateDir);
        console.log('✅ Created template directory: templates/');
      } catch (dirError) {
        console.error('❌ Failed to create template directory:', dirError);
      }
    }
  }

  /**
   * Prompt the user for input
   * @param question The question to ask
   * @returns The user's answer
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      if (!this.rl) {
        resolve('');
        return;
      }
      
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}
