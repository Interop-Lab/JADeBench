'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

function runScript(script, args = []) {
  const scriptPath = path.join(ROOT_DIR, 'scripts', script);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  return typeof result.status === 'number' ? result.status : 1;
}

function runScaffold(type, args) {
  return runScript('new.js', [type, ...args]);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: args => runScript('validate-plugins.js', args)
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: args => runScript('validate-cross-platform.js', args)
  },
  consistency: {
    description: 'Cross-platform documentation consistency',
    handler: args => runScript('validate-consistency.js', args)
  },
  paths: {
    description: 'Scan for hardcoded platform paths',
    handler: args => runScript('validate-paths.js', args)
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: args => runScript('validate-counts.js', args)
  },
  'platform-docs': {
    description: 'Repository consistency checks (versions, mappings, counts)',
    usage: 'validate platform-docs [--json]',
    handler: args => runScript('validate-platform-docs.js', args)
  },
  'agent-skill-compliance': {
    description: 'Agent Skills Open Standard compliance',
    handler: args => runScript('validate-agent-skill-compliance.js', args)
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: args => runScript('validate-opencode-install.js', args)
  }
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Scaffold a new plugin',
    handler: args => runScaffold('plugin', args)
  },
  agent: {
    description: 'Scaffold a new agent',
    handler: args => runScaffold('agent', args)
  },
  skill: {
    description: 'Scaffold a new skill',
    handler: args => runScaffold('skill', args)
  },
  command: {
    description: 'Scaffold a new command',
    handler: args => runScaffold('command', args)
  }
};

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: args => runScript('validate.js', args)
  },
  preflight: {
    description: 'Run preflight checks (change-aware checklist enforcement)',
    usage: 'preflight [--all] [--release] [--json] [--verbose]',
    handler: args => runScript('preflight.js', args)
  },
  bump: {
    description: 'Bump version across all files',
    usage: 'bump <version>',
    handler: args => runScript('bump.js', args)
  },
  'setup-hooks': {
    description: 'Install git hooks (pre-commit, pre-push)',
    handler: args => runScript('setup-hooks.js', args)
  },
  'dev-install': {
    description: 'Install to all tools for development testing',
    usage: 'dev-install [tool] [--clean]',
    handler: args => runScript('dev-install.js', args)
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: args => runScript('detect.js', args)
  },
  verify: {
    description: 'Verify development tool availability',
    handler: args => runScript('verify.js', args)
  },
  status: {
    description: 'Show project health overview',
    handler: args => runScript('status.js', args)
  },
  test: {
    description: 'Run test suite',
    handler: args => runScript('test.js', args)
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: args => runScript('migrate-opencode.js', args)
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: args => runScript('test-transform.js', args)
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: args => runScript('gen-docs.js', args)
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: args => runScript('expand-templates.js', args)
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: args => runScript('gen-adapters.js', args)
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: args => runScript('new.js', args)
  }
};

function parseArgs(argv) {
  const input = Array.isArray(argv) ? argv.slice() : [];
  const positionals = [];
  const options = Object.create(null);
  const flags = new Set();
  let parsingOptions = true;

  for (let index = 0; index < input.length; index++) {
    const token = input[index];

    if (parsingOptions && token === '--') {
      parsingOptions = false;
      continue;
    }

    if (parsingOptions && typeof token === 'string' && token.startsWith('--')) {
      const equalsIndex = token.indexOf('=');

      if (equalsIndex !== -1) {
        const name = token.slice(2, equalsIndex);
        const value = token.slice(equalsIndex + 1);
        options[name] = value;
        flags.add(name);
        continue;
      }

      const name = token.slice(2);

      if (
        index + 1 < input.length &&
        typeof input[index + 1] === 'string' &&
        !input[index + 1].startsWith('-')
      ) {
        options[name] = input[++index];
      } else {
        options[name] = true;
      }

      flags.add(name);
      continue;
    }

    if (
      parsingOptions &&
      typeof token === 'string' &&
      token.length > 1 &&
      token[0] === '-'
    ) {
      const names = token.slice(1);

      if (
        names.length === 1 &&
        index + 1 < input.length &&
        typeof input[index + 1] === 'string' &&
        !input[index + 1].startsWith('-')
      ) {
        options[names] = input[++index];
        flags.add(names);
      } else {
        for (const name of names) {
          options[name] = true;
          flags.add(name);
        }
      }

      continue;
    }

    positionals.push(token);
  }

  const command = positionals.length > 0 ? positionals[0] : null;
  const subcommand = positionals.length > 1 ? positionals[1] : null;

  return {
    command,
    subcommand,
    args: positionals.slice(1),
    positionals,
    options,
    flags,
    raw: input
  };
}

function printCommandHelp(name, command = COMMANDS[name]) {
  if (!command) {
    console.error(`Unknown command: ${name}`);
    return 1;
  }

  console.log(`Usage: agentsys ${command.usage || name}`);
  console.log('');
  console.log(command.description);

  if (command.subcommands) {
    console.log('');
    console.log('Subcommands:');

    const names = Object.keys(command.subcommands);
    const width = Math.max(...names.map(subcommand => subcommand.length));

    for (const subcommand of names) {
      const definition = command.subcommands[subcommand];
      console.log(`  ${subcommand.padEnd(width)}  ${definition.description}`);
    }
  }

  return 0;
}

function printHelp() {
  let version;

  try {
    version = require('../package.json').version;
  } catch (_) {
    version = undefined;
  }

  console.log(`AgentSys${version ? ` v${version}` : ''}`);
  console.log('');
  console.log('Usage: agentsys <command> [options]');
  console.log('');
  console.log('Commands:');

  const names = Object.keys(COMMANDS);
  const width = Math.max(...names.map(name => name.length));

  for (const name of names) {
    console.log(`  ${name.padEnd(width)}  ${COMMANDS[name].description}`);
  }

  console.log('');
  console.log('Run "agentsys <command> --help" for command-specific help.');
  return 0;
}

function route(parsed) {
  const input = Array.isArray(parsed) ? parseArgs(parsed) : parsed || parseArgs([]);
  const commandName = input.command;
  const options = input.options || Object.create(null);

  if (!commandName || commandName === 'help' || options.help || options.h) {
    if (commandName && COMMANDS[commandName]) {
      return printCommandHelp(commandName, COMMANDS[commandName]);
    }

    return printHelp();
  }

  if (commandName === 'version' || options.version || options.v) {
    try {
      console.log(require('../package.json').version);
      return 0;
    } catch (_) {
      return 1;
    }
  }

  const command = COMMANDS[commandName];

  if (!command) {
    console.error(`[ERROR] Unknown command: ${commandName}`);
    printHelp();
    return 1;
  }

  const args = Array.isArray(input.args) ? input.args.slice() : [];

  if (command.subcommands && args.length > 0) {
    const subcommandName = args[0];
    const subcommand = command.subcommands[subcommandName];

    if (subcommand) {
      if (options.help || options.h) {
        return printCommandHelp(
          `${commandName} ${subcommandName}`,
          subcommand
        );
      }

      return subcommand.handler(args.slice(1));
    }
  }

  return command.handler(args);
}

if (require.main === module) {
  try {
    const result = route(parseArgs(process.argv.slice(2)));

    if (result && typeof result.then === 'function') {
      result
        .then(code => {
          if (typeof code === 'number') {
            process.exit(code);
          }
        })
        .catch(error => {
          console.error(`[ERROR] ${error.message}`);
          process.exit(1);
        });
    } else if (typeof result === 'number' && result !== 0) {
      process.exit(result);
    }
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseArgs,
  COMMANDS,
  VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS,
  route
};
