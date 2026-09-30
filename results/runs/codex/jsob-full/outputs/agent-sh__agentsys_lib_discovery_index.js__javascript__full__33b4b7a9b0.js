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

const fs = require('fs');
const path = require('path');

let cache = null;
let cacheRoot = null;

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return {};

  const closingDelimiter = content.indexOf('\n---', 3);
  if (closingDelimiter === -1) return {};

  const frontmatter = content.substring(3, closingDelimiter);
  const result = {};
  const lines = frontmatter.split('\n');
  let arrayKey = null;
  let arrayValue = null;

  for (const line of lines) {
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && arrayKey && arrayValue) {
      arrayValue.push(unquote(item[1].trim()));
      continue;
    }

    const colon = line.indexOf(':');
    if (colon <= 0) continue;

    if (arrayKey && arrayValue) {
      result[arrayKey] = arrayValue;
      arrayKey = null;
      arrayValue = null;
    }

    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (!key) continue;

    if (value === '') {
      arrayKey = key;
      arrayValue = [];
    } else {
      result[key] = unquote(value);
    }
  }

  if (arrayKey && arrayValue) result[arrayKey] = arrayValue;
  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolveRoot(root) {
  return root || path.resolve(__dirname, '..', '..');
}

function resolvePluginsDir(root) {
  return path.resolve(resolveRoot(root), 'plugins');
}

function getCache(root) {
  const resolvedRoot = resolveRoot(root);
  return cache && cacheRoot === resolvedRoot ? cache : null;
}

function setCache(root, key, value) {
  const resolvedRoot = resolveRoot(root);
  if (!cache || cacheRoot !== resolvedRoot) {
    cache = {};
    cacheRoot = resolvedRoot;
  }
  cache[key] = value;
}

function invalidateCache() {
  cache = null;
  cacheRoot = null;
}

function discoverPlugins(root) {
  const cached = getCache(root);
  if (cached && cached.plugins) return cached.plugins;

  const pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) return [];

  const plugins = fs.readdirSync(pluginsDir)
    .filter(name => {
      if (!isValidPluginName(name)) return false;
      return fs.existsSync(path.join(pluginsDir, name, '.claude-plugin', 'plugin.json'));
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownFiles(root, directory, cacheKey) {
  const cached = getCache(root);
  if (cached && cached[cacheKey]) return cached[cacheKey];

  const pluginsDir = resolvePluginsDir(root);
  const entries = [];

  for (const plugin of discoverPlugins(root)) {
    const sourceDir = path.join(pluginsDir, plugin, directory);
    if (!fs.existsSync(sourceDir)) continue;

    const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md')).sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(sourceDir, file), 'utf8');
      entries.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, cacheKey, entries);
  return entries;
}

function discoverCommands(root) {
  return discoverMarkdownFiles(root, 'commands', 'commands');
}

function discoverAgents(root) {
  return discoverMarkdownFiles(root, 'agents', 'agents');
}

function discoverSkills(root) {
  const cached = getCache(root);
  if (cached && cached.skills) return cached.skills;

  const pluginsDir = resolvePluginsDir(root);
  const skills = [];

  for (const plugin of discoverPlugins(root)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    for (const name of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf8');
      skills.push({
        name,
        plugin,
        dir: name,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, 'skills', skills);
  return skills;
}

function discoverAll(root) {
  return {
    plugins: discoverPlugins(root),
    commands: discoverCommands(root),
    agents: discoverAgents(root),
    skills: discoverSkills(root),
  };
}

function getCommandMappings(root) {
  return discoverCommands(root).map(command => [
    command.file,
    command.plugin,
    command.file,
  ]);
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map(command => [
    command.name,
    command.plugin,
    command.file,
    command.frontmatter['codex-description'] ||
      command.frontmatter['cursor-description'] ||
      command.frontmatter.description ||
      '',
  ]);
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map(command => [
    `agentsys-${command.plugin}-${command.name}`,
    command.plugin,
    command.file,
    command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description ||
      '',
    command.frontmatter.type || 'command',
    command.frontmatter.globs || '',
  ]);
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map(command => [
    command.name,
    command.plugin,
    command.file,
    command.frontmatter['kiro-description'] ||
      command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description ||
      '',
  ]);
}

function getPluginPrefixRegex(root) {
  const plugins = discoverPlugins(root);
  if (plugins.length === 0) return /$^/g;
  const escaped = plugins.map(plugin => plugin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'g');
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
  invalidateCache,
};
