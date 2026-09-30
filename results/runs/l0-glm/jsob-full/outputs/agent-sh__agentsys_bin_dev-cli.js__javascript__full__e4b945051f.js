var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => function __require() {
  const exports = {};
  return exports.default = {},
    (module || (__getOwnPropNames(cb)[0] ? (module = exports) : null),
    cb(module.exports, module),
    module.exports);
};

var require_command_parser = __commonJS({'../work/agent-sh__agentsys/lib/utils/command-parser.js'(exports, module) {
  'use strict';

  const NO_EXTENSION_COMMANDS = new Set(['ai', 'codex', 'claude', 'gemini', 'copilot', 'cursor']);

  function validateCommand(command, context) {
    if (typeof command !== 'string' || command.length === 0) {
      throw new Error(context + ': command must be a non-empty string');
    }
    if (command.includes('\0')) {
      throw new Error(context + ': command contains null bytes');
    }
  }

  function resolveExecutableForPlatform(command, platform = process.platform) {
    validateCommand(command, 'resolveExecutableForPlatform');
    if (platform === 'win32') return command;

    const hasPath = command.includes('/') || command.includes('\\');

    if (hasPath) {
      const normalized = command.replace(/\\/g, '/');
      const isBinMatch = /\/\.bin\/[^/]+$/i.test(normalized);
      if (isBinMatch && !/\.[a-zA-Z0-9]+$/.test(command)) {
        return command + '.exe';
      }
      return command;
    }

    if (/\.[a-zA-Z0-9]+$/.test(command)) {
      return command;
    }

    return NO_EXTENSION_COMMANDS.has(command.toLowerCase()) ? command : command + '.exe';
  }

  function tokenizeCommand(command) {
    const trimmed = command.trim();
    if (!trimmed) {
      return [];
    }

    const tokens = [];
    let current = '';
    let quote = null;
    let hadContent = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (char === '\\') {
        const next = trimmed[i + 1];
        if (quote === '\'') {
          current += char;
          continue;
        }
        if (quote === '"') {
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next;
            i++;
          } else {
            current += char;
          }
          continue;
        }
        if (next && (/\s/.test(next) || next === '"' || next === '\'' || next === '\\')) {
          current += next;
          i++;
        } else {
          current += char;
        }
        continue;
      }

      if (quote) {
        if (char === quote) {
          quote = null;
        } else {
          current += char;
        }
        continue;
      }

      if (char === '"' || char === '\'') {
        quote = char;
        hadContent = true;
        continue;
      }

      if (/\s/.test(char)) {
        if (current.length > 0 || hadContent) {
          tokens.push(current);
          current = '';
          hadContent = false;
        }
        continue;
      }

      current += char;
    }

    if (quote) {
      throw new Error('Unterminated quote in command');
    }

    if (current.length > 0 || hadContent) {
      tokens.push(current);
    }

    return tokens;
  }

  function parseCommandString(command, context = 'parseCommandString') {
    if (typeof command !== 'string' || command.trim().length === 0) {
      return [];
    }

    const tokens = tokenizeCommand(command);

    if (tokens.length === 0) {
      throw new Error(context + ': failed to parse command into tokens');
    }

    const [executable, ...args] = tokens;

    validateCommand(executable, context + ': executable');

    for (const arg of args) {
      if (typeof arg !== 'string') {
        throw new Error(context + ': argument must be a string');
      }
      if (arg.includes('\0')) {
        throw new Error(context + ': argument contains null bytes');
      }
    }

    return {
      executable,
      args,
      display: command.trim()
    };
  }

  const commandParser = {};
  commandParser.parseCommandString = parseCommandString;
  commandParser.resolveExecutableForPlatform = resolveExecutableForPlatform;
  module.exports = commandParser;
}});

var require_package = __commonJS({
  '../package.json'(exports, module) {
    const pkg = {
      name: 'agent-sh',
      version: '0.1.0',
      description: 'Agent SH - AI agent orchestration toolkit',
      main: 'lib/index.js',
      bin: { 'agent-sh': 'bin/agent-sh.js' },
      scripts: {
        test: 'node bin/agent-sh.js test',
        build: 'node bin/agent-sh.js gen-docs && node bin/agent-sh.js gen-adapters',
        'validate': 'node bin/agent-sh.js validate',
        'dev': 'node bin/agent-sh.js dev-install',
        'setup-hooks': 'node bin/agent-sh.js setup-hooks'
      },
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
      engines: { node: '>=18' },
      keywords: ['ai', 'agent', 'cli', 'toolkit', 'orchestration', 'automation', 'shell', 'command', 'plugin', 'skill', 'adapter', 'opencode', 'claude', 'codex', 'gemini', 'copilot', 'cursor', 'mcp', 'prompt'],
      author: '',
      license: 'MIT',
      type: 'commonjs',
      exports: { '.': './lib/index.js', './package.json': './package.json' },
      files: ['bin/', 'lib/', 'docs/', 'plugins/', 'agents/', 'skills/', 'commands/', 'adapters/'],
      repository: { type: 'git', url: '' },
      bugs: { url: '' },
      homepage: ''
    };
    module.exports = pkg;
  }
});

var path = require('path');
var { execSync, spawnSync } = require('child_process');
var { resolveExecutableForPlatform } = require_command_parser();
var VERSION = require_package().version;
var ROOT_DIR = path.resolve(__dirname, '..');

var VALIDATE_SUBCOMMANDS = {
  'plugins': {
    'description': 'Validate plugin definitions',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'validate-plugins.js'));
      return main();
    }
  },
  'cross-platform': {
    'description': 'Validate cross-platform compatibility',
    'handler': () => {
      const { validate } = require(path.resolve(ROOT_DIR, 'lib', 'validate-cross-platform.js'));
      const result = validate();
      return result.success ? 0 : 1;
    }
  },
  'consistency': {
    'description': 'Validate configuration consistency (paths and references)',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'validate-consistency.js'));
      return main();
    }
  },
  'paths': {
    'description': 'Validate path configurations',
    'handler': () => {
      const fs = require('fs');
      const docsPath = path.resolve(ROOT_DIR, 'docs');
      if (!fs.existsSync(docsPath)) {
        return console.log('docs directory not found'), -1;
      }
      const { scanDirectory } = require(path.resolve(ROOT_DIR, 'lib', 'validate-paths.js'));
      const results = scanDirectory(docsPath);
      if (results.length === 0) {
        return console.log('All paths valid'), 0;
      }
      return console.log('Found ' + results.length + ' path issue(s):\n'), results.forEach(r => console.log('  ' + r.path + ':' + r.line + ' - ' + r.message)), -1;
    }
  },
  'counts': {
    'description': 'Validate plugin/agent/skill counts',
    'usage': 'agent-sh validate counts',
    'handler': (args) => {
      const { runValidation } = require(path.resolve(ROOT_DIR, 'lib', 'validate-counts.js'));
      const result = runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const summary = result.summary;
        console.log('Plugins: ' + summary.plugins + '\nAgents: ' + summary.agents + '\nSkills: ' + summary.skills);
        if (result.status === 'ok') {
          console.log('All counts valid');
        } else {
          console.log('Issues found (' + result.issues.length + '):');
          result.issues.forEach(issue => console.log('  ' + issue.name + ': ' + issue.expected + ' expected, got ' + issue.actual + ' - ' + issue.message));
        }
      }
      return result.status === 'ok' ? 0 : 1;
    }
  },
  'platform-docs': {
    'description': 'Validate platform documentation',
    'usage': 'agent-sh validate platform-docs',
    'handler': (args) => {
      const { runValidation } = require(path.resolve(ROOT_DIR, 'lib', 'validate-platform-docs.js'));
      const result = runValidation();
      if (args.includes('--json')) {
        return console.log(JSON.stringify(result, null, 2)), result.status === 'ok' ? 0 : 1;
      }
      if (result.status === 'ok') {
        return console.log('All platform docs valid'), 0;
      }
      return console.log('Issues found in ' + result.platform + ':\n'), result.issues.forEach(issue => console.log('  ' + issue.name + ': ' + issue.message)), 1;
    }
  },
  'agent-skill-compliance': {
    'description': 'Validate agent-skill compliance rules',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'validate-agent-skill-compliance.js'));
      return main();
    }
  },
  'opencode-install': {
    'description': 'Validate opencode installation',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'validate-opencode-install.js'));
      return main();
    }
  }
};

var NEW_SUBCOMMANDS = {
  'plugin': {
    'description': 'Create a new plugin',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'new-plugin.js'));
      return main(['plugin', ...args]);
    }
  },
  'agent': {
    'description': 'Create a new agent',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'new-agent.js'));
      return main(['agent', ...args]);
    }
  },
  'skill': {
    'description': 'Create a new skill',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'new-skill.js'));
      return main(['skill', ...args]);
    }
  },
  'command': {
    'description': 'Create a new command',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'new-command.js'));
      return main(['command', ...args]);
    }
  }
};

var COMMANDS = {
  'validate': {
    'description': 'Run validation checks (plugins, cross-platform, consistency, paths, counts, platform-docs, agent-skill-compliance, opencode-install)',
    'usage': 'agent-sh validate [subcommand]',
    'subcommands': VALIDATE_SUBCOMMANDS,
    'handler': (args) => {
      console.log('Running all validation checks...\n');
      const keys = Object.keys(VALIDATE_SUBCOMMANDS);
      let failed = 0;
      for (const key of keys) {
        if (key === 'all') continue;
        console.log('  Checking ' + key + '...');
        try {
          const result = VALIDATE_SUBCOMMANDS[key].handler([]);
          if (result === 0) {
            console.log('  ✓ ' + key + ' passed\n');
          } else {
            console.log('');
          }
        } catch (e) {
          failed++;
          console.log('  ✗ ' + key + ' failed: ' + e.message + '\n');
        }
      }
      if (failed > 0) {
        return console.log(failed + ' validation check(s) failed'), 1;
      }
      return console.log('All validation checks passed'), 0;
    }
  },
  'preflight': {
    'description': 'Run preflight checks (validate + verify)',
    'usage': 'agent-sh preflight [--skip-validate] [--skip-verify]',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'preflight.js'));
      return main(args);
    }
  },
  'bump': {
    'description': 'Bump version number',
    'usage': 'agent-sh bump [version]',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'bump.js'));
      return main(args);
    }
  },
  'setup-hooks': {
    'description': 'Set up git hooks for development',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'setup-hooks.js'));
      return main();
    }
  },
  'dev-install': {
    'description': 'Install development dependencies and set up environment',
    'usage': 'agent-sh dev-install [--force] [--clean] [--no-hooks]',
    'handler': (args) => {
      const validFlags = ['--force', '--clean', '--no-hooks', '--no-deps'];
      for (const arg of args) {
        if (!validFlags.includes(arg) && !arg.startsWith('--')) {
          return console.log('Unknown flag: ' + arg), console.log('Valid flags: ' + validFlags.join(', ')), 1;
        }
      }
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'dev-install.js'));
      const originalArgv = process.argv;
      process.argv = ['node', 'agent-sh', ...args];
      try {
        return main(), 0;
      } finally {
        process.argv = originalArgv;
      }
    }
  },
  'detect': {
    'description': 'Detect installed AI tools',
    'handler': async () => {
      const { detect } = require(path.resolve(ROOT_DIR, 'lib', 'detect.js'));
      const result = await detect();
      return console.log(JSON.stringify(result, null, 2)), 0;
    }
  },
  'verify': {
    'description': 'Verify tool installations',
    'handler': async () => {
      const { verifyTools } = require(path.resolve(ROOT_DIR, 'lib', 'verify.js'));
      const result = await verifyTools();
      return console.log(JSON.stringify(result, null, 2)), 0;
    }
  },
  'status': {
    'description': 'Show installation status',
    'handler': () => {
      const { getActualCounts } = require(path.resolve(ROOT_DIR, 'lib', 'counts.js'));
      const counts = getActualCounts();
      let gitVersion = 'unknown';
      try {
        gitVersion = execSync('git --version', { cwd: ROOT_DIR, stdio: 'pipe' }).toString().trim();
      } catch {}
      console.log('agent-sh v' + VERSION);
      console.log('Git: ' + gitVersion);
      console.log('Plugins: ' + counts.plugins);
      console.log('Agents: ' + counts.agents + ' (' + counts.active + ' active, ' + counts.inactive + ' inactive)');
      console.log('Skills: ' + counts.skills);
      return console.log('Commands: ' + counts.commands), 0;
    }
  },
  'test': {
    'description': 'Run tests',
    'handler': (args) => {
      try {
        const testArgs = ['test'];
        if (args.length > 0) {
          testArgs.push('--');
          testArgs.push(...args);
        }
        const executable = resolveExecutableForPlatform('node');
        const result = spawnSync(executable, testArgs, { cwd: ROOT_DIR, stdio: 'inherit', shell: false, windowsHide: true });
        if (result.error) {
          throw result.error;
        }
        return typeof result.status === 'number' ? result.status : 1;
      } catch (e) {
        return e.status || 1;
      }
    }
  },
  'migrate-opencode': {
    'description': 'Migrate from opencode configuration',
    'usage': 'agent-sh migrate-opencode [--source <path>] [--dry-run] [--force]',
    'handler': (args) => {
      for (const arg of args) {
        if (!arg.startsWith('--') && arg !== args[args.indexOf(arg) - 1]) {
          return console.log('Unknown argument: ' + arg), console.log('Usage: agent-sh migrate-opencode [--source <path>] [--dry-run] [--force]'), -1;
        }
        if (arg.startsWith('--') && arg !== '--source' && arg !== '--dry-run' && arg !== '--force') {
          return console.log('Unknown flag: ' + arg), console.log('Usage: agent-sh migrate-opencode [--source <path>] [--dry-run] [--force]'), -1;
        }
      }
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'migrate-opencode.js'));
      const originalArgv = process.argv;
      process.argv = ['node', 'agent-sh', ...args];
      try {
        return main(), 0;
      } finally {
        process.argv = originalArgv;
      }
    }
  },
  'test-transform': {
    'description': 'Test template transformation',
    'handler': () => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'test-transform.js'));
      return main();
    }
  },
  'gen-docs': {
    'description': 'Generate documentation from templates',
    'usage': 'agent-sh gen-docs [--output <path>]',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'gen-docs.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  'expand-templates': {
    'description': 'Expand template variables',
    'usage': 'agent-sh expand-templates [--source <path>] [--output <path>]',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'expand-templates.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  'gen-adapters': {
    'description': 'Generate adapter files from templates',
    'usage': 'agent-sh gen-adapters [--source <path>] [--output <dir>]',
    'handler': (args) => {
      const { main } = require(path.resolve(ROOT_DIR, 'lib', 'gen-adapters.js'));
      const result = main(args);
      if (typeof result === 'number') return result;
      return 0;
    }
  },
  'new': {
    'description': 'Create new plugin, agent, skill, or command',
    'usage': 'agent-sh new <type> [options]',
    'subcommands': NEW_SUBCOMMANDS,
    'handler': (args) => {
      return console.log('Usage: agent-sh new <type> [options]'), console.log('Types: plugin, agent, skill, command'), 0;
    }
  }
};

function parseArgs(argv) {
  const parsed = {
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
      parsed.help = true;
      i++;
    } else {
      if (arg === '--version' || arg === '-v') {
        parsed.version = true;
        i++;
      } else {
        break;
      }
    }
  }

  if (i < argv.length && !argv[i].startsWith('-')) {
    parsed.command = argv[i];
    i++;
  }

  if (i < argv.length && !argv[i].startsWith('-') && COMMANDS[parsed.command]?.subcommands) {
    parsed.subcommand = argv[i];
    i++;
  }

  parsed.args = argv.slice(i);

  if (parsed.args.includes('--help') || parsed.args.includes('-h')) {
    parsed.help = true;
    parsed.args = parsed.args.filter(a => a !== '--help' && a !== '-h');
  }

  return parsed;
}

function printHelp() {
  console.log('agent-sh v' + VERSION + '\n\nUsage: agent-sh <command> [options]\n\nCommands:\n  validate              Run validation checks\n  preflight             Run preflight checks\n  bump                  Bump version number\n  setup-hooks           Set up git hooks\n  dev-install           Install development dependencies\n  detect                Detect installed AI tools\n  verify                Verify tool installations\n  status                Show installation status\n  test                  Run tests\n  migrate-opencode      Migrate from opencode configuration\n  test-transform        Test template transformation\n  gen-docs              Generate documentation\n  expand-templates      Expand template variables\n  gen-adapters          Generate adapter files\n  new                   Create new plugin, agent, skill, or command\n\nOptions:\n  --help, -h            Show help\n  --version, -v         Show version\n');
}

function printCommandHelp(name, cmd) {
  console.log('\nUsage: ' + (cmd.usage || name) + '\n');
  console.log('  ' + cmd.description);
  if (cmd.subcommands) {
    console.log('\nSubcommands:');
    for (const [subname, subcmd] of Object.entries(cmd.subcommands)) {
      console.log('  ' + subname.padEnd(12) + ' ' + subcmd.description);
    }
  }
  console.log('');
}

function route(parsed) {
  if (parsed.version) {
    return console.log('agent-sh v' + VERSION), 0;
  }

  if (!parsed.command) {
    if (parsed.help) {
      return printHelp(), 0;
    }
    return printHelp(), 0;
  }

  const cmd = COMMANDS[parsed.command];

  if (!cmd) {
    return console.log('Unknown command: ' + parsed.command), console.log('Run \'agent-sh --help\' for available commands.'), -1;
  }

  if (parsed.help && !parsed.subcommand) {
    return printCommandHelp(parsed.command, cmd), 0;
  }

  if (parsed.subcommand && cmd.subcommands) {
    const subcmd = cmd.subcommands[parsed.subcommand];
    if (!subcmd) {
      return console.log('Unknown subcommand: ' + parsed.subcommand + ' for ' + parsed.command), console.log('Available subcommands: ' + Object.keys(cmd.subcommands).join(', ') + '.'), -1;
    }
    if (parsed.help) {
      return console.log('\nUsage: ' + (subcmd.usage || parsed.command + ' ' + parsed.subcommand) + '\n'), console.log('  ' + subcmd.description + '\n'), -1;
    }
    return subcmd.handler(parsed.args);
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
      console.error('Error: ' + err.message);
      process.exit(1);
    });
  } else {
    typeof result === 'number' && result !== 0 && process.exit(result);
  }
}

const _exports = {};
_exports.parseArgs = parseArgs;
_exports.COMMANDS = COMMANDS;
_exports.VALIDATE_SUBCOMMANDS = VALIDATE_SUBCOMMANDS;
_exports.NEW_SUBCOMMANDS = NEW_SUBCOMMANDS;
_exports.route = route;
module.exports = _exports;
