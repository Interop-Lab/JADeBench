#!/usr/bin/env node
'use strict';

const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.join(__dirname, '..');

function projectPath(...segments) {
  return path.join(ROOT_DIR, ...segments);
}

function loadProjectModule(...segments) {
  return require(projectPath(...segments));
}

function runMain(script, args = []) {
  return loadProjectModule('scripts', script).main(args);
}

function runNoArgMain(script) {
  return loadProjectModule('scripts', script).main();
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => runNoArgMain('validate-plugins.js'),
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => {
      const result = loadProjectModule('scripts', 'validate-cross-platform.js').validate();
      return result.valid ? 0 : 1;
    },
  },
  consistency: {
    description: 'Repository consistency checks (versions, mappings, counts)',
    handler: () => runNoArgMain('validate-repo-consistency.js'),
  },
  paths: {
    description: 'Scan for hardcoded platform paths',
    handler: validatePaths,
  },
  counts: {
    description: 'Validate counts and versions across docs',
    usage: 'validate counts [--json]',
    handler: validateCounts,
  },
  'platform-docs': {
    description: 'Cross-platform documentation consistency',
    usage: 'validate platform-docs [--json]',
    handler: validatePlatformDocs,
  },
  'agent-skill-compliance': {
    description: 'Agent Skills Open Standard compliance',
    handler: () => runNoArgMain('validate-agent-skill-compliance.js'),
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => runNoArgMain('validate-opencode-install.js'),
  },
};

const NEW_SUBCOMMANDS = Object.fromEntries(
  ['plugin', 'agent', 'skill', 'command'].map(type => [
    type,
    {
      description: `Scaffold a new ${type}`,
      handler: args => runMain('scaffold.js', [type, ...args]),
    },
  ]),
);

const COMMANDS = {
  validate: {
    description: 'Run validators (all, or specify subcommand)',
    usage: 'validate [subcommand] [options]',
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: runAllValidators,
  },
  preflight: {
    description: 'Run preflight checks (change-aware checklist enforcement)',
    usage: 'preflight [--all] [--release] [--json] [--verbose]',
    handler: args => runMain('preflight.js', args),
  },
  bump: {
    description: 'Bump version across all files',
    usage: 'bump <version>',
    handler: args => runMain('bump-version.js', args),
  },
  'setup-hooks': {
    description: 'Install git hooks (pre-commit, pre-push)',
    handler: () => runNoArgMain('setup-hooks.js'),
  },
  'dev-install': {
    description: 'Install to all tools for development testing',
    usage: 'dev-install [tool] [--clean]',
    handler: runDevInstall,
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: async () => {
      const result = await loadProjectModule('lib', 'platform', 'detect-platform.js').detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  verify: {
    description: 'Verify development tool availability',
    handler: async () => {
      const result = await loadProjectModule('lib', 'platform', 'verify-tools.js').verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  status: {
    description: 'Show project health overview',
    handler: printStatus,
  },
  test: {
    description: 'Run test suite',
    handler: runTests,
  },
  'migrate-opencode': {
    description: 'Migrate commands for OpenCode compatibility',
    usage: 'migrate-opencode [--target <path>] [--dry-run]',
    handler: runMigrateOpenCode,
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => runNoArgMain('test-transform.js'),
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: args => runMain('generate-docs.js', args),
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: args => runMain('expand-templates.js', args),
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: args => runMain('gen-adapters.js', args),
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

function validatePaths() {
  const fs = require('fs');
  const pluginsDirectory = projectPath('plugins');
  if (!fs.existsSync(pluginsDirectory)) {
    console.log('[OK] No plugins/ directory (plugins extracted to standalone repos)');
    return 0;
  }

  const { scanDirectory } = loadProjectModule('scripts', 'check-hardcoded-paths.js');
  const violations = scanDirectory(pluginsDirectory);
  if (violations.length === 0) {
    console.log('[OK] No hardcoded platform paths found');
    return 0;
  }

  console.log(`[ERROR] Found ${violations.length} hardcoded path violation(s)`);
  for (const violation of violations) {
    console.log(`  ${violation.file}:${violation.line} - ${violation.match}`);
  }
  return 1;
}

function validateCounts(args) {
  const { runValidation } = loadProjectModule('scripts', 'validate-counts.js');
  const result = runValidation();
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.actualCounts) {
    const counts = result.actualCounts;
    console.log(`Plugins: ${counts.plugins}, Agents: ${counts.totalAgents}, Skills: ${counts.skills}`);
    if (result.status === 'ok') console.log('[OK] All counts aligned');
    else {
      console.log(`[ERROR] ${result.issues.length} issue(s) found`);
      for (const issue of result.issues) {
        console.log(`  ${issue.file}: ${issue.field} expected ${issue.expected}, got ${issue.actual}`);
      }
    }
  }
  return result.status === 'ok' ? 0 : 1;
}

function validatePlatformDocs(args) {
  const { runValidation } = loadProjectModule('scripts', 'validate-cross-platform-docs.js');
  const result = runValidation();
  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else if (result.status === 'ok') console.log('[OK] Cross-platform docs valid');
  else {
    console.log(`[ERROR] ${result.issues.length} issue(s)`);
    for (const issue of result.issues) console.log(`  ${issue.file}: ${issue.message}`);
  }
  return result.status === 'ok' ? 0 : 1;
}

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
      }
    } catch (error) {
      failures++;
      console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
    }
  }
  if (failures) console.log(`[ERROR] ${failures} validator(s) failed`);
  else console.log('[OK] All validators passed');
  return failures ? 1 : 0;
}

function runDevInstall(args) {
  const validArguments = new Set(['claude', 'opencode', 'codex', '--clean']);
  const invalid = args.find(argument => !validArguments.has(argument));
  if (invalid) {
    console.error(`[ERROR] Invalid argument: ${invalid}`);
    console.error('Valid arguments: claude, opencode, codex, --clean');
    return 1;
  }
  return runWithArgv('dev-install.js', args);
}

function runTests(args) {
  const testArgs = ['test'];
  if (args.length > 0) testArgs.push('--', ...args);
  const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(executable, testArgs, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return typeof result.status === 'number' ? result.status : 1;
}

function runWithArgv(script, args) {
  const previousArgv = process.argv;
  process.argv = [previousArgv[0] || 'node', script, ...args];
  try {
    const result = runNoArgMain(script);
    return typeof result === 'number' ? result : 0;
  } finally {
    process.argv = previousArgv;
  }
}

function runMigrateOpenCode(args) {
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--dry-run') continue;
    if (argument === '--target' && args[index + 1]) {
      index++;
      continue;
    }
    console.error(`[ERROR] Unknown flag: ${argument}`);
    console.error('Valid flags: --target <path>, --dry-run');
    return 1;
  }
  return runWithArgv('migrate-opencode.js', args);
}

function printStatus() {
  const { getActualCounts } = loadProjectModule('scripts', 'validate-counts.js');
  const counts = getActualCounts();
  let branch = 'unknown';
  try {
    branch = execSync('git branch --show-current', { cwd: ROOT_DIR, stdio: 'pipe' }).toString().trim();
  } catch {}
  console.log(`agentsys v${VERSION}`);
  console.log(`Branch: ${branch}`);
  console.log(`Plugins: ${counts.plugins}`);
  console.log(`Agents:  ${counts.totalAgents} (${counts.fileBasedAgents} file-based + ${counts.roleBasedAgents} role-based)`);
  console.log(`Skills:  ${counts.skills}`);
  return 0;
}

function parseArgs(args) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  let index = 0;
  while (index < args.length) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      parsed.help = true;
      index++;
    } else if (argument === '--version' || argument === '-v') {
      parsed.version = true;
      index++;
    } else break;
  }
  if (index < args.length && !args[index].startsWith('-')) parsed.command = args[index++];
  if (index < args.length && !args[index].startsWith('-') && COMMANDS[parsed.command]?.subcommands) {
    parsed.subcommand = args[index++];
  }
  parsed.rest = args.slice(index);
  if (parsed.rest.includes('--help') || parsed.rest.includes('-h')) {
    parsed.help = true;
    parsed.rest = parsed.rest.filter(argument => argument !== '--help' && argument !== '-h');
  }
  return parsed;
}

function printHelp() {
  console.log(`
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
  expand-templates        Expand agent template snippets
  gen-adapters            Generate platform adapter files from source

Scaffolding:
  new plugin <name>       Scaffold a new plugin
  new agent <name>        Scaffold a new agent (--plugin required)
  new skill <name>        Scaffold a new skill (--plugin required)
  new command <name>      Scaffold a new command (--plugin required)
`);
}

function printCommandHelp(name, command) {
  console.log(`\nagentsys-dev ${command.usage || name}\n`);
  console.log(`  ${command.description}\n`);
  if (command.subcommands) {
    console.log('Subcommands:');
    for (const [subcommand, definition] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(24)} ${definition.description}`);
    }
  }
  console.log('');
}

function route(input) {
  const parsed = Array.isArray(input) ? parseArgs(input) : input;
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
  const result = route(process.argv.slice(2));
  if (result && typeof result.then === 'function') {
    result.then(code => {
      if (typeof code === 'number') process.exit(code);
    }).catch(error => {
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
