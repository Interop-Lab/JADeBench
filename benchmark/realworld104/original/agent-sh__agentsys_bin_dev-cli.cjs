#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/utils/command-parser.js
var require_command_parser = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/command-parser.js"(exports2, module2) {
    "use strict";
    var WINDOWS_CMD_SHIMS = /* @__PURE__ */ new Set(["npm", "npx", "pnpm", "yarn", "yarnpkg", "corepack"]);
    function assertValidToken(value, label) {
      if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
      }
      if (value.includes("\0")) {
        throw new Error(`${label} contains invalid null byte`);
      }
    }
    function resolveExecutableForPlatform2(executable, platform = process.platform) {
      assertValidToken(executable, "Executable");
      if (platform !== "win32") {
        return executable;
      }
      const isPathExecutable = executable.includes("/") || executable.includes("\\");
      if (isPathExecutable) {
        const normalizedPath = executable.replace(/\\/g, "/");
        const isNodeModulesBinPath = /\/\.bin\/[^/]+$/i.test(normalizedPath);
        if (isNodeModulesBinPath && !/\.[a-zA-Z0-9]+$/.test(executable)) {
          return executable + ".cmd";
        }
        return executable;
      }
      if (/\.[a-zA-Z0-9]+$/.test(executable)) {
        return executable;
      }
      return WINDOWS_CMD_SHIMS.has(executable.toLowerCase()) ? `${executable}.cmd` : executable;
    }
    function tokenize(command) {
      const trimmed = command.trim();
      if (!trimmed) {
        return [];
      }
      const tokens = [];
      let current = "";
      let quote = null;
      let tokenHadQuotes = false;
      for (let i = 0; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (ch === "\\") {
          const next = trimmed[i + 1];
          if (quote === "'") {
            current += ch;
            continue;
          }
          if (quote === '"') {
            if (next === '"' || next === "\\" || next === "$" || next === "`") {
              current += next;
              i += 1;
            } else {
              current += ch;
            }
            continue;
          }
          if (next && (/\s/.test(next) || next === '"' || next === "'" || next === "\\")) {
            current += next;
            i += 1;
          } else {
            current += ch;
          }
          continue;
        }
        if (quote) {
          if (ch === quote) {
            quote = null;
          } else {
            current += ch;
          }
          continue;
        }
        if (ch === '"' || ch === "'") {
          quote = ch;
          tokenHadQuotes = true;
          continue;
        }
        if (/\s/.test(ch)) {
          if (current.length > 0 || tokenHadQuotes) {
            tokens.push(current);
            current = "";
            tokenHadQuotes = false;
          }
          continue;
        }
        current += ch;
      }
      if (quote) {
        throw new Error("Command contains unterminated quote");
      }
      if (current.length > 0 || tokenHadQuotes) {
        tokens.push(current);
      }
      return tokens;
    }
    function parseCommand(command, label = "Command") {
      if (typeof command !== "string" || command.trim().length === 0) {
        throw new Error(`${label} must be a non-empty string`);
      }
      const tokens = tokenize(command);
      if (tokens.length === 0) {
        throw new Error(`${label} must include an executable`);
      }
      const [executable, ...args] = tokens;
      assertValidToken(executable, `${label} executable`);
      for (const arg of args) {
        if (typeof arg !== "string") {
          throw new Error(`${label} argument must be a string`);
        }
        if (arg.includes("\0")) {
          throw new Error(`${label} argument contains invalid null byte`);
        }
      }
      return {
        executable,
        args,
        display: command.trim()
      };
    }
    module2.exports = {
      parseCommand,
      resolveExecutableForPlatform: resolveExecutableForPlatform2
    };
  }
});

// ../work/agent-sh__agentsys/package.json
var require_package = __commonJS({
  "../work/agent-sh__agentsys/package.json"(exports2, module2) {
    module2.exports = {
      name: "agentsys",
      version: "6.0.1",
      description: "A modular runtime and orchestration system for AI agents - works with Claude Code, OpenCode, and Codex CLI",
      main: "lib/platform/detect-platform.js",
      type: "commonjs",
      bin: {
        agentsys: "./bin/cli.js",
        "agentsys-dev": "./bin/dev-cli.js"
      },
      scripts: {
        dev: "node bin/dev-cli.js",
        test: "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        validate: "node bin/dev-cli.js validate",
        "validate:plugins": "node bin/dev-cli.js validate plugins",
        "validate:agent-skill-compliance": "node bin/dev-cli.js validate agent-skill-compliance",
        "validate:cross-platform": "node bin/dev-cli.js validate cross-platform",
        "validate:consistency": "node bin/dev-cli.js validate consistency",
        "validate:paths": "node bin/dev-cli.js validate paths",
        "validate:counts": "node bin/dev-cli.js validate counts",
        "validate:platform-docs": "node bin/dev-cli.js validate platform-docs",
        preflight: "node bin/dev-cli.js preflight",
        "preflight:all": "node bin/dev-cli.js preflight --all",
        "preflight:release": "node bin/dev-cli.js preflight --release",
        "gen-docs": "node bin/dev-cli.js gen-docs",
        "gen-docs:check": "node bin/dev-cli.js gen-docs --check",
        "expand-templates": "node bin/dev-cli.js expand-templates",
        "expand-templates:check": "node bin/dev-cli.js expand-templates --check",
        "gen-adapters": "node bin/dev-cli.js gen-adapters",
        "gen-adapters:check": "node bin/dev-cli.js gen-adapters --check",
        "new:plugin": "node bin/dev-cli.js new plugin",
        "new:agent": "node bin/dev-cli.js new agent",
        "new:skill": "node bin/dev-cli.js new skill",
        "new:command": "node bin/dev-cli.js new command",
        bump: "node bin/dev-cli.js bump",
        detect: "node bin/dev-cli.js detect",
        verify: "node bin/dev-cli.js verify",
        version: "node scripts/stamp-version.js && git add package.json package-lock.json .claude-plugin/plugin.json .claude-plugin/marketplace.json site/content.json CHANGELOG.md",
        "setup-hooks": "node bin/dev-cli.js setup-hooks"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/agent-sh/agentsys.git"
      },
      keywords: [
        "ai",
        "llm",
        "agents",
        "autonomous-agents",
        "agentic",
        "claude",
        "claude-code",
        "anthropic",
        "openai",
        "codex",
        "opencode",
        "automation",
        "workflow",
        "devtools",
        "code-review",
        "multi-agent",
        "cli",
        "pr-automation",
        "productivity",
        "repo-intel",
        "static-analysis",
        "drift-detect"
      ],
      author: {
        name: "Avi Fenesh",
        url: "https://github.com/avifenesh"
      },
      license: "MIT",
      bugs: {
        url: "https://github.com/agent-sh/agentsys/issues"
      },
      homepage: "https://github.com/agent-sh/agentsys#readme",
      engines: {
        node: ">=18.0.0"
      },
      devDependencies: {
        jest: "^29.7.0"
      },
      workspaces: [
        "lib"
      ]
    };
  }
});

// ../work/agent-sh__agentsys/bin/dev-cli.js
var path = require("path");
var { execSync, spawnSync } = require("child_process");
var { resolveExecutableForPlatform } = require_command_parser();
var VERSION = require_package().version;
var ROOT_DIR = path.join(__dirname, "..");
var VALIDATE_SUBCOMMANDS = {
  "plugins": {
    description: "Validate plugin structure",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-plugins.js"));
      return main();
    }
  },
  "cross-platform": {
    description: "Cross-platform compatibility checks",
    handler: () => {
      const { validate } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform.js"));
      const result = validate();
      return result.success ? 0 : 1;
    }
  },
  "consistency": {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-repo-consistency.js"));
      return main();
    }
  },
  "paths": {
    description: "Scan for hardcoded platform paths",
    handler: () => {
      const fs = require("fs");
      const pluginsDir = path.join(ROOT_DIR, "plugins");
      if (!fs.existsSync(pluginsDir)) {
        console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)");
        return 0;
      }
      const { scanDirectory } = require(path.join(ROOT_DIR, "scripts", "check-hardcoded-paths.js"));
      const issues = scanDirectory(pluginsDir);
      if (issues.length === 0) {
        console.log("[OK] No hardcoded platform paths found");
        return 0;
      }
      console.log(`[ERROR] Found ${issues.length} hardcoded path issue(s)`);
      issues.forEach((i) => console.log(`  ${i.file}:${i.line} - ${i.platform}`));
      return 1;
    }
  },
  "counts": {
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
          result.issues.forEach((i) => console.log(`  ${i.file}: ${i.metric} expected ${i.expected}, got ${i.actual}`));
        }
      }
      return result.status === "ok" ? 0 : 1;
    }
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
      result.issues.forEach((i) => console.log(`  ${i.file}: ${i.message}`));
      return 1;
    }
  },
  "agent-skill-compliance": {
    description: "Agent Skills Open Standard compliance",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-agent-skill-compliance.js"));
      return main();
    }
  },
  "opencode-install": {
    description: "Validate OpenCode installation",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "validate-opencode-install.js"));
      return main();
    }
  }
};
var NEW_SUBCOMMANDS = {
  "plugin": {
    description: "Scaffold a new plugin",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["plugin", ...args]);
    }
  },
  "agent": {
    description: "Scaffold a new agent",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["agent", ...args]);
    }
  },
  "skill": {
    description: "Scaffold a new skill",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["skill", ...args]);
    }
  },
  "command": {
    description: "Scaffold a new command",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return main(["command", ...args]);
    }
  }
};
var COMMANDS = {
  "validate": {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: (_args) => {
      console.log("Running all validators...\n");
      const names = Object.keys(VALIDATE_SUBCOMMANDS);
      let failed = 0;
      for (const name of names) {
        if (name === "opencode-install") continue;
        console.log(`--- validate ${name} ---`);
        try {
          const code = VALIDATE_SUBCOMMANDS[name].handler([]);
          if (code !== 0) {
            failed++;
            console.log(`[ERROR] validate ${name} failed
`);
          } else {
            console.log("");
          }
        } catch (err) {
          failed++;
          console.log(`[ERROR] validate ${name} threw: ${err.message}
`);
        }
      }
      if (failed > 0) {
        console.log(`[ERROR] ${failed} validator(s) failed`);
        return 1;
      }
      console.log("[OK] All validators passed");
      return 0;
    }
  },
  "preflight": {
    description: "Run preflight checks (change-aware checklist enforcement)",
    usage: "preflight [--all] [--release] [--json] [--verbose]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "preflight.js"));
      return main(args);
    }
  },
  "bump": {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "bump-version.js"));
      return main(args);
    }
  },
  "setup-hooks": {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "setup-hooks.js"));
      return main();
    }
  },
  "dev-install": {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: (args) => {
      const validArgs = ["claude", "opencode", "codex", "--clean"];
      for (const arg of args) {
        if (!validArgs.includes(arg) && !arg.startsWith("--")) {
          console.error(`[ERROR] Invalid argument: ${arg}`);
          console.error(`Valid arguments: ${validArgs.join(", ")}`);
          return 1;
        }
      }
      const { main } = require(path.join(ROOT_DIR, "scripts", "dev-install.js"));
      const origArgv = process.argv;
      process.argv = ["node", "dev-install.js", ...args];
      try {
        main();
        return 0;
      } finally {
        process.argv = origArgv;
      }
    }
  },
  "detect": {
    description: "Detect project platform configuration",
    handler: async () => {
      const { detect } = require(path.join(ROOT_DIR, "lib", "platform", "detect-platform.js"));
      const result = await detect();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }
  },
  "verify": {
    description: "Verify development tool availability",
    handler: async () => {
      const { verifyTools } = require(path.join(ROOT_DIR, "lib", "platform", "verify-tools.js"));
      const result = await verifyTools();
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }
  },
  "status": {
    description: "Show project health overview",
    handler: () => {
      const { getActualCounts } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const counts = getActualCounts();
      let branch = "unknown";
      try {
        branch = execSync("git branch --show-current", { cwd: ROOT_DIR, stdio: "pipe" }).toString().trim();
      } catch {
      }
      console.log(`agentsys v${VERSION}`);
      console.log(`Branch: ${branch}`);
      console.log(`Plugins: ${counts.plugins}`);
      console.log(`Agents:  ${counts.totalAgents} (${counts.fileBasedAgents} file-based + ${counts.roleBasedAgents} role-based)`);
      console.log(`Skills:  ${counts.skills}`);
      return 0;
    }
  },
  "test": {
    description: "Run test suite",
    handler: (args) => {
      try {
        const cmdArgs = ["test"];
        if (args.length > 0) {
          cmdArgs.push("--");
          cmdArgs.push(...args);
        }
        const npmExecutable = resolveExecutableForPlatform("npm");
        const result = spawnSync(npmExecutable, cmdArgs, {
          cwd: ROOT_DIR,
          stdio: "inherit",
          shell: false,
          windowsHide: true
        });
        if (result.error) {
          throw result.error;
        }
        return typeof result.status === "number" ? result.status : 1;
      } catch (err) {
        return err.status || 1;
      }
    }
  },
  "migrate-opencode": {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: (args) => {
      for (const arg of args) {
        if (!arg.startsWith("--") && arg !== args[args.indexOf("--target") + 1]) {
          console.error(`[ERROR] Invalid argument: ${arg}`);
          console.error(`Valid flags: --target <path>, --dry-run`);
          return 1;
        }
        if (arg.startsWith("--") && arg !== "--target" && arg !== "--dry-run") {
          console.error(`[ERROR] Unknown flag: ${arg}`);
          console.error(`Valid flags: --target <path>, --dry-run`);
          return 1;
        }
      }
      const { main } = require(path.join(ROOT_DIR, "scripts", "migrate-opencode.js"));
      const origArgv = process.argv;
      process.argv = ["node", "migrate-opencode.js", ...args];
      try {
        main();
        return 0;
      } finally {
        process.argv = origArgv;
      }
    }
  },
  "test-transform": {
    description: "Test OpenCode transform on next-task command",
    handler: () => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "test-transform.js"));
      return main();
    }
  },
  "gen-docs": {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "generate-docs.js"));
      const result = main(args);
      if (typeof result === "number") return result;
      return 0;
    }
  },
  "expand-templates": {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "expand-templates.js"));
      const result = main(args);
      if (typeof result === "number") return result;
      return 0;
    }
  },
  "gen-adapters": {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: (args) => {
      const { main } = require(path.join(ROOT_DIR, "scripts", "gen-adapters.js"));
      const result = main(args);
      if (typeof result === "number") return result;
      return 0;
    }
  },
  "new": {
    description: "Scaffold new plugin, agent, skill, or command",
    usage: "new <type> <name> [options]",
    subcommands: NEW_SUBCOMMANDS,
    handler: (args) => {
      console.log("Available types: plugin, agent, skill, command");
      console.log("Usage: agentsys-dev new <type> <name> [options]");
      return 1;
    }
  }
};
function parseArgs(args) {
  const result = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    rest: []
  };
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
      i++;
    } else if (arg === "--version" || arg === "-v") {
      result.version = true;
      i++;
    } else {
      break;
    }
  }
  if (i < args.length && !args[i].startsWith("-")) {
    result.command = args[i];
    i++;
  }
  if (i < args.length && !args[i].startsWith("-") && COMMANDS[result.command]?.subcommands) {
    result.subcommand = args[i];
    i++;
  }
  result.rest = args.slice(i);
  if (result.rest.includes("--help") || result.rest.includes("-h")) {
    result.help = true;
    result.rest = result.rest.filter((a) => a !== "--help" && a !== "-h");
  }
  return result;
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
function printCommandHelp(cmdName, cmd) {
  console.log(`
agentsys-dev ${cmd.usage || cmdName}
`);
  console.log(`  ${cmd.description}`);
  if (cmd.subcommands) {
    console.log("\nSubcommands:");
    for (const [name, sub] of Object.entries(cmd.subcommands)) {
      console.log(`  ${name.padEnd(24)} ${sub.description}`);
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
    if (parsed.help) {
      printHelp();
      return 0;
    }
    printHelp();
    return 0;
  }
  const cmd = COMMANDS[parsed.command];
  if (!cmd) {
    console.error(`[ERROR] Unknown command: ${parsed.command}`);
    console.error(`Run 'agentsys-dev --help' for available commands.`);
    return 1;
  }
  if (parsed.help && !parsed.subcommand) {
    printCommandHelp(parsed.command, cmd);
    return 0;
  }
  if (parsed.subcommand && cmd.subcommands) {
    const sub = cmd.subcommands[parsed.subcommand];
    if (!sub) {
      console.error(`[ERROR] Unknown subcommand: ${parsed.command} ${parsed.subcommand}`);
      console.error(`Run 'agentsys-dev ${parsed.command} --help' for subcommands.`);
      return 1;
    }
    if (parsed.help) {
      console.log(`
agentsys-dev ${sub.usage || parsed.command + " " + parsed.subcommand}
`);
      console.log(`  ${sub.description}
`);
      return 0;
    }
    return sub.handler(parsed.rest);
  }
  return cmd.handler(parsed.rest);
}
if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === "function") {
    result.then((code) => {
      if (typeof code === "number") process.exit(code);
    }).catch((err) => {
      console.error(`[ERROR] ${err.message}`);
      process.exit(1);
    });
  } else if (typeof result === "number" && result !== 0) {
    process.exit(result);
  }
}
module.exports = { parseArgs, COMMANDS, VALIDATE_SUBCOMMANDS, NEW_SUBCOMMANDS, route };
