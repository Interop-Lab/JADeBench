#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const VERSION = "6.0.1";
const ROOT_DIR = path.resolve(__dirname, "..");

function load(relativePath) {
  return require(path.join(ROOT_DIR, relativePath));
}

function exitCode(result) {
  return typeof result === "number" ? result : result === false ? 1 : 0;
}

function callMain(relativePath, args) {
  return load(relativePath).main(args);
}

function runSimpleValidator(relativePath, method = "main") {
  return exitCode(load(relativePath)[method]());
}

function validateHardcodedPaths() {
  const pluginsDirectory = path.join(ROOT_DIR, "plugins");
  if (!fs.existsSync(pluginsDirectory)) {
    console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)");
    return 0;
  }

  const platformPath = /(?:\.claude|\.cursor|\.windsurf|\.continue|\.opencode)[/\\]/;
  const violations = [];

  function scan(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(filename);
      else if (/\.(?:js|cjs|mjs|json|md|sh)$/.test(entry.name)) {
        const lines = fs.readFileSync(filename, "utf8").split(/\r?\n/);
        lines.forEach((line, index) => {
          if (platformPath.test(line)) {
            violations.push(`${path.relative(ROOT_DIR, filename)}:${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }

  scan(pluginsDirectory);
  if (!violations.length) {
    console.log("[OK] No hardcoded platform paths found");
    return 0;
  }
  console.error("[ERROR] Hardcoded platform paths found:");
  violations.forEach((violation) => console.error(`  ${violation}`));
  return 1;
}

function printValidationReport(result) {
  if (!result || typeof result !== "object") return;
  for (const [name, value] of Object.entries(result)) {
    if (name === "valid" || name === "success" || name === "errors") continue;
    console.log(`${name}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
  }
  if (Array.isArray(result.errors)) result.errors.forEach((error) => console.error(error));
}

function runReportValidator(relativePath, args) {
  const result = load(relativePath).runValidation();
  if (args.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else printValidationReport(result);
  return result?.valid === false || result?.success === false || result?.errors?.length ? 1 : 0;
}

function scaffold(type, args) {
  return exitCode(load("scripts/scaffold.js").main([type, ...args]));
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: "Validate plugin structure",
    handler: () => runSimpleValidator("scripts/validate-plugins.js"),
  },
  "cross-platform": {
    description: "Cross-platform compatibility checks",
    handler: () => (load("scripts/validate-cross-platform.js").validate() ? 0 : 1),
  },
  consistency: {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => runSimpleValidator("scripts/validate-repo-consistency.js"),
  },
  paths: {
    description: "Scan for hardcoded platform paths",
    handler: validateHardcodedPaths,
  },
  counts: {
    description: "Validate counts and versions across docs",
    usage: "validate counts [--json]",
    handler: (args) => runReportValidator("scripts/validate-counts.js", args),
  },
  "platform-docs": {
    description: "Cross-platform documentation consistency",
    usage: "validate platform-docs [--json]",
    handler: (args) => runReportValidator("scripts/validate-cross-platform-docs.js", args),
  },
  "agent-skill-compliance": {
    description: "Agent Skills Open Standard compliance",
    handler: () => runSimpleValidator("scripts/validate-agent-skill-compliance.js"),
  },
  "opencode-install": {
    description: "Validate OpenCode installation",
    handler: () => runSimpleValidator("scripts/validate-opencode-install.js"),
  },
};

const NEW_SUBCOMMANDS = {
  plugin: { description: "Scaffold a new plugin", handler: (args) => scaffold("plugin", args) },
  agent: { description: "Scaffold a new agent", handler: (args) => scaffold("agent", args) },
  skill: { description: "Scaffold a new skill", handler: (args) => scaffold("skill", args) },
  command: { description: "Scaffold a new command", handler: (args) => scaffold("command", args) },
};

function runAllValidators() {
  console.log("Running all validators...\n");
  let failures = 0;
  for (const [name, command] of Object.entries(VALIDATE_SUBCOMMANDS)) {
    if (name === "opencode-install") continue;
    console.log(`--- validate ${name} ---`);
    try {
      const result = command.handler([]);
      if (result && typeof result.then === "function") {
        throw new Error("Asynchronous validators are not supported by this runner");
      }
      if (result) failures++;
    } catch (error) {
      failures++;
      console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
    }
    if (name === "paths") console.log("");
  }
  if (failures) console.log(`[ERROR] ${failures} validator(s) failed`);
  else console.log("[OK] All validators passed");
  return failures ? 1 : 0;
}

function showStatus() {
  const counts = load("scripts/validate-counts.js").getActualCounts();
  console.log(`agentsys project status (v${VERSION})`);
  for (const [name, value] of Object.entries(counts || {})) {
    console.log(`  ${name}: ${value}`);
  }
  return 0;
}

function runTests(args) {
  const result = spawnSync("npm", ["test", ...args], {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function runDevInstall(args) {
  const supportedTools = new Set(["claude", "cursor", "windsurf", "continue", "opencode"]);
  const tool = args.find((arg) => !arg.startsWith("-"));
  if (tool && !supportedTools.has(tool)) {
    console.error(`[ERROR] Unknown tool: ${tool}`);
    return 1;
  }
  const module = load("scripts/dev-install.js");
  return exitCode(module.main(tool, { clean: args.includes("--clean") }));
}

function runMigration(args) {
  const allowed = new Set(["--dry-run", "--target"]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!allowed.has(arg)) return 1;
    if (arg === "--target" && !args[++index]) return 1;
  }
  const previous = process.argv;
  process.argv = [previous[0], previous[1], ...args];
  try {
    return exitCode(load("scripts/migrate-opencode.js").main());
  } finally {
    process.argv = previous;
  }
}

const COMMANDS = {
  validate: {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: runAllValidators,
  },
  preflight: {
    description: "Run preflight checks (change-aware checklist enforcement)",
    usage: "preflight [--all] [--release] [--json] [--verbose]",
    handler: (args) => exitCode(callMain("scripts/preflight.js", args)),
  },
  bump: {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: (args) => exitCode(callMain("scripts/bump-version.js", args)),
  },
  "setup-hooks": {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: () => exitCode(load("scripts/setup-hooks.js").main()),
  },
  "dev-install": {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: runDevInstall,
  },
  detect: {
    description: "Detect project platform configuration",
    handler: () => {
      console.log(JSON.stringify(load("lib/platform/detect-platform.js").detect(), null, 2));
      return 0;
    },
  },
  verify: {
    description: "Verify development tool availability",
    handler: () => exitCode(load("lib/platform/verify-tools.js").verifyTools()),
  },
  status: { description: "Show project health overview", handler: showStatus },
  test: { description: "Run test suite", handler: runTests },
  "migrate-opencode": {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: runMigration,
  },
  "test-transform": {
    description: "Test OpenCode transform on next-task command",
    handler: () => exitCode(load("scripts/test-transform.js").main()),
  },
  "gen-docs": {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: (args) => exitCode(callMain("scripts/generate-docs.js", args)),
  },
  "expand-templates": {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: (args) => exitCode(callMain("scripts/expand-templates.js", args)),
  },
  "gen-adapters": {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: (args) => exitCode(callMain("scripts/gen-adapters.js", args)),
  },
  new: {
    description: "Scaffold new plugin, agent, skill, or command",
    usage: "new <type> <name> [options]",
    subcommands: NEW_SUBCOMMANDS,
    handler: () => {
      console.log("Available types: plugin, agent, skill, command");
      console.log("Usage: agentsys-dev new <type> <name> [options]");
      return 1;
    },
  },
};

function parseArgs(args) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  const positional = [];
  for (const arg of args) {
    if (arg === "-h" || arg === "--help") parsed.help = true;
    else if (arg === "-v" || arg === "--version") parsed.version = true;
    else positional.push(arg);
  }
  parsed.command = positional.shift() || null;
  if (parsed.command && COMMANDS[parsed.command]?.subcommands && positional.length && positional[0][0] !== "-") {
    parsed.subcommand = positional.shift();
  }
  parsed.rest = positional;
  return parsed;
}

function printHelp() {
  console.log(`
agentsys-dev v${VERSION} - Developer CLI

Usage:
  agentsys-dev <command> [options]
  agentsys-dev --help
  agentsys-dev --version

Commands:`);
  for (const [name, command] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(23)} ${command.description}`);
  }
  console.log("\nRun 'agentsys-dev <command> --help' for command details.\n");
}

function printCommandHelp(name, command) {
  console.log(`\nagentsys-dev ${command.usage || name}\n`);
  console.log(`  ${command.description}`);
  if (command.subcommands) {
    console.log("\nSubcommands:");
    for (const [subcommand, definition] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(24)} ${definition.description}`);
    }
    console.log("");
  }
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
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error(`[ERROR] Unknown subcommand: ${parsed.command} ${parsed.subcommand}`);
      console.error(`Run 'agentsys-dev ${parsed.command} --help' for subcommands.`);
      return 1;
    }
    return subcommand.handler(parsed.rest);
  }
  return command.handler(parsed.rest);
}

if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
  if (result && typeof result.then === "function") {
    result.then((code) => {
      if (typeof code === "number") process.exit(code);
    }).catch((error) => {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    });
  } else if (typeof result === "number" && result !== 0) {
    process.exit(result);
  }
}

module.exports = { parseArgs, COMMANDS, VALIDATE_SUBCOMMANDS, NEW_SUBCOMMANDS, route };
