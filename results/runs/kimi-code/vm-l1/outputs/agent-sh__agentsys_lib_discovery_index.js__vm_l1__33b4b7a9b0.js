/**
 * Convention-based plugin discovery.
 */

const fs = require('fs');
const path = require('path');

let _cache = null;
let _cacheRoot = null;

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};

  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const lines = content.substring(4, end).split('\n');
  const frontmatter = {};
  let currentKey = null;

  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = frontmatter[currentKey]
          ? [frontmatter[currentKey]]
          : [];
      }
      frontmatter[currentKey].push(unquote(listItem[1].trim()));
      continue;
    }

    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.substring(0, separator).trim();
    if (!key || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      currentKey = null;
      continue;
    }

    const value = line.substring(separator + 1).trim();
    frontmatter[key] = unquote(value);
    currentKey = key;
  }

  return frontmatter;
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name || '');
}

function resolvePluginsDir(rootDir) {
  const root = path.resolve(rootDir || path.join(__dirname, '..', '..', '..'));
  return path.join(root, 'plugins');
}

function getCache(rootDir) {
  const root = path.resolve(rootDir || path.join(__dirname, '..', '..', '..'));
  return _cache && _cacheRoot === root ? _cache : null;
}

function setCache(rootDir, key, value) {
  const root = path.resolve(rootDir || path.join(__dirname, '..', '..', '..'));
  if (!_cache || _cacheRoot !== root) {
    _cache = {};
    _cacheRoot = root;
  }
  _cache[key] = value;
  return value;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function discoverPlugins(rootDir) {
  const cached = getCache(rootDir);
  if (cached?.plugins) return cached.plugins;

  const pluginsDir = resolvePluginsDir(rootDir);
  if (!fs.existsSync(pluginsDir)) return setCache(rootDir, 'plugins', []);

  const plugins = fs.readdirSync(pluginsDir)
    .filter(name => {
      if (!isValidPluginName(name)) return false;
      const manifest = path.join(pluginsDir, name, '.claude-plugin', 'plugin.json');
      return fs.existsSync(manifest);
    })
    .sort();

  return setCache(rootDir, 'plugins', plugins);
}

function discoverCommands(rootDir) {
  return discoverMarkdownEntries(rootDir, 'commands');
}

function discoverAgents(rootDir) {
  return discoverMarkdownEntries(rootDir, 'agents');
}

function discoverMarkdownEntries(rootDir, kind) {
  const cached = getCache(rootDir);
  if (cached?.[kind]) return cached[kind];

  const pluginsDir = resolvePluginsDir(rootDir);
  const entries = [];
  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, kind);
    if (!fs.existsSync(directory)) continue;

    const files = fs.readdirSync(directory)
      .filter(file => file.endsWith('.md'))
      .sort();
    for (const filename of files) {
      const file = path.join(directory, filename);
      const content = fs.readFileSync(file, 'utf8');
      entries.push({
        name: filename.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  return setCache(rootDir, kind, entries);
}

function discoverSkills(rootDir) {
  const cached = getCache(rootDir);
  if (cached?.skills) return cached.skills;

  const pluginsDir = resolvePluginsDir(rootDir);
  const skills = [];
  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(directory)) continue;

    for (const name of fs.readdirSync(directory).sort()) {
      const dir = path.join(directory, name);
      const file = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, 'utf8');
      skills.push({
        name,
        plugin,
        dir,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  return setCache(rootDir, 'skills', skills);
}

function getCommandMappings(rootDir) {
  return discoverCommands(rootDir).map(({ file, plugin }) => ({ file, plugin }));
}

function getCodexSkillMappings(rootDir) {
  return discoverCommands(rootDir).map(command => ({
    description: command.frontmatter['codex-description'] ||
      command.frontmatter.description || '',
    name: command.name,
    plugin: command.plugin,
    file: command.file,
  }));
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  if (plugins.length === 0) return /$^/g;
  const escaped = plugins.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`);
}

function discoverAll(rootDir) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir),
  };
}

function getCursorRuleMappings(rootDir) {
  return discoverCommands(rootDir).map(command => ({
    description: command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description || '',
    type: 'command',
    globs: '',
    name: `agentsys-${command.plugin}-${command.name}`,
    file: command.file,
    plugin: command.plugin,
    command: command.name,
    frontmatter: command.frontmatter,
  }));
}

function getKiroSteeringMappings(rootDir) {
  return discoverCommands(rootDir).map(command => ({
    description: command.frontmatter['kiro-description'] ||
      command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description || '',
    name: command.name,
    plugin: command.plugin,
    file: command.file,
  }));
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
