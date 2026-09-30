#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2bae27, _0xfe7be0) => function _0x326079() {
  if (!_0xfe7be0) {
    (0, _0x2bae27[__getOwnPropNames(_0x2bae27)[0]])((_0xfe7be0 = {
      exports: {}
    }).exports, _0xfe7be0);
  }
  return _0xfe7be0.exports;
};
var require_command_parser = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/command-parser.js"(_0x53237, _0x4ecda0) {
    'use strict';

    var _0x33b3b5 = new Set(["npm", "npx", "pnpm", "yarn", "yarnpkg", "corepack"]);
    function _0x505f63(_0x36096f, _0x5dbca5) {
      if (typeof _0x36096f !== "string" || _0x36096f.length === 0) {
        throw new Error(_0x5dbca5 + " must be a non-empty string");
      }
      if (_0x36096f.includes("\0")) {
        throw new Error(_0x5dbca5 + " contains invalid null byte");
      }
    }
    function _0x4c8afe(_0x307361, _0xb70f3 = process.platform) {
      _0x505f63(_0x307361, "Executable");
      if (_0xb70f3 !== "win32") {
        return _0x307361;
      }
      const _0x5a7f35 = _0x307361.includes("/") || _0x307361.includes("\\");
      if (_0x5a7f35) {
        const _0xa9f7fd = _0x307361.replace(/\\/g, "/");
        const _0xc7b8d1 = /\/\.bin\/[^/]+$/i.test(_0xa9f7fd);
        if (_0xc7b8d1 && !/\.[a-zA-Z0-9]+$/.test(_0x307361)) {
          return _0x307361 + ".cmd";
        }
        return _0x307361;
      }
      if (/\.[a-zA-Z0-9]+$/.test(_0x307361)) {
        return _0x307361;
      }
      if (_0x33b3b5.has(_0x307361.toLowerCase())) {
        return _0x307361 + ".cmd";
      } else {
        return _0x307361;
      }
    }
    function _0x527cfe(_0x47ce97) {
      const _0x28d144 = _0x47ce97.trim();
      if (!_0x28d144) {
        return [];
      }
      const _0x340e9a = [];
      let _0x45cf5f = "";
      let _0x2b5f72 = null;
      let _0x9cd337 = false;
      for (let _0x3b764c = 0; _0x3b764c < _0x28d144.length; _0x3b764c++) {
        const _0x3a1022 = _0x28d144[_0x3b764c];
        if (_0x3a1022 === "\\") {
          const _0x39486c = _0x28d144[_0x3b764c + 1];
          if (_0x2b5f72 === "'") {
            _0x45cf5f += _0x3a1022;
            continue;
          }
          if (_0x2b5f72 === "\"") {
            if (_0x39486c === "\"" || _0x39486c === "\\" || _0x39486c === "$" || _0x39486c === "`") {
              _0x45cf5f += _0x39486c;
              _0x3b764c += 1;
            } else {
              _0x45cf5f += _0x3a1022;
            }
            continue;
          }
          if (_0x39486c && (/\s/.test(_0x39486c) || _0x39486c === "\"" || _0x39486c === "'" || _0x39486c === "\\")) {
            _0x45cf5f += _0x39486c;
            _0x3b764c += 1;
          } else {
            _0x45cf5f += _0x3a1022;
          }
          continue;
        }
        if (_0x2b5f72) {
          if (_0x3a1022 === _0x2b5f72) {
            _0x2b5f72 = null;
          } else {
            _0x45cf5f += _0x3a1022;
          }
          continue;
        }
        if (_0x3a1022 === "\"" || _0x3a1022 === "'") {
          _0x2b5f72 = _0x3a1022;
          _0x9cd337 = true;
          continue;
        }
        if (/\s/.test(_0x3a1022)) {
          if (_0x45cf5f.length > 0 || _0x9cd337) {
            _0x340e9a.push(_0x45cf5f);
            _0x45cf5f = "";
            _0x9cd337 = false;
          }
          continue;
        }
        _0x45cf5f += _0x3a1022;
      }
      if (_0x2b5f72) {
        throw new Error("Command contains unterminated quote");
      }
      if (_0x45cf5f.length > 0 || _0x9cd337) {
        _0x340e9a.push(_0x45cf5f);
      }
      return _0x340e9a;
    }
    function _0x53cdf6(_0x4f0ee1, _0x51f745 = "Command") {
      if (typeof _0x4f0ee1 !== "string" || _0x4f0ee1.trim().length === 0) {
        throw new Error(_0x51f745 + " must be a non-empty string");
      }
      const _0x3d1cdd = _0x527cfe(_0x4f0ee1);
      if (_0x3d1cdd.length === 0) {
        throw new Error(_0x51f745 + " must include an executable");
      }
      const [_0x390198, ..._0x337a82] = _0x3d1cdd;
      _0x505f63(_0x390198, _0x51f745 + " executable");
      for (const _0x225e87 of _0x337a82) {
        if (typeof _0x225e87 !== "string") {
          throw new Error(_0x51f745 + " argument must be a string");
        }
        if (_0x225e87.includes("\0")) {
          throw new Error(_0x51f745 + " argument contains invalid null byte");
        }
      }
      return {
        executable: _0x390198,
        args: _0x337a82,
        display: _0x4f0ee1.trim()
      };
    }
    const _0x27ca0a = {
      parseCommand: _0x53cdf6,
      resolveExecutableForPlatform: _0x4c8afe
    };
    _0x4ecda0.exports = _0x27ca0a;
  }
});
const _0x114d22 = {
  "../work/agent-sh__agentsys/package.json": function (_0x1c35b7, _0xe83943) {
    const _0x5e8d5a = {};
    _0x5e8d5a.name = "agentsys";
    _0x5e8d5a.version = "6.0.1";
    _0x5e8d5a.description = "A modular runtime and orchestration system for AI agents - works with Claude Code, OpenCode, and Codex CLI";
    _0x5e8d5a.main = "lib/platform/detect-platform.js";
    _0x5e8d5a.type = "commonjs";
    _0x5e8d5a.bin = {};
    _0x5e8d5a.scripts = {};
    _0x5e8d5a.repository = {};
    _0x5e8d5a.keywords = ["ai", "llm", "agents", "autonomous-agents", "agentic", "claude", "claude-code", "anthropic", "openai", "codex", "opencode", "automation", "workflow", "devtools", "code-review", "multi-agent", "cli", "pr-automation", "productivity", "repo-intel", "static-analysis", "drift-detect"];
    _0x5e8d5a.author = {};
    _0x5e8d5a.license = "MIT";
    _0x5e8d5a.bugs = {};
    _0x5e8d5a.homepage = "https://github.com/agent-sh/agentsys#readme";
    _0x5e8d5a.engines = {};
    _0x5e8d5a.devDependencies = {};
    _0x5e8d5a.workspaces = ["lib"];
    _0x5e8d5a.bin.agentsys = "./bin/cli.js";
    _0x5e8d5a.bin["agentsys-dev"] = "./bin/dev-cli.js";
    _0x5e8d5a.scripts.dev = "node bin/dev-cli.js";
    _0x5e8d5a.scripts.test = "jest";
    _0x5e8d5a.scripts["test:watch"] = "jest --watch";
    _0x5e8d5a.scripts["test:coverage"] = "jest --coverage";
    _0x5e8d5a.scripts.validate = "node bin/dev-cli.js validate";
    _0x5e8d5a.scripts["validate:plugins"] = "node bin/dev-cli.js validate plugins";
    _0x5e8d5a.scripts["validate:agent-skill-compliance"] = "node bin/dev-cli.js validate agent-skill-compliance";
    _0x5e8d5a.scripts["validate:cross-platform"] = "node bin/dev-cli.js validate cross-platform";
    _0x5e8d5a.scripts["validate:consistency"] = "node bin/dev-cli.js validate consistency";
    _0x5e8d5a.scripts["validate:paths"] = "node bin/dev-cli.js validate paths";
    _0x5e8d5a.scripts["validate:counts"] = "node bin/dev-cli.js validate counts";
    _0x5e8d5a.scripts["validate:platform-docs"] = "node bin/dev-cli.js validate platform-docs";
    _0x5e8d5a.scripts.preflight = "node bin/dev-cli.js preflight";
    _0x5e8d5a.scripts["preflight:all"] = "node bin/dev-cli.js preflight --all";
    _0x5e8d5a.scripts["preflight:release"] = "node bin/dev-cli.js preflight --release";
    _0x5e8d5a.scripts["gen-docs"] = "node bin/dev-cli.js gen-docs";
    _0x5e8d5a.scripts["gen-docs:check"] = "node bin/dev-cli.js gen-docs --check";
    _0x5e8d5a.scripts["expand-templates"] = "node bin/dev-cli.js expand-templates";
    _0x5e8d5a.scripts["expand-templates:check"] = "node bin/dev-cli.js expand-templates --check";
    _0x5e8d5a.scripts["gen-adapters"] = "node bin/dev-cli.js gen-adapters";
    _0x5e8d5a.scripts["gen-adapters:check"] = "node bin/dev-cli.js gen-adapters --check";
    _0x5e8d5a.scripts["new:plugin"] = "node bin/dev-cli.js new plugin";
    _0x5e8d5a.scripts["new:agent"] = "node bin/dev-cli.js new agent";
    _0x5e8d5a.scripts["new:skill"] = "node bin/dev-cli.js new skill";
    _0x5e8d5a.scripts["new:command"] = "node bin/dev-cli.js new command";
    _0x5e8d5a.scripts.bump = "node bin/dev-cli.js bump";
    _0x5e8d5a.scripts.detect = "node bin/dev-cli.js detect";
    _0x5e8d5a.scripts.verify = "node bin/dev-cli.js verify";
    _0x5e8d5a.scripts.version = "node scripts/stamp-version.js && git add package.json package-lock.json .claude-plugin/plugin.json .claude-plugin/marketplace.json site/content.json CHANGELOG.md";
    _0x5e8d5a.scripts["setup-hooks"] = "node bin/dev-cli.js setup-hooks";
    _0x5e8d5a.repository.type = "git";
    _0x5e8d5a.repository.url = "git+https://github.com/agent-sh/agentsys.git";
    _0x5e8d5a.author.name = "Avi Fenesh";
    _0x5e8d5a.author.url = "https://github.com/avifenesh";
    _0x5e8d5a.bugs.url = "https://github.com/agent-sh/agentsys/issues";
    _0x5e8d5a.engines.node = ">=18.0.0";
    _0x5e8d5a.devDependencies.jest = "^29.7.0";
    _0xe83943.exports = _0x5e8d5a;
  }
};
var require_package = __commonJS(_0x114d22);
var path = require("path");
var {
  execSync,
  spawnSync
} = require("child_process");
var {
  resolveExecutableForPlatform
} = require_command_parser();
var VERSION = require_package().version;
var ROOT_DIR = path.join(__dirname, "..");
var VALIDATE_SUBCOMMANDS = {
  plugins: {
    description: "Validate plugin structure",
    handler: () => {
      const {
        main: _0x48c519
      } = require(path.join(ROOT_DIR, "scripts", "validate-plugins.js"));
      return _0x48c519();
    }
  },
  "cross-platform": {
    description: "Cross-platform compatibility checks",
    handler: () => {
      const {
        validate: _0xf28c54
      } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform.js"));
      const _0xb408a5 = _0xf28c54();
      if (_0xb408a5.success) {
        return 0;
      } else {
        return 1;
      }
    }
  },
  consistency: {
    description: "Repository consistency checks (versions, mappings, counts)",
    handler: () => {
      const {
        main: _0x52ed4a
      } = require(path.join(ROOT_DIR, "scripts", "validate-repo-consistency.js"));
      return _0x52ed4a();
    }
  },
  paths: {
    description: "Scan for hardcoded platform paths",
    handler: () => {
      const _0x1d71e1 = require("fs");
      const _0x34fa04 = path.join(ROOT_DIR, "plugins");
      if (!_0x1d71e1.existsSync(_0x34fa04)) {
        console.log("[OK] No plugins/ directory (plugins extracted to standalone repos)");
        return 0;
      }
      const {
        scanDirectory: _0x19ace6
      } = require(path.join(ROOT_DIR, "scripts", "check-hardcoded-paths.js"));
      const _0x12168d = _0x19ace6(_0x34fa04);
      if (_0x12168d.length === 0) {
        console.log("[OK] No hardcoded platform paths found");
        return 0;
      }
      console.log("[ERROR] Found " + _0x12168d.length + " hardcoded path issue(s)");
      _0x12168d.forEach(_0x9967d6 => console.log("  " + _0x9967d6.file + ":" + _0x9967d6.line + " - " + _0x9967d6.platform));
      return 1;
    }
  },
  counts: {
    description: "Validate counts and versions across docs",
    usage: "validate counts [--json]",
    handler: _0xad8a58 => {
      const {
        runValidation: _0x6fb03c
      } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const _0x1344bd = _0x6fb03c();
      if (_0xad8a58.includes("--json")) {
        console.log(JSON.stringify(_0x1344bd, null, 2));
      } else {
        const _0x446a5d = _0x1344bd.actualCounts;
        console.log("Plugins: " + _0x446a5d.plugins + ", Agents: " + _0x446a5d.totalAgents + ", Skills: " + _0x446a5d.skills);
        if (_0x1344bd.status === "ok") {
          console.log("[OK] All counts aligned");
        } else {
          console.log("[ERROR] " + _0x1344bd.issues.length + " issue(s) found");
          _0x1344bd.issues.forEach(_0x96d191 => console.log("  " + _0x96d191.file + ": " + _0x96d191.metric + " expected " + _0x96d191.expected + ", got " + _0x96d191.actual));
        }
      }
      if (_0x1344bd.status === "ok") {
        return 0;
      } else {
        return 1;
      }
    }
  },
  "platform-docs": {
    description: "Cross-platform documentation consistency",
    usage: "validate platform-docs [--json]",
    handler: _0x483cdf => {
      const {
        runValidation: _0x28f7d2
      } = require(path.join(ROOT_DIR, "scripts", "validate-cross-platform-docs.js"));
      const _0x3dccd3 = _0x28f7d2();
      if (_0x483cdf.includes("--json")) {
        console.log(JSON.stringify(_0x3dccd3, null, 2));
        if (_0x3dccd3.status === "ok") {
          return 0;
        } else {
          return 1;
        }
      }
      if (_0x3dccd3.status === "ok") {
        console.log("[OK] Cross-platform docs valid");
        return 0;
      }
      console.log("[ERROR] " + _0x3dccd3.issues.length + " issue(s)");
      _0x3dccd3.issues.forEach(_0x42ca72 => console.log("  " + _0x42ca72.file + ": " + _0x42ca72.message));
      return 1;
    }
  },
  "agent-skill-compliance": {
    description: "Agent Skills Open Standard compliance",
    handler: () => {
      const {
        main: _0x4b6c23
      } = require(path.join(ROOT_DIR, "scripts", "validate-agent-skill-compliance.js"));
      return _0x4b6c23();
    }
  },
  "opencode-install": {
    description: "Validate OpenCode installation",
    handler: () => {
      const {
        main: _0x359525
      } = require(path.join(ROOT_DIR, "scripts", "validate-opencode-install.js"));
      return _0x359525();
    }
  }
};
var NEW_SUBCOMMANDS = {
  plugin: {
    description: "Scaffold a new plugin",
    handler: _0x44a2ac => {
      const {
        main: _0x52e415
      } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return _0x52e415(["plugin", ..._0x44a2ac]);
    }
  },
  agent: {
    description: "Scaffold a new agent",
    handler: _0xaf2452 => {
      const {
        main: _0x3b58d9
      } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return _0x3b58d9(["agent", ..._0xaf2452]);
    }
  },
  skill: {
    description: "Scaffold a new skill",
    handler: _0x433e90 => {
      const {
        main: _0x1f915d
      } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return _0x1f915d(["skill", ..._0x433e90]);
    }
  },
  command: {
    description: "Scaffold a new command",
    handler: _0x60eb83 => {
      const {
        main: _0xb20c7e
      } = require(path.join(ROOT_DIR, "scripts", "scaffold.js"));
      return _0xb20c7e(["command", ..._0x60eb83]);
    }
  }
};
var COMMANDS = {
  validate: {
    description: "Run validators (all, or specify subcommand)",
    usage: "validate [subcommand] [options]",
    subcommands: VALIDATE_SUBCOMMANDS,
    handler: _0x58d8f9 => {
      console.log("Running all validators...\n");
      const _0x2d0a52 = Object.keys(VALIDATE_SUBCOMMANDS);
      let _0x3a91b5 = 0;
      for (const _0x114d7a of _0x2d0a52) {
        if (_0x114d7a === "opencode-install") {
          continue;
        }
        console.log("--- validate " + _0x114d7a + " ---");
        try {
          const _0x464414 = VALIDATE_SUBCOMMANDS[_0x114d7a].handler([]);
          if (_0x464414 !== 0) {
            _0x3a91b5++;
            console.log("[ERROR] validate " + _0x114d7a + " failed\n");
          } else {
            console.log("");
          }
        } catch (_0x55e554) {
          _0x3a91b5++;
          console.log("[ERROR] validate " + _0x114d7a + " threw: " + _0x55e554.message + "\n");
        }
      }
      if (_0x3a91b5 > 0) {
        console.log("[ERROR] " + _0x3a91b5 + " validator(s) failed");
        return 1;
      }
      console.log("[OK] All validators passed");
      return 0;
    }
  },
  preflight: {
    description: "Run preflight checks (change-aware checklist enforcement)",
    usage: "preflight [--all] [--release] [--json] [--verbose]",
    handler: _0x4f2360 => {
      const {
        main: _0x5669a8
      } = require(path.join(ROOT_DIR, "scripts", "preflight.js"));
      return _0x5669a8(_0x4f2360);
    }
  },
  bump: {
    description: "Bump version across all files",
    usage: "bump <version>",
    handler: _0x2993d7 => {
      const {
        main: _0x3d90ab
      } = require(path.join(ROOT_DIR, "scripts", "bump-version.js"));
      return _0x3d90ab(_0x2993d7);
    }
  },
  "setup-hooks": {
    description: "Install git hooks (pre-commit, pre-push)",
    handler: () => {
      const {
        main: _0x1988e9
      } = require(path.join(ROOT_DIR, "scripts", "setup-hooks.js"));
      return _0x1988e9();
    }
  },
  "dev-install": {
    description: "Install to all tools for development testing",
    usage: "dev-install [tool] [--clean]",
    handler: _0x5a7312 => {
      const _0x558eee = ["claude", "opencode", "codex", "--clean"];
      for (const _0x1e1276 of _0x5a7312) {
        if (!_0x558eee.includes(_0x1e1276) && !_0x1e1276.startsWith("--")) {
          console.error("[ERROR] Invalid argument: " + _0x1e1276);
          console.error("Valid arguments: " + _0x558eee.join(", "));
          return 1;
        }
      }
      const {
        main: _0x408634
      } = require(path.join(ROOT_DIR, "scripts", "dev-install.js"));
      const _0x2f7ac2 = process.argv;
      process.argv = ["node", "dev-install.js", ..._0x5a7312];
      try {
        _0x408634();
        return 0;
      } finally {
        process.argv = _0x2f7ac2;
      }
    }
  },
  detect: {
    description: "Detect project platform configuration",
    handler: async () => {
      const {
        detect: _0x4cc2df
      } = require(path.join(ROOT_DIR, "lib", "platform", "detect-platform.js"));
      const _0x1abc6b = await _0x4cc2df();
      console.log(JSON.stringify(_0x1abc6b, null, 2));
      return 0;
    }
  },
  verify: {
    description: "Verify development tool availability",
    handler: async () => {
      const {
        verifyTools: _0x48828c
      } = require(path.join(ROOT_DIR, "lib", "platform", "verify-tools.js"));
      const _0x4d2966 = await _0x48828c();
      console.log(JSON.stringify(_0x4d2966, null, 2));
      return 0;
    }
  },
  status: {
    description: "Show project health overview",
    handler: () => {
      const {
        getActualCounts: _0x225536
      } = require(path.join(ROOT_DIR, "scripts", "validate-counts.js"));
      const _0x11d8d4 = _0x225536();
      let _0x25fdf1 = "unknown";
      try {
        _0x25fdf1 = execSync("git branch --show-current", {
          cwd: ROOT_DIR,
          stdio: "pipe"
        }).toString().trim();
      } catch {}
      console.log("agentsys v" + VERSION);
      console.log("Branch: " + _0x25fdf1);
      console.log("Plugins: " + _0x11d8d4.plugins);
      console.log("Agents:  " + _0x11d8d4.totalAgents + " (" + _0x11d8d4.fileBasedAgents + " file-based + " + _0x11d8d4.roleBasedAgents + " role-based)");
      console.log("Skills:  " + _0x11d8d4.skills);
      return 0;
    }
  },
  test: {
    description: "Run test suite",
    handler: _0x177067 => {
      try {
        const _0x52c88a = ["test"];
        if (_0x177067.length > 0) {
          _0x52c88a.push("--");
          _0x52c88a.push(..._0x177067);
        }
        const _0x6edaf4 = resolveExecutableForPlatform("npm");
        const _0x1141ed = spawnSync(_0x6edaf4, _0x52c88a, {
          cwd: ROOT_DIR,
          stdio: "inherit",
          shell: false,
          windowsHide: true
        });
        if (_0x1141ed.error) {
          throw _0x1141ed.error;
        }
        if (typeof _0x1141ed.status === "number") {
          return _0x1141ed.status;
        } else {
          return 1;
        }
      } catch (_0x38c48c) {
        return _0x38c48c.status || 1;
      }
    }
  },
  "migrate-opencode": {
    description: "Migrate commands for OpenCode compatibility",
    usage: "migrate-opencode [--target <path>] [--dry-run]",
    handler: _0x3454d1 => {
      for (const _0x324bf2 of _0x3454d1) {
        if (!_0x324bf2.startsWith("--") && _0x324bf2 !== _0x3454d1[_0x3454d1.indexOf("--target") + 1]) {
          console.error("[ERROR] Invalid argument: " + _0x324bf2);
          console.error("Valid flags: --target <path>, --dry-run");
          return 1;
        }
        if (_0x324bf2.startsWith("--") && _0x324bf2 !== "--target" && _0x324bf2 !== "--dry-run") {
          console.error("[ERROR] Unknown flag: " + _0x324bf2);
          console.error("Valid flags: --target <path>, --dry-run");
          return 1;
        }
      }
      const {
        main: _0x5635ce
      } = require(path.join(ROOT_DIR, "scripts", "migrate-opencode.js"));
      const _0x6b2cc7 = process.argv;
      process.argv = ["node", "migrate-opencode.js", ..._0x3454d1];
      try {
        _0x5635ce();
        return 0;
      } finally {
        process.argv = _0x6b2cc7;
      }
    }
  },
  "test-transform": {
    description: "Test OpenCode transform on next-task command",
    handler: () => {
      const {
        main: _0x271040
      } = require(path.join(ROOT_DIR, "scripts", "test-transform.js"));
      return _0x271040();
    }
  },
  "gen-docs": {
    description: "Auto-generate documentation sections from plugin source",
    usage: "gen-docs [--check] [--dry-run]",
    handler: _0x2daf58 => {
      const {
        main: _0x22e45f
      } = require(path.join(ROOT_DIR, "scripts", "generate-docs.js"));
      const _0x2e4a66 = _0x22e45f(_0x2daf58);
      if (typeof _0x2e4a66 === "number") {
        return _0x2e4a66;
      }
      return 0;
    }
  },
  "expand-templates": {
    description: "Expand agent template snippets",
    usage: "expand-templates [--check] [--dry-run]",
    handler: _0x3bbd2d => {
      const {
        main: _0xa51402
      } = require(path.join(ROOT_DIR, "scripts", "expand-templates.js"));
      const _0x2d2490 = _0xa51402(_0x3bbd2d);
      if (typeof _0x2d2490 === "number") {
        return _0x2d2490;
      }
      return 0;
    }
  },
  "gen-adapters": {
    description: "Generate platform adapter files from plugin source",
    usage: "gen-adapters [--check] [--dry-run]",
    handler: _0x513a2f => {
      const {
        main: _0x13f97c
      } = require(path.join(ROOT_DIR, "scripts", "gen-adapters.js"));
      const _0x1423af = _0x13f97c(_0x513a2f);
      if (typeof _0x1423af === "number") {
        return _0x1423af;
      }
      return 0;
    }
  },
  new: {
    description: "Scaffold new plugin, agent, skill, or command",
    usage: "new <type> <name> [options]",
    subcommands: NEW_SUBCOMMANDS,
    handler: _0x4b5cbf => {
      console.log("Available types: plugin, agent, skill, command");
      console.log("Usage: agentsys-dev new <type> <name> [options]");
      return 1;
    }
  }
};
function parseArgs(_0x4a1ed3) {
  const _0x15cbf4 = {
    help: false,
    version: false,
    command: null,
    subcommand: null,
    rest: []
  };
  let _0x4430e3 = 0;
  while (_0x4430e3 < _0x4a1ed3.length) {
    const _0x113041 = _0x4a1ed3[_0x4430e3];
    if (_0x113041 === "--help" || _0x113041 === "-h") {
      _0x15cbf4.help = true;
      _0x4430e3++;
    } else if (_0x113041 === "--version" || _0x113041 === "-v") {
      _0x15cbf4.version = true;
      _0x4430e3++;
    } else {
      break;
    }
  }
  if (_0x4430e3 < _0x4a1ed3.length && !_0x4a1ed3[_0x4430e3].startsWith("-")) {
    _0x15cbf4.command = _0x4a1ed3[_0x4430e3];
    _0x4430e3++;
  }
  if (_0x4430e3 < _0x4a1ed3.length && !_0x4a1ed3[_0x4430e3].startsWith("-") && COMMANDS[_0x15cbf4.command]?.subcommands) {
    _0x15cbf4.subcommand = _0x4a1ed3[_0x4430e3];
    _0x4430e3++;
  }
  _0x15cbf4.rest = _0x4a1ed3.slice(_0x4430e3);
  if (_0x15cbf4.rest.includes("--help") || _0x15cbf4.rest.includes("-h")) {
    _0x15cbf4.help = true;
    _0x15cbf4.rest = _0x15cbf4.rest.filter(_0x21ebc9 => _0x21ebc9 !== "--help" && _0x21ebc9 !== "-h");
  }
  return _0x15cbf4;
}
function printHelp() {
  console.log("\nagentsys-dev v" + VERSION + " - Developer CLI\n\nUsage:\n  agentsys-dev <command> [options]\n  agentsys-dev --help\n  agentsys-dev --version\n\nCommands:\n  validate                Run all validators\n  validate <sub>          Run single validator:\n    plugins                 Plugin structure\n    cross-platform          Cross-platform compatibility\n    consistency             Repo consistency (versions, mappings)\n    paths                   Hardcoded platform paths\n    counts [--json]         Doc counts and versions\n    platform-docs [--json]  Cross-platform docs\n    agent-skill-compliance  Agent Skills Open Standard\n    opencode-install        OpenCode installation\n\n  preflight [flags]       Change-aware checklist enforcement\n    --all                 Run all checks regardless of changes\n    --release             Include release-specific checks\n    --json                Structured JSON output\n\n  bump <version>          Bump version across all files\nsetup-hooks             Install git hooks\n  dev-install [tool]      Install to dev tools (--clean to remove)\n  detect                  Detect project platform config\n  verify                  Verify dev tool availability\n  status                  Show project health overview\n  test                    Run test suite\n  migrate-opencode        Migrate commands for OpenCode\n  test-transform          Test OpenCode transform\n  gen-docs                Auto-generate doc sections from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  expand-templates        Expand agent template snippets\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n  gen-adapters            Generate platform adapter files from source\n    --check               Validate freshness (exit 1 if stale)\n    --dry-run             Show changes without writing\n\nScaffolding:\n  new plugin <name>       Scaffold a new plugin\n  new agent <name>        Scaffold a new agent (--plugin required)\n  new skill <name>        Scaffold a new skill (--plugin required)\n  new command <name>      Scaffold a new command (--plugin required)\n\nUser CLI (agentsys):\n  agentsys                      Interactive installer\n  agentsys install <plugin>     Install a specific plugin (resolves deps)\n  agentsys remove <plugin>      Remove an installed plugin\n  agentsys search [term]        Search available plugins\n  agentsys list                 List installed plugins and versions\n  agentsys update               Re-fetch latest plugin versions\n\nAliases (npm scripts):\n  npm run new:plugin        = agentsys-dev new plugin\n  npm run new:agent         = agentsys-dev new agent\n  npm run new:skill         = agentsys-dev new skill\n  npm run new:command       = agentsys-dev new command\n  npm run validate          = agentsys-dev validate\n  npm run validate:plugins  = agentsys-dev validate plugins\n  npm run bump              = agentsys-dev bump\n  npm run detect            = agentsys-dev detect\n  npm run verify            = agentsys-dev verify\n  npm run gen-docs          = agentsys-dev gen-docs\n  npm run gen-docs:check    = agentsys-dev gen-docs --check\n  npm run expand-templates  = agentsys-dev expand-templates\n  npm run expand-templates:check = agentsys-dev expand-templates --check\n  npm run gen-adapters      = agentsys-dev gen-adapters\n  npm run gen-adapters:check = agentsys-dev gen-adapters --check\n");
}
function printCommandHelp(_0x5927af, _0x140dcc) {
  console.log("\nagentsys-dev " + (_0x140dcc.usage || _0x5927af) + "\n");
  console.log("  " + _0x140dcc.description);
  if (_0x140dcc.subcommands) {
    console.log("\nSubcommands:");
    for (const [_0x4f495d, _0x2d64d3] of Object.entries(_0x140dcc.subcommands)) {
      console.log("  " + _0x4f495d.padEnd(24) + " " + _0x2d64d3.description);
    }
  }
  console.log("");
}
function route(_0x314c13) {
  if (_0x314c13.version) {
    console.log("agentsys-dev v" + VERSION);
    return 0;
  }
  if (!_0x314c13.command) {
    if (_0x314c13.help) {
      printHelp();
      return 0;
    }
    printHelp();
    return 0;
  }
  const _0x426e06 = COMMANDS[_0x314c13.command];
  if (!_0x426e06) {
    console.error("[ERROR] Unknown command: " + _0x314c13.command);
    console.error("Run 'agentsys-dev --help' for available commands.");
    return 1;
  }
  if (_0x314c13.help && !_0x314c13.subcommand) {
    printCommandHelp(_0x314c13.command, _0x426e06);
    return 0;
  }
  if (_0x314c13.subcommand && _0x426e06.subcommands) {
    const _0x4c7329 = _0x426e06.subcommands[_0x314c13.subcommand];
    if (!_0x4c7329) {
      console.error("[ERROR] Unknown subcommand: " + _0x314c13.command + " " + _0x314c13.subcommand);
      console.error("Run 'agentsys-dev " + _0x314c13.command + " --help' for subcommands.");
      return 1;
    }
    if (_0x314c13.help) {
      console.log("\nagentsys-dev " + (_0x4c7329.usage || _0x314c13.command + " " + _0x314c13.subcommand) + "\n");
      console.log("  " + _0x4c7329.description + "\n");
      return 0;
    }
    return _0x4c7329.handler(_0x314c13.rest);
  }
  return _0x426e06.handler(_0x314c13.rest);
}
if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const result = route(parsed);
  if (result && typeof result.then === "function") {
    result.then(_0x2a538 => {
      if (typeof _0x2a538 === "number") {
        process.exit(_0x2a538);
      }
    }).catch(_0x4c9510 => {
      console.error("[ERROR] " + _0x4c9510.message);
      process.exit(1);
    });
  } else if (typeof result === "number" && result !== 0) {
    process.exit(result);
  }
}
const _0x2ae194 = {
  parseArgs: parseArgs,
  COMMANDS: COMMANDS,
  VALIDATE_SUBCOMMANDS: VALIDATE_SUBCOMMANDS,
  NEW_SUBCOMMANDS: NEW_SUBCOMMANDS,
  route: route
};
module.exports = _0x2ae194;