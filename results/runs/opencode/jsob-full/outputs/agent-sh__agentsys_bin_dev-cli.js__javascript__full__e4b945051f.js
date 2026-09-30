#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const VERSION = "6.0.1";
const ROOT_DIR = path.join(__dirname, "..");

function resolveExecutableForPlatform(command) {
  return process.platform === "win32" && !/\.(?:cmd|exe|bat)$/i.test(command)
    ? `${command}.cmd`
    : command;
}

function loadScript(...parts) {
  return require(path.join(ROOT_DIR, ...parts));
}

function runMain(parts, args = []) {
  const script = loadScript(...parts);
  const main = typeof script === "function" ? script : script.main;
  if (typeof main !== "function") {
    throw new TypeError(`${parts.join("/")} does not export main()`);
  }
  return main(args);
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: "Validate plugin structure",
    handler: () => runMain(["scripts", "validate-plugins.js"]),
  },
  "cross-platform": {
    description: "Cross-platform compatibility checks",
    handler: () => runMain(["scripts", "validate-cross-platform.js"]),
  },
  consistency: {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => runMain(["scripts", "validate-repo-consistency.js"]),
  },
  paths: {
    description: "Scan for hardcoded platform paths",
    handler: () => {
      const pluginsDirectory = path.join(ROOT_DIR, "plugins");
      if (!fs.existsSync(pluginsDirectory)) {
        console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)");
      }

      const checker = loadScript("scripts", "check-hardcoded-paths.js");
      const check = checker.main || checker.checkHardcodedPaths || checker;
      const issues = check(ROOT_DIR) || [];
      if (issues.length === 0) {
        console.log("[OK] No hardcoded platform paths found");
        return 0;
      }

      console.log(`[ERROR] Found ${issues.length} hardcoded path issue(s)`);
      for (const issue of issues) {
        console.log(`  ${issue.file}:${issue.line} - ${issue.platform}`);
      }
      return 1;
    },
  },
  counts: {
    description: "Validate counts and versions across docs",
    usage: "validate counts [--json]",
    handler: (args = []) => {
      const validator = loadScript("scripts", "validate-counts.js");
      const runValidation = validator.runValidation || validator.main || validator;
      const result = runValidation();
      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const counts = result.actualCounts;
        console.log(`Plugins: ${counts.plugins}, Agents: ${counts.totalAgents}, Skills: ${counts.skills}`);
        if (result.status === "ok") {
          console.log("[OK] All counts aligned");
        } else {
          console.log(`[ERROR] ${result.issues.length} issue(s) found`);
          for (const issue of result.issues) {
            console.log(`  ${issue.file}: ${issue.metric} expected ${issue.expected}, got ${issue.actual}`);
          }
        }
      }
      return result.status === "ok" ? 0 : 1;
    },
  },
  "platform-docs": {
    description: "Cross-platform documentation consistency",
    usage: "validate platform-docs [--json]",
    handler: (args = []) => {
      const validator = loadScript("scripts", "validate-cross-platform-docs.js");
      const validate = validator.main || validator.validate || validator;
      const result = validate();
      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result.status === "ok") {
        console.log("[OK] Cross-platform docs valid");
      } else {
        console.log(`[ERROR] ${result.issues.length} issue(s)`);
        for (const issue of result.issues) console.log(`  ${issue.file}: ${issue.message}`);
      }
      return result.status === "ok" ? 0 : 1;
    },
  },
  "agent-skill-compliance": {
    description: "Agent Skills Open Standard compliance",
    handler: () => runMain(["scripts", "validate-agent-skill-compliance.js"]),
  },
  "opencode-install": {
    description: "Validate OpenCode installation",
    handler: () => runMain(["scripts", "validate-opencode-install.js"]),
  },
};

function scaffold(type, args) {
  const script = loadScript("scripts", "scaffold.js");
  const main = script.main || script;
  return main([type, ...args]);
}

const NEW_SUBCOMMANDS = Object.fromEntries(
  ["plugin", "agent", "skill", "command"].map((type) => [
    type,
    {
      description: `Scaffold a new ${type}`,
      handler: (args = []) => scaffold(type, args),
    },
  ]),
);

function scriptCommand(filename) {
  return (args = []) => runMain(["scripts", filename], args);
}

const COMMANDS = {
  validate: {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: async () => {
      console.log("Running all validators...\n");
      let failures = 0;
      for (const [name, validator] of Object.entries(VALIDATE_SUBCOMMANDS)) {
        console.log(`--- validate ${name} ---`);
        try {
          if ((await validator.handler([])) !== 0) failures++;
        } catch (error) {
          failures++;
          console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
        }
        console.log("");
      }
      if (failures) {
        console.log(`[ERROR] ${failures} validator(s) failed`);
        return 1;
      }
      console.log("[OK] All validators passed");
      return 0;
    },
  },
  preflight: {
    description: "Run preflight checks (change-aware checklist enforcement)",
    usage: "preflight [--all] [--release] [--json] [--verbose]",
    handler: scriptCommand("preflight.js"),
  },
  bump: {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: scriptCommand("bump-version.js"),
  },
  "setup-hooks": {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: scriptCommand("setup-hooks.js"),
  },
  "dev-install": {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: (args = []) => {
      const valid = ["claude", "opencode", "codex", "--clean"];
      const invalid = args.find((arg) => !valid.includes(arg));
      if (invalid) {
        console.error(`[ERROR] Invalid argument: ${invalid}`);
        console.error(`Valid arguments: ${valid.join(", ")}`);
        return 1;
      }
      return scriptCommand("dev-install.js")(args);
    },
  },
  detect: {
    description: "Detect project platform configuration",
    handler: () => {
      const detector = loadScript("lib", "platform", "detect-platform.js");
      const result = (detector.detectPlatform || detector.main || detector)();
      console.log(JSON.stringify(result, null, 2));
      return result;
    },
  },
  verify: {
    description: "Verify development tool availability",
    handler: () => {
      const verifier = loadScript("lib", "platform", "verify-tools.js");
      const result = (verifier.verifyTools || verifier.main || verifier)();
      console.log(JSON.stringify(result, null, 2));
      return result;
    },
  },
  status: {
    description: "Show project health overview",
    handler: () => {
      const validator = loadScript("scripts", "validate-counts.js");
      const result = (validator.runValidation || validator.main || validator)();
      let branch = "unknown";
      try {
        branch = execSync("git branch --show-current", { cwd: ROOT_DIR, stdio: "pipe" }).toString().trim() || "unknown";
      } catch {}
      const counts = result.actualCounts;
      console.log(`agentsys v${VERSION}`);
      console.log(`Branch: ${branch}`);
      console.log(`Plugins: ${counts.plugins}`);
      console.log(`Agents:  ${counts.totalAgents} (${counts.fileBasedAgents} file-based + ${counts.roleBasedAgents} role-based)`);
      console.log(`Skills:  ${counts.skills}`);
      return 0;
    },
  },
  test: {
    description: "Run test suite",
    handler: (args = []) => {
      const executable = resolveExecutableForPlatform("npm");
      const child = spawnSync(executable, ["test", ...(args.length ? ["--", ...args] : [])], {
        cwd: ROOT_DIR,
        stdio: "inherit",
        shell: false,
        windowsHide: true,
      });
      return child.status || 0;
    },
  },
  "migrate-opencode": {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: (args = []) => {
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === "--dry-run") continue;
        if (arg === "--target" && args[index + 1]) { index++; continue; }
        console.error(`[ERROR] Unknown flag: ${arg}`);
        console.error("Valid flags: --target <path>, --dry-run");
        return 1;
      }
      return scriptCommand("migrate-opencode.js")(args);
    },
  },
  "test-transform": {
    description: "Test OpenCode transform on next-task command",
    handler: scriptCommand("test-transform.js"),
  },
  "gen-docs": {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: scriptCommand("generate-docs.js"),
  },
  "expand-templates": {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: scriptCommand("expand-templates.js"),
  },
  "gen-adapters": {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: scriptCommand("gen-adapters.js"),
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

function parseArgs(argv) {
  const parsed = { help: false, version: false, command: null, subcommand: null, rest: [] };
  let index = 0;
  while (index < argv.length) {
    if (argv[index] === "--help" || argv[index] === "-h") { parsed.help = true; index++; }
    else if (argv[index] === "--version" || argv[index] === "-v") { parsed.version = true; index++; }
    else break;
  }
  if (index < argv.length && !argv[index].startsWith("-")) parsed.command = argv[index++];
  const command = COMMANDS[parsed.command];
  if (command?.subcommands && index < argv.length && !argv[index].startsWith("-")) parsed.subcommand = argv[index++];
  parsed.rest = argv.slice(index);
  if (parsed.rest.includes("--help") || parsed.rest.includes("-h")) {
    parsed.help = true;
    parsed.rest = parsed.rest.filter((arg) => arg !== "--help" && arg !== "-h");
  }
  return parsed;
}

function printHelp() {
  console.log(`\nagentsys-dev v${VERSION}\n`);
  console.log("Usage: agentsys-dev <command> [options]\n");
  console.log("Commands:");
  for (const [name, command] of Object.entries(COMMANDS)) console.log(`  ${name.padEnd(24)} ${command.description}`);
  console.log("\nOptions:\n  -h, --help               Show help\n  -v, --version            Show version\n");
}

function printCommandHelp(name, command) {
  console.log(`\nagentsys-dev ${command.usage || name}\n`);
  console.log(`  ${command.description}`);
  if (command.subcommands) {
    console.log("\nSubcommands:");
    for (const [subcommand, details] of Object.entries(command.subcommands)) {
      console.log(`  ${subcommand.padEnd(24)} ${details.description}`);
    }
  }
  console.log("");
}

function route(parsed) {
  if (parsed.version) { console.log(VERSION); return 0; }
  if (!parsed.command) { printHelp(); return parsed.help ? 0 : 1; }
  const command = COMMANDS[parsed.command];
  if (!command) { console.error(`[ERROR] Unknown command: ${parsed.command}`); printHelp(); return 1; }
  if (parsed.help) { printCommandHelp(parsed.command, command); return 0; }
  if (command.subcommands && parsed.subcommand) {
    const subcommand = command.subcommands[parsed.subcommand];
    if (!subcommand) {
      console.error(`[ERROR] Unknown subcommand: ${parsed.subcommand}`);
      printCommandHelp(parsed.command, command);
      return 1;
    }
    return subcommand.handler(parsed.rest);
  }
  return command.handler(parsed.rest);
}

if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
  if (result && typeof result.then === "function") {
    result.then((code) => { if (typeof code === "number") process.exit(code); })
      .catch((error) => { console.error(`[ERROR] ${error.message}`); process.exit(1); });
  } else if (typeof result === "number" && result !== 0) {
    process.exit(result);
  }
}

module.exports = { parseArgs, COMMANDS, VALIDATE_SUBCOMMANDS, NEW_SUBCOMMANDS, route };
