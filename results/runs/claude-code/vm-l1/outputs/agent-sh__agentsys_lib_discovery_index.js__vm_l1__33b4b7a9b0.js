/**
 * Convention-based plugin discovery.
 *
 * Plugins live under `plugins/<name>` and may provide a manifest, commands,
 * agents, and skills in their conventional subdirectories.
 */
const fs = require('fs');
const path = require('path');

let cache = null;
let cacheRoot = null;

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const metadata = {};
  let currentList = null;
  for (const line of content.substring(4, end).split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      currentList.push(stripQuotes(listItem[1].trim()));
      continue;
    }

    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!key || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    const value = line.slice(separator + 1).trim();
    if (value === '') {
      currentList = [];
      metadata[key] = currentList;
    } else {
      currentList = null;
      metadata[key] = stripQuotes(value);
    }
  }
  return metadata;
}

function stripQuotes(value) {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function defaultRoot() {
  return path.resolve(__dirname, '..', '..', '..');
}

function resolvePluginsDir(rootDir = defaultRoot()) {
  return path.join(rootDir, 'plugins');
}

function listDirectories(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
}

function discoverPlugins(rootDir = defaultRoot()) {
  const cached = getCache(rootDir, 'plugins');
  if (cached) return cached;

  const pluginsDir = resolvePluginsDir(rootDir);
  if (!fs.existsSync(pluginsDir)) return [];

  const plugins = fs.readdirSync(pluginsDir)
    .filter((name) => {
      if (!isValidPluginName(name)) return false;
      return fs.existsSync(path.join(pluginsDir, name, '.claude-plugin', 'plugin.json'));
    })
    .sort();

  setCache(rootDir, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownEntries(rootDir, subdirectory) {
  const entries = [];
  const pluginsDir = resolvePluginsDir(rootDir);
  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, subdirectory);
    for (const filename of listMarkdownFiles(directory)) {
      const file = path.join(directory, filename);
      entries.push({
        name: filename.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(fs.readFileSync(file, 'utf8')),
      });
    }
  }
  return entries;
}

function discoverCommands(rootDir = defaultRoot()) {
  const cached = getCache(rootDir, 'commands');
  if (cached) return cached;
  return setCache(rootDir, 'commands', discoverMarkdownEntries(rootDir, 'commands'));
}

function discoverAgents(rootDir = defaultRoot()) {
  const cached = getCache(rootDir, 'agents');
  if (cached) return cached;
  return setCache(rootDir, 'agents', discoverMarkdownEntries(rootDir, 'agents'));
}

function discoverSkills(rootDir = defaultRoot()) {
  const cached = getCache(rootDir, 'skills');
  if (cached) return cached;

  const skills = [];
  const pluginsDir = resolvePluginsDir(rootDir);
  for (const plugin of discoverPlugins(rootDir)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    for (const name of fs.readdirSync(skillsDir).sort()) {
      const dir = path.join(skillsDir, name);
      const file = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(file)) continue;
      skills.push({
        name,
        plugin,
        dir,
        frontmatter: parseFrontmatter(fs.readFileSync(file, 'utf8')),
      });
    }
  }
  return setCache(rootDir, 'skills', skills);
}

function getCommandMappings(rootDir = defaultRoot()) {
  return discoverCommands(rootDir).map(({ file, plugin }) => [file, plugin, file]);
}

function getCodexSkillMappings(rootDir = defaultRoot()) {
  return discoverCommands(rootDir).map((command) => [
    command.name,
    command.plugin,
    command.file,
    command.frontmatter['codex-description'] || command.frontmatter.description || '',
  ]);
}

function getPluginPrefixRegex(rootDir = defaultRoot()) {
  const plugins = discoverPlugins(rootDir);
  if (plugins.length === 0) return /$^/g;
  const names = plugins.map((plugin) => plugin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${names.join('|')})`, 'g');
}

function getCursorRuleMappings(rootDir = defaultRoot()) {
  return discoverCommands(rootDir).map((command) => [
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

function getKiroSteeringMappings(rootDir = defaultRoot()) {
  return discoverCommands(rootDir).map((command) => [
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

function discoverAll(rootDir = defaultRoot()) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir),
  };
}

function getCache(rootDir = defaultRoot(), section) {
  return cacheRoot === rootDir && cache ? cache[section] : null;
}

function setCache(rootDir = defaultRoot(), section, value) {
  if (cacheRoot !== rootDir) {
    cache = {};
    cacheRoot = rootDir;
  }
  cache[section] = value;
  return value;
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
