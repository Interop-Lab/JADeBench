var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2a896f, _0x44d04a) => function _0x5186e8() {
  if (!_0x44d04a) {
    (0, _0x2a896f[__getOwnPropNames(_0x2a896f)[0]])((_0x44d04a = {
      exports: {}
    }).exports, _0x44d04a);
  }
  return _0x44d04a.exports;
};
var require_discovery = __commonJS({
  "../work/agent-sh__agentsys/lib/discovery/index.js"(_0x45d819, _0x25efed) {
    /**
    * Plugin Discovery Module
    *
    * Convention-based filesystem scanning to discover plugins, commands,
    * agents, and skills. Replaces all hardcoded registration lists.
    *
    * Convention:
    * - plugins/<name>/.claude-plugin/plugin.json -> plugin
    * - plugins/<name>/commands/*.md -> commands
    * - plugins/<name>/agents/*.md -> agents
    * - plugins/<name>/skills/<skill>/SKILL.md -> skills
    *
    * @module discovery
    * @author Avi Fenesh
    * @license MIT
    */
    var _0x22af93 = require("fs");
    var _0x39780a = require("path");
    var _0x599b5f = null;
    var _0x2a0675 = null;
    function _0x4d4f40(_0x1ce43f) {
      if (!_0x1ce43f || !_0x1ce43f.startsWith("---")) {
        return {};
      }
      const _0x32c96e = _0x1ce43f.indexOf("\n---", 3);
      if (_0x32c96e === -1) {
        return {};
      }
      const _0x56f7be = _0x1ce43f.substring(4, _0x32c96e);
      const _0x4b14d4 = {};
      const _0x292c72 = _0x56f7be.split("\n");
      let _0x367d13 = null;
      let _0x40f4fb = null;
      for (const _0x32b2ea of _0x292c72) {
        const _0x1fb41c = _0x32b2ea.match(/^\s+-\s+(.+)$/);
        if (_0x1fb41c && _0x367d13 && _0x40f4fb) {
          let _0x1d8bad = _0x1fb41c[1].trim();
          if (_0x1d8bad.startsWith("\"") && _0x1d8bad.endsWith("\"") || _0x1d8bad.startsWith("'") && _0x1d8bad.endsWith("'")) {
            _0x1d8bad = _0x1d8bad.slice(1, -1);
          }
          _0x40f4fb.push(_0x1d8bad);
          continue;
        }
        const _0x525f0e = _0x32b2ea.indexOf(":");
        if (_0x525f0e > 0) {
          if (_0x367d13 && _0x40f4fb) {
            _0x4b14d4[_0x367d13] = _0x40f4fb;
            _0x367d13 = null;
            _0x40f4fb = null;
          }
          const _0x7f8089 = _0x32b2ea.substring(0, _0x525f0e).trim();
          if (_0x7f8089 === "__proto__" || _0x7f8089 === "constructor" || _0x7f8089 === "prototype") {
            continue;
          }
          let _0x1adffb = _0x32b2ea.substring(_0x525f0e + 1).trim();
          if (_0x1adffb === "") {
            _0x367d13 = _0x7f8089;
            _0x40f4fb = [];
          } else {
            if (_0x1adffb.startsWith("\"") && _0x1adffb.endsWith("\"") || _0x1adffb.startsWith("'") && _0x1adffb.endsWith("'")) {
              _0x1adffb = _0x1adffb.slice(1, -1);
            }
            _0x4b14d4[_0x7f8089] = _0x1adffb;
            _0x367d13 = null;
            _0x40f4fb = null;
          }
        }
      }
      if (_0x367d13 && _0x40f4fb) {
        _0x4b14d4[_0x367d13] = _0x40f4fb;
      }
      return _0x4b14d4;
    }
    function _0xcb2d93(_0x5a7698) {
      return /^[a-z0-9][a-z0-9-]*$/.test(_0x5a7698);
    }
    function _0x3b2e5f(_0x133989) {
      if (!_0x133989) {
        _0x133989 = _0x39780a.resolve(__dirname, "..", "..");
      }
      return _0x39780a.join(_0x133989, "plugins");
    }
    function _0x326d18(_0xb8cbeb) {
      const _0x2f6731 = _0x1c93c9(_0xb8cbeb);
      if (_0x2f6731 && _0x2f6731.plugins) {
        return _0x2f6731.plugins;
      }
      const _0x51aba0 = _0x3b2e5f(_0xb8cbeb);
      if (!_0x22af93.existsSync(_0x51aba0)) {
        return [];
      }
      const _0x4d47b9 = _0x22af93.readdirSync(_0x51aba0);
      const _0x26542d = _0x4d47b9.filter(_0x569310 => {
        if (!_0xcb2d93(_0x569310)) {
          return false;
        }
        const _0x394b65 = _0x39780a.join(_0x51aba0, _0x569310, ".claude-plugin", "plugin.json");
        return _0x22af93.existsSync(_0x394b65);
      }).sort();
      _0x58e508(_0xb8cbeb, "plugins", _0x26542d);
      return _0x26542d;
    }
    function _0x3b2c85(_0x361132) {
      const _0x48a4ef = _0x1c93c9(_0x361132);
      if (_0x48a4ef && _0x48a4ef.commands) {
        return _0x48a4ef.commands;
      }
      const _0xbb3526 = _0x3b2e5f(_0x361132);
      const _0x485189 = _0x326d18(_0x361132);
      const _0x5e82bd = [];
      for (const _0x47089f of _0x485189) {
        const _0x2d2210 = _0x39780a.join(_0xbb3526, _0x47089f, "commands");
        if (!_0x22af93.existsSync(_0x2d2210)) {
          continue;
        }
        const _0x32d1a = _0x22af93.readdirSync(_0x2d2210).filter(_0x20766c => _0x20766c.endsWith(".md")).sort();
        for (const _0x47a8b8 of _0x32d1a) {
          const _0x12e568 = _0x39780a.join(_0x2d2210, _0x47a8b8);
          const _0x3eda0c = _0x22af93.readFileSync(_0x12e568, "utf8");
          const _0xb7d14a = _0x4d4f40(_0x3eda0c);
          _0x5e82bd.push({
            name: _0x47a8b8.replace(/\.md$/, ""),
            plugin: _0x47089f,
            file: _0x47a8b8,
            frontmatter: _0xb7d14a
          });
        }
      }
      _0x58e508(_0x361132, "commands", _0x5e82bd);
      return _0x5e82bd;
    }
    function _0x1ac4ef(_0x5aed07) {
      const _0x283ae6 = _0x1c93c9(_0x5aed07);
      if (_0x283ae6 && _0x283ae6.agents) {
        return _0x283ae6.agents;
      }
      const _0x2a6600 = _0x3b2e5f(_0x5aed07);
      const _0x2ce0d5 = _0x326d18(_0x5aed07);
      const _0x227249 = [];
      for (const _0x447573 of _0x2ce0d5) {
        const _0x363422 = _0x39780a.join(_0x2a6600, _0x447573, "agents");
        if (!_0x22af93.existsSync(_0x363422)) {
          continue;
        }
        const _0x26164b = _0x22af93.readdirSync(_0x363422).filter(_0x35632e => _0x35632e.endsWith(".md")).sort();
        for (const _0x219891 of _0x26164b) {
          const _0x3ba7ae = _0x39780a.join(_0x363422, _0x219891);
          const _0x52797d = _0x22af93.readFileSync(_0x3ba7ae, "utf8");
          const _0xec17e0 = _0x4d4f40(_0x52797d);
          _0x227249.push({
            name: _0x219891.replace(/\.md$/, ""),
            plugin: _0x447573,
            file: _0x219891,
            frontmatter: _0xec17e0
          });
        }
      }
      _0x58e508(_0x5aed07, "agents", _0x227249);
      return _0x227249;
    }
    function _0x7cdd0c(_0x596c0a) {
      const _0x213ba3 = _0x1c93c9(_0x596c0a);
      if (_0x213ba3 && _0x213ba3.skills) {
        return _0x213ba3.skills;
      }
      const _0x43fe06 = _0x3b2e5f(_0x596c0a);
      const _0x47d890 = _0x326d18(_0x596c0a);
      const _0xad8775 = [];
      for (const _0x21d472 of _0x47d890) {
        const _0x4ae6bd = _0x39780a.join(_0x43fe06, _0x21d472, "skills");
        if (!_0x22af93.existsSync(_0x4ae6bd)) {
          continue;
        }
        const _0xe79f24 = _0x22af93.readdirSync(_0x4ae6bd).sort();
        for (const _0xe05f77 of _0xe79f24) {
          const _0x56fab2 = _0x39780a.join(_0x4ae6bd, _0xe05f77, "SKILL.md");
          if (_0x22af93.existsSync(_0x56fab2)) {
            const _0x3c4587 = _0x22af93.readFileSync(_0x56fab2, "utf8");
            const _0x12613c = _0x4d4f40(_0x3c4587);
            const _0x4451d6 = {
              name: _0xe05f77,
              plugin: _0x21d472,
              dir: _0xe05f77,
              frontmatter: _0x12613c
            };
            _0xad8775.push(_0x4451d6);
          }
        }
      }
      _0x58e508(_0x596c0a, "skills", _0xad8775);
      return _0xad8775;
    }
    function _0x4e3ebf(_0x20d5aa) {
      const _0x3c4e67 = _0x3b2c85(_0x20d5aa);
      return _0x3c4e67.map(_0x3cc325 => [_0x3cc325.file, _0x3cc325.plugin, _0x3cc325.file]);
    }
    function _0x20ffe5(_0x28790c) {
      const _0x191b32 = _0x3b2c85(_0x28790c);
      return _0x191b32.map(_0x1df9b3 => {
        const _0x3b69d8 = _0x1df9b3.frontmatter["codex-description"] || _0x1df9b3.frontmatter.description || "";
        return [_0x1df9b3.name, _0x1df9b3.plugin, _0x1df9b3.file, _0x3b69d8];
      });
    }
    function _0x3935cc(_0x30d64d) {
      const _0x7e749d = _0x326d18(_0x30d64d);
      if (_0x7e749d.length === 0) {
        return /$^/g;
      }
      const _0x3b6602 = _0x7e749d.map(_0x6416d9 => _0x6416d9.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      return new RegExp("(" + _0x3b6602.join("|") + ")", "g");
    }
    function _0x2a6a6e(_0x29ea4e) {
      return {
        plugins: _0x326d18(_0x29ea4e),
        commands: _0x3b2c85(_0x29ea4e),
        agents: _0x1ac4ef(_0x29ea4e),
        skills: _0x7cdd0c(_0x29ea4e)
      };
    }
    function _0x1c93c9(_0x5423cc) {
      const _0x256908 = _0x5423cc || _0x39780a.resolve(__dirname, "..", "..");
      if (_0x599b5f && _0x2a0675 === _0x256908) {
        return _0x599b5f;
      }
      return null;
    }
    function _0x58e508(_0x175d30, _0x1c6a8a, _0x39ee07) {
      const _0xbf09a6 = _0x175d30 || _0x39780a.resolve(__dirname, "..", "..");
      if (!_0x599b5f || _0x2a0675 !== _0xbf09a6) {
        _0x599b5f = {};
        _0x2a0675 = _0xbf09a6;
      }
      _0x599b5f[_0x1c6a8a] = _0x39ee07;
    }
    function _0x1e4ac2() {
      _0x599b5f = null;
      _0x2a0675 = null;
    }
    function _0x1dc561(_0x1a3239) {
      const _0x2efc39 = _0x3b2c85(_0x1a3239);
      return _0x2efc39.map(_0x359a37 => {
        const _0x1e88ae = _0x359a37.frontmatter["cursor-description"] || _0x359a37.frontmatter["codex-description"] || _0x359a37.frontmatter.description || "";
        const _0x53539f = _0x359a37.frontmatter.type || "command";
        const _0x46c8dd = _0x359a37.frontmatter.globs || "";
        return ["agentsys-" + _0x359a37.plugin + "-" + _0x359a37.name, _0x359a37.plugin, _0x359a37.file, _0x1e88ae, _0x53539f, _0x46c8dd];
      });
    }
    function _0x1230e1(_0x42192a) {
      const _0x5b1213 = _0x3b2c85(_0x42192a);
      return _0x5b1213.map(_0x4e605b => {
        const _0x51833b = _0x4e605b.frontmatter["kiro-description"] || _0x4e605b.frontmatter["cursor-description"] || _0x4e605b.frontmatter["codex-description"] || _0x4e605b.frontmatter.description || "";
        return [_0x4e605b.name, _0x4e605b.plugin, _0x4e605b.file, _0x51833b];
      });
    }
    const _0x45a3c1 = {
      parseFrontmatter: _0x4d4f40,
      isValidPluginName: _0xcb2d93,
      discoverPlugins: _0x326d18,
      discoverCommands: _0x3b2c85,
      discoverAgents: _0x1ac4ef,
      discoverSkills: _0x7cdd0c,
      discoverAll: _0x2a6a6e,
      getCommandMappings: _0x4e3ebf,
      getCodexSkillMappings: _0x20ffe5,
      getCursorRuleMappings: _0x1dc561,
      getKiroSteeringMappings: _0x1230e1,
      getPluginPrefixRegex: _0x3935cc,
      invalidateCache: _0x1e4ac2
    };
    _0x25efed.exports = _0x45a3c1;
  }
});
var discovery = require_discovery();
function transformBodyForOpenCode(_0x292888, _0x2cf3ea) {
  _0x292888 = _0x292888.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${PLUGIN_ROOT}");
  _0x292888 = _0x292888.replace(/\$CLAUDE_PLUGIN_ROOT/g, "$PLUGIN_ROOT");
  _0x292888 = _0x292888.replace(/\.claude\//g, (_0x6a4a23, _0x26221c) => {
    const _0x55c6bf = _0x292888.substring(Math.max(0, _0x26221c - 60), _0x26221c + _0x6a4a23.length + 10);
    if (/Claude Code:/.test(_0x55c6bf)) {
      return _0x6a4a23;
    }
    return ".opencode/";
  });
  _0x292888 = _0x292888.replace(/\.claude'/g, (_0x5c4608, _0x1ad121) => {
    const _0x28ae5d = _0x292888.substring(Math.max(0, _0x1ad121 - 60), _0x1ad121 + _0x5c4608.length + 10);
    if (/Claude Code:/.test(_0x28ae5d)) {
      return _0x5c4608;
    }
    return ".opencode'";
  });
  _0x292888 = _0x292888.replace(/\.claude"/g, (_0x2da446, _0x19e142) => {
    const _0xd39a8 = _0x292888.substring(Math.max(0, _0x19e142 - 60), _0x19e142 + _0x2da446.length + 10);
    if (/Claude Code:/.test(_0xd39a8)) {
      return _0x2da446;
    }
    return ".opencode\"";
  });
  _0x292888 = _0x292888.replace(/\.claude`/g, (_0x463f0f, _0x4e979a) => {
    const _0x423d0d = _0x292888.substring(Math.max(0, _0x4e979a - 60), _0x4e979a + _0x463f0f.length + 10);
    if (/Claude Code:/.test(_0x423d0d)) {
      return _0x463f0f;
    }
    return ".opencode`";
  });
  const _0x253d0c = discovery.discoverPlugins(_0x2cf3ea);
  if (_0x253d0c.length > 0) {
    const _0x441a00 = _0x253d0c.join("|");
    _0x292888 = _0x292888.replace(new RegExp("`(" + _0x441a00 + "):([a-z-]+)`", "g"), "`$2`");
    _0x292888 = _0x292888.replace(new RegExp("(" + _0x441a00 + "):([a-z-]+)", "g"), "$2");
  }
  _0x292888 = _0x292888.replace(/```(\w*)\n([\s\S]*?)```/g, (_0xc76803, _0x5791cf, _0x43d663) => {
    const _0x4e1a2b = (_0x5791cf || "").toLowerCase();
    if (_0x4e1a2b === "bash" || _0x4e1a2b === "shell" || _0x4e1a2b === "sh") {
      if (_0x43d663.includes("node -e") && _0x43d663.includes("require(")) {
        return "*(Bash command with Node.js require - adapt for OpenCode)*";
      }
      return _0xc76803;
    }
    if (!_0x5791cf && (_0x43d663.trim().startsWith("gh ") || _0x43d663.trim().startsWith("glab ") || _0x43d663.trim().startsWith("git ") || _0x43d663.trim().startsWith("#!"))) {
      return _0xc76803;
    }
    if (_0x43d663.includes("require(") || _0x43d663.includes("Task(") || /^\s*const\s+[a-zA-Z_$[{]/m.test(_0x43d663) || /^\s*let\s+[a-zA-Z_$[{]/m.test(_0x43d663) || _0x43d663.includes("function ") || _0x43d663.includes("=>") || _0x43d663.includes("async ") || _0x43d663.includes("await ") || _0x43d663.includes("completePhase")) {
      let _0x19d71b = "";
      const _0x5c723e = [..._0x43d663.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)];
      for (const _0x20b7ff of _0x5c723e) {
        const _0x47d210 = _0x20b7ff[1];
        _0x19d71b += "- Invoke `@" + _0x47d210 + "` agent\n";
      }
      const _0x818b7b = _0x43d663.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      if (_0x818b7b) {
        for (const _0xbd343b of _0x818b7b) {
          const _0x152bc7 = _0xbd343b.match(/['"]([^'"]+)['"]/)[1];
          _0x19d71b += "- Phase: " + _0x152bc7 + "\n";
        }
      }
      if (_0x43d663.includes("AskUserQuestion")) {
        _0x19d71b += "- Use AskUserQuestion tool for user input\n";
      }
      if (_0x43d663.includes("EnterPlanMode")) {
        _0x19d71b += "- Use EnterPlanMode for user approval\n";
      }
      if (_0x43d663.includes("completePhase")) {
        _0x19d71b += "- Call `workflowState.completePhase(result)` to advance workflow state\n";
      }
      if (_0x19d71b) {
        return _0x19d71b;
      }
      return "*(JavaScript reference - not executable in OpenCode)*";
    }
    return _0xc76803;
  });
  _0x292888 = _0x292888.replace(/\*\(Reference - adapt for OpenCode\)\*/g, "");
  _0x292888 = _0x292888.replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, _0x3c8ee7 => {
    const _0x3c5cb1 = _0x3c8ee7.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (_0x3c5cb1) {
      return "Invoke `@" + _0x3c5cb1[1] + "` agent";
    }
    return "*(Task call - use @agent-name syntax)*";
  });
  _0x292888 = _0x292888.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  _0x292888 = _0x292888.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  if (_0x292888.includes("agent")) {
    const _0x4f14ca = "\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n> Available agents: task-discoverer, exploration-agent, planning-agent,\n> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n> Example: `@exploration-agent analyze the codebase`\n\n";
    _0x292888 = _0x292888.replace(/^(---\n[\s\S]*?---\n)/, "$1" + _0x4f14ca);
  }
  if (_0x292888.includes("Master Workflow Orchestrator") && _0x292888.includes("No Shortcuts Policy")) {
    const _0x1a0658 = "\n## Phase 1: Policy Selection (Built-in Options)\n\nAsk the user these questions using AskUserQuestion:\n\n**Question 1 - Source**: \"Where should I look for tasks?\"\n- GitHub Issues - Use `gh issue list` to find issues\n- GitHub Projects - Issues from a GitHub Project board\n- GitLab Issues - Use `glab issue list` to find issues\n- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo\n- Custom - User specifies their own source\n- Other - User describes source, you figure it out\n\nIf user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.\n\n**Question 2 - Priority**: \"What type of tasks to prioritize?\"\n- All - Consider all tasks, pick by score\n- Bugs - Focus on bug fixes\n- Security - Security issues first\n- Features - New feature development\n\n**Question 3 - Stop Point**: \"How far should I take this task?\"\n- Merged - Until PR is merged to main\n- PR Created - Stop after creating PR\n- Implemented - Stop after local implementation\n- Deployed - Deploy to staging\n- Production - Full production deployment\n\nAfter user answers, proceed to Phase 2 with the selected policy.\n\n";
    if (_0x292888.includes("OpenCode Note")) {
      _0x292888 = _0x292888.replace(/(Example:.*analyze the codebase\`\n\n)/, "$1" + _0x1a0658);
    }
  }
  return _0x292888;
}
function transformCommandFrontmatterForOpenCode(_0x2dbd9d) {
  return _0x2dbd9d.replace(/^---\n([\s\S]*?)^---/m, (_0x252206, _0x30c641) => {
    const _0x1ce8a6 = _0x30c641.trim().split("\n");
    const _0x251269 = {};
    for (const _0xc9cd5f of _0x1ce8a6) {
      const _0x5a930b = _0xc9cd5f.indexOf(":");
      if (_0x5a930b > 0) {
        const _0x491658 = _0xc9cd5f.substring(0, _0x5a930b).trim();
        const _0x526a71 = _0xc9cd5f.substring(_0x5a930b + 1).trim();
        _0x251269[_0x491658] = _0x526a71;
      }
    }
    let _0x4ad4ea = "---\n";
    if (_0x251269.description) {
      _0x4ad4ea += "description: " + _0x251269.description + "\n";
    }
    _0x4ad4ea += "agent: general\n";
    _0x4ad4ea += "---";
    return _0x4ad4ea;
  });
}
function transformAgentFrontmatterForOpenCode(_0x1845b2, _0x4b8e7c) {
  const {
    stripModels = true
  } = _0x4b8e7c || {};
  return _0x1845b2.replace(/^---\n([\s\S]*?)^---/m, (_0x4d3f5a, _0x50360b) => {
    const _0x46335e = _0x50360b.trim().split("\n");
    const _0x3ac149 = {};
    for (const _0x359061 of _0x46335e) {
      const _0x14aaa0 = _0x359061.indexOf(":");
      if (_0x14aaa0 > 0) {
        const _0x22e4eb = _0x359061.substring(0, _0x14aaa0).trim();
        const _0x5b4b41 = _0x359061.substring(_0x14aaa0 + 1).trim();
        _0x3ac149[_0x22e4eb] = _0x5b4b41;
      }
    }
    let _0x1ba1d0 = "---\n";
    if (_0x3ac149.name) {
      _0x1ba1d0 += "name: " + _0x3ac149.name + "\n";
    }
    if (_0x3ac149.description) {
      _0x1ba1d0 += "description: " + _0x3ac149.description + "\n";
    }
    _0x1ba1d0 += "mode: subagent\n";
    if (_0x3ac149.model && !stripModels) {
      const _0x50ed8c = {
        sonnet: "anthropic/claude-sonnet-4",
        opus: "anthropic/claude-opus-4",
        haiku: "anthropic/claude-haiku-3-5"
      };
      _0x1ba1d0 += "model: " + (_0x50ed8c[_0x3ac149.model] || _0x3ac149.model) + "\n";
    }
    if (_0x3ac149.tools) {
      _0x1ba1d0 += "permission:\n";
      const _0x197d6f = _0x3ac149.tools.toLowerCase();
      _0x1ba1d0 += "  read: " + (_0x197d6f.includes("read") ? "allow" : "deny") + "\n";
      _0x1ba1d0 += "  edit: " + (_0x197d6f.includes("edit") || _0x197d6f.includes("write") ? "allow" : "deny") + "\n";
      _0x1ba1d0 += "  bash: " + (_0x197d6f.includes("bash") ? "allow" : "ask") + "\n";
      _0x1ba1d0 += "  glob: " + (_0x197d6f.includes("glob") ? "allow" : "deny") + "\n";
      _0x1ba1d0 += "  grep: " + (_0x197d6f.includes("grep") ? "allow" : "deny") + "\n";
    }
    _0x1ba1d0 += "---";
    return _0x1ba1d0;
  });
}
function transformSkillBodyForOpenCode(_0x10d7a9, _0x2b9af4) {
  return transformBodyForOpenCode(_0x10d7a9, _0x2b9af4);
}
function transformForCodex(_0x329f38, _0x1b85df) {
  const {
    skillName: _0x571911,
    description: _0x5d67d1,
    pluginInstallPath: _0x29f07a
  } = _0x1b85df;
  const _0x176b94 = _0x5d67d1.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  const _0x15ea01 = "\"" + _0x176b94 + "\"";
  if (_0x329f38.startsWith("---")) {
    _0x329f38 = _0x329f38.replace(/^---\n[\s\S]*?\n---\n/, "---\nname: " + _0x571911 + "\ndescription: " + _0x15ea01 + "\n---\n");
  } else {
    _0x329f38 = "---\nname: " + _0x571911 + "\ndescription: " + _0x15ea01 + "\n---\n\n" + _0x329f38;
  }
  _0x329f38 = _0x329f38.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, _0x29f07a);
  _0x329f38 = _0x329f38.replace(/\$CLAUDE_PLUGIN_ROOT/g, _0x29f07a);
  _0x329f38 = _0x329f38.replace(/\$\{PLUGIN_ROOT\}/g, _0x29f07a);
  _0x329f38 = _0x329f38.replace(/\$PLUGIN_ROOT/g, _0x29f07a);
  _0x329f38 = _0x329f38.replace(/AskUserQuestion/g, "request_user_input");
  _0x329f38 = _0x329f38.replace(/^[ \t]*multiSelect:.*\n?/gm, "");
  _0x329f38 = _0x329f38.replace(/^([ \t]*request_user_input:\s*)$/gm, "$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: \"q1\"`).");
  return _0x329f38;
}
function transformRuleForCursor(_0x53bfda, _0x5c6c78) {
  const {
    description = "",
    pluginInstallPath: _0x27541f,
    globs = "",
    alwaysApply = true
  } = _0x5c6c78;
  const _0x156658 = description.replace(/[\x00-\x1f\x7f]/g, " ");
  const _0xa8fcaa = _0x156658.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  const _0x16e3a6 = "\"" + _0xa8fcaa + "\"";
  let _0x35a10d = "---\ndescription: " + _0x16e3a6 + "\n";
  if (globs) {
    _0x35a10d += "globs: " + JSON.stringify(globs) + "\n";
  }
  _0x35a10d += "alwaysApply: " + alwaysApply + "\n---\n";
  if (_0x53bfda.startsWith("---")) {
    _0x53bfda = _0x53bfda.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  _0x53bfda = _0x35a10d + _0x53bfda;
  _0x53bfda = _0x53bfda.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x27541f);
  _0x53bfda = _0x53bfda.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x27541f);
  _0x53bfda = _0x53bfda.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x27541f);
  _0x53bfda = _0x53bfda.replace(/\$PLUGIN_ROOT/g, () => _0x27541f);
  _0x53bfda = _0x53bfda.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, _0x26e923 => {
    const _0x35c801 = _0x26e923.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (_0x35c801) {
      return "Invoke the " + _0x35c801[1] + " agent";
    }
    return "";
  });
  _0x53bfda = _0x53bfda.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  _0x53bfda = _0x53bfda.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  _0x53bfda = _0x53bfda.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return _0x53bfda;
}
function transformSkillForCursor(_0x2d996c, _0x31ff07) {
  const {
    pluginInstallPath: _0x3fc230
  } = _0x31ff07;
  _0x2d996c = _0x2d996c.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x3fc230);
  _0x2d996c = _0x2d996c.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x3fc230);
  _0x2d996c = _0x2d996c.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x3fc230);
  _0x2d996c = _0x2d996c.replace(/\$PLUGIN_ROOT/g, () => _0x3fc230);
  _0x2d996c = _0x2d996c.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return _0x2d996c;
}
function transformCommandForCursor(_0x571bae, _0x5bf5a0) {
  const {
    pluginInstallPath: _0x48f08d
  } = _0x5bf5a0;
  if (_0x571bae.startsWith("---")) {
    _0x571bae = _0x571bae.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  _0x571bae = _0x571bae.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x48f08d);
  _0x571bae = _0x571bae.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x48f08d);
  _0x571bae = _0x571bae.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x48f08d);
  _0x571bae = _0x571bae.replace(/\$PLUGIN_ROOT/g, () => _0x48f08d);
  _0x571bae = _0x571bae.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  _0x571bae = _0x571bae.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  _0x571bae = _0x571bae.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, _0x5b13db => {
    const _0x308bbd = _0x5b13db.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (_0x308bbd) {
      return "Invoke the " + _0x308bbd[1] + " agent";
    }
    return "";
  });
  _0x571bae = _0x571bae.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return _0x571bae;
}
function transformSkillForKiro(_0x49e9cb, _0x527b56) {
  const {
    pluginInstallPath: _0x496ca4
  } = _0x527b56;
  _0x49e9cb = _0x49e9cb.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x496ca4);
  _0x49e9cb = _0x49e9cb.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x496ca4);
  _0x49e9cb = _0x49e9cb.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x496ca4);
  _0x49e9cb = _0x49e9cb.replace(/\$PLUGIN_ROOT/g, () => _0x496ca4);
  _0x49e9cb = _0x49e9cb.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return _0x49e9cb;
}
function transformCommandForKiro(_0x53c006, _0x38a000) {
  const {
    pluginInstallPath: _0x12ec7f,
    name = "",
    description = ""
  } = _0x38a000;
  if (_0x53c006.startsWith("---")) {
    _0x53c006 = _0x53c006.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  const _0x329649 = description.replace(/[\x00-\x1f\x7f]/g, " ");
  const _0x275d4d = _0x329649.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  let _0x16a2e3 = "---\n";
  _0x16a2e3 += "inclusion: manual\n";
  if (name) {
    _0x16a2e3 += "name: \"" + name + "\"\n";
  }
  if (description) {
    _0x16a2e3 += "description: \"" + _0x275d4d + "\"\n";
  }
  _0x16a2e3 += "---\n";
  _0x53c006 = _0x16a2e3 + _0x53c006;
  _0x53c006 = _0x53c006.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x12ec7f);
  _0x53c006 = _0x53c006.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x12ec7f);
  _0x53c006 = _0x53c006.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x12ec7f);
  _0x53c006 = _0x53c006.replace(/\$PLUGIN_ROOT/g, () => _0x12ec7f);
  _0x53c006 = _0x53c006.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  _0x53c006 = _0x53c006.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  _0x53c006 = _0x53c006.replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, (_0x35f954, _0x2943b6) => {
    if (!_0x2943b6.includes("Promise.all") || !_0x2943b6.includes("Task(")) {
      return _0x35f954;
    }
    const _0x3a35d4 = [..._0x2943b6.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/gs)];
    if (_0x3a35d4.length < 2) {
      return _0x35f954;
    }
    const _0x2636d6 = _0x3a35d4.map(_0x589977 => {
      const _0x3f5c89 = _0x589977[1];
      const _0x276391 = _0x589977[2].split("\n").find(_0x7801da => _0x7801da.trim()) || "";
      return "Delegate to the `" + _0x3f5c89 + "` subagent:\n> " + _0x276391.trim();
    });
    let _0x236fc1 = _0x2636d6.join("\n\n");
    const _0x59ccbe = _0x2636d6.some(_0x1142af => /review|quality|security|performance|test|coverage/i.test(_0x1142af));
    if (_0x2636d6.length >= 4 && _0x59ccbe) {
      _0x236fc1 = "**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n\n" + _0x236fc1 + "\n\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.";
    }
    return _0x236fc1;
  });
  _0x53c006 = _0x53c006.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, _0x3753bf => {
    const _0x1e51bb = _0x3753bf.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    const _0x1ab9ac = _0x3753bf.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
    if (_0x1e51bb) {
      const _0x33ace6 = _0x1e51bb[1];
      const _0x3d4440 = _0x1ab9ac ? _0x1ab9ac[1].replace(/\\n/g, "\n").trim() : "";
      if (_0x3d4440) {
        return "Delegate to the `" + _0x33ace6 + "` subagent:\n> " + _0x3d4440.split("\n")[0];
      }
      return "Delegate to the `" + _0x33ace6 + "` subagent.";
    }
    return "";
  });
  _0x53c006 = _0x53c006.replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, _0x574551 => {
    const _0x4e6af3 = _0x574551.match(/question:\s*["'`]([\s\S]*?)["'`]/);
    const _0xb87e95 = _0x4e6af3 ? _0x4e6af3[1] : "Please choose:";
    const _0x42e173 = [..._0x574551.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)];
    if (_0x42e173.length > 0) {
      const _0x35cf82 = _0x42e173.map((_0xebca78, _0x2ab269) => _0x2ab269 + 1 + ". **" + _0xebca78[1] + "** - " + _0xebca78[2]).join("\n");
      return "**" + _0xb87e95 + "**\n\n" + _0x35cf82 + "\n\nReply with the number or name of your choice.";
    }
    return "**" + _0xb87e95 + "**\n\nReply in chat with your choice.";
  });
  _0x53c006 = _0x53c006.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  const _0x3cb4d7 = /((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g;
  _0x53c006 = _0x53c006.replace(_0x3cb4d7, _0x46214d => {
    const _0x476f20 = _0x46214d.match(/Delegate to the `([^`]+)` subagent/g) || [];
    if (_0x476f20.length < 4) {
      return _0x46214d;
    }
    const _0x52f215 = _0x476f20.some(_0x5782bc => /review|quality|security|performance|test|coverage/i.test(_0x5782bc));
    if (!_0x52f215) {
      return _0x46214d;
    }
    return "**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n" + _0x46214d + "\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.\n";
  });
  return _0x53c006;
}
function transformAgentForKiro(_0x113784, _0x2f4ae6) {
  const {
    pluginInstallPath: _0x4a4088
  } = _0x2f4ae6 || {};
  const _0x3c0af6 = discovery.parseFrontmatter(_0x113784);
  let _0x46b89b = _0x113784;
  if (_0x113784.startsWith("---")) {
    const _0x2be801 = _0x113784.indexOf("\n---", 3);
    if (_0x2be801 !== -1) {
      _0x46b89b = _0x113784.substring(_0x2be801 + 4).replace(/^\n/, "");
    }
  }
  if (_0x4a4088) {
    _0x46b89b = _0x46b89b.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => _0x4a4088);
    _0x46b89b = _0x46b89b.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => _0x4a4088);
    _0x46b89b = _0x46b89b.replace(/\$\{PLUGIN_ROOT\}/g, () => _0x4a4088);
    _0x46b89b = _0x46b89b.replace(/\$PLUGIN_ROOT/g, () => _0x4a4088);
  }
  _0x46b89b = _0x46b89b.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  const _0x499b71 = {
    name: _0x3c0af6.name || "",
    description: _0x3c0af6.description || "",
    prompt: _0x46b89b.trim()
  };
  if (_0x3c0af6.tools) {
    const _0x53b886 = Array.isArray(_0x3c0af6.tools) ? _0x3c0af6.tools.map(_0xc16e5f => _0xc16e5f.toLowerCase()) : [_0x3c0af6.tools.toLowerCase()];
    const _0x41fd21 = _0x53b886.join(" ");
    const _0x1c2e4a = [];
    if (_0x41fd21.includes("read")) {
      _0x1c2e4a.push("read");
    }
    if (_0x41fd21.includes("edit") || _0x41fd21.includes("write")) {
      _0x1c2e4a.push("write");
    }
    if (_0x41fd21.includes("bash") || _0x41fd21.includes("shell")) {
      _0x1c2e4a.push("shell");
    }
    if (_0x41fd21.includes("glob")) {
      _0x1c2e4a.push("read");
    }
    if (_0x41fd21.includes("grep")) {
      _0x1c2e4a.push("read");
    }
    if (_0x41fd21.includes("task") || _0x41fd21.includes("agent")) {
      _0x1c2e4a.push("shell");
    }
    if (_0x41fd21.includes("web") || _0x41fd21.includes("fetch")) {
      _0x1c2e4a.push("shell");
    }
    if (_0x41fd21.includes("notebook")) {
      _0x1c2e4a.push("write");
    }
    if (_0x41fd21.includes("lsp")) {
      _0x1c2e4a.push("read");
    }
    const _0x494daf = [...new Set(_0x1c2e4a)];
    _0x499b71.tools = _0x494daf.length > 0 ? _0x494daf : ["read"];
  } else {
    _0x499b71.tools = ["read"];
  }
  _0x499b71.resources = ["file://.kiro/prompts/**/*.md"];
  return JSON.stringify(_0x499b71, null, 2);
}
function generateCombinedReviewerAgent(_0x4e9351, _0x429a93, _0xfe882c) {
  const _0x145a7f = _0x4e9351.map(_0x10e948 => "## " + _0x10e948.name + " Review\n\nFocus: " + _0x10e948.focus).join("\n\n---\n\n");
  const _0xe54db8 = {
    name: _0x429a93,
    description: _0xfe882c,
    prompt: "You are a combined code reviewer covering multiple review passes in a single session.\n\n" + _0x145a7f + "\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.",
    tools: ["read"],
    resources: ["file://.kiro/prompts/**/*.md"]
  };
  const _0x688927 = _0xe54db8;
  return JSON.stringify(_0x688927, null, 2);
}
const _0x4d71e4 = {
  transformBodyForOpenCode: transformBodyForOpenCode,
  transformCommandFrontmatterForOpenCode: transformCommandFrontmatterForOpenCode,
  transformAgentFrontmatterForOpenCode: transformAgentFrontmatterForOpenCode,
  transformSkillBodyForOpenCode: transformSkillBodyForOpenCode,
  transformForCodex: transformForCodex,
  transformRuleForCursor: transformRuleForCursor,
  transformSkillForCursor: transformSkillForCursor,
  transformCommandForCursor: transformCommandForCursor,
  transformForCursor: transformRuleForCursor,
  transformSkillForKiro: transformSkillForKiro,
  transformCommandForKiro: transformCommandForKiro,
  transformAgentForKiro: transformAgentForKiro,
  generateCombinedReviewerAgent: generateCombinedReviewerAgent
};
module.exports = _0x4d71e4;