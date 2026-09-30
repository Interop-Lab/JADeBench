/**
 * Convention-based discovery of plugins and their commands, agents, and skills.
 */

'use strict';

const fs = require('fs');
const path = require('path');

let cache = null;
let cacheRoot = null;

function parseFrontmatter(source) {
  if (!source || !source.startsWith('---')) return {};

  const end = source.indexOf('---', 3);
  if (end === -1) return {};

  const result = {};
  const lines = source.slice(3, end).split('\n');
  let listKey = null;
  let list = null;

  for (const line of lines) {
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && listKey && list) {
      let value = item[1].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      list.push(value);
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    if (listKey && list) {
      result[listKey] = list;
      listKey = null;
      list = null;
    }

    const key = line.slice(0, colon).trim();
    if (!key || key.startsWith('#') || key === '---') continue;

    let value = line.slice(colon + 1).trim();
    if (value === '') {
      listKey = key;
      list = [];
      continue;
    }

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  if (listKey && list) result[listKey] = list;
  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function rootDirectory(root) {
  return root || path.resolve(__dirname, '..', '..');
}

function resolvePluginsDir(root) {
  return path.join(rootDirectory(root), 'plugins');
}

function getCache(root) {
  const resolvedRoot = rootDirectory(root);
  return cache && cacheRoot === resolvedRoot ? cache : null;
}

function setCache(root, key, value) {
  const resolvedRoot = rootDirectory(root);
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
  const saved = getCache(root);
  if (saved && saved.plugins) return saved.plugins;

  const pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) return [];

  const plugins = fs.readdirSync(pluginsDir)
    .filter((name) => {
      if (!isValidPluginName(name)) return false;
      return fs.existsSync(path.join(
        pluginsDir, name, '.claude-plugin', 'plugin.json'
      ));
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownFiles(root, directory, cacheKey) {
  const saved = getCache(root);
  if (saved && saved[cacheKey]) return saved[cacheKey];

  const pluginsDir = resolvePluginsDir(root);
  const entries = [];
  for (const plugin of discoverPlugins(root)) {
    const dir = path.join(pluginsDir, plugin, directory);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter((file) => file.endsWith('.md'))
      .sort();

    for (const file of files) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      entries.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(source),
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
  const saved = getCache(root);
  if (saved && saved.skills) return saved.skills;

  const pluginsDir = resolvePluginsDir(root);
  const skills = [];
  for (const plugin of discoverPlugins(root)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    for (const name of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      skills.push({
        name,
        plugin,
        dir: name,
        frontmatter: parseFrontmatter(fs.readFileSync(skillFile, 'utf8')),
      });
    }
  }

  setCache(root, 'skills', skills);
  return skills;
}

function getCommandMappings(root) {
  return discoverCommands(root).map(({ plugin, file }) => [file, plugin, file]);
}

function commandDescription(command) {
  return command.frontmatter.description ||
    command.frontmatter['short-description'] ||
    command.frontmatter['argument-hint'] || '';
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map((command) => [
    command.name,
    command.plugin,
    command.file,
    commandDescription(command),
  ]);
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map((command) => {
    const frontmatter = command.frontmatter;
    const description = frontmatter.description ||
      frontmatter['short-description'] ||
      frontmatter['argument-hint'] || '';
    const type = frontmatter.type || 'command';
    const globs = frontmatter.globs || '';
    return [
      `agentsys-${command.plugin}-${command.name}`,
      command.plugin,
      command.file,
      description,
      type,
      globs,
    ];
  });
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map((command) => [
    command.name,
    command.plugin,
    command.file,
    commandDescription(command),
  ]);
}

function getPluginPrefixRegex(root) {
  const plugins = discoverPlugins(root);
  if (plugins.length === 0) return /$^/g;
  const escaped = plugins.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'g');
}

function discoverAll(root) {
  return {
    plugins: discoverPlugins(root),
    commands: discoverCommands(root),
    agents: discoverAgents(root),
    skills: discoverSkills(root),
  };
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
