#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.join(__dirname, '..');

function resolveExecutableForPlatform(command) {
  if (process.platform !== 'win32') return command;
  const extension = path.extname(command);
  return extension ? command : `${command}.cmd`;
}

function requireFromRoot(relativePath) {
  return require(path.join(ROOT_DIR, relativePath));
}

function runMain(relativePath, args) {
  const loaded = requireFromRoot(relativePath);
  return args === undefined ? loaded.main() : loaded.main(args);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => runMain('scripts/validate-plugins.js'),
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => {
      const result = requireFromRoot('scripts/validate-cross-platform.js').validate();
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
      return runMain('scripts/validate-paths.js');
    },
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: args => {
      const result = requireFromRoot('scripts/validate-counts.js').runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const counts = result.actualCounts;
        console.log(`Plugins: ${counts.plugins}, Agents: ${counts.totalAgents}, Skills: ${counts.skills}`);
        if (result.status === 'ok') {
          console.log('[OK] All counts aligned');
        } else {
          console.log(`[ERROR] ${result.issues.length} issue(s) found`);
          result.issues.forEach(issue => {
            console.log(`  ${issue.type}: ${issue.message} expected ${issue.expected}, got ${issue.actual}`);
          });
        }
      }
      return result.status === 'ok' ? 0 : 1;
    },
  },
  'platform-docs': {
    description: 'Cross-platform documentation consistency',
    usage: 'validate platform-docs [--json]',
    handler: args => {
      const result = requireFromRoot('scripts/validate-cross-platform-docs.js').runValidation();
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result.status === 'ok') {
        console.log('[OK] Cross-platform docs valid');
      } else {
        console.log(`[ERROR] ${result.issues.length} issue(s)`);
        result.issues.forEach(issue => console.log(`  ${issue.type}: ${issue.message}`));
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

function scaffold(type, args) {
  return runMain('scripts/scaffold.js', [type, ...args]);
}

const NEW_SUBCOMMANDS = {
  plugin: { description: 'Scaffold a new plugin', handler: args => scaffold('plugin', args) },
  agent: { description: 'Scaffold a new agent', handler: args => scaffold('agent', args) },
  skill: { description: 'Scaffold a new skill', handler: args => scaffold('skill', args) },
  command: { description: 'Scaffold a new command', handler: args => scaffold('command', args) },
};

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: async args => {
      const subcommand = args[0];
      if (subcommand && VALIDATE_SUBCOMMANDS[subcommand]) {
        return VALIDATE_SUBCOMMANDS[subcommand].handler(args.slice(1));
      }

      console.log('Running all validators...\n');
      let failures = 0;
      const validators = Object.entries(VALIDATE_SUBCOMMANDS).filter(([name]) => name !== 'opencode-install');
      for (const [name, validator] of validators) {
        console.log(`--- validate ${name} ---`);
        try {
          const status = await validator.handler(args);
          if (status !== 0) {
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
      if (failures) console.log(`[ERROR] ${failures} validator(s) failed`);
      else console.log('[OK] All validators passed');
      return failures ? 1 : 0;
    },
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
    handler: args => {
      const validArguments = new Set(['claude', 'opencode', 'codex', '--clean']);
      const invalid = args.find(argument => !validArguments.has(argument));
      if (invalid) {
        console.error(`[ERROR] Invalid argument: ${invalid}`);
        console.error('Valid arguments: claude, opencode, codex, --clean');
        return 1;
      }
      const previousArgv = process.argv;
      process.argv = ['node', 'dev-install.js', ...args];
      try {
        runMain('scripts/dev-install.js');
        return 0;
      } finally {
        process.argv = previousArgv;
      }
    },
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: () => {
      const result = requireFromRoot('lib/platform/detect-platform.js').detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  verify: {
    description: 'Verify development tool availability',
    handler: () => {
      const result = requireFromRoot('lib/platform/verify-tools.js').verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  status: {
    description: 'Show project health overview',
    handler: () => {
      const counts = requireFromRoot('scripts/validate-counts.js').getActualCounts();
      let branch = 'unknown';
      try {
        branch = execSync('git branch --show-current', { cwd: ROOT_DIR, encoding: 'utf8' }).trim() || 'unknown';
      } catch {}
      console.log(`agentsys v${VERSION}`);
      console.log(`Branch: ${branch}`);
      console.log(`Plugins: ${counts.plugins}`);
      console.log(`Agents:  ${counts.totalAgents} (${counts.fileBasedAgents} file-based + ${counts.roleBasedAgents} role-based)`);
      console.log(`Skills:  ${counts.skills}`);
      return 0;
    },
  },
  test: {
    description: 'Run test suite',
    handler: args => {
      const testArgs = args.length ? ['test', '--', ...args] : ['test'];
      try {
        const result = spawnSync(resolveExecutableForPlatform('npm'), testArgs, {
          cwd: ROOT_DIR,
          stdio: 'inherit',
          shell: false,
          windowsHide: true,
        });
        return typeof result.status === 'number' ? result.status : 1;
      } catch {
        return 1;
      }
    },
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: args => {
      for (let index = 0; index < args.length; index++) {
        if (args[index] === '--target') {
          index++;
        } else if (args[index] !== '--dry-run') {
          console.error(`[ERROR] Unknown flag: ${args[index]}`);
          console.error('Valid flags: --target <path>, --dry-run');
          return 1;
        }
      }
      const previousArgv = process.argv;
      process.argv = ['node', 'migrate-opencode.js', ...args];
      try {
        runMain('scripts/migrate-opencode.js');
        return 0;
      } finally {
        process.argv = previousArgv;
      }
    },
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => runMain('scripts/test-transform.js'),
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: args => {
      const result = runMain('scripts/generate-docs.js', args);
      return typeof result === 'number' ? result : 0;
    },
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: args => {
      const result = runMain('scripts/expand-templates.js', args);
      return typeof result === 'number' ? result : 0;
    },
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: args => {
      const result = runMain('scripts/gen-adapters.js', args);
      return typeof result === 'number' ? result : 0;
    },
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: args => {
      const type = args[0];
      if (!type) {
        console.log(`Available types: ${Object.keys(NEW_SUBCOMMANDS).join(', ')}`);
        console.log('Usage: agentsys-dev new <type> <name> [options]');
        return 1;
      }
      return NEW_SUBCOMMANDS[type].handler(args.slice(1));
    },
  },
};

function parseArgs(argv) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') parsed.help = true;
    else if (argument === '--version' || argument === '-v') parsed.version = true;
    else if (!parsed.command && !argument.startsWith('-') && parsed.rest.length === 0) parsed.command = argument;
    else if (
      !parsed.help &&
      !parsed.version &&
      !parsed.subcommand &&
      parsed.command &&
      COMMANDS[parsed.command]?.subcommands &&
      !argument.startsWith('-') &&
      parsed.rest.length === 0
    ) parsed.subcommand = argument;
    else parsed.rest.push(argument);
  }
  return parsed;
}

const GENERAL_HELP = `
agentsys-dev v${VERSION} - Developer CLI

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

function printHelp() {
  console.log(GENERAL_HELP);
}

function printCommandHelp(commandName, command) {
  console.log(`\nagentsys-dev ${command.usage || commandName}\n`);
  console.log(`  ${command.description}`);
  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [name, subcommand] of Object.entries(command.subcommands)) {
      console.log(`  ${name.padEnd(24)} ${subcommand.description}`);
    }
  }
  console.log('');
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
  if (parsed.help) {
    printCommandHelp(parsed.command, command);
    return 0;
  }
  if (command.subcommands && parsed.subcommand && !command.subcommands[parsed.subcommand]) {
    console.error(`[ERROR] Unknown subcommand: ${parsed.command} ${parsed.subcommand}`);
    console.error(`Run 'agentsys-dev ${parsed.command} --help' for subcommands.`);
    return 1;
  }
  const args = parsed.subcommand ? [parsed.subcommand, ...parsed.rest] : parsed.rest;
  return command.handler(args);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result
      .then(status => {
        if (typeof status === 'number') process.exit(status);
      })
      .catch(error => {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
      });
  } else if (typeof result === 'number' && result !== 0) {
    process.exit(result);
  }
}

module.exports = { parseArgs, COMMANDS, VALIDATE_SUBCOMMANDS, NEW_SUBCOMMANDS, route };
