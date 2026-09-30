#!/usr/bin/env node
"use strict";

const path = require("path");
const { execSync, spawnSync } = require("child_process");

const VERSION = "6.0.1";
const ROOT_DIR = path.join(__dirname, "..");
const WINDOWS_COMMAND_SHIMS = new Set([
  "npm",
  "npx",
  "pnpm",
  "yarn",
  "yarnpkg",
  "corepack",
]);

function validateNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  if (value.includes("\0")) {
    throw new Error(`${label} contains invalid null byte`);
  }
}

function splitCommand(command) {
  const input = command.trim();
  if (!input) {
    return [];
  }

  const tokens = [];
  let token = "";
  let quote = null;
  let tokenHadQuote = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character !== "\\") {
      if (quote) {
        if (character === quote) {
          quote = null;
        } else {
          token += character;
        }
      } else if (character === '"' || character === "'") {
        quote = character;
        tokenHadQuote = true;
      } else if (/\s/.test(character)) {
        if (token.length > 0 || tokenHadQuote) {
          tokens.push(token);
          token = "";
          tokenHadQuote = false;
        }
      } else {
        token += character;
      }
      continue;
    }

    const nextCharacter = input[index + 1];
    if (quote === "'") {
      token += character;
      continue;
    }
    if (quote === '"') {
      if (
        nextCharacter === '"' ||
        nextCharacter === "\\" ||
        nextCharacter === "$" ||
        nextCharacter === "`"
      ) {
        token += nextCharacter;
        index += 1;
      } else {
        token += character;
      }
      continue;
    }
    if (
      nextCharacter &&
      (/\s/.test(nextCharacter) ||
        nextCharacter === '"' ||
        nextCharacter === "'" ||
        nextCharacter === "\\")
    ) {
      token += nextCharacter;
      index += 1;
    } else {
      token += character;
    }
  }

  if (quote) {
    throw new Error("Command contains unterminated quote");
  }
  if (token.length > 0 || tokenHadQuote) {
    tokens.push(token);
  }
  return tokens;
}

function parseCommand(command, label = "Command") {
  if (typeof command !== "string" || command.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  const tokens = splitCommand(command);
  if (tokens.length === 0) {
    throw new Error(`${label} must include an executable`);
  }

  const [executable, ...args] = tokens;
  validateNonEmptyString(executable, `${label} executable`);
  for (const argument of args) {
    if (typeof argument !== "string") {
      throw new Error(`${label} argument must be a string`);
    }
    if (argument.includes("\0")) {
      throw new Error(`${label} argument contains invalid null byte`);
    }
  }

  return { executable, args, display: command.trim() };
}

function resolveExecutableForPlatform(executable, platform = process.platform) {
  validateNonEmptyString(executable, "Executable");
  if (platform !== "win32") {
    return executable;
  }

  if (executable.includes("/") || executable.includes("\\")) {
    const normalizedExecutable = executable.replace(/\\/g, "/");
    const isExtensionlessBinPath =
      /\/\.bin\/[^/]+$/i.test(normalizedExecutable) &&
      !/\.[a-zA-Z0-9]+$/.test(executable);
    return isExtensionlessBinPath ? `${executable}.cmd` : executable;
  }
  if (/\.[a-zA-Z0-9]+$/.test(executable)) {
    return executable;
  }
  return WINDOWS_COMMAND_SHIMS.has(executable.toLowerCase())
    ? `${executable}.cmd`
    : executable;
}

const VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: "Validate plugin structure",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-plugins.js"));
      return main();
    },
  },
  "cross-platform": {
    description: "Cross-platform compatibility checks",
    handler: () => {
      const { validate } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform.js"));
      return validate().success ? 0 : 1;
    },
  },
  consistency: {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-repo-consistency.js"));
      return main();
    },
  },
  paths: {
    description: "Scan for hardcoded platform paths",
    handler: () => {
      const fs = require("fs");
      const pluginsDirectory = path.join(ROOT_DIR, "plugins");
      if (!fs.existsSync(pluginsDirectory)) {
        console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)");
        return 0;
      }

      const { scanDirectory } = require(path.join(ROOT_DIR, "scripts", "check-hardcoded-paths.js"));
      const issues = scanDirectory(pluginsDirectory);
      if (issues.length === 0) {
        console.log("[OK] No hardcoded platform paths found");
        return 0;
      }

      console.log(`[ERROR] Found ${issues.length} hardcoded path issue(s)`);
      issues.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.platform}`);
      });
      return 1;
    },
  },
  counts: {
    description: "Validate counts and versions across docs",
    usage: "validate counts [--json]",
    handler: (args) => {
      const { runValidation } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
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
          result.issues.forEach((issue) => {
            console.log(`  ${issue.file}: ${issue.metric} expected ${issue.expected}, got ${issue.actual}`);
          });
        }
      }
      return result.status === "ok" ? 0 : 1;
    },
  },
  "platform-docs": {
    description: "Cross-platform documentation consistency",
    usage: "validate platform-docs [--json]",
    handler: (args) => {
      const { runValidation } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform-docs.js"));
      const result = runValidation();
      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
        return result.status === "ok" ? 0 : 1;
      }
      if (result.status === "ok") {
        console.log("[OK] Cross-platform docs valid");
        return 0;
      }

      console.log(`[ERROR] ${result.issues.length} issue(s)`);
      result.issues.forEach((issue) => {
        console.log(`  ${issue.file}: ${issue.message}`);
      });
      return 1;
    },
  },
  "agent-skill-compliance": {
    description: "Agent Skills Open Standard compliance",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-agent-skill-compliance.js"));
      return main();
    },
  },
  "opencode-install": {
    description: "Validate OpenCode installation",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-opencode-install.js"));
      return main();
    },
  },
};

const NEW_SUBCOMMANDS = {
  plugin: {
    description: "Scaffold a new plugin",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["plugin", ...args]);
    },
  },
  agent: {
    description: "Scaffold a new agent",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["agent", ...args]);
    },
  },
  skill: {
    description: "Scaffold a new skill",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["skill", ...args]);
    },
  },
  command: {
    description: "Scaffold a new command",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["command", ...args]);
    },
  },
};

const COMMANDS = {
  validate: {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: (args) => {
      console.log("Running all validators...\n");
      let failures = 0;
      for (const name of Object.keys(VALIDATE_SUBCOMMANDS)) {
        if (name === "opencode-install") {
          continue;
        }

        console.log(`--- validate ${name} ---`);
        try {
          if (VALIDATE_SUBCOMMANDS[name].handler([]) !== 0) {
            failures += 1;
            console.log(`[ERROR] validate ${name} failed\n`);
          } else {
            console.log("");
          }
        } catch (error) {
          failures += 1;
          console.log(`[ERROR] validate ${name} threw: ${error.message}\n`);
        }
      }

      if (failures > 0) {
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
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "preflight.js"));
      return main(args);
    },
  },
  bump: {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "bump-version.js"));
      return main(args);
    },
  },
  "setup-hooks": {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "setup-hooks.js"));
      return main();
    },
  },
  "dev-install": {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: (args) => {
      const validArguments = ["claude", "opencode", "codex", "--clean"];
      for (const argument of args) {
        if (!validArguments.includes(argument) && !argument.startsWith("--")) {
          console.error(`[ERROR] Invalid argument: ${argument}`);
          console.error(`Valid arguments: ${validArguments.join(", ")}`);
          return 1;
        }
      }

      const { main } = require(path.join(ROOT_DIR, "scripts", "dev-install.js"));
      const originalArgv = process.argv;
      process.argv = ["node", "dev-install.js", ...args];
      try {
        main();
        return 0;
      } finally {
        process.argv = originalArgv;
      }
    },
  },
  detect: {
    description: "Detect project platform configuration",
    handler: async () => {
      const { detect } = require(path.join(ROOT_DIR, "lib", "platform", "detect-platform.js"));
      const result = await detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  verify: {
    description: "Verify development tool availability",
    handler: async () => {
      const { verifyTools } = require(path.join(ROOT_DIR, "lib", "platform", "verify-tools.js"));
      const result = await verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    },
  },
  status: {
    description: "Show project health overview",
    handler: () => {
      const { getActualCounts } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const counts = getActualCounts();
      let branch = "unknown";
      try {
        branch = execSync("git branch --show-current", {
          cwd: ROOT_DIR,
          stdio: "pipe",
        }).toString().trim();
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
    description: "Run test suite",
    handler: (args) => {
      try {
        const npmArguments = ["test"];
        if (args.length > 0) {
          npmArguments.push("--");
          npmArguments.push(...args);
        }
        const npmExecutable = resolveExecutableForPlatform("npm");
        const result = spawnSync(npmExecutable, npmArguments, {
          cwd: ROOT_DIR,
          stdio: "inherit",
          shell: false,
          windowsHide: true,
        });
        if (result.error) {
          throw result.error;
        }
        return typeof result.status === "number" ? result.status : 1;
      } catch (error) {
        return error.status || 1;
      }
    },
  },
  "migrate-opencode": {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: (args) => {
      const targetValue = args[args.indexOf("--target") + 1];
      for (const argument of args) {
        if (!argument.startsWith("--") && argument !== targetValue) {
          console.error(`[ERROR] Invalid argument: ${argument}`);
          console.error("Valid flags: --target <path>, --dry-run");
          return 1;
        }
        if (
          argument.startsWith("--") &&
          argument !== "--target" &&
          argument !== "--dry-run"
        ) {
          console.error(`[ERROR] Unknown flag: ${argument}`);
          console.error("Valid flags: --target <path>, --dry-run");
          return 1;
        }
      }

      const { main } = require(path.join(ROOT_DIR, "scripts", "migrate-opencode.js"));
      const originalArgv = process.argv;
      process.argv = ["node", "migrate-opencode.js", ...args];
      try {
        main();
        return 0;
      } finally {
        process.argv = originalArgv;
      }
    },
  },
  "test-transform": {
    description: "Test OpenCode transform on next-task command",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "test-transform.js"));
      return main();
    },
  },
  "gen-docs": {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "generate-docs.js"));
      const result = main(args);
      return typeof result === "number" ? result : 0;
    },
  },
  "expand-templates": {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "expand-templates.js"));
      const result = main(args);
      return typeof result === "number" ? result : 0;
    },
  },
  "gen-adapters": {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "gen-adapters.js"));
      const result = main(args);
      return typeof result === "number" ? result : 0;
    },
  },
  new: {
    description: "Scaffold new plugin, agent, skill, or command",
    usage: "new <type> <name> [options]",
    subcommands: NEW_SUBCOMMANDS,
    handler: (args) => {
      console.log("Available types: plugin, agent, skill, command");
      console.log("Usage: agentsys-dev new <type> <name> [options]");
      return 1;
    },
  },
};

function parseArgs(argv) {
  const parsed = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    rest: [],
  };
  let index = 0;

  while (index < argv.length) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      parsed.help = true;
      index += 1;
    } else if (argument === "--version" || argument === "-v") {
      parsed.version = true;
      index += 1;
    } else {
      break;
    }
  }

  if (index < argv.length && !argv[index].startsWith("-")) {
    parsed.command = argv[index];
    index += 1;
  }
  if (
    index < argv.length &&
    !argv[index].startsWith("-") &&
    COMMANDS[parsed.command]?.subcommands
  ) {
    parsed.subcommand = argv[index];
    index += 1;
  }

  parsed.rest = argv.slice(index);
  if (parsed.rest.includes("--help") || parsed.rest.includes("-h")) {
    parsed.help = true;
    parsed.rest = parsed.rest.filter(
      (argument) => argument !== "--help" && argument !== "-h",
    );
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
`);
}

function printCommandHelp(commandName, command) {
  console.log(`\nagentsys-dev ${command.usage || commandName}\n`);
  console.log(`  ${command.description}`);
  if (command.subcommands) {
    console.log("\nSubcommands:");
    for (const [name, subcommand] of Object.entries(command.subcommands)) {
      console.log(`  ${name.padEnd(24)} ${subcommand.description}`);
    }
  }
  console.log("");
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
      const usage = subcommand.usage || `${parsed.command} ${parsed.subcommand}`;
      console.log(`\nagentsys-dev ${usage}\n`);
      console.log(`  ${subcommand.description}\n`);
      return 0;
    }
    return subcommand.handler(parsed.rest);
  }
  return command.handler(parsed.rest);
}

if (require.main === module) {
  const result = route(parseArgs(process.argv.slice(2)));
  if (result && typeof result.then === "function") {
    result
      .then((exitCode) => {
        if (typeof exitCode === "number") {
          process.exit(exitCode);
        }
      })
      .catch((error) => {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
      });
  } else if (typeof result === "number" && result !== 0) {
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
