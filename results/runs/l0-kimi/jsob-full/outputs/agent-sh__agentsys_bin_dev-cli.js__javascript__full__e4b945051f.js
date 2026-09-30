const path = require('path');
const { execSync, spawnSync } = require('child_process');
const VERSION = require('./package.json').version;
const ROOT_DIR = path.resolve(__dirname, '..');

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin configurations',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-plugins.js'));
      return main();
    }
  },
  'cross-platform': {
    description: 'Validate cross-platform compatibility',
    handler: () => {
      const { validate } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-cross-platform.js'));
      const result = validate();
      return result.valid ? 0 : 1;
    }
  },
  consistency: {
    description: 'Validate consistency across the codebase',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-consistency.js'));
      return main();
    }
  },
  paths: {
    description: 'Validate file paths and references',
    handler: () => {
      const fs = require('fs');
      const scanDir = path.resolve(ROOT_DIR, 'src');
      if (!fs.existsSync(scanDir)) {
        console.log('Source directory not found');
        return 1;
      }
      const { scanDirectory } = require(path.resolve(ROOT_DIR, 'scripts', 'scan-directory.js'));
      const results = scanDirectory(scanDir);
      if (results.length === 0) {
        console.log('No path issues found');
        return 0;
      }
      console.log(`Found ${results.length} path issues:`);
      results.forEach(issue => console.log(`  ${issue.file}:${issue.line} - ${issue.message}`));
      return 1;
    }
  },
  counts: {
    description: 'Validate code counts and metrics',
    usage: 'agent-sh validate counts [--json]',
    handler: (args) => {
      const { runValidation } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-counts.js'));
      const result = runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const stats = result.statistics;
        console.log(`Total files: ${stats.totalFiles}`);
        console.log(`Total lines: ${stats.totalLines}`);
        console.log(`Total functions: ${stats.totalFunctions}`);
        if (result.status === 'ok') {
          console.log('All counts are within acceptable ranges');
        } else {
          console.log('Warning: Some counts exceed recommended limits');
          result.warnings.forEach(w => console.log(`  ${w.file}: ${w.message}`));
        }
      }
      return result.status === 'ok' ? 0 : 1;
    }
  },
  'platform-docs': {
    description: 'Validate platform documentation',
    usage: 'agent-sh validate platform-docs [--json]',
    handler: (args) => {
      const { runValidation } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-platform-docs.js'));
      const result = runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
        return result.status === 'ok' ? 0 : 1;
      }
      if (result.status === 'ok') {
        console.log('Platform documentation is valid');
        return 0;
      }
      console.log(`Found ${result.issues.length} documentation issues:`);
      result.issues.forEach(issue => console.log(`  ${issue.file}: ${issue.message}`));
      return 1;
    }
  },
  'agent-skill-compliance': {
    description: 'Validate agent skill compliance',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-agent-skill-compliance.js'));
      return main();
    }
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'validate-opencode-install.js'));
      return main();
    }
  }
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Create a new plugin',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'new-plugin.js'));
      return main(['new', ...args]);
    }
  },
  agent: {
    description: 'Create a new agent',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'new-agent.js'));
      return main(['new', ...args]);
    }
  },
  skill: {
    description: 'Create a new skill',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'new-skill.js'));
      return main(['new', ...args]);
    }
  },
  command: {
    description: 'Create a new command',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'new-command.js'));
      return main(['new', ...args]);
    }
  }
};

const COMMANDS = {
  validate: {
    description: 'Run validation checks on the codebase',
    usage: 'agent-sh validate <subcommand>',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: (args) => {
      console.log('Available validation subcommands:');
      const subcommands = Object.keys(VALIDATE_SUBCOMMANDS);
      let failed = 0;
      for (const subcmd of subcommands) {
        if (subcmd === 'counts') continue;
        console.log(`  - ${subcmd}: ${VALIDATE_SUBCOMMANDS[subcmd].description}`);
        try {
          const result = VALIDATE_SUBCOMMANDS[subcmd].handler([]);
          if (result !== 0) {
            failed++;
            console.log(`    Warning: ${subcmd} validation failed`);
          } else {
            console.log('');
          }
        } catch (e) {
          failed++;
          console.log(`    Error: ${subcmd} validation threw an exception: ${e.message}`);
        }
      }
      if (failed > 0) {
        console.log(`\n${failed} validation(s) failed.`);
        return 1;
      }
      console.log('\nAll validations passed!');
      return 0;
    }
  },
  preflight: {
    description: 'Run preflight checks before deployment',
    usage: 'agent-sh preflight [--verbose]',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'preflight.js'));
      return main(args);
    }
  },
  bump: {
    description: 'Bump version numbers',
    usage: 'agent-sh bump [major|minor|patch]',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'bump.js'));
      return main(args);
    }
  },
  'setup-hooks': {
    description: 'Set up git hooks for the repository',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'setup-hooks.js'));
      return main();
    }
  },
  'dev-install': {
    description: 'Install development dependencies and set up environment',
    usage: 'agent-sh dev-install [--force] [--clean]',
    handler: (args) => {
      const validFlags = ['--force', '--clean', '--verbose', '--dry-run'];
      for (const arg of args) {
        if (!validFlags.includes(arg) && !arg.startsWith('--')) {
          console.log(`Unknown argument: ${arg}`);
          console.log(`Valid arguments: ${validFlags.join(', ')}`);
          return 1;
        }
      }
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'dev-install.js'));
      const originalArgv = process.argv;
      process.argv = ['node', 'dev-install.js', ...args];
      try {
        return main();
      } finally {
        process.argv = originalArgv;
      }
    }
  },
  detect: {
    description: 'Detect project configuration and environment',
    handler: async () => {
      const { detect } = require(path.resolve(ROOT_DIR, 'scripts', 'detect.js'));
      const result = await detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }
  },
  verify: {
    description: 'Verify tools and dependencies are installed',
    handler: async () => {
      const { verifyTools } = require(path.resolve(ROOT_DIR, 'scripts', 'verify.js'));
      const result = await verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }
  },
  status: {
    description: 'Show current project status',
    handler: () => {
      const { getActualCounts } = require(path.resolve(ROOT_DIR, 'scripts', 'get-counts.js'));
      const counts = getActualCounts();
      let gitInfo = 'unknown';
      try {
        gitInfo = execSync('git rev-parse --short HEAD', { cwd: ROOT_DIR, stdio: 'pipe' }).toString().trim();
      } catch {}
      console.log(`Version: v${VERSION}`);
      console.log(`Git commit: ${gitInfo}`);
      console.log(`Files: ${counts.files}`);
      console.log(`Lines: ${counts.lines} (${counts.code} code, ${counts.comments} comments, ${counts.blank} blank)`);
      console.log(`Functions: ${counts.functions}`);
      return 0;
    }
  },
  test: {
    description: 'Run tests',
    handler: (args) => {
      try {
        const testArgs = ['test'];
        if (args.length > 0) {
          testArgs.push('--');
          testArgs.push(...args);
        }
        const npmPath = resolveExecutableForPlatform('npm');
        const result = spawnSync(npmPath, testArgs, { cwd: ROOT_DIR, stdio: 'inherit', shell: false, windowsHide: true });
        if (result.error) {
          throw result.error;
        }
        return typeof result.status === 'number' ? result.status : 1;
      } catch (e) {
        return e.code || 1;
      }
    }
  },
  'migrate-opencode': {
    description: 'Migrate from OpenCode to the new format',
    usage: 'agent-sh migrate-opencode <source> <destination> [--force]',
    handler: (args) => {
      for (const arg of args) {
        if (!arg.startsWith('--') && args.indexOf(arg) === args.length - 1) {
          console.log(`Unknown argument: ${arg}`);
          console.log('Usage: agent-sh migrate-opencode <source> <destination> [--force]');
          return 1;
        }
        if (arg.startsWith('--') && arg !== '--force') {
          console.log(`Unknown flag: ${arg}`);
          console.log('Valid flags: --force');
          return 1;
        }
      }
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'migrate-opencode.js'));
      const originalArgv = process.argv;
      process.argv = ['node', 'migrate-opencode.js', ...args];
      try {
        return main();
      } finally {
        process.argv = originalArgv;
      }
    }
  },
  'test-transform': {
    description: 'Test code transformation',
    handler: () => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'test-transform.js'));
      return main();
    }
  },
  'gen-docs': {
    description: 'Generate documentation from code',
    usage: 'agent-sh gen-docs [--output <dir>] [--format <md|html>]',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'gen-docs.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  'expand-templates': {
    description: 'Expand template files with variables',
    usage: 'agent-sh expand-templates [--input <dir>] [--output <dir>] [--vars <file>]',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'expand-templates.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  'gen-adapters': {
    description: 'Generate adapter code for different platforms',
    usage: 'agent-sh gen-adapters [--platform <name>] [--output <dir>]',
    handler: (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'scripts', 'gen-adapters.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  new: {
    description: 'Create new project components',
    usage: 'agent-sh new <type> [name]',
    subcommands: NEW_SUBCOMMANDS,
    handler: (args) => {
      console.log('Usage: agent-sh new <type> [name]');
      console.log('Types: plugin, agent, skill, command');
      return 0;
    }
  }
};

function resolveExecutableForPlatform(cmd, platform = process.platform) {
  if (platform === 'win32') {
    const pathVar = process.env.PATH || '';
    const paths = pathVar.split(/[;:]/);
    for (const p of paths) {
      const fullPath = path.join(p, cmd + '.exe');
      if (require('fs').existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  return cmd;
}

function parseArgs(argv) {
  const result = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    args: []
  };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      i++;
    } else if (arg === '--version' || arg === '-v') {
      result.version = true;
      i++;
    } else {
      break;
    }
  }
  if (i < argv.length && !argv[i].startsWith('-')) {
    result.command = argv[i];
    i++;
  }
  if (i < argv.length && !argv[i].startsWith('-') && COMMANDS[result.command]?.subcommands) {
    result.subcommand = argv[i];
    i++;
  }
  result.args = argv.slice(i);
  if (result.args.includes('--help') || result.args.includes('-h')) {
    result.help = true;
    result.args = result.args.filter(a => a !== '--help' && a !== '-h');
  }
  return result;
}

function printHelp() {
  console.log(`agent-sh v${VERSION}
A CLI tool for managing agent-based projects

Usage: agent-sh <command> [options]

Commands:
  validate          Run validation checks on the codebase
  preflight         Run preflight checks before deployment
  bump              Bump version numbers
  setup-hooks       Set up git hooks for the repository
  dev-install       Install development dependencies
  detect            Detect project configuration
  verify            Verify tools and dependencies
  status            Show current project status
  test              Run tests
  migrate-opencode  Migrate from OpenCode format
  test-transform    Test code transformation
  gen-docs          Generate documentation
  expand-templates  Expand template files
  gen-adapters      Generate adapter code
  new               Create new project components

Options:
  -h, --help        Show help
  -v, --version     Show version

For more information on a command, run: agent-sh <command> --help`);
}

function printCommandHelp(commandName, command) {
  console.log(`Usage: agent-sh ${commandName} [options]`);
  console.log(`  ${command.description}`);
  if (command.usage) {
    console.log(`\nUsage: ${command.usage}`);
  }
  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [subName, sub] of Object.entries(command.subcommands)) {
      console.log(`  ${subName.padEnd(20)} ${sub.description}`);
    }
  }
  console.log('');
}

function route(parsed) {
  if (parsed.version) {
    console.log(`agent-sh v${VERSION}`);
    return 0;
  }
  if (!parsed.command) {
    if (parsed.help) {
      printHelp();
      return 0;
    }
    printHelp();
    return 1;
  }
  const cmd = COMMANDS[parsed.command];
  if (!cmd) {
    console.log(`Unknown command: ${parsed.command}`);
    console.log('Run "agent-sh --help" for available commands.');
    return 1;
  }
  if (parsed.help && !parsed.subcommand) {
    printCommandHelp(parsed.command, cmd);
    return 0;
  }
  if (parsed.subcommand && cmd.subcommands) {
    const sub = cmd.subcommands[parsed.subcommand];
    if (!sub) {
      console.log(`Unknown subcommand: ${parsed.subcommand}`);
      console.log(`Available subcommands: ${Object.keys(cmd.subcommands).join(', ')}`);
      return 1;
    }
    if (parsed.help) {
      console.log(`Usage: agent-sh ${parsed.command} ${parsed.subcommand} [options]`);
      console.log(`  ${sub.description || cmd.description}`);
      if (sub.usage) {
        console.log(`\nUsage: ${sub.usage}`);
      }
      return 0;
    }
    return sub.handler(parsed.args);
  }
  return cmd.handler(parsed.args);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result.then(code => {
      if (typeof code === 'number') process.exit(code);
    }).catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
  } else if (typeof result === 'number') {
    process.exit(result);
  }
}

module.exports = {
  parseArgs,
  COMMANDS,
  VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS,
  route
};
