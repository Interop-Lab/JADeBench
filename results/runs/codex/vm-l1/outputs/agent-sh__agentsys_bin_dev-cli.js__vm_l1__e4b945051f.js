#!/usr/bin/env node
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.join(__dirname, '..');
const WINDOWS_SHIM_COMMANDS = new Set([
  'npm',
  'npx',
  'pnpm',
  'yarn',
  'yarnpkg',
  'corepack',
]);

function parseCommand(command) {
  const [executable, ...args] = command.trim().split(/\s+/);
  return { executable, args, display: command };
}

function resolveExecutableForPlatform(command) {
  if (process.platform !== 'win32' || command.includes(' ')) return command;
  return WINDOWS_SHIM_COMMANDS.has(command) ? command + '.cmd' : command;
}

function loadScript(relativePath) {
  return require(path.join(ROOT_DIR, relativePath));
}

function runMain(relativePath, args) {
  return loadScript(relativePath).main(args);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: 'Validate plugin structure',
    handler: () => runMain('scripts/validate-plugins.js'),
  },
  'cross-platform': {
    description: 'Cross-platform compatibility checks',
    handler: () => {
      const result = loadScript('scripts/validate-cross-platform.js').validate();
      return result.success ? 0 : 1;
    },
  },
  consistency: {
    description: 'Repository consistency checks (versions, mappings, counts)',
    handler: () => runMain('scripts/validate-repo-consistency.js'),
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
    handler: () => runMain('scripts/validate-agent-skill-compliance.js'),
  },
  'opencode-install': {
    description: 'Validate OpenCode installation',
    handler: () => runMain('scripts/validate-opencode-install.js'),
  },
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: 'Scaffold a new plugin',
    handler: args => scaffold('plugin', args),
  },
  agent: {
    description: 'Scaffold a new agent',
    handler: args => scaffold('agent', args),
  },
  skill: {
    description: 'Scaffold a new skill',
    handler: args => scaffold('skill', args),
  },
  command: {
    description: 'Scaffold a new command',
    handler: args => scaffold('command', args),
  },
};

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
    handler: runDevInstall,
  },
  detect: {
    description: 'Detect project platform configuration',
    handler: detectPlatform,
  },
  verify: {
    description: 'Verify development tool availability',
    handler: verifyTools,
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
    handler: runMigration,
  },
  'test-transform': {
    description: 'Test OpenCode transform on next-task command',
    handler: () => runMain('scripts/test-transform.js'),
  },
  'gen-docs': {
    description: 'Auto-generate documentation sections from plugin source',
    usage: 'gen-docs [--check] [--dry-run]',
    handler: args => runMain('scripts/generate-docs.js', args),
  },
  'expand-templates': {
    description: 'Expand agent template snippets',
    usage: 'expand-templates [--check] [--dry-run]',
    handler: args => runMain('scripts/expand-templates.js', args),
  },
  'gen-adapters': {
    description: 'Generate platform adapter files from plugin source',
    usage: 'gen-adapters [--check] [--dry-run]',
    handler: args => runMain('scripts/gen-adapters.js', args),
  },
  new: {
    description: 'Scaffold new plugin, agent, skill, or command',
    usage: 'new <type> <name> [options]',
    subcommands: NEW_SUBCOMMANDS,
    handler: printNewHelp,
  },
};

function validatePaths() {
  const fs = require('fs');
  const pluginsDirectory = path.join(ROOT_DIR, 'plugins');
  if (!fs.existsSync(pluginsDirectory)) {
    console.log('[OK] No plugins/ directory (plugins extracted to standalone repos)');
    return 0;
  }

  const { scanDirectory } = loadScript('scripts/check-hardcoded-paths.js');
  const issues = scanDirectory(pluginsDirectory);
  if (issues.length === 0) {
    console.log('[OK] No hardcoded platform paths found');
    return 0;
  }

  console.log('[ERROR] Found ' + issues.length + ' hardcoded path issue(s)');
  issues.forEach(issue => {
    console.log('  ' + issue.file + ':' + issue.line + ' - ' + issue.platform);
  });
  return 1;
}

function validateCounts(args) {
  const result = loadScript('scripts/validate-counts.js').runValidation();
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const counts = result.actualCounts;
    console.log(
      'Plugins: ' + counts.plugins +
      ', Agents: ' + counts.totalAgents +
      ', Skills: ' + counts.skills
    );
    if (result.status === 'ok') {
      console.log('[OK] All counts aligned');
    } else {
      console.log('[ERROR] ' + result.issues.length + ' issue(s) found');
      result.issues.forEach(issue => console.log('  ' + issue));
    }
  }
  return result.status === 'ok' ? 0 : 1;
}

function validatePlatformDocs(args) {
  const result = loadScript('scripts/validate-cross-platform-docs.js').runValidation();
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === 'ok') {
    console.log('[OK] Cross-platform docs valid');
  } else {
    console.log('[ERROR] ' + result.issues.length + ' issue(s)');
    result.issues.forEach(issue => console.log('  ' + issue));
  }
  return result.status === 'ok' ? 0 : 1;
}

function scaffold(type, args) {
  return loadScript('scripts/scaffold.js').main([type, ...args]);
}

async function validateAll() {
  console.log('Running all validators...\n');
  let failures = 0;
  for (const name of Object.keys(VALIDATE_SUBCOMMANDS)) {
    if (name === 'opencode-install') continue;
    console.log('--- validate ' + name + ' ---');
    try {
      const result = await VALIDATE_SUBCOMMANDS[name].handler([]);
      if (result) {
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

  if (failures) {
    console.log('[ERROR] ' + failures + ' validator(s) failed');
    return 1;
  }
  console.log('[OK] All validators passed');
  return 0;
}

function runDevInstall(args) {
  const validArguments = ['claude', 'opencode', 'codex', '--clean'];
  const invalidArgument = args.find(arg => !validArguments.includes(arg));
  if (invalidArgument) {
    console.error('[ERROR] Invalid argument: ' + invalidArgument);
    console.error('Valid arguments: ' + validArguments.join(', '));
    return 1;
  }

  loadScript('scripts/dev-install.js').main();
  return 0;
}

function detectPlatform() {
  const result = loadScript('lib/platform/detect-platform.js').detect();
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

function verifyTools() {
  const result = loadScript('lib/platform/verify-tools.js').verifyTools();
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

function printStatus() {
  const counts = loadScript('scripts/validate-counts.js').getActualCounts();
  let branch = 'unknown';
  try {
    branch = execSync('git branch --show-current', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    }).toString().trim();
  } catch {}

  console.log('agentsys v' + VERSION);
  console.log('Branch: ' + branch);
  console.log('Plugins: ' + counts.plugins);
  console.log(
    'Agents:  ' + counts.totalAgents + ' (' + counts.fileBasedAgents +
    ' file-based + ' + counts.roleBasedAgents + ' role-based)'
  );
  console.log('Skills:  ' + counts.skills);
  return 0;
}

function runTests(args) {
  const npmArgs = ['test'];
  if (args.length) npmArgs.push('--', ...args);
  const result = spawnSync(resolveExecutableForPlatform('npm'), npmArgs, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error) return 1;
  return typeof result.status === 'number' ? result.status : 1;
}

function runMigration(args) {
  const validFlags = ['--target', '--dry-run'];
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (!argument.startsWith('--')) continue;
    if (!validFlags.includes(argument)) {
      console.error('[ERROR] Unknown flag: ' + argument);
      console.error('Valid flags: --target <path>, --dry-run');
      return 1;
    }
    if (argument === '--target') index++;
  }

  loadScript('scripts/migrate-opencode.js').main();
  return 0;
}

function printNewHelp() {
  console.log('Available types: plugin, agent, skill, command');
  console.log('Usage: agentsys-dev new <type> <name> [options]');
  return 1;
}

function parseArgs(args) {
  const parsed = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    rest: [],
  };

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      parsed.help = true;
    } else if (argument === '--version' || argument === '-v') {
      parsed.version = true;
    } else if (argument.startsWith('-')) {
      parsed.rest = args.slice(index);
      break;
    } else if (!parsed.command) {
      parsed.command = argument;
    } else if (
      !parsed.subcommand &&
      COMMANDS[parsed.command] &&
      COMMANDS[parsed.command].subcommands &&
      COMMANDS[parsed.command].subcommands
    ) {
      parsed.subcommand = argument;
    } else {
      parsed.rest = args.slice(index);
      break;
    }
  }
  return parsed;
}

function printHelp() {
  console.log(
    '\nagentsys-dev v' + VERSION + ' - Developer CLI\n\n' +
    'Usage:\n' +
    '  agentsys-dev <command> [options]\n' +
    '  agentsys-dev --help\n' +
    '  agentsys-dev --version\n\n' +
    'Commands:\n' +
    '  validate                Run all validators\n' +
    '  validate <sub>          Run single validator:\n' +
    '    plugins                 Plugin structure\n' +
    '    cross-platform          Cross-platform compatibility\n' +
    '    consistency             Repo consistency (versions, mappings)\n' +
    '    paths                   Hardcoded platform paths\n' +
    '    counts [--json]         Doc counts and versions\n' +
    '    platform-docs [--json]  Cross-platform docs\n' +
    '    agent-skill-compliance  Agent Skills Open Standard\n' +
    '    opencode-install        OpenCode installation\n\n' +
    '  preflight [flags]       Change-aware checklist enforcement\n' +
    '    --all                 Run all checks regardless of changes\n' +
    '    --release             Include release-specific checks\n' +
    '    --json                Structured JSON output\n\n' +
    '  bump <version>          Bump version across all files\n' +
    'setup-hooks             Install git hooks\n' +
    '  dev-install [tool]      Install to dev tools (--clean to remove)\n' +
    '  detect                  Detect project platform config\n' +
    '  verify                  Verify dev tool availability\n' +
    '  status                  Show project health overview\n' +
    '  test                    Run test suite\n' +
    '  migrate-opencode        Migrate commands for OpenCode\n' +
    '  test-transform          Test OpenCode transform\n' +
    '  gen-docs                Auto-generate doc sections from source\n' +
    '    --check               Validate freshness (exit 1 if stale)\n' +
    '    --dry-run             Show changes without writing\n' +
    '  expand-templates        Expand agent template snippets\n' +
    '    --check               Validate freshness (exit 1 if stale)\n' +
    '    --dry-run             Show changes without writing\n' +
    '  gen-adapters            Generate platform adapter files from source\n' +
    '    --check               Validate freshness (exit 1 if stale)\n' +
    '    --dry-run             Show changes without writing\n\n' +
    'Scaffolding:\n' +
    '  new plugin <name>       Scaffold a new plugin\n' +
    '  new agent <name>        Scaffold a new agent (--plugin required)\n' +
    '  new skill <name>        Scaffold a new skill (--plugin required)\n' +
    '  new command <name>      Scaffold a new command (--plugin required)\n\n' +
    'User CLI (agentsys):\n' +
    '  agentsys                      Interactive installer\n' +
    '  agentsys install <plugin>     Install a specific plugin (resolves deps)\n' +
    '  agentsys remove <plugin>      Remove an installed plugin\n' +
    '  agentsys search [term]        Search available plugins\n' +
    '  agentsys list                 List installed plugins and versions\n' +
    '  agentsys update               Re-fetch latest plugin versions\n\n' +
    'Aliases (npm scripts):\n' +
    '  npm run new:plugin        = agentsys-dev new plugin\n' +
    '  npm run new:agent         = agentsys-dev new agent\n' +
    '  npm run new:skill         = agentsys-dev new skill\n' +
    '  npm run new:command       = agentsys-dev new command\n' +
    '  npm run validate          = agentsys-dev validate\n' +
    '  npm run validate:plugins  = agentsys-dev validate plugins\n' +
    '  npm run bump              = agentsys-dev bump\n' +
    '  npm run detect            = agentsys-dev detect\n' +
    '  npm run verify            = agentsys-dev verify\n' +
    '  npm run gen-docs          = agentsys-dev gen-docs\n' +
    '  npm run gen-docs:check    = agentsys-dev gen-docs --check\n' +
    '  npm run expand-templates  = agentsys-dev expand-templates\n' +
    '  npm run expand-templates:check = agentsys-dev expand-templates --check\n' +
    '  npm run gen-adapters      = agentsys-dev gen-adapters\n' +
    '  npm run gen-adapters:check = agentsys-dev gen-adapters --check\n'
  );
}

function printCommandHelp(commandName, command) {
  console.log('\nagentsys-dev ' + (command.usage || commandName) + '\n');
  console.log('  ' + command.description);
  if (!command.subcommands) return;

  console.log('\nSubcommands:');
  for (const [name, subcommand] of Object.entries(command.subcommands)) {
    console.log('  ' + name.padEnd(24, ' ') + subcommand.description);
  }
}

function route(parsed) {
  if (parsed.version) {
    console.log('agentsys-dev v' + VERSION);
    return 0;
  }

  if (!parsed.command) {
    printHelp();
    return 0;
  }

  const command = COMMANDS[parsed.command];
  if (!command) {
    console.error('[ERROR] Unknown command: ' + parsed.command);
    console.error("Run 'agentsys-dev --help' for available commands.");
    return 1;
  }

  if (parsed.help) {
    printCommandHelp(parsed.command, command);
    return 0;
  }

  if (parsed.subcommand) {
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error('[ERROR] Unknown subcommand: ' + parsed.subcommand);
      console.error("Run 'agentsys-dev " + parsed.command + " --help' for subcommands.");
      return 1;
    }
    return subcommand.handler(parsed.rest);
  }

  return command.handler(parsed.rest);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === 'function') {
    result
      .then(exitCode => {
        if (typeof exitCode === 'number') process.exit(exitCode);
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
