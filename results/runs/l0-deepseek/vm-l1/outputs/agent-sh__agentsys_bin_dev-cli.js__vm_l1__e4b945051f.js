const path = require('path');
const { execSync, spawnSync } = require('child_process');

const commandParser = require('../work/agent-sh__agentsys/lib/utils/command-parser.js');
const packageJson = require('../work/agent-sh__agentsys/package.json');

const { resolveExecutableForPlatform } = commandParser();
const VERSION = packageJson.version;
const ROOT_DIR = path.resolve(__dirname, '..');

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => validatePlugins()
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => validateCrossPlatform()
  },
  consistency: {
    description: 'Repository consistency checks (versions, mappings, counts)',
    handler: () => validateConsistency()
  },
  paths: {
    description: 'Scan for hardcoded platform paths',
    handler: () => validatePaths()
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: (args) => validateCounts(args)
  },
  'platform-docs': {
    description: 'Cross-platform documentation consistency',
    usage: 'validate platform-docs [--json]',
    handler: (args) => validatePlatformDocs(args)
  },
  'agent-skill-compliance': {
    description: 'Agent Skills Open Standard compliance',
    handler: () => validateAgentSkillCompliance()
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => validateOpencodeInstall()
  }
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Scaffold a new plugin',
    handler: (args) => newPlugin(args)
  },
  agent: {
    description: 'Scaffold a new agent',
    handler: (args) => newAgent(args)
  },
  skill: {
    description: 'Scaffold a new skill',
    handler: (args) => newSkill(args)
  },
  command: {
    description: 'Scaffold a new command',
    handler: (args) => newCommand(args)
  }
};

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: (args) => validateCommand(args)
  },
  preflight: {
    description: 'Run preflight checks (change-aware checklist enforcement)',
    usage: 'preflight [--all] [--release] [--json] [--verbose]',
    handler: (args) => preflight(args)
  },
  bump: {
    description: 'Bump version across all files',
    usage: 'bump <version>',
    handler: (args) => bump(args)
  },
  'setup-hooks': {
    description: 'Install git hooks (pre-commit, pre-push)',
    handler: () => setupHooks()
  },
  'dev-install': {
    description: 'Install to all tools for development testing',
    usage: 'dev-install [tool] [--clean]',
    handler: (args) => devInstall(args)
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: () => detect()
  },
  verify: {
    description: 'Verify development tool availability',
    handler: () => verify()
  },
  status: {
    description: 'Show project health overview',
    handler: () => status()
  },
  test: {
    description: 'Run test suite',
    handler: (args) => test(args)
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: (args) => migrateOpencode(args)
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => testTransform()
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: (args) => genDocs(args)
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: (args) => expandTemplates(args)
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: (args) => genAdapters(args)
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: (args) => newCommand(args)
  }
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        result[k] = v;
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith('-')) {
      result[arg.slice(1)] = true;
    } else {
      result._.push(arg);
    }
  }
  return result;
}

function printHelp() {
  console.log('Usage: agent-sh <command> [options]');
  console.log('');
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
  }
}

function printCommandHelp(commandName, subcommandName) {
  const command = COMMANDS[commandName];
  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    return;
  }
  console.log(`Usage: ${command.usage}`);
  console.log('');
  console.log(command.description);
  if (command.subcommands) {
    console.log('');
    console.log('Subcommands:');
    for (const [name, sub] of Object.entries(command.subcommands)) {
      console.log(`  ${name.padEnd(20)} ${sub.description}`);
    }
  }
}

function route(parsedArgs) {
  const commandName = parsedArgs._[0];
  if (!commandName) {
    printHelp();
    return;
  }
  const command = COMMANDS[commandName];
  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    return 1;
  }
  const subcommandName = parsedArgs._[1];
  if (command.subcommands) {
    if (!subcommandName) {
      printCommandHelp(commandName);
      return;
    }
    const subcommand = command.subcommands[subcommandName];
    if (!subcommand) {
      console.error(`Unknown subcommand: ${subcommandName}`);
      return 1;
    }
    return subcommand.handler(parsedArgs);
  }
  return command.handler(parsedArgs);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result.then(code => {
      if (typeof code === 'number') process.exit(code);
    }).catch(err => {
      console.error('[ERROR] ' + err.message);
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
