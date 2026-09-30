var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/discovery/index.js
var require_discovery = __commonJS({
  "../work/agent-sh__agentsys/lib/discovery/index.js"(exports2, module2) {
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
    var fs = require("fs");
    var path = require("path");
    var _cache = null;
    var _cacheRoot = null;
    function parseFrontmatter(content) {
      if (!content || !content.startsWith("---")) {
        return {};
      }
      const endIdx = content.indexOf("\n---", 3);
      if (endIdx === -1) {
        return {};
      }
      const frontmatterBlock = content.substring(4, endIdx);
      const result = {};
      const lines = frontmatterBlock.split("\n");
      let currentKey = null;
      let currentArray = null;
      for (const line of lines) {
        const arrayItemMatch = line.match(/^\s+-\s+(.+)$/);
        if (arrayItemMatch && currentKey && currentArray) {
          let item = arrayItemMatch[1].trim();
          if (item.startsWith('"') && item.endsWith('"') || item.startsWith("'") && item.endsWith("'")) {
            item = item.slice(1, -1);
          }
          currentArray.push(item);
          continue;
        }
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          if (currentKey && currentArray) {
            result[currentKey] = currentArray;
            currentKey = null;
            currentArray = null;
          }
          const key = line.substring(0, colonIdx).trim();
          if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
          let value = line.substring(colonIdx + 1).trim();
          if (value === "") {
            currentKey = key;
            currentArray = [];
          } else {
            if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
              value = value.slice(1, -1);
            }
            result[key] = value;
            currentKey = null;
            currentArray = null;
          }
        }
      }
      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
      }
      return result;
    }
    function isValidPluginName(name) {
      return /^[a-z0-9][a-z0-9-]*$/.test(name);
    }
    function resolvePluginsDir(repoRoot) {
      if (!repoRoot) {
        repoRoot = path.resolve(__dirname, "..", "..");
      }
      return path.join(repoRoot, "plugins");
    }
    function discoverPlugins(repoRoot) {
      const cached = getCache(repoRoot);
      if (cached && cached.plugins) return cached.plugins;
      const pluginsDir = resolvePluginsDir(repoRoot);
      if (!fs.existsSync(pluginsDir)) return [];
      const entries = fs.readdirSync(pluginsDir);
      const plugins = entries.filter((name) => {
        if (!isValidPluginName(name)) return false;
        const pluginJson = path.join(pluginsDir, name, ".claude-plugin", "plugin.json");
        return fs.existsSync(pluginJson);
      }).sort();
      setCache(repoRoot, "plugins", plugins);
      return plugins;
    }
    function discoverCommands(repoRoot) {
      const cached = getCache(repoRoot);
      if (cached && cached.commands) return cached.commands;
      const pluginsDir = resolvePluginsDir(repoRoot);
      const plugins = discoverPlugins(repoRoot);
      const commands = [];
      for (const plugin of plugins) {
        const commandsDir = path.join(pluginsDir, plugin, "commands");
        if (!fs.existsSync(commandsDir)) continue;
        const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".md")).sort();
        for (const file of files) {
          const filePath = path.join(commandsDir, file);
          const content = fs.readFileSync(filePath, "utf8");
          const frontmatter = parseFrontmatter(content);
          commands.push({
            name: file.replace(/\.md$/, ""),
            plugin,
            file,
            frontmatter
          });
        }
      }
      setCache(repoRoot, "commands", commands);
      return commands;
    }
    function discoverAgents(repoRoot) {
      const cached = getCache(repoRoot);
      if (cached && cached.agents) return cached.agents;
      const pluginsDir = resolvePluginsDir(repoRoot);
      const plugins = discoverPlugins(repoRoot);
      const agents = [];
      for (const plugin of plugins) {
        const agentsDir = path.join(pluginsDir, plugin, "agents");
        if (!fs.existsSync(agentsDir)) continue;
        const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md")).sort();
        for (const file of files) {
          const filePath = path.join(agentsDir, file);
          const content = fs.readFileSync(filePath, "utf8");
          const frontmatter = parseFrontmatter(content);
          agents.push({
            name: file.replace(/\.md$/, ""),
            plugin,
            file,
            frontmatter
          });
        }
      }
      setCache(repoRoot, "agents", agents);
      return agents;
    }
    function discoverSkills(repoRoot) {
      const cached = getCache(repoRoot);
      if (cached && cached.skills) return cached.skills;
      const pluginsDir = resolvePluginsDir(repoRoot);
      const plugins = discoverPlugins(repoRoot);
      const skills = [];
      for (const plugin of plugins) {
        const skillsDir = path.join(pluginsDir, plugin, "skills");
        if (!fs.existsSync(skillsDir)) continue;
        const entries = fs.readdirSync(skillsDir).sort();
        for (const entry of entries) {
          const skillFile = path.join(skillsDir, entry, "SKILL.md");
          if (fs.existsSync(skillFile)) {
            const content = fs.readFileSync(skillFile, "utf8");
            const frontmatter = parseFrontmatter(content);
            skills.push({
              name: entry,
              plugin,
              dir: entry,
              frontmatter
            });
          }
        }
      }
      setCache(repoRoot, "skills", skills);
      return skills;
    }
    function getCommandMappings(repoRoot) {
      const commands = discoverCommands(repoRoot);
      return commands.map((cmd) => [cmd.file, cmd.plugin, cmd.file]);
    }
    function getCodexSkillMappings(repoRoot) {
      const commands = discoverCommands(repoRoot);
      return commands.map((cmd) => {
        const description = cmd.frontmatter["codex-description"] || cmd.frontmatter.description || "";
        return [cmd.name, cmd.plugin, cmd.file, description];
      });
    }
    function getPluginPrefixRegex(repoRoot) {
      const plugins = discoverPlugins(repoRoot);
      if (plugins.length === 0) return /$^/g;
      const escaped = plugins.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      return new RegExp(`(${escaped.join("|")})`, "g");
    }
    function discoverAll(repoRoot) {
      return {
        plugins: discoverPlugins(repoRoot),
        commands: discoverCommands(repoRoot),
        agents: discoverAgents(repoRoot),
        skills: discoverSkills(repoRoot)
      };
    }
    function getCache(repoRoot) {
      const root = repoRoot || path.resolve(__dirname, "..", "..");
      if (_cache && _cacheRoot === root) return _cache;
      return null;
    }
    function setCache(repoRoot, key, value) {
      const root = repoRoot || path.resolve(__dirname, "..", "..");
      if (!_cache || _cacheRoot !== root) {
        _cache = {};
        _cacheRoot = root;
      }
      _cache[key] = value;
    }
    function invalidateCache() {
      _cache = null;
      _cacheRoot = null;
    }
    function getCursorRuleMappings(repoRoot) {
      const commands = discoverCommands(repoRoot);
      return commands.map((cmd) => {
        const description = cmd.frontmatter["cursor-description"] || cmd.frontmatter["codex-description"] || cmd.frontmatter.description || "";
        const type = cmd.frontmatter.type || "command";
        const globs = cmd.frontmatter.globs || "";
        return [`agentsys-${cmd.plugin}-${cmd.name}`, cmd.plugin, cmd.file, description, type, globs];
      });
    }
    function getKiroSteeringMappings(repoRoot) {
      const commands = discoverCommands(repoRoot);
      return commands.map((cmd) => {
        const description = cmd.frontmatter["kiro-description"] || cmd.frontmatter["cursor-description"] || cmd.frontmatter["codex-description"] || cmd.frontmatter.description || "";
        return [cmd.name, cmd.plugin, cmd.file, description];
      });
    }
    module2.exports = {
      parseFrontmatter,
      isValidPluginName,
      discoverPlugins,
      discoverCommands,
      discoverAgents,
      discoverSkills,
      discoverAll,
      getCommandMappings,
      getCodexSkillMappings,
      getCursorRuleMappings,
      getKiroSteeringMappings,
      getPluginPrefixRegex,
      invalidateCache
    };
  }
});

// ../work/agent-sh__agentsys/lib/adapter-transforms.js
/**
 * Adapter Transform Functions
 *
 * Shared transforms for converting Claude Code plugin content into
 * OpenCode and Codex adapter formats. Used by:
 *   - bin/cli.js (npm installer)
 *   - scripts/dev-install.js (development installer)
 *   - scripts/gen-adapters.js (static adapter generation)
 *
 * @module adapter-transforms
 * @author Avi Fenesh
 * @license MIT
 */
var discovery = require_discovery();
function transformBodyForOpenCode(content, repoRoot) {
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${PLUGIN_ROOT}");
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, "$PLUGIN_ROOT");
  content = content.replace(/\.claude\//g, (match, offset) => {
    const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
    if (/Claude Code:/.test(context)) return match;
    return ".opencode/";
  });
  content = content.replace(/\.claude'/g, (match, offset) => {
    const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
    if (/Claude Code:/.test(context)) return match;
    return ".opencode'";
  });
  content = content.replace(/\.claude"/g, (match, offset) => {
    const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
    if (/Claude Code:/.test(context)) return match;
    return '.opencode"';
  });
  content = content.replace(/\.claude`/g, (match, offset) => {
    const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
    if (/Claude Code:/.test(context)) return match;
    return ".opencode`";
  });
  const plugins = discovery.discoverPlugins(repoRoot);
  if (plugins.length > 0) {
    const pluginNames = plugins.join("|");
    content = content.replace(new RegExp("`(" + pluginNames + "):([a-z-]+)`", "g"), "`$2`");
    content = content.replace(new RegExp("(" + pluginNames + "):([a-z-]+)", "g"), "$2");
  }
  content = content.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const langLower = (lang || "").toLowerCase();
      if (langLower === "bash" || langLower === "shell" || langLower === "sh") {
        if (code.includes("node -e") && code.includes("require(")) {
          return "*(Bash command with Node.js require - adapt for OpenCode)*";
        }
        return match;
      }
      if (!lang && (code.trim().startsWith("gh ") || code.trim().startsWith("glab ") || code.trim().startsWith("git ") || code.trim().startsWith("#!"))) {
        return match;
      }
      if (code.includes("require(") || code.includes("Task(") || /^\s*const\s+[a-zA-Z_$[{]/m.test(code) || /^\s*let\s+[a-zA-Z_$[{]/m.test(code) || code.includes("function ") || code.includes("=>") || code.includes("async ") || code.includes("await ") || code.includes("completePhase")) {
        let instructions = "";
        const taskMatches = [...code.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)];
        for (const taskMatch of taskMatches) {
          const agent = taskMatch[1];
          instructions += `- Invoke \`@${agent}\` agent
`;
        }
        const phaseMatches = code.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        if (phaseMatches) {
          for (const pm of phaseMatches) {
            const phase = pm.match(/['"]([^'"]+)['"]/)[1];
            instructions += `- Phase: ${phase}
`;
          }
        }
        if (code.includes("AskUserQuestion")) {
          instructions += "- Use AskUserQuestion tool for user input\n";
        }
        if (code.includes("EnterPlanMode")) {
          instructions += "- Use EnterPlanMode for user approval\n";
        }
        if (code.includes("completePhase")) {
          instructions += "- Call `workflowState.completePhase(result)` to advance workflow state\n";
        }
        if (instructions) {
          return instructions;
        }
        return "*(JavaScript reference - not executable in OpenCode)*";
      }
      return match;
    }
  );
  content = content.replace(/\*\(Reference - adapt for OpenCode\)\*/g, "");
  content = content.replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, (match) => {
    const agentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (agentMatch) {
      return `Invoke \`@${agentMatch[1]}\` agent`;
    }
    return "*(Task call - use @agent-name syntax)*";
  });
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  if (content.includes("agent")) {
    const note = `
> **OpenCode Note**: Invoke agents using \`@agent-name\` syntax.
> Available agents: task-discoverer, exploration-agent, planning-agent,
> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent
> Example: \`@exploration-agent analyze the codebase\`

`;
    content = content.replace(/^(---\n[\s\S]*?---\n)/, `$1${note}`);
  }
  if (content.includes("Master Workflow Orchestrator") && content.includes("No Shortcuts Policy")) {
    const policySection = `
## Phase 1: Policy Selection (Built-in Options)

Ask the user these questions using AskUserQuestion:

**Question 1 - Source**: "Where should I look for tasks?"
- GitHub Issues - Use \`gh issue list\` to find issues
- GitHub Projects - Issues from a GitHub Project board
- GitLab Issues - Use \`glab issue list\` to find issues
- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo
- Custom - User specifies their own source
- Other - User describes source, you figure it out

If user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.

**Question 2 - Priority**: "What type of tasks to prioritize?"
- All - Consider all tasks, pick by score
- Bugs - Focus on bug fixes
- Security - Security issues first
- Features - New feature development

**Question 3 - Stop Point**: "How far should I take this task?"
- Merged - Until PR is merged to main
- PR Created - Stop after creating PR
- Implemented - Stop after local implementation
- Deployed - Deploy to staging
- Production - Full production deployment

After user answers, proceed to Phase 2 with the selected policy.

`;
    if (content.includes("OpenCode Note")) {
      content = content.replace(/(Example:.*analyze the codebase\`\n\n)/, `$1${policySection}`);
    }
  }
  return content;
}
function transformCommandFrontmatterForOpenCode(content) {
  return content.replace(
    /^---\n([\s\S]*?)^---/m,
    (match, frontmatter) => {
      const lines = frontmatter.trim().split("\n");
      const parsed = {};
      for (const line of lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim();
          const value = line.substring(colonIdx + 1).trim();
          parsed[key] = value;
        }
      }
      let opencodeFrontmatter = "---\n";
      if (parsed.description) opencodeFrontmatter += `description: ${parsed.description}
`;
      opencodeFrontmatter += "agent: general\n";
      opencodeFrontmatter += "---";
      return opencodeFrontmatter;
    }
  );
}
function transformAgentFrontmatterForOpenCode(content, options) {
  const { stripModels = true } = options || {};
  return content.replace(
    /^---\n([\s\S]*?)^---/m,
    (match, frontmatter) => {
      const lines = frontmatter.trim().split("\n");
      const parsed = {};
      for (const line of lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim();
          const value = line.substring(colonIdx + 1).trim();
          parsed[key] = value;
        }
      }
      let opencodeFrontmatter = "---\n";
      if (parsed.name) opencodeFrontmatter += `name: ${parsed.name}
`;
      if (parsed.description) opencodeFrontmatter += `description: ${parsed.description}
`;
      opencodeFrontmatter += "mode: subagent\n";
      if (parsed.model && !stripModels) {
        const modelMap = {
          "sonnet": "anthropic/claude-sonnet-4",
          "opus": "anthropic/claude-opus-4",
          "haiku": "anthropic/claude-haiku-3-5"
        };
        opencodeFrontmatter += `model: ${modelMap[parsed.model] || parsed.model}
`;
      }
      if (parsed.tools) {
        opencodeFrontmatter += "permission:\n";
        const tools = parsed.tools.toLowerCase();
        opencodeFrontmatter += `  read: ${tools.includes("read") ? "allow" : "deny"}
`;
        opencodeFrontmatter += `  edit: ${tools.includes("edit") || tools.includes("write") ? "allow" : "deny"}
`;
        opencodeFrontmatter += `  bash: ${tools.includes("bash") ? "allow" : "ask"}
`;
        opencodeFrontmatter += `  glob: ${tools.includes("glob") ? "allow" : "deny"}
`;
        opencodeFrontmatter += `  grep: ${tools.includes("grep") ? "allow" : "deny"}
`;
      }
      opencodeFrontmatter += "---";
      return opencodeFrontmatter;
    }
  );
}
function transformSkillBodyForOpenCode(content, repoRoot) {
  return transformBodyForOpenCode(content, repoRoot);
}
function transformForCodex(content, options) {
  const { skillName, description, pluginInstallPath } = options;
  const escapedDescription = description.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const yamlDescription = `"${escapedDescription}"`;
  if (content.startsWith("---")) {
    content = content.replace(
      /^---\n[\s\S]*?\n---\n/,
      `---
name: ${skillName}
description: ${yamlDescription}
---
`
    );
  } else {
    content = `---
name: ${skillName}
description: ${yamlDescription}
---

${content}`;
  }
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, pluginInstallPath);
  content = content.replace(/AskUserQuestion/g, "request_user_input");
  content = content.replace(/^[ \t]*multiSelect:.*\n?/gm, "");
  content = content.replace(
    /^([ \t]*request_user_input:\s*)$/gm,
    '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).'
  );
  return content;
}
function transformRuleForCursor(content, options) {
  const { description = "", pluginInstallPath, globs = "", alwaysApply = true } = options;
  const cleanDescription = description.replace(/[\x00-\x1f\x7f]/g, " ");
  const escapedDescription = cleanDescription.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const yamlDescription = `"${escapedDescription}"`;
  let frontmatter = `---
description: ${yamlDescription}
`;
  if (globs) {
    frontmatter += `globs: ${JSON.stringify(globs)}
`;
  }
  frontmatter += `alwaysApply: ${alwaysApply}
---
`;
  if (content.startsWith("---")) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  content = frontmatter + content;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (match) => {
    const agentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (agentMatch) {
      return `Invoke the ${agentMatch[1]} agent`;
    }
    return "";
  });
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return content;
}
function transformSkillForCursor(content, options) {
  const { pluginInstallPath } = options;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return content;
}
function transformCommandForCursor(content, options) {
  const { pluginInstallPath } = options;
  if (content.startsWith("---")) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (match) => {
    const agentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (agentMatch) {
      return `Invoke the ${agentMatch[1]} agent`;
    }
    return "";
  });
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return content;
}
function transformSkillForKiro(content, options) {
  const { pluginInstallPath } = options;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  return content;
}
function transformCommandForKiro(content, options) {
  const { pluginInstallPath, name = "", description = "" } = options;
  if (content.startsWith("---")) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  const cleanDescription = description.replace(/[\x00-\x1f\x7f]/g, " ");
  const escapedDescription = cleanDescription.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  let frontmatter = "---\n";
  frontmatter += "inclusion: manual\n";
  if (name) frontmatter += `name: "${name}"
`;
  if (description) frontmatter += `description: "${escapedDescription}"
`;
  frontmatter += "---\n";
  content = frontmatter + content;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "");
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, "");
  content = content.replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, (fullBlock, codeContent) => {
    if (!codeContent.includes("Promise.all") || !codeContent.includes("Task(")) return fullBlock;
    const taskMatches = [...codeContent.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/gs)];
    if (taskMatches.length < 2) return fullBlock;
    const delegations = taskMatches.map((m) => {
      const agent = m[1];
      const promptFirstLine = m[2].split("\n").find((l) => l.trim()) || "";
      return `Delegate to the \`${agent}\` subagent:
> ${promptFirstLine.trim()}`;
    });
    let result = delegations.join("\n\n");
    const hasReviewKeyword = delegations.some(
      (d) => /review|quality|security|performance|test|coverage/i.test(d)
    );
    if (delegations.length >= 4 && hasReviewKeyword) {
      result = `**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**

Try delegating to these subagents (experimental parallel spawning):

${result}

If parallel spawning is unavailable, run 2 combined reviewers sequentially:
1. Delegate to the \`reviewer-quality-security\` subagent (code quality + security)
2. Then delegate to the \`reviewer-perf-test\` subagent (performance + test coverage)

Aggregate all findings from whichever execution path succeeded.`;
    }
    return result;
  });
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (match) => {
    const agentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    const promptMatch = match.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
    if (agentMatch) {
      const agentName = agentMatch[1];
      const prompt = promptMatch ? promptMatch[1].replace(/\\n/g, "\n").trim() : "";
      if (prompt) {
        return `Delegate to the \`${agentName}\` subagent:
> ${prompt.split("\n")[0]}`;
      }
      return `Delegate to the \`${agentName}\` subagent.`;
    }
    return "";
  });
  content = content.replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, (match) => {
    const questionMatch = match.match(/question:\s*["'`]([\s\S]*?)["'`]/);
    const question = questionMatch ? questionMatch[1] : "Please choose:";
    const optionMatches = [...match.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)];
    if (optionMatches.length > 0) {
      const options2 = optionMatches.map((m, i) => `${i + 1}. **${m[1]}** - ${m[2]}`).join("\n");
      return `**${question}**

${options2}

Reply with the number or name of your choice.`;
    }
    return `**${question}**

Reply in chat with your choice.`;
  });
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  const reviewerBatchPattern = /((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g;
  content = content.replace(reviewerBatchPattern, (block) => {
    const delegations = block.match(/Delegate to the `([^`]+)` subagent/g) || [];
    if (delegations.length < 4) return block;
    const hasReviewKeyword = delegations.some(
      (d) => /review|quality|security|performance|test|coverage/i.test(d)
    );
    if (!hasReviewKeyword) return block;
    return `**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**

Try delegating to these subagents (experimental parallel spawning):
${block}
If parallel spawning is unavailable, run 2 combined reviewers sequentially:
1. Delegate to the \`reviewer-quality-security\` subagent (code quality + security)
2. Then delegate to the \`reviewer-perf-test\` subagent (performance + test coverage)

Aggregate all findings from whichever execution path succeeded.
`;
  });
  return content;
}
function transformAgentForKiro(content, options) {
  const { pluginInstallPath } = options || {};
  const frontmatter = discovery.parseFrontmatter(content);
  let body = content;
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("\n---", 3);
    if (endIdx !== -1) {
      body = content.substring(endIdx + 4).replace(/^\n/, "");
    }
  }
  if (pluginInstallPath) {
    body = body.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
    body = body.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
    body = body.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
    body = body.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  }
  body = body.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, "$1");
  const agent = {
    name: frontmatter.name || "",
    description: frontmatter.description || "",
    prompt: body.trim()
  };
  if (frontmatter.tools) {
    const toolItems = Array.isArray(frontmatter.tools) ? frontmatter.tools.map((t) => t.toLowerCase()) : [frontmatter.tools.toLowerCase()];
    const toolStr = toolItems.join(" ");
    const tools = [];
    if (toolStr.includes("read")) tools.push("read");
    if (toolStr.includes("edit") || toolStr.includes("write")) tools.push("write");
    if (toolStr.includes("bash") || toolStr.includes("shell")) tools.push("shell");
    if (toolStr.includes("glob")) tools.push("read");
    if (toolStr.includes("grep")) tools.push("read");
    if (toolStr.includes("task") || toolStr.includes("agent")) tools.push("shell");
    if (toolStr.includes("web") || toolStr.includes("fetch")) tools.push("shell");
    if (toolStr.includes("notebook")) tools.push("write");
    if (toolStr.includes("lsp")) tools.push("read");
    const deduped = [...new Set(tools)];
    agent.tools = deduped.length > 0 ? deduped : ["read"];
  } else {
    agent.tools = ["read"];
  }
  agent.resources = ["file://.kiro/prompts/**/*.md"];
  return JSON.stringify(agent, null, 2);
}
function generateCombinedReviewerAgent(roles, name, description) {
  const sections = roles.map(
    (r) => `## ${r.name} Review

Focus: ${r.focus}`
  ).join("\n\n---\n\n");
  const agent = {
    name,
    description,
    prompt: `You are a combined code reviewer covering multiple review passes in a single session.

${sections}

For each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.`,
    tools: ["read"],
    resources: ["file://.kiro/prompts/**/*.md"]
  };
  return JSON.stringify(agent, null, 2);
}
module.exports = {
  transformBodyForOpenCode,
  transformCommandFrontmatterForOpenCode,
  transformAgentFrontmatterForOpenCode,
  transformSkillBodyForOpenCode,
  transformForCodex,
  transformRuleForCursor,
  transformSkillForCursor,
  transformCommandForCursor,
  transformForCursor: transformRuleForCursor,
  transformSkillForKiro,
  transformCommandForKiro,
  transformAgentForKiro,
  generateCombinedReviewerAgent
};
