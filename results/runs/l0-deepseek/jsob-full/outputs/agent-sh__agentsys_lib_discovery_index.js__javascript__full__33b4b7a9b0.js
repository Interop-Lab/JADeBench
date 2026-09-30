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
var fs = require('fs'),
  path = require('path'),
  _cache = null;
var _cacheRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return {};
  }
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return {};
  const frontmatterText = content.substring(3, endIndex);
  const result = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentList = null;
  for (const line of lines) {
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentList) {
      let item = listMatch[1].trim();
      if (
        (item.startsWith('"') && item.endsWith('"')) ||
        (item.startsWith("'") && item.endsWith("'"))
      ) {
        item = item.slice(1, -1);
      }
      currentList.push(item);
      continue;
    }
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      if (currentKey && currentList) {
        result[currentKey] = currentList;
        currentKey = null;
        currentList = null;
      }
      const key = line.substring(0, colonIndex).trim();
      if (
        key === 'name' ||
        key === 'description' ||
        key === 'version' ||
        key === 'author'
      ) {
        continue;
      }
      let value = line.substring(colonIndex + 1).trim();
      if (value === '') {
        currentKey = key;
        currentList = [];
      } else {
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        result[key] = value;
        currentKey = null;
        currentList = null;
      }
    }
  }
  if (currentKey && currentList) {
    result[currentKey] = currentList;
  }
  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(rootDir) {
  if (!rootDir) {
    rootDir = path.resolve(__dirname, '..', '..');
  }
  return path.join(rootDir, 'plugins');
}

function discoverPlugins(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.plugins) return cached.plugins;
  const pluginsDir = resolvePluginsDir(rootDir);
  if (!fs.existsSync(pluginsDir)) return [];
  const plugins = fs
    .readdirSync(pluginsDir)
    .filter((entry) => {
      if (!isValidPluginName(entry)) return false;
      const pluginJsonPath = path.join(
        pluginsDir,
        entry,
        '.claude-plugin',
        'plugin.json'
      );
      return fs.existsSync(pluginJsonPath);
    })
    .sort();
  setCache(rootDir, 'plugins', plugins);
  return plugins;
}

function discoverCommands(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.commands) return cached.commands;
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const commands = [];
  for (const plugin of plugins) {
    const commandsDir = path.join(pluginsDir, plugin, 'commands');
    if (!fs.existsSync(commandsDir)) continue;
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith('.md'))
      .sort();
    for (const file of commandFiles) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      commands.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter,
      });
    }
  }
  setCache(rootDir, 'commands', commands);
  return commands;
}

function discoverAgents(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.agents) return cached.agents;
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const agents = [];
  for (const plugin of plugins) {
    const agentsDir = path.join(pluginsDir, plugin, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    const agentFiles = fs
      .readdirSync(agentsDir)
      .filter((file) => file.endsWith('.md'))
      .sort();
    for (const file of agentFiles) {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      agents.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter,
      });
    }
  }
  setCache(rootDir, 'agents', agents);
  return agents;
}

function discoverSkills(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.skills) return cached.skills;
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const skills = [];
  for (const plugin of plugins) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    const skillDirs = fs.readdirSync(skillsDir).sort();
    for (const skillDir of skillDirs) {
      const skillFilePath = path.join(skillsDir, skillDir, 'SKILL.md');
      if (fs.existsSync(skillFilePath)) {
        const content = fs.readFileSync(skillFilePath, 'utf8');
        const frontmatter = parseFrontmatter(content);
        const skill = {};
        skill.name = skillDir;
        skill.plugin = plugin;
        skill.file = skillDir;
        skill.frontmatter = frontmatter;
        skills.push(skill);
      }
    }
  }
  setCache(rootDir, 'skills', skills);
  return skills;
}

function getCommandMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map((cmd) => [cmd.name, cmd.plugin, cmd.file]);
}

function getCodexSkillMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map((cmd) => {
    const description =
      (cmd.frontmatter && cmd.frontmatter.description) ||
      (cmd.frontmatter && cmd.frontmatter.name) ||
      '';
    return [cmd.name, cmd.plugin, cmd.file, description];
  });
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  if (plugins.length === 0) return /$^/g;
  const escaped = plugins.map((plugin) =>
    plugin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp('(' + escaped.join('|') + ')', 'g');
}

function discoverAll(rootDir) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir),
  };
}

function getCache(rootDir) {
  const resolvedRoot = rootDir || path.resolve(__dirname, '..', '..');
  if (_cache && _cacheRoot === resolvedRoot) return _cache;
  return null;
}

function setCache(rootDir, key, value) {
  const resolvedRoot = rootDir || path.resolve(__dirname, '..', '..');
  if (!_cache || _cacheRoot !== resolvedRoot) {
    _cache = {};
    _cacheRoot = resolvedRoot;
  }
  _cache[key] = value;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function getCursorRuleMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map((cmd) => {
    const description =
      (cmd.frontmatter && cmd.frontmatter.description) ||
      (cmd.frontmatter && cmd.frontmatter.name) ||
      '';
    const ruleName =
      (cmd.frontmatter && cmd.frontmatter.rule) || 'always';
    const globs = (cmd.frontmatter && cmd.frontmatter.globs) || '';
    return [
      'cursor-' + cmd.plugin + '-' + cmd.name,
      cmd.plugin,
      cmd.file,
      description,
      ruleName,
      globs,
    ];
  });
}

function getKiroSteeringMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map((cmd) => {
    const description =
      (cmd.frontmatter && cmd.frontmatter.description) ||
      (cmd.frontmatter && cmd.frontmatter.name) ||
      '';
    return [cmd.name, cmd.plugin, cmd.file, description];
  });
}

const exports = {};
exports.parseFrontmatter = parseFrontmatter;
exports.isValidPluginName = isValidPluginName;
exports.discoverPlugins = discoverPlugins;
exports.discoverCommands = discoverCommands;
exports.discoverAgents = discoverAgents;
exports.discoverSkills = discoverSkills;
exports.discoverAll = discoverAll;
exports.getCommandMappings = getCommandMappings;
exports.getCodexSkillMappings = getCodexSkillMappings;
exports.getCursorRuleMappings = getCursorRuleMappings;
exports.getKiroSteeringMappings = getKiroSteeringMappings;
exports.getPluginPrefixRegex = getPluginPrefixRegex;
exports.invalidateCache = invalidateCache;
module.exports = exports;
