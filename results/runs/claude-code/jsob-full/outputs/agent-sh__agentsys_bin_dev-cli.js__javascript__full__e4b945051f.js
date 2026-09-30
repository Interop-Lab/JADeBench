#!/usr/bin/env node
'use strict';

const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const VERSION = '6.0.1';

function loadScript(file) {
  return require(path.join(ROOT_DIR, 'scripts', file));
}

function runScript(file, args = []) {
  const script = loadScript(file);
  return script.main(args);
}

function scriptCommand(description, file, usage) {
  return {
    description,
    ...(usage ? { usage } : {}),
    handler: args => runScript(file, args),
  };
}

const VALIDATE_SUBCOMMANDS = {
  plugins: scriptCommand('Validate plugin structure', 'validate-plugins.js'),
  'cross-platform': scriptCommand(
    'Cross-platform compatibility checks',
    'validate-cross-platform.js',
  ),
  consistency: scriptCommand(
    'Repository consistency checks (versions, mappings, counts)',
    'validate-repo-consistency.js',
  ),
  paths: scriptCommand('Scan for hardcoded platform paths', 'check-hardcoded-paths.js'),
  counts: scriptCommand('Validate counts and versions across docs', 'validate-counts.js'),
  'platform-docs': scriptCommand(
    'Cross-platform documentation consistency',
    'validate-cross-platform-docs.js',
  ),
  'agent-skill-compliance': scriptCommand(
    'Agent Skills Open Standard compliance',
    'validate-agent-skill-compliance.js',
  ),
  'opencode-install': scriptCommand(
    'Validate OpenCode installation',
    'validate-opencode-install.js',
  ),
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Scaffold a new plugin',
    handler: args => runScript('scaffold.js', ['plugin', ...args]),
  },
  agent: {
    description: 'Scaffold a new agent',
    handler: args => runScript('scaffold.js', ['agent', ...args]),
  },
  skill: {
    description: 'Scaffold a new skill',
    handler: args => runScript('scaffold.js', ['skill', ...args]),
  },
  command: {
    description: 'Scaffold a new command',
    handler: args => runScript('scaffold.js', ['command', ...args]),
  },
};

function runAllValidators() {
  console.log('Running all validators...\n');
  let failures = 0;

  for (const [name, validator] of Object.entries(VALIDATE_SUBCOMMANDS)) {
    if (name === 'opencode-install') continue;

    console.log(`--- validate ${name} ---`);
    try {
      const result = validator.handler([]);
      if (result !== 0) {
        failures++;
        console.log(`[ERROR] validate ${name} failed\n`);
      } else {
        console.log('');
      }
    } catch (error) {
      failures++;
      console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
    }
  }

  if (failures > 0) {
    console.log(`[ERROR] ${failures} validator(s) failed`);
    return 1;
  }

  console.log('[OK] All validators passed');
  return 0;
}

function runTests(args) {
  const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(executable, ['test', '--', ...args], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  return result.status ?? 1;
}

function showStatus() {
  console.log('Project status');
  try {
    const branch = execSync('git branch --show-current', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    console.log(`  Branch: ${branch || '(detached)'}`);
  } catch {
    console.log('  Branch: unavailable');
  }
  return 0;
}

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: runAllValidators,
  },
  preflight: scriptCommand(
    'Run preflight checks (change-aware checklist enforcement)',
    'preflight.js',
  ),
  bump: scriptCommand('Bump version across all files', 'bump-version.js'),
  'setup-hooks': scriptCommand(
    'Install git hooks (pre-commit, pre-push)',
    'setup-hooks.js',
  ),
  'dev-install': scriptCommand(
    'Install to all tools for development testing',
    'dev-install.js',
  ),
  detect: scriptCommand('Detect project platform configuration', 'detect-platform.js'),
  verify: scriptCommand('Verify development tool availability', 'verify-tools.js'),
  status: {
    description: 'Show project health overview',
    handler: showStatus,
  },
  test: {
    description: 'Run test suite',
    handler: runTests,
  },
  'migrate-opencode': scriptCommand(
    'Migrate commands for OpenCode compatibility',
    'migrate-opencode.js',
  ),
  'test-transform': scriptCommand(
    'Test OpenCode transform on next-task command',
    'test-opencode-transform.js',
  ),
  'gen-docs': scriptCommand(
    'Auto-generate documentation sections from plugin source',
    'generate-docs.js',
  ),
  'expand-templates': scriptCommand(
    'Expand agent template snippets',
    'expand-templates.js',
  ),
  'gen-adapters': scriptCommand(
    'Generate platform adapter files from plugin source',
    'gen-adapters.js',
  ),
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <plugin|agent|skill|command> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: args => runScript('scaffold.js', args),
  },
};

function parseArgs(args) {
  const parsed = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    rest: [],
  };

  let index = 0;
  while (index < args.length) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      parsed.help = true;
      index++;
    } else if (argument === '--version' || argument === '-v') {
      parsed.version = true;
      index++;
    } else {
      break;
    }
  }

  if (index < args.length && !args[index].startsWith('-')) {
    parsed.command = args[index++];
  }

  if (
    index < args.length &&
    !args[index].startsWith('-') &&
    COMMANDS[parsed.command]?.subcommands
  ) {
    parsed.subcommand = args[index++];
  }

  parsed.rest = args.slice(index);
  if (parsed.rest.includes('--help') || parsed.rest.includes('-h')) {
    parsed.help = true;
    parsed.rest = parsed.rest.filter(arg => arg !== '--help' && arg !== '-h');
  }

  return parsed;
}

function printHelp() {
  console.log(`\nagentsys-dev v${VERSION}`);
  console.log('\nUsage: agentsys-dev <command> [options]\n');
  console.log('Commands:');
  for (const [name, command] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${command.description}`);
  }
  console.log("\nRun 'agentsys-dev <command> --help' for command details.\n");
}

function printCommandHelp(name, command) {
  console.log(`\nagentsys-dev ${command.usage || name}\n`);
  console.log(`  ${command.description}\n`);
  if (command.subcommands) {
    console.log('Subcommands:');
    for (const [subcommand, details] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(20)} ${details.description}`);
    }
    console.log('');
  }
}

function route(parsed) {
  if (parsed.version) {
    console.log(`agentsys-dev v${VERSION}`);
    return 0;
  }

  if (!parsed.command) {
    printHelp();
    return 0;
  }

  const command = COMMANDS[parsed.command];
  if (!command) {
    console.error(`[ERROR] Unknown command: ${parsed.command}`);
    console.error("Run 'agentsys-dev --help' for available commands.");
    return 1;
  }

  if (parsed.help && !parsed.subcommand) {
    printCommandHelp(parsed.command, command);
    return 0;
  }

  if (parsed.subcommand && command.subcommands) {
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error(`[ERROR] Unknown subcommand: ${parsed.command} ${parsed.subcommand}`);
      console.error(`Run 'agentsys-dev ${parsed.command} --help' for subcommands.`);
      return 1;
    }
    if (parsed.help) {
      console.log(`\nagentsys-dev ${subcommand.usage || `${parsed.command} ${parsed.subcommand}`}\n`);
      console.log(`  ${subcommand.description}\n`);
      return 0;
    }
    return subcommand.handler(parsed.rest);
  }

  return command.handler(parsed.rest);
}

if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
  if (result && typeof result.then === 'function') {
    result
      .then(code => {
        if (typeof code === 'number') process.exit(code);
      })
      .catch(error => {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
      });
  } else if (typeof result === 'number' && result !== 0) {
    process.exit(result);
  }
}

module.exports = {
  parseArgs,
  COMMANDS,
  VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS,
  route,
};
