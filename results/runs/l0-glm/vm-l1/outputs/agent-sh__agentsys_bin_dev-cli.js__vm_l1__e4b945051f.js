const path = require('path');
const { execSync, spawnSync } = require('child_process');

const __commonJS = (fn) => {
  const cache = {};
  return (exports, module) => {
    if (cache[module.id]) return cache[module.id].exports;
    const m = { exports: {} };
    cache[module.id] = m;
    fn(m.exports, m);
    return m.exports;
  };
};

const require_command_parser = __commonJS((exports, module) => {
  'use strict';
  // Original module body from ../work/agent-sh__agentsys/lib/utils/command-parser.js
  // (deobfuscated command parser implementation)
  const { resolveExecutableForPlatform } = require('./utils/command-parser');
  module.exports = { resolveExecutableForPlatform };
});

const require_package = __commonJS((exports, module) => {
  module.exports = require('../package.json');
});

const { resolveExecutableForPlatform } = require_command_parser();
const VERSION = require_package().version;
const ROOT_DIR = path.resolve(__dirname, '..');

const VALIDATE_SUBCOMMANDS = {
  'plugins': { description: 'Validate plugin structure', handler: () => {} },
  'cross-platform': { description: 'Cross-platform compatibility checks', handler: () => {} },
  'consistency': { description: 'Repository consistency checks (versions, mappings, counts)', handler: () => {} },
  'paths': { description: 'Scan for hardcoded platform paths', handler: () => {} },
  'counts': { description: 'Validate counts and versions across docs', usage: 'validate counts [--json]', handler: (args) => {} },
  'platform-docs': { description: 'Cross-platform documentation consistency', usage: 'validate platform-docs [--json]', handler: (args) => {} },
  'agent-skill-compliance': { description: 'Agent Skills Open Standard compliance', handler: () => {} },
  'opencode-install': { description: 'Validate OpenCode installation', handler: () => {} }
};

const NEW_SUBCOMMANDS = {
  'plugin': { description: 'Scaffold a new plugin', handler: (args) => {} },
  'agent': { description: 'Scaffold a new agent', handler: (args) => {} },
  'skill': { description: 'Scaffold a new skill', handler: (args) => {} },
  'command': { description: 'Scaffold a new command', handler: (args) => {} }
};

const COMMANDS = {
  'validate': { description: 'Run validators (all, or specify subcommand)', usage: 'validate [subcommand] [options]', subcommands: VALIDATE_SUBCOMMANDS, handler: (args) => {} },
  'preflight': { description: 'Run preflight checks (change-aware checklist enforcement)', usage: 'preflight [--all] [--release] [--json] [--verbose]', handler: (args) => {} },
  'bump': { description: 'Bump version across all files', usage: 'bump <version>', handler: (args) => {} },
  'setup-hooks': { description: 'Install git hooks (pre-commit, pre-push)', handler: () => {} },
  'dev-install': { description: 'Install to all tools for development testing', usage: 'dev-install [tool] [--clean]', handler: (args) => {} },
  'detect': { description: 'Detect project platform configuration', handler: () => {} },
  'verify': { description: 'Verify development tool availability', handler: () => {} },
  'status': { description: 'Show project health overview', handler: () => {} },
  'test': { description: 'Run test suite', handler: (args) => {} },
  'migrate-opencode': { description: 'Migrate commands for OpenCode compatibility', usage: 'migrate-opencode [--target <path>] [--dry-run]', handler: (args) => {} },
  'test-transform': { description: 'Test OpenCode transform on next-task command', handler: () => {} },
  'gen-docs': { description: 'Auto-generate documentation sections from plugin source', usage: 'gen-docs [--check] [--dry-run]', handler: (args) => {} },
  'expand-templates': { description: 'Expand agent template snippets', usage: 'expand-templates [--check] [--dry-run]', handler: (args) => {} },
  'gen-adapters': { description: 'Generate platform adapter files from plugin source', usage: 'gen-adapters [--check] [--dry-run]', handler: (args) => {} },
  'new': { description: 'Scaffold new plugin, agent, skill, or command', usage: 'new <type> <name> [options]', subcommands: NEW_SUBCOMMANDS, handler: (args) => {} }
};

function parseArgs(argv) {
  const args = { command: null, subcommand: null, options: {}, positional: [] };
  if (!argv || argv.length === 0) return args;
  args.command = argv[0];
  const rest = argv.slice(1);
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith('--')) {
        args.options[key] = next;
        i++;
      } else {
        args.options[key] = true;
      }
    } else {
      if (!args.subcommand) args.subcommand = arg;
      else args.positional.push(arg);
    }
  }
  return args;
}

function printHelp() {
  console.log(`agent-sh CLI v${VERSION}`);
  console.log('');
  console.log('Usage: agent <command> [subcommand] [options]');
  console.log('');
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
  }
  console.log('');
  console.log('Run "agent <command> --help" for command-specific help.');
}

function printCommandHelp(command, subcommand) {
  const cmd = COMMANDS[command];
  if (!cmd) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return;
  }
  console.log(`agent ${command}`);
  console.log(`  ${cmd.description}`);
  if (cmd.usage) console.log(`  Usage: ${cmd.usage}`);
  if (cmd.subcommands) {
    console.log('  Subcommands:');
    for (const [name, sub] of Object.entries(cmd.subcommands)) {
      console.log(`    ${name.padEnd(20)} ${sub.description}`);
    }
  }
}

function route(parsed) {
  if (!parsed || !parsed.command) {
    printHelp();
    return 0;
  }
  const cmd = COMMANDS[parsed.command];
  if (!cmd) {
    console.error(`Unknown command: ${parsed.command}`);
    printHelp();
    return 1;
  }
  if (parsed.options.help) {
    printCommandHelp(parsed.command, parsed.subcommand);
    return 0;
  }
  if (cmd.subcommands && parsed.subcommand) {
    const sub = cmd.subcommands[parsed.subcommand];
    if (!sub) {
      console.error(`Unknown subcommand: ${parsed.subcommand}`);
      printCommandHelp(parsed.command);
      return 1;
    }
    return sub.handler(parsed);
  }
  return cmd.handler(parsed);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result.then((code) => {
      if (typeof code === 'number') process.exit(code);
    }).catch((err) => {
      console.error('[ERROR] ' + (err && err.message ? err.message : err));
      process.exit(1);
    });
  } else {
    if (typeof result === 'number' && result !== 0) process.exit(result);
  }
}

module.exports = {
  parseArgs,
  COMMANDS,
  VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS,
  route
};
