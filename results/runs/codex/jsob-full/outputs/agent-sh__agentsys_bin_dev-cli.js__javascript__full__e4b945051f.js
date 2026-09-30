#!/usr/bin/env node
'use strict';

const path = require('path');
const { execSync, spawnSync } = require('child_process');

const VERSION = '6.0.1';
const ROOT_DIR = path.join(__dirname,  '..');
const WINDOWS_COMMAND_SHIMS = new Set([
  'npm',
  'npx',
  'pnpm',
  'yarn',
  'yarnpkg',
  'corepack',
]);

function assertSafeString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(label + ' must be a non-empty string');
  }
  if (value.includes('\0')) {
    throw new Error(label + ' contains invalid null byte');
  }
}

function resolveExecutableForPlatform(executable, platform = process.platform) {
  assertSafeString(executable, 'Executable');
  if (platform !== 'win32') return executable;

  const containsPathSeparator = executable.includes('/') || executable.includes('\\');
  if (containsPathSeparator) {
    const normalized = executable.replace(/\\/g, '/');
    const isBinShim = /\/\.bin\/[^/]+$/i.test(normalized);
    if (isBinShim && !/\.[a-zA-Z0-9]+$/.test(executable)) {
      return executable + '.cmd';
    }
    return executable;
  }

  if (/\.[a-zA-Z0-9]+$/.test(executable)) return executable;
  return WINDOWS_COMMAND_SHIMS.has(executable.toLowerCase())
    ? executable + '.cmd'
    : executable;
}

function splitCommand(command) {
  const input = command.trim();
  if (!input) return [];

  const parts = [];
  let current = '';
  let quote = null;
  let quotedToken = false;

  for (let index = 0; index < input.length; index++) {
    const character = input[index];
    if (character === '\\') {
      const nextCharacter = input[index + 1];
      if (quote === "'") {
        current += character;
        continue;
      }
      if (quote === '"') {
        if (nextCharacter === '"' || nextCharacter === '\\' || nextCharacter === '$' || nextCharacter?.charCodeAt(0) === 96) {
          current += nextCharacter;
          index++;
        } else {
          current += character;
        }
        continue;
      }
      if (nextCharacter && (/\s/.test(nextCharacter) || nextCharacter === '"' || nextCharacter === "'" || nextCharacter === '\\')) {
        current += nextCharacter;
        index++;
      } else {
        current += character;
      }
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      else current += character;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      quotedToken = true;
      continue;
    }
    if (/\s/.test(character)) {
      if (current.length > 0 || quotedToken) {
        parts.push(current);
        current = '';
        quotedToken = false;
      }
      continue;
    }
    current += character;
  }

  if (quote) throw new Error('Command contains unterminated quote');
  if (current.length > 0 || quotedToken) parts.push(current);
  return parts;
}

function parseCommand(command, label = 'Command') {
  if (typeof command !== 'string' || command.trim().length === 0) {
    throw new Error(label + ' must be a non-empty string');
  }
  const parts = splitCommand(command);
  if (parts.length === 0) throw new Error(label + ' must include an executable');

  const [executable, ...args] = parts;
  assertSafeString(executable, label + ' executable');
  for (const argument of args) {
    if (typeof argument !== 'string') throw new Error(label + ' argument must be a string');
    if (argument.includes('\0')) throw new Error(label + ' argument contains invalid null byte');
  }
  return { executable, args, display: command.trim() };
}

const VALIDATE_SUBCOMMANDS = {
  plugins:  {
    description: "Validate plugin structure",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-plugins.js"));
      return main();
    }
  },
  'cross-platform': {
    description: "Cross-platform compatibility checks",
    handler: () => {
      const { validate } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform.js"));
      const validation = validate();
      return validation.success?0:1;
    }
  },
  consistency: {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-repo-consistency.js"));
      return main();
    }
  },
  paths: {
    description: "Scan for hardcoded platform paths",
    handler: () => {
      const fs = require('fs'),pluginsDirectory=path.join(ROOT_DIR, "plugins");
      if(!fs.existsSync(pluginsDirectory)) {
        return console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)"),0;
      }
      const { scanDirectory } = require(path.join(ROOT_DIR, "scripts", "check-hardcoded-paths.js"));
      const issues = scanDirectory(pluginsDirectory);
      if (issues.length === 0) {
        return console.log("[OK] No hardcoded platform paths found"),0;
      }
      return console.log("[ERROR] Found "+issues.length+(" hardcoded path issue(s)")),issues.forEach(item=>console.log('  '+item.file+':'+item.line+" - "+item.platform)),1;
    }
  },
  counts: {
    description: "Validate counts and versions across docs",
    usage: "validate counts [--json]",
    handler: (args) => {
      const { runValidation } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const validation = runValidation();
      if (args.includes("--json")) console.log(JSON.stringify(validation,  null,  2));
      else {
        const counts = validation.actualCounts;
        console.log("Plugins:"+' '+counts.plugins+(", Agents"+': ')+counts.totalAgents+(", Skills"+': ')+counts.skills);
        if (validation.status === 'ok') {
          console.log("[OK] All counts aligned");
        }
        else {
          console.log("[ERROR] "+validation.issues.length+(" issue(s) found")),validation.issues.forEach(item=>console.log('  '+item.file+': '+item.metric+(" expecte"+'d ')+item.expected+", got "+item.actual));
        }
      }
      return validation.status === 'ok' ? 0 : 1;
    }
  },
  'platform-docs': {
    description: "Cross-platform documentation consistency",
    usage: "validate platform-docs [--json]",
    handler: (args) => {
      const { runValidation } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform-docs.js"));
      const validation = runValidation();
      if(args.includes("--json"))return console.log(JSON.stringify(validation, null, 2)),validation.status === 'ok' ? 0 : 1;
      if (validation.status === 'ok') {
        return console.log("[OK] Cross-platform docs valid"),0;
      }
      return console.log("[ERROR] "+validation.issues.length+(" issue(s)")),validation.issues.forEach(item=>console.log('  '+item.file+': '+item.message)),1;
    }
  },
  'agent-skill-compliance': {
    description: "Agent Skills Open Standard compliance",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-agent-skill-compliance.js"));
      return main();
    }
  },
  'opencode-install': {
    description: "Validate OpenCode installation",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-opencode-install.js"));
      return main();
    }
  }
};

const NEW_SUBCOMMANDS =  {
  plugin:  {
    description: "Scaffold a new plugin",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["plugin",...args]);
    }
  },
  agent: {
    description: "Scaffold a new agent",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["agent",...args]);
    }
  },
  skill: {
    description: "Scaffold a new skill",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["skill",...args]);
    }
  },
  command: {
    description: "Scaffold a new command",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["command",...args]);
    }
  }
};

const COMMANDS =  {
  validate:  {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",subcommands: VALIDATE_SUBCOMMANDS,
    handler: () => {
      console.log('Running all validators...\n');
      let failures = 0;
      for (const commandName of Object.keys(VALIDATE_SUBCOMMANDS)) {
        if (commandName === 'opencode-install') continue;
        console.log('--- validate ' + commandName + ' ---');
        try {
          const exitCode = VALIDATE_SUBCOMMANDS[commandName].handler([]);
          if (exitCode !== 0) {
            failures++;
            console.log('[ERROR] validate ' + commandName + ' failed\n');
          } else {
            console.log('');
          }
        } catch (error) {
          failures++;
          console.log('[ERROR] validate ' + commandName + ' threw: ' + error.message + '\n');
        }
      }
      if (failures > 0) {
        console.log('[ERROR] ' + failures + ' validator(s) failed');
        return 1;
      }
      console.log('[OK] All validators passed');
      return 0;
    }
  },
  preflight: {
    description: "Run preflight checks (change-aware checklist enforcement)",
    usage: "preflight [--all] [--release] [--json] [--verbose]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "preflight.js"));
      return main(args);
    }
  },
  bump: {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "bump-version.js"));
      return main(args);
    }
  },
  'setup-hooks': {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "setup-hooks.js"));
      return main();
    }
  },
  'dev-install': {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: (args) => {
      const validArguments = ["claude","opencode","codex","--clean"];
      for(const argument of args) {
        if(!validArguments.includes(argument)&&!argument.startsWith('--')) {
          return console.error("[ERROR] Invalid argument"+': '+argument),console.error("Valid arguments:"+' '+validArguments.join(', ')),1;
        }
      }
      const { main } = require(path.join(ROOT_DIR, "scripts", "dev-install.js")),originalArgv=process.argv;
      process.argv=["node","dev-install.js",...args];
      try {
        return main(),0;
      }
      finally {
        process.argv=originalArgv;
      }
    }
  },
  detect: {
    description: "Detect project platform configuration",
    handler: async () => {
      const { detect } = require(path.join(ROOT_DIR, "lib", "platform", "detect-platform.js"));
      const platform = await detect();
      return console.log(JSON.stringify(platform, null, 2)),0;
    }
  },
  verify: {
    description: "Verify development tool availability",
    handler: async () => {
      const { verifyTools } = require(path.join(ROOT_DIR, "lib", "platform", "verify-tools.js")),tools=await verifyTools();
      return console.log(JSON.stringify(tools, null, 2)),0;
    }
  },
  status: {
    description: "Show project health overview",
    handler: () => {
      const { getActualCounts } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const counts = getActualCounts();
      let branch = "unknown";
      try {
        branch=((execSync)(("git branch --show-current"),( {
          cwd: ROOT_DIR,stdio: "pipe"
        }))).toString().trim();
      }
      catch {
      }
      console.log("agentsys"+' v'+VERSION),console.log("Branch: "+branch),console.log("Plugins:"+' '+counts.plugins),console.log("Agents: "+' '+counts.totalAgents+' ('+counts.fileBasedAgents+(" file-based + ")+counts.roleBasedAgents+(" role-based)"));
      return console.log("Skills: "+' '+counts.skills),0;
    }
  },
  test: {
    description: "Run test suite",
    handler: (args) => {
      try {
        const npmArgs = ["test"];
        ((args.length)>(0))&&(npmArgs.push('--'),npmArgs.push(...args));
        const npmExecutable = resolveExecutableForPlatform("npm"),child=((spawnSync)((npmExecutable),(npmArgs),( {
          cwd: ROOT_DIR,stdio: "inherit",shell: false,windowsHide: true
        })));
        if(child.error) {
          throw child.error;
        }
        return ((typeof child.status)===("number"))?child.status:1;
      }
      catch(error) {
        return error.status||1;
      }
    }
  },
  'migrate-opencode': {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: (args) => {
      for(const argument of args) {
        if(!argument.startsWith('--')&&((argument)!==(args[((args.indexOf("--target"))+(1))]))) {
          return console.error("[ERROR] Invalid argument"+': '+argument),console.error("Valid flags: --target <path>, --dry-run"),1;
        }
        if(argument.startsWith('--')&&((argument)!==("--target"))&&((argument)!==("--dry-run"))) {
          return console.error("[ERROR] Unknown flag: "+argument),console.error("Valid flags: --target <path>, --dry-run"),1;
        }
      }
      const { main } = require(path.join(ROOT_DIR, "scripts", "migrate-opencode.js")),originalArgv=process.argv;
      process.argv=["node","migrate-opencode.js",...args];
      try {
        return main(),0;
      }
      finally {
        process.argv=originalArgv;
      }
    }
  },
  'test-transform': {
    description: "Test OpenCode transform on next-task command",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "test-transform.js"));
      return main();
    }
  },
  'gen-docs': {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "generate-docs.js"));
      const exitCode = main(args);
      if (typeof exitCode === "number")return exitCode;
      return 0;
    }
  },
  'expand-templates': {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "expand-templates.js")),exitCode=main(args);
      if (typeof exitCode === "number")return exitCode;
      return 0;
    }
  },
  'gen-adapters': {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "gen-adapters.js")),exitCode=main(args);
      if (typeof exitCode === "number")return exitCode;
      return 0;
    }
  },
  new: {
    description: "Scaffold new plugin, agent, skill, or command",
    usage: "new <type> <name> [options]",subcommands: NEW_SUBCOMMANDS,
    handler: () => {
      console.log('Available types: plugin, agent, skill, command');
      console.log('Usage: agentsys-dev new <type> <name> [options]');
      return 0;
    }
  }
};
function parseArgs(argv) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  let index = 0;
  while (index < argv.length) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      parsed.help = true;
      index++;
    } else if (argument === '--version' || argument === '-v') {
      parsed.version = true;
      index++;
    } else {
      break;
    }
  }
  if (index < argv.length && !argv[index].startsWith('-')) parsed.command = argv[index++];
  if (index < argv.length && !argv[index].startsWith('-') && COMMANDS[parsed.command]?.subcommands) {
    parsed.subcommand = argv[index++];
  }
  parsed.rest = argv.slice(index);
  if (parsed.rest.includes('--help') || parsed.rest.includes('-h')) {
    parsed.help = true;
    parsed.rest = parsed.rest.filter(argument => argument !== '--help' && argument !== '-h');
  }
  return parsed;
}
function printHelp() {
  console.log("\nagentsys-dev v6.0.1 - Developer CLI\n\nUsage:\n  agentsys-dev <command> [options]\n  agentsys-dev --help\n  agentsys-dev --version\n\nCommands:\n  validate                Run all validators\n  validate <sub>          Run single validator:\n    plugins                 Plugin structure\n    cross-platform          Cross-platform compatibility\n    consistency             Repo consistency (versions, mappings)\n    paths                   Hardcoded platform paths\n    counts [--json]         Doc counts and versions\n    platform-docs [--json]  Cross-platform docs\n    agent-skill-compliance  Agent Skills Open Standard\n    opencode-install        OpenCode installation\n\n  preflight [flags]       Change-aware checklist enforcement\n    --all                 Run all checks regardless of changes\n    --release             Include release-specific checks\n    --json                Structured JSON output\n\n  bump <version>          Bump version across all files\nsetup-hooks             Install git hooks\n  dev-install [tool]      Install to dev tools (--clean to remove)\n  detect                  Detect project platform config\n  verify                  Verify dev tool availability\n  status                  Show project health overview\n  test                    Run test suite\n  migrate-opencode        Migrate commands for OpenCode\n  test-transform          Test OpenCode transform\n  gen-docs                Auto-generate doc sections from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  expand-templates        Expand agent template snippets\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  gen-adapters            Generate platform adapter files from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n\nScaffolding:\n  new plugin <name>       Scaffold a new plugin\n  new agent <name>        Scaffold a new agent (--plugin required)\n  new skill <name>        Scaffold a new skill (--plugin required)\n  new command <name>      Scaffold a new command (--plugin required)\n\nUser CLI (agentsys):\n  agentsys                      Interactive installer\n  agentsys install <plugin>     Install a specific plugin (resolves deps)\n  agentsys remove <plugin>      Remove an installed plugin\n  agentsys search [term]        Search available plugins\n  agentsys list                 List installed plugins and versions\n  agentsys update               Re-fetch latest plugin versions\n\nAliases (npm scripts):\n  npm run new:plugin        = agentsys-dev new plugin\n  npm run new:agent         = agentsys-dev new agent\n  npm run new:skill         = agentsys-dev new skill\n  npm run new:command       = agentsys-dev new command\n  npm run validate          = agentsys-dev validate\n  npm run validate:plugins  = agentsys-dev validate plugins\n  npm run bump              = agentsys-dev bump\n  npm run detect            = agentsys-dev detect\n  npm run verify            = agentsys-dev verify\n  npm run gen-docs          = agentsys-dev gen-docs\n  npm run gen-docs:check    = agentsys-dev gen-docs --check\n  npm run expand-templates  = agentsys-dev expand-templates\n  npm run expand-templates:check = agentsys-dev expand-templates --check\n  npm run gen-adapters      = agentsys-dev gen-adapters\n  npm run gen-adapters:check = agentsys-dev gen-adapters --check\n");
}
function printCommandHelp(commandName, command) {
  console.log('\nagentsys-dev ' + (command.usage || commandName) + '\n');
  console.log('  ' + command.description);
  if (command.subcommands) {
    console.log('\nSubcommands:');
    for (const [name, subcommand] of Object.entries(command.subcommands)) {
      console.log('  ' + name.padEnd(24) + ' ' + subcommand.description);
    }
  }
  console.log('');
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
  if (parsed.help && !parsed.subcommand) {
    printCommandHelp(parsed.command, command);
    return 0;
  }
  if (parsed.subcommand && command.subcommands) {
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error('[ERROR] Unknown subcommand: ' + parsed.command + ' ' + parsed.subcommand);
      console.error("Run 'agentsys-dev " + parsed.command + " --help' for subcommands.");
      return 1;
    }
    if (parsed.help) {
      console.log('\nagentsys-dev ' + (subcommand.usage || parsed.command + ' ' + parsed.subcommand) + '\n');
      console.log('  ' + subcommand.description + '\n');
      return 0;
    }
    return subcommand.handler(parsed.rest);
  }
  return command.handler(parsed.rest);
}
if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
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
