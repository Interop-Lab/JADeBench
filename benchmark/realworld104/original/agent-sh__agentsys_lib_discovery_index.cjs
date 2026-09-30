// ../work/agent-sh__agentsys/lib/discovery/index.js
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
module.exports = {
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
