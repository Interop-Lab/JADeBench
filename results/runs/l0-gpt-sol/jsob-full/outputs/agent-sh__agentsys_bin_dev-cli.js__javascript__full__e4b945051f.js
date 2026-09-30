'use strict';

const path = require('path');
const { execSync, spawnSync } = require('child_process');

const requireCommandParser = require('../work/agent-sh/agentsys/lib/utils/command-parser.js');
const packageInfo = require('../package.json');

const VERSION = packageInfo.version;
const ROOT_DIR = path.resolve(__dirname, '..');

function loadCommand(relativePath) {
  return require(path.resolve(ROOT_DIR, relativePath));
}

function invoke(relativePath, args) {
  const command = loadCommand(relativePath);
  if (typeof command.main !== 'function') {
    return undefined;
  }
  return command.main(args);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugins.',
    handler() {
      return invoke('lib/validate-plugins.js', []);
    }
  },
  'cross-platform': {
    description: 'Validate cross-platform support.',
    handler() {
      return invoke('lib/validate-cross-platform.js', []);
    }
  },
  consistency: {
    description: 'Validate consistency.',
    handler() {
      return invoke('lib/validate-consistency.js', []);
    }
  },
  paths: {
    description: 'Validate paths.',
    handler() {
      return invoke('lib/validate-paths.js', []);
    }
  },
  counts: {
    description: 'Validate counts.',
    usage: 'validate counts [--json]',
    handler(args) {
      const result = invoke('lib/validate-counts.js', []);
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
        return result && result.status === 'ok' ? 0 : 1;
      }
      if (result && result.actual) {
        console.log(`Actual counts: ${result.actual}`);
      }
      if (result && result.expected) {
        console.log(`Expected counts: ${result.expected}`);
      }
      return result && result.status === 'ok' ? 0 : 1;
    }
  },
  'platform-docs': {
    description: 'Validate platform documentation.',
    usage: 'validate platform-docs [--json]',
    handler(args) {
      const result = invoke('lib/validate-platform-docs.js', []);
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
        return result && result.status === 'ok' ? 0 : 1;
      }
      return result && result.status === 'ok' ? 0 : 1;
    }
  },
  'agent-skill-compliance': {
    description: 'Validate agent skill compliance.',
    handler() {
      return invoke('lib/validate-agent-skill-compliance.js', []);
    }
  },
  'opencode-install': {
    description: 'Validate OpenCode installation.',
    handler() {
      return invoke('lib/validate-opencode-install.js', []);
    }
  }
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Create a plugin.',
    handler(args) {
      return invoke('lib/new/plugin.js', ['plugin', ...args]);
    }
  },
  agent: {
    description: 'Create an agent.',
    handler(args) {
      return invoke('lib/new/agent.js', ['agent', ...args]);
    }
  },
  skill: {
    description: 'Create a skill.',
    handler(args) {
      return invoke('lib/new/skill.js', ['skill', ...args]);
    }
  },
  command: {
    description: 'Create a command.',
    handler(args) {
      return invoke('lib/new/command.js', ['command', ...args]);
    }
  }
};

const COMMANDS = {
  validate: {
    description: 'Validate the project.',
    usage: 'validate <subcommand>',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler(args) {
      let failures = 0;
      for (const name of Object.keys(VALIDATE_SUBCOMMANDS)) {
        if (name === '--') {
          continue;
        }

        const command = VALIDATE_SUBCOMMANDS[name];
        console.log(`Running ${name} validation...`);

        try {
          const result = command.handler(args);
          if (typeof result === 'number' && result !== 0) {
            failures++;
            console.error(`Validation failed: ${name}`);
          }
        } catch (error) {
          failures++;
          console.error(`Validation failed: ${name}: ${error.message}`);
        }
      }

      if (failures > 0) {
        console.error(`${failures} validation(s) failed.`);
        return failures;
      }

      console.log('All validations passed.');
      return 0;
    }
  },
  preflight: {
    description: 'Run preflight checks.',
    usage: 'preflight [options]',
    handler(args) {
      return invoke('lib/preflight.js', args);
    }
  },
  bump: {
    description: 'Bump the project version.',
    usage: 'bump [options]',
    handler(args) {
      return invoke('lib/bump.js', args);
    }
  },
  'setup-hooks': {
    description: 'Set up repository hooks.',
    usage: 'setup-hooks',
    handler() {
      return invoke('lib/setup-hooks.js', []);
    }
  },
  'dev-install': {
    description: 'Install the development environment.',
    usage: 'dev-install [options]',
    handler(args) {
      return invoke('lib/dev-install.js', args);
    }
  },
  detect: {
    description: 'Detect the project configuration.',
    handler() {
      return invoke('lib/detect.js', []);
    }
  },
  verify: {
    description: 'Verify project tools.',
    handler() {
      return invoke('lib/verify.js', []);
    },
  status: {
    description: 'Show project status.',
    handler() {
      const { getActualCounts } = loadCommand('lib/validate-counts.js');
      const counts = getActualCounts();
      let toolVersion = 'unknown';

      try {
        toolVersion = execSync('claude --version', {
          cwd: ROOT_DIR,
          stdio: ['ignore', 'pipe', 'ignore']
        }).toString().trim();
      } catch {}

      console.log(`Agent SH v${VERSION}`);
      console.log(`Claude: ${toolVersion}`);
      console.log(`Skills: ${counts.skills}`);
      console.log(`Commands: ${counts.commands}`);
      console.log(`Agents: ${counts.agents}`);
      console.log(`Plugins: ${counts.plugins}`);
      return 0;
    }
  },
  test: {
    description: 'Run tests.',
    handler(args) {
      const executable = requireCommandParser.resolveExecutableForPlatform('npm');
      const commandArgs = ['test'];

      if (args.length > 0) {
        commandArgs.push('--', ...args);
      }

      const result = spawnSync(executable, commandArgs, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        shell: false,
        windowsHide: true
      });

      if (result.error) {
        throw result.error;
      }

      return typeof result.status === 'number' ? result.status : 1;
    }
  },
  'migrate-opencode': {
    description: 'Migrate to OpenCode.',
    usage: 'migrate-opencode [options]',
    handler(args) {
      return invoke('lib/migrate-opencode.js', args);
    }
  },
  'test-transform': {
    description: 'Run transformation tests.',
    handler() {
      return invoke('lib/test-transform.js', []);
    }
  },
  'gen-docs': {
    description: 'Generate documentation.',
    usage: 'gen-docs [options]',
    handler(args) {
      return invoke('lib/gen-docs.js', args);
    }
  },
  'expand-templates': {
    description: 'Expand templates.',
    usage: 'expand-templates [options]',
    handler(args) {
      return invoke('lib/expand-templates.js', args);
    }
  },
  'gen-adapters': {
    description: 'Generate adapters.',
    usage: 'gen-adapters [options]',
    handler(args) {
      return invoke('lib/gen-adapters.js', args);
    }
  },
  new: {
    description: 'Create a new project component.',
    usage: 'new <subcommand>',
    subcommands: NEW_SUBCOMMANDS,
    handler(args) {
      return invoke('lib/new.js', args);
    }
  }
};

function parseArgs(argv) {
  const result = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    args: []
  };

  let index = 0;

  while (index < argv.length) {
    const value = argv[index];

    if (value === '--help' || value === '-h') {
      result.help = true;
      index++;
      continue;
    }

    if (value === '--version' || value === '-v') {
      result.version = true;
      index++;
      continue;
    }

    break;
  }

  result.args = argv.slice(index);

  if (result.args.length > 0 && !result.args[0].startsWith('-')) {
    result.command = result.args.shift();
  }

  if (
    result.command &&
    COMMANDS[result.command] &&
    COMMANDS[result.command].subcommands &&
    result.args.length > 0 &&
    !result.args[0].startsWith('-')
  ) {
    result.subcommand = result.args.shift();
  }

  result.args = result.args.slice();
  return result;
}

function printHelp() {
  console.log(`agent-sh v${VERSION}\n`);
  console.log('Usage: agent-sh [options] <command> [arguments]\n');
  console.log('Commands:');

  for (const [name, command] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(24)} ${command.description}`);
  }

  console.log('\nOptions:');
  console.log('  -h, --help              Show help');
  console.log('  -v, --version           Show version');
}

function printCommandHelp(name, command) {
  console.log(`Usage: ${command.usage || name}\n`);
  console.log(`  ${command.description}`);

  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [subcommand, definition] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(24)} ${definition.description}`);
    }
  }

  console.log('');
}

function route(parsed) {
  if (parsed.version) {
    console.log(VERSION);
    return 0;
  }

  if (parsed.help && !parsed.command) {
    printHelp();
    return 0;
  }

  if (!parsed.command) {
    printHelp();
    return 0;
  }

  const command = COMMANDS[parsed.command];

  if (!command) {
    console.error(`Unknown command: ${parsed.command}`);
    printHelp();
    return 1;
  }

  if (parsed.help && !parsed.subcommand) {
    printCommandHelp(parsed.command, command);
    return 0;
  }

  if (parsed.subcommand && command.subcommands) {
    const subcommand = command.subcommands[parsed.subcommand];

    if (!subcommand) {
      console.error(
        `Unknown ${parsed.command} subcommand: ${parsed.subcommand}`
      );
      printCommandHelp(parsed.command, command);
      return 1;
    }

    if (parsed.help) {
      printCommandHelp(parsed.subcommand, subcommand);
      return 0;
    }

    return subcommand.handler(parsed.args);
  }

  if (parsed.help) {
    printCommandHelp(parsed.command, command);
    return 0;
  }

  return command.handler(parsed.args);
}

module.exports = {
  parseArgs,
  COMMANDS,
  VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS,
  route
};

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));

  Promise.resolve(route(parsed))
    .then(result => {
      if (typeof result === 'number') {
        process.exitCode = result;
      }
    })
    .catch(error => {
      console.error(error && error.message ? error.message : error);
      process.exitCode = 1;
    });
}
