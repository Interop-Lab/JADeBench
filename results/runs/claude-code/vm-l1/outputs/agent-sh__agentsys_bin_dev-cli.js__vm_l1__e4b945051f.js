#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.join(__dirname, '..');

function load(...segments) {
  return require(path.join(ROOT_DIR, ...segments));
}

function runScript(file, exportName = 'main', ...args) {
  return load('scripts', file)[exportName](...args);
}

function validationHandler(file, exportName = 'main') {
  return () => runScript(file, exportName);
}

function scaffold(type, args) {
  return runScript('scaffold.js', 'main', type, args);
}

function validatePaths() {
  const pluginsDirectory = path.join(ROOT_DIR, 'plugins');
  if (!fs.existsSync(pluginsDirectory)) {
    console.log('[OK] No plugins/ directory (plugins extracted to standalone repos)');
    return 0;
  }
  const { scanDirectory } = load('scripts', 'check-hardcoded-paths.js');
  const issues = scanDirectory(pluginsDirectory);
  if (issues.length === 0) {
    console.log('[OK] No hardcoded platform paths found');
    return 0;
  }
  console.log(`[ERROR] Found ${issues.length} hardcoded path issue(s)`);
  issues.forEach(issue => console.log(issue));
  return 1;
}

function reportValidation(result, successMessage, args) {
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === 'ok') {
    console.log(successMessage(result));
  } else {
    console.log(`[ERROR] ${result.issues.length} issue(s) found`);
    result.issues.forEach(issue => console.log(issue));
  }
  return result.status === 'ok' ? 0 : 1;
}

function validateCounts(args) {
  const result = runScript('validate-counts.js', 'runValidation');
  return reportValidation(
    result,
    value => `[OK] All counts aligned\nPlugins: ${value.actualCounts.plugins}, Agents: ${value.actualCounts.totalAgents}, Skills: ${value.actualCounts.skills}`,
    args,
  );
}

function validatePlatformDocs(args) {
  const result = runScript('validate-cross-platform-docs.js', 'runValidation');
  return reportValidation(result, () => '[OK] Cross-platform docs valid', args);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: { description: 'Validate plugin structure', handler: validationHandler('validate-plugins.js') },
  'cross-platform': { description: 'Cross-platform compatibility checks', handler: validationHandler('validate-cross-platform.js', 'validate') },
  consistency: { description: 'Repository consistency checks (versions, mappings, counts)', handler: validationHandler('validate-repo-consistency.js') },
  paths: { description: 'Scan for hardcoded platform paths', handler: validatePaths },
  counts: { description: 'Validate counts and versions across docs', usage: 'validate counts [--json]', handler: validateCounts },
  'platform-docs': { description: 'Cross-platform documentation consistency', usage: 'validate platform-docs [--json]', handler: validatePlatformDocs },
  'agent-skill-compliance': { description: 'Agent Skills Open Standard compliance', handler: validationHandler('validate-agent-skill-compliance.js') },
  'opencode-install': { description: 'Validate OpenCode installation', handler: validationHandler('validate-opencode-install.js') },
};

const NEW_SUBCOMMANDS = {
  plugin: { description: 'Scaffold a new plugin', handler: args => scaffold('plugin', args) },
  agent: { description: 'Scaffold a new agent', handler: args => scaffold('agent', args) },
  skill: { description: 'Scaffold a new skill', handler: args => scaffold('skill', args) },
  command: { description: 'Scaffold a new command', handler: args => scaffold('command', args) },
};

async function validateAll() {
  console.log('Running all validators...\n');
  let failures = 0;
  for (const [name, command] of Object.entries(VALIDATE_SUBCOMMANDS)) {
    if (name === 'opencode-install') continue;
    console.log(`--- validate ${name} ---`);
    try {
      const result = await command.handler([]);
      if (result) {
        failures++;
        console.log(`[ERROR] validate ${name} failed\n`);
      }
    } catch (error) {
      failures++;
      console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
    }
  }
  console.log(failures ? `[ERROR] ${failures} validator(s) failed` : '[OK] All validators passed');
  return failures ? 1 : 0;
}

function devInstall(args) {
  const tools = ['claude', 'opencode', 'codex'];
  const clean = args.includes('--clean');
  const positional = args.filter(arg => !arg.startsWith('--'));
  if (positional.length > 1 || (positional[0] && !tools.includes(positional[0]))) {
    console.error(`[ERROR] Invalid argument: ${positional.join(' ')}`);
    console.error(`Valid arguments: ${tools.join(', ')}`);
    return 1;
  }
  return runScript('dev-install.js', 'main', positional[0], clean);
}

function showStatus() {
  const counts = runScript('validate-counts.js', 'getActualCounts');
  let branch = 'unknown';
  try {
    branch = execSync('git branch --show-current', { cwd: ROOT_DIR, stdio: 'pipe' }).toString().trim();
  } catch {}
  console.log(`agentsys v${VERSION}`);
  console.log(`Branch: ${branch}`);
  console.log(`Plugins: ${counts.plugins}`);
  console.log(`Agents:  ${counts.totalAgents} (${counts.fileBasedAgents} file-based + ${counts.roleBasedAgents} role-based)`);
  console.log(`Skills:  ${counts.skills}`);
}

function runTests(args) {
  const npmArgs = ['test'];
  if (args.length) npmArgs.push('--', ...args);
  const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(executable, npmArgs, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return typeof result.status === 'number' ? result.status : 1;
}

function migrateOpenCode(args) {
  let target;
  let dryRun = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--target') {
      target = args[++index];
      if (!target) {
        console.error('[ERROR] Invalid argument: --target');
        console.error('Valid flags: --target <path>, --dry-run');
        return 1;
      }
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--')) {
      console.error(`[ERROR] Unknown flag: ${arg}`);
      return 1;
    } else {
      console.error(`[ERROR] Invalid argument: ${arg}`);
      console.error('Valid flags: --target <path>, --dry-run');
      return 1;
    }
  }
  return runScript('migrate-opencode.js', 'main', { target, dryRun, argv: ['node', process.argv[1], ...args] });
}

function generator(file) {
  return args => runScript(file, 'main', args);
}

const COMMANDS = {
  validate: { description: 'Run validators (all, or specify subcommand)', usage: 'validate [subcommand] [options]', subcommands: VALIDATE_SUBCOMMANDS, handler: validateAll },
  preflight: { description: 'Run preflight checks (change-aware checklist enforcement)', usage: 'preflight [--all] [--release] [--json] [--verbose]', handler: args => runScript('preflight.js', 'main', args) },
  bump: { description: 'Bump version across all files', usage: 'bump <version>', handler: args => runScript('bump-version.js', 'main', args) },
  'setup-hooks': { description: 'Install git hooks (pre-commit, pre-push)', handler: validationHandler('setup-hooks.js') },
  'dev-install': { description: 'Install to all tools for development testing', usage: 'dev-install [tool] [--clean]', handler: devInstall },
  detect: { description: 'Detect project platform configuration', handler: () => console.log(JSON.stringify(load('lib', 'platform', 'detect-platform.js').detect(), null, 2)) },
  verify: { description: 'Verify development tool availability', handler: () => console.log(JSON.stringify(load('lib', 'platform', 'verify-tools.js').verifyTools(), null, 2)) },
  status: { description: 'Show project health overview', handler: showStatus },
  test: { description: 'Run test suite', handler: runTests },
  'migrate-opencode': { description: 'Migrate commands for OpenCode compatibility', usage: 'migrate-opencode [--target <path>] [--dry-run]', handler: migrateOpenCode },
  'test-transform': { description: 'Test OpenCode transform on next-task command', handler: validationHandler('test-transform.js') },
  'gen-docs': { description: 'Auto-generate documentation sections from plugin source', usage: 'gen-docs [--check] [--dry-run]', handler: generator('generate-docs.js') },
  'expand-templates': { description: 'Expand agent template snippets', usage: 'expand-templates [--check] [--dry-run]', handler: generator('expand-templates.js') },
  'gen-adapters': { description: 'Generate platform adapter files from plugin source', usage: 'gen-adapters [--check] [--dry-run]', handler: generator('gen-adapters.js') },
  new: { description: 'Scaffold new plugin, agent, skill, or command', usage: 'new <type> <name> [options]', subcommands: NEW_SUBCOMMANDS, handler() { console.log('Available types: plugin, agent, skill, command'); console.log('Usage: agentsys-dev new <type> <name> [options]'); } },
};

function parseArgs(args) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  if (args.length === 0) return parsed;
  if (args.includes('--help') || args.includes('-h')) parsed.help = true;
  if (args.includes('--version') || args.includes('-v')) parsed.version = true;
  const positional = args.filter(arg => !['--help', '-h', '--version', '-v'].includes(arg));
  if (!positional.length || positional[0].startsWith('-')) {
    parsed.rest = positional;
    return parsed;
  }
  parsed.command = positional[0];
  const command = COMMANDS[parsed.command];
  if (command?.subcommands && positional[1] && command.subcommands[positional[1]]) {
    parsed.subcommand = positional[1];
    parsed.rest = positional.slice(2);
  } else {
    parsed.rest = positional.slice(1);
  }
  return parsed;
}

function printHelp() {
  console.log("\nagentsys-dev v6.0.1 - Developer CLI\n\nUsage:\n  agentsys-dev <command> [options]\n  agentsys-dev --help\n  agentsys-dev --version\n\nCommands:\n  validate                Run all validators\n  validate <sub>          Run single validator:\n    plugins                 Plugin structure\n    cross-platform          Cross-platform compatibility\n    consistency             Repo consistency (versions, mappings)\n    paths                   Hardcoded platform paths\n    counts [--json]         Doc counts and versions\n    platform-docs [--json]  Cross-platform docs\n    agent-skill-compliance  Agent Skills Open Standard\n    opencode-install        OpenCode installation\n\n  preflight [flags]       Change-aware checklist enforcement\n    --all                 Run all checks regardless of changes\n    --release             Include release-specific checks\n    --json                Structured JSON output\n\n  bump <version>          Bump version across all files\nsetup-hooks             Install git hooks\n  dev-install [tool]      Install to dev tools (--clean to remove)\n  detect                  Detect project platform config\n  verify                  Verify dev tool availability\n  status                  Show project health overview\n  test                    Run test suite\n  migrate-opencode        Migrate commands for OpenCode\n  test-transform          Test OpenCode transform\n  gen-docs                Auto-generate doc sections from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  expand-templates        Expand agent template snippets\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  gen-adapters            Generate platform adapter files from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n\nScaffolding:\n  new plugin <name>       Scaffold a new plugin\n  new agent <name>        Scaffold a new agent (--plugin required)\n  new skill <name>        Scaffold a new skill (--plugin required)\n  new command <name>      Scaffold a new command (--plugin required)\n\nUser CLI (agentsys):\n  agentsys                      Interactive installer\n  agentsys install <plugin>     Install a specific plugin (resolves deps)\n  agentsys remove <plugin>      Remove an installed plugin\n  agentsys search [term]        Search available plugins\n  agentsys list                 List installed plugins and versions\n  agentsys update               Re-fetch latest plugin versions\n\nAliases (npm scripts):\n  npm run new:plugin        = agentsys-dev new plugin\n  npm run new:agent         = agentsys-dev new agent\n  npm run new:skill         = agentsys-dev new skill\n  npm run new:command       = agentsys-dev new command\n  npm run validate          = agentsys-dev validate\n  npm run validate:plugins  = agentsys-dev validate plugins\n  npm run bump              = agentsys-dev bump\n  npm run detect            = agentsys-dev detect\n  npm run verify            = agentsys-dev verify\n  npm run gen-docs          = agentsys-dev gen-docs\n  npm run gen-docs:check    = agentsys-dev gen-docs --check\n  npm run expand-templates  = agentsys-dev expand-templates\n  npm run expand-templates:check = agentsys-dev expand-templates --check\n  npm run gen-adapters      = agentsys-dev gen-adapters\n  npm run gen-adapters:check = agentsys-dev gen-adapters --check\n");
}

function printCommandHelp(name, command) {
  console.log(`\nagentsys-dev ${command.usage || name}\n`);
  console.log(`  ${command.description}`);
  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [subcommand, details] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(24, ' ')} ${details.description}`);
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
  if (command.subcommands && parsed.subcommand) {
    return command.subcommands[parsed.subcommand].handler(parsed.rest);
  }
  if (command.subcommands && parsed.rest[0] && !parsed.rest[0].startsWith('-')) {
    console.error(`[ERROR] Unknown subcommand: ${parsed.command} ${parsed.rest[0]}`);
    console.error(`Run 'agentsys-dev ${parsed.command} --help' for subcommands.`);
    return 1;
  }
  return command.handler(parsed.rest);
}

if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
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

module.exports = { parseArgs, COMMANDS, VALIDATE_SUBCOMMANDS, NEW_SUBCOMMANDS, route };
