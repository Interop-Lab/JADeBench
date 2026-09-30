#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.resolve(__dirname, '..');
const WINDOWS_SHIMS = new Set(['npm', 'npx', 'pnpm', 'yarn', 'yarnpkg', 'corepack']);

function resolveExecutableForPlatform(executable, platform = process.platform) {
  if (typeof executable !== 'string' || executable.length === 0) {
    throw new Error('Executable must be a non-empty string');
  }
  if (executable.includes('\0')) {
    throw new Error('Executable contains invalid null byte');
  }
  if (platform !== 'win32') return executable;
  if (/[/\\]/.test(executable)) {
    if (/\/\.bin\/[^/]+$/i.test(executable) && !/\.[a-zA-Z0-9]+$/.test(executable)) {
      return executable.replace(/\\/g, '/') + '.cmd';
    }
    return executable;
  }
  return WINDOWS_SHIMS.has(executable.toLowerCase()) ? executable + '.cmd' : executable;
}

function script(relativePath) {
  return require(path.join(ROOT_DIR, relativePath));
}

function runMain(relativePath, args) {
  const main = script(relativePath).main;
  return args === undefined ? main() : main(args);
}

function runWithProcessArgs(relativePath, args) {
  const originalArgv = process.argv;
  process.argv = ['node', path.basename(relativePath), ...args];
  try {
    script(relativePath).main();
  } finally {
    process.argv = originalArgv;
  }
  return 0;
}

function printPathIssue(issue) {
  console.log('  ' + issue.file + ':' + issue.line + ' - ' + issue.platform);
}

function printCountIssue(issue) {
  console.log(
    '  ' + issue.file + ': ' + issue.metric + ' expected ' + issue.expected + ', got ' + issue.actual,
  );
}

function printDocumentationIssue(issue) {
  console.log('  ' + issue.file + ': ' + issue.message);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => runMain('scripts/validate-plugins.js'),
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => {
      const result = script('scripts/validate-cross-platform.js').validate();
      return result.success ? 0 : 1;
    },
  },
  consistency: {
    description: 'Repository consistency checks (versions, mappings, counts)',
    handler: () => runMain('scripts/validate-repo-consistency.js'),
  },
  paths: {
    description: 'Scan for hardcoded platform paths',
    handler: () => {
      const pluginsDirectory = path.join(ROOT_DIR, 'plugins');
      if (!fs.existsSync(pluginsDirectory)) {
        console.log('[OK] No plugins/ directory (plugins extracted to standalone repos)');
        return 0;
      }

      const issues = script('scripts/check-hardcoded-paths.js').scanDirectory(pluginsDirectory);
      if (issues.length === 0) {
        console.log('[OK] No hardcoded platform paths found');
        return 0;
      }

      console.log('[ERROR] Found ' + issues.length + ' hardcoded path issue(s)');
      issues.forEach(printPathIssue);
      return 1;
    },
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: args => {
      const result = script('scripts/validate-counts.js').runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const counts = result.actualCounts;
        console.log(
          'Plugins: ' + counts.plugins + ', Agents: ' + counts.totalAgents + ', Skills: ' + counts.skills,
        );
        if (result.status === 'ok') {
          console.log('[OK] All counts aligned');
        } else {
          console.log('[ERROR] ' + result.issues.length + ' issue(s) found');
          result.issues.forEach(printCountIssue);
        }
      }
      return result.status === 'ok' ? 0 : 1;
    },
  },
  'platform-docs': {
    description: 'Cross-platform documentation consistency',
    usage: 'validate platform-docs [--json]',
    handler: args => {
      const result = script('scripts/validate-cross-platform-docs.js').runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result.status === 'ok') {
        console.log('[OK] Cross-platform docs valid');
      } else {
        console.log('[ERROR] ' + result.issues.length + ' issue(s)');
        result.issues.forEach(printDocumentationIssue);
      }
      return result.status === 'ok' ? 0 : 1;
    },
  },
  'agent-skill-compliance': {
    description: 'Agent Skills Open Standard compliance',
    handler: () => runMain('scripts/validate-agent-skill-compliance.js'),
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => runMain('scripts/validate-opencode-install.js'),
  },
};

const NEW_SUBCOMMANDS = {};
for (const type of ['plugin', 'agent', 'skill', 'command']) {
  NEW_SUBCOMMANDS[type] = {
    description: 'Scaffold a new ' + type,
    handler: args => runMain('scripts/scaffold.js', [type, ...args]),
  };
}

function validateAll() {
  console.log('Running all validators...\n');
  let failures = 0;
  for (const name of Object.keys(VALIDATE_SUBCOMMANDS)) {
    if (name === 'opencode-install') continue;
    console.log('--- validate ' + name + ' ---');
    try {
      if (VALIDATE_SUBCOMMANDS[name].handler([]) !== 0) {
        failures++;
        console.log('[ERROR] validate ' + name + ' failed\n');
      } else {
        console.log('');
      }
    } catch (error) {
      failures++;
      console.log('[ERROR] validate ' + name + ' threw: ' + error.message + '\n');
    }
  }

  if (failures > 0) {
    console.log('[ERROR] ' + failures + ' validator(s) failed');
    return 1;
  }
  console.log('[OK] All validators passed');
  return 0;
}

function runDevelopmentInstall(args) {
  const validTools = ['claude', 'opencode', 'codex'];
  for (const arg of args) {
    if (!validTools.includes(arg) && arg !== '--clean' && !arg.startsWith('--')) {
      console.error('[ERROR] Invalid argument: ' + arg);
      console.error('Valid arguments: claude, opencode, codex, --clean');
      return 1;
    }
  }
  return runWithProcessArgs('scripts/dev-install.js', args);
}

function runMigration(args) {
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      if (index === 0 || args[index - 1] !== '--target') {
        console.error('[ERROR] Invalid argument: ' + arg);
        console.error('Valid flags: --target <path>, --dry-run');
        return 1;
      }
    } else if (arg !== '--target' && arg !== '--dry-run') {
      console.error('[ERROR] Unknown flag: ' + arg);
      console.error('Valid flags: --target <path>, --dry-run');
      return 1;
    }
  }
  return runWithProcessArgs('scripts/migrate-opencode.js', args);
}

function runTests(args) {
  const npmArgs = ['test'];
  if (args.length > 0) npmArgs.push('--', ...args);
  const result = spawnSync(resolveExecutableForPlatform('npm'), npmArgs, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error) return 1;
  return typeof result.status === 'number' ? result.status : 1;
}

function runGenerator(relativePath, args) {
  const result = runMain(relativePath, args);
  return typeof result === 'number' ? result : 0;
}

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: validateAll,
  },
  preflight: {
    description: 'Run preflight checks (change-aware checklist enforcement)',
    usage: 'preflight [--all] [--release] [--json] [--verbose]',
    handler: args => runMain('scripts/preflight.js', args),
  },
  bump: {
    description: 'Bump version across all files',
    usage: 'bump <version>',
    handler: args => runMain('scripts/bump-version.js', args),
  },
  'setup-hooks': {
    description: 'Install git hooks (pre-commit, pre-push)',
    handler: () => runMain('scripts/setup-hooks.js'),
  },
  'dev-install': {
    description: 'Install to all tools for development testing',
    usage: 'dev-install [tool] [--clean]',
    handler: runDevelopmentInstall,
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: async () => {
      const result = await script('lib/platform/detect-platform.js').detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  verify: {
    description: 'Verify development tool availability',
    handler: async () => {
      const result = await script('lib/platform/verify-tools.js').verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  status: {
    description: 'Show project health overview',
    handler: () => {
      const counts = script('scripts/validate-counts.js').getActualCounts();
      let branch = 'unknown';
      try {
        branch = execSync('git branch --show-current', { cwd: ROOT_DIR, stdio: 'pipe' })
          .toString()
          .trim();
      } catch {}
      console.log('agentsys v' + VERSION);
      console.log('Branch: ' + branch);
      console.log('Plugins: ' + counts.plugins);
      console.log(
        'Agents:  ' + counts.totalAgents + ' (' + counts.fileBasedAgents +
          ' file-based + ' + counts.roleBasedAgents + ' role-based)',
      );
      console.log('Skills:  ' + counts.skills);
      return 0;
    },
  },
  test: {
    description: 'Run test suite',
    handler: runTests,
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: runMigration,
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => runMain('scripts/test-transform.js'),
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: args => runGenerator('scripts/generate-docs.js', args),
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: args => runGenerator('scripts/expand-templates.js', args),
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: args => runGenerator('scripts/gen-adapters.js', args),
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: () => {
      console.log('Available types: plugin, agent, skill, command');
      console.log('Usage: agentsys-dev new <type> <name> [options]');
      return 1;
    },
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

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if (parsed.command === null && !arg.startsWith('-')) {
      parsed.command = arg;
    } else if (
      parsed.command !== null &&
      parsed.subcommand === null &&
      COMMANDS[parsed.command] &&
      COMMANDS[parsed.command].subcommands &&
      !arg.startsWith('-')
    ) {
      parsed.subcommand = arg;
    } else {
      parsed.rest.push(arg);
    }
  }
  return parsed;
}

function printHelp() {
  console.log(HELP_TEXT);
}

function printCommandHelp(name, command) {
  console.log('\nagentsys-dev ' + command.usage + '\n');
  console.log('  ' + command.description);
  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [subcommandName, subcommand] of Object.entries(command.subcommands)) {
      console.log('  ' + subcommandName.padEnd(24) + ' ' + subcommand.description);
    }
    console.log('');
  }
}

function route(parsed) {
  if (parsed.version) {
    console.log('agentsys-dev v' + VERSION);
    return 0;
  }

  if (parsed.help || parsed.command === null) {
    const command = parsed.command && COMMANDS[parsed.command];
    if (command) printCommandHelp(parsed.command, command);
    else printHelp();
    return 0;
  }

  const command = COMMANDS[parsed.command];
  if (!command) {
    console.error('[ERROR] Unknown command: ' + parsed.command);
    console.error("Run 'agentsys-dev --help' for available commands.");
    return 1;
  }

  if (parsed.subcommand !== null && command.subcommands) {
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error('[ERROR] Unknown subcommand: ' + parsed.command + ' ' + parsed.subcommand);
      console.error("Run 'agentsys-dev " + parsed.command + " --help' for subcommands.");
      return 1;
    }
    return subcommand.handler(parsed.rest);
  }
  return command.handler(parsed.rest);
}

const HELP_TEXT = `
agentsys-dev v6.0.1 - Developer CLI

Usage:
  agentsys-dev <command> [options]
  agentsys-dev --help
  agentsys-dev --version

Commands:
  validate                Run all validators
  validate <sub>          Run single validator:
    plugins                 Plugin structure
    cross-platform          Cross-platform compatibility
    consistency             Repo consistency (versions, mappings)
    paths                   Hardcoded platform paths
    counts [--json]         Doc counts and versions
    platform-docs [--json]  Cross-platform docs
    agent-skill-compliance  Agent Skills Open Standard
    opencode-install        OpenCode installation

  preflight [flags]       Change-aware checklist enforcement
    --all                 Run all checks regardless of changes
    --release             Include release-specific checks
    --json                Structured JSON output

  bump <version>          Bump version across all files
setup-hooks             Install git hooks
  dev-install [tool]      Install to dev tools (--clean to remove)
  detect                  Detect project platform config
  verify                  Verify dev tool availability
  status                  Show project health overview
  test                    Run test suite
  migrate-opencode        Migrate commands for OpenCode
  test-transform          Test OpenCode transform
  gen-docs                Auto-generate doc sections from source
    --check               Validate freshness (exit 1 if stale)
    --dry-run             Show changes without writing
  expand-templates        Expand agent template snippets
    --check               Validate freshness (exit 1 if stale)
    --dry-run             Show changes without writing
  gen-adapters            Generate platform adapter files from source
    --check               Validate freshness (exit 1 if stale)
    --dry-run             Show changes without writing

Scaffolding:
  new plugin <name>       Scaffold a new plugin
  new agent <name>        Scaffold a new agent (--plugin required)
  new skill <name>        Scaffold a new skill (--plugin required)
  new command <name>      Scaffold a new command (--plugin required)

User CLI (agentsys):
  agentsys                      Interactive installer
  agentsys install <plugin>     Install a specific plugin (resolves deps)
  agentsys remove <plugin>      Remove an installed plugin
  agentsys search [term]        Search available plugins
  agentsys list                 List installed plugins and versions
  agentsys update               Re-fetch latest plugin versions

Aliases (npm scripts):
  npm run new:plugin        = agentsys-dev new plugin
  npm run new:agent         = agentsys-dev new agent
  npm run new:skill         = agentsys-dev new skill
  npm run new:command       = agentsys-dev new command
  npm run validate          = agentsys-dev validate
  npm run validate:plugins  = agentsys-dev validate plugins
  npm run bump              = agentsys-dev bump
  npm run detect            = agentsys-dev detect
  npm run verify            = agentsys-dev verify
  npm run gen-docs          = agentsys-dev gen-docs
  npm run gen-docs:check    = agentsys-dev gen-docs --check
  npm run expand-templates  = agentsys-dev expand-templates
  npm run expand-templates:check = agentsys-dev expand-templates --check
  npm run gen-adapters      = agentsys-dev gen-adapters
  npm run gen-adapters:check = agentsys-dev gen-adapters --check
`;

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result
      .then(code => {
        if (typeof code === 'number') process.exit(code);
      })
      .catch(error => {
        console.error('[ERROR] ' + error.message);
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
