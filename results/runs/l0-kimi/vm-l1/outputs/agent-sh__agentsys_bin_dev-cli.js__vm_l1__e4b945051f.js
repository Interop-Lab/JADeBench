#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const path = require('path');

const VERSION = require('../work/agent-sh__agentsys/package.json').version;
const ROOT_DIR = path.resolve(__dirname, '..');

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => {}
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => {}
  },
  consistency: {
    description: 'Repository consistency checks (versions, mappings, counts)',
    handler: () => {}
  },
  paths: {
    description: 'Scan for hardcoded platform paths',
    handler: () => {}
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: (_opts) => {}
  },
  'platform-docs': {
    description: 'Cross-platform documentation consistency',
    usage: 'validate platform-docs [--json]',
    handler: (_opts) => {}
  },
  'agent-skill-compliance': {
    description: 'Agent Skills Open Standard compliance',
    handler: () => {}
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => {}
  }
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Scaffold a new plugin',
    handler: (_opts) => {}
  },
  agent: {
    description: 'Scaffold a new agent',
    handler: (_opts) => {}
  },
  skill: {
    description: 'Scaffold a new skill',
    handler: (_opts) => {}
  },
  command: {
    description: 'Scaffold a new command',
    handler: (_opts) => {}
  }
};

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: (_opts) => {}
  },
  preflight: {
    description: 'Run preflight checks (change-aware checklist enforcement)',
    usage: 'preflight [--all] [--release] [--json] [--verbose]',
    handler: (_opts) => {}
  },
  bump: {
    description: 'Bump version across all files',
    usage: 'bump <version>',
    handler: (_opts) => {}
  },
  'setup-hooks': {
    description: 'Install git hooks (pre-commit, pre-push)',
    handler: () => {}
  },
  'dev-install': {
    description: 'Install to all tools for development testing',
    usage: 'dev-install [tool] [--clean]',
    handler: (_opts) => {}
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: () => {}
  },
  verify: {
    description: 'Verify development tool availability',
    handler: () => {}
  },
  status: {
    description: 'Show project health overview',
    handler: () => {}
  },
  test: {
    description: 'Run test suite',
    handler: (_opts) => {}
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: (_opts) => {}
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => {}
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: (_opts) => {}
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: (_opts) => {}
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: (_opts) => {}
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: (_opts) => {}
  }
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { command: null, subcommand: null, options: {}, positional: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        result.options[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.options[arg.slice(2)] = args[++i];
      } else {
        result.options[arg.slice(2)] = true;
      }
    } else if (arg.startsWith('-')) {
      result.options[arg.slice(1)] = true;
    } else if (!result.command) {
      result.command = arg;
    } else if (!result.subcommand && COMMANDS[result.command]?.subcommands) {
      result.subcommand = arg;
    } else {
      result.positional.push(arg);
    }
  }
  
  return result;
}

function printHelp() {
  console.log(`Agent CLI v${VERSION}`);
  console.log('');
  console.log('Usage: agent <command> [subcommand] [options]');
  console.log('');
  console.log('Commands:');
  
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
    if (cmd.subcommands) {
      for (const [subname, sub] of Object.entries(cmd.subcommands)) {
        console.log(`    ${subname.padEnd(18)} ${sub.description}`);
      }
    }
  }
  
  console.log('');
  console.log('Global options:');
  console.log('  --help, -h           Show help');
  console.log('  --version            Show version');
}

function printCommandHelp(commandName, subcommandName) {
  const cmd = COMMANDS[commandName];
  if (!cmd) {
    console.error(`Unknown command: ${commandName}`);
    return;
  }
  
  if (subcommandName && cmd.subcommands) {
    const sub = cmd.subcommands[subcommandName];
    if (!sub) {
      console.error(`Unknown subcommand: ${subcommandName}`);
      return;
    }
    console.log(`${commandName} ${subcommandName}`);
    console.log('');
    console.log(sub.description);
    if (sub.usage) {
      console.log('');
      console.log(`Usage: ${sub.usage}`);
    }
  } else {
    console.log(commandName);
    console.log('');
    console.log(cmd.description);
    if (cmd.usage) {
      console.log('');
      console.log(`Usage: ${cmd.usage}`);
    }
    if (cmd.subcommands) {
      console.log('');
      console.log('Subcommands:');
      for (const [name, sub] of Object.entries(cmd.subcommands)) {
        console.log(`  ${name.padEnd(18)} ${sub.description}`);
      }
    }
  }
}

function route(parsed) {
  if (parsed.options.help || parsed.options.h) {
    if (parsed.command) {
      printCommandHelp(parsed.command, parsed.subcommand);
    } else {
      printHelp();
    }
    return 0;
  }
  
  if (parsed.options.version) {
    console.log(VERSION);
    return 0;
  }
  
  if (!parsed.command) {
    printHelp();
    return 1;
  }
  
  const cmd = COMMANDS[parsed.command];
  if (!cmd) {
    console.error(`Unknown command: ${parsed.command}`);
    return 1;
  }
  
  if (parsed.subcommand && cmd.subcommands) {
    const sub = cmd.subcommands[parsed.subcommand];
    if (!sub) {
      console.error(`Unknown subcommand: ${parsed.subcommand}`);
      return 1;
    }
    return sub.handler(parsed);
  }
  
  return cmd.handler(parsed);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv);
  const result = route(parsed);
  
  if (result && typeof result.then === 'function') {
    result.then(code => {
      if (typeof code === 'number') {
        process.exit(code);
      }
    }).catch(err => {
      console.error('[ERROR] ' + (err.message || err));
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
  route
};
