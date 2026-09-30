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

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return {};

  const closingDelimiter = content.indexOf('---', 3);
  if (closingDelimiter === -1) return {};

  const frontmatter = content.substring(3, closingDelimiter);
  const result = {};
  let listKey = null;
  let list = null;

  for (const line of frontmatter.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey && list) {
      list.push(unquote(listItem[1].trim()));
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) {
      if (listKey && list) result[listKey] = list;
      listKey = null;
      list = null;
      continue;
    }

    if (listKey && list) {
      result[listKey] = list;
      listKey = null;
      list = null;
    }

    const key = line.substring(0, colon).trim();
    if (!key || key === '---' || key.startsWith('#')) continue;

    const value = line.substring(colon + 1).trim();
    if (value === '') {
      listKey = key;
      list = [];
    } else {
      result[key] = unquote(value);
    }
  }

  if (listKey && list) result[listKey] = list;
  return result;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(root) {
  const projectRoot = root || path.resolve(__dirname, '..', '..');
  return path.join(projectRoot, 'plugins');
}

function discoverPlugins(root) {
  const cached = getCache(root);
  if (cached && cached.plugins) return cached.plugins;

  const pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) return [];

  const plugins = fs.readdirSync(pluginsDir)
    .filter((name) => {
      if (!isValidPluginName(name)) return false;
      const manifest = path.join(pluginsDir, name, '.claude-plugin', 'plugin.json');
      return fs.existsSync(manifest);
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverCommands(root) {
  const cached = getCache(root);
  if (cached && cached.commands) return cached.commands;

  const pluginsDir = resolvePluginsDir(root);
  const commands = discoverMarkdownEntries(root, pluginsDir, 'commands');
  setCache(root, 'commands', commands);
  return commands;
}

function discoverAgents(root) {
  const cached = getCache(root);
  if (cached && cached.agents) return cached.agents;

  const pluginsDir = resolvePluginsDir(root);
  const agents = discoverMarkdownEntries(root, pluginsDir, 'agents');
  setCache(root, 'agents', agents);
  return agents;
}

function discoverMarkdownEntries(root, pluginsDir, directoryName) {
  const entries = [];
  for (const plugin of discoverPlugins(root)) {
    const directory = path.join(pluginsDir, plugin, directoryName);
    if (!fs.existsSync(directory)) continue;

    const files = fs.readdirSync(directory)
      .filter((file) => file.endsWith('.md'))
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(directory, file), 'utf8');
      entries.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }
  return entries;
}

function discoverSkills(root) {
  const cached = getCache(root);
  if (cached && cached.skills) return cached.skills;

  const pluginsDir = resolvePluginsDir(root);
  const skills = [];
  for (const plugin of discoverPlugins(root)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    const names = fs.readdirSync(skillsDir).sort();
    for (const name of names) {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf8');
      skills.push({
        name,
        plugin,
        file: name,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, 'skills', skills);
  return skills;
}

function getCommandMappings(root) {
  return discoverCommands(root).map(({ name, plugin, file }) => [name, plugin, file]);
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map(({ name, plugin, file, frontmatter }) => [
    name,
    plugin,
    file,
    frontmatter['codex-description'] || frontmatter.description || '',
  ]);
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map(({ name, plugin, file, frontmatter }) => [
    `agentsys-${plugin}-${name}`,
    plugin,
    file,
    frontmatter['cursor-description'] || frontmatter.description || frontmatter['codex-description'] || '',
    frontmatter.alwaysApply || 'false',
    frontmatter.globs || '',
  ]);
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map(({ name, plugin, file, frontmatter }) => [
    name,
    plugin,
    file,
    frontmatter['kiro-description'] ||
      frontmatter['cursor-description'] ||
      frontmatter['codex-description'] ||
      frontmatter.description ||
      '',
  ]);
}

function getPluginPrefixRegex(root) {
  const plugins = discoverPlugins(root);
  if (plugins.length === 0) return /$^/g;

  const escapedNames = plugins.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escapedNames.join('|')})`, 'g');
}

function discoverAll(root) {
  return {
    plugins: discoverPlugins(root),
    commands: discoverCommands(root),
    agents: discoverAgents(root),
    skills: discoverSkills(root),
  };
}

function getCache(root) {
  const projectRoot = root || path.resolve(__dirname, '..', '..');
  return cache && cacheRoot === projectRoot ? cache : null;
}

function setCache(root, key, value) {
  const projectRoot = root || path.resolve(__dirname, '..', '..');
  if (!cache || cacheRoot !== projectRoot) {
    cache = {};
    cacheRoot = projectRoot;
  }
  cache[key] = value;
}

function invalidateCache() {
  cache = null;
  cacheRoot = null;
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
