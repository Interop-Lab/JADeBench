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

const cache = {
  plugins: null,
  commands: null,
  agents: null,
  skills: null,
};

function parseFrontmatter(content) {
  if (content == null) return {};
  if (typeof content !== 'string') throw new TypeError('undefined is not a function');

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};

  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    if (!key) continue;

    frontmatter[key] = line.slice(separator + 1).trim() || [];
  }
  return frontmatter;
}

function isValidPluginName(name) {
  return typeof name === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(rootDir) {
  return path.join(rootDir || process.cwd(), 'plugins');
}

function getCache(type, pluginsDir) {
  const entry = cache[type];
  return entry && entry.pluginsDir === pluginsDir ? entry.value : undefined;
}

function setCache(type, pluginsDir, value) {
  cache[type] = { pluginsDir, value };
  return value;
}

function discoverPlugins(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const cached = getCache('plugins', pluginsDir);
  if (cached) return cached;
  if (!fs.existsSync(pluginsDir)) return setCache('plugins', pluginsDir, []);

  const plugins = fs.readdirSync(pluginsDir)
    .filter((name) => isValidPluginName(name))
    .filter((name) => fs.existsSync(path.join(pluginsDir, name, '.claude-plugin', 'plugin.json')))
    .sort();

  return setCache('plugins', pluginsDir, plugins);
}

function discoverMarkdownEntries(rootDir, type) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const cached = getCache(type, pluginsDir);
  if (cached) return cached;

  const entries = [];
  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, type);
    if (!fs.existsSync(directory)) continue;

    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.md')).sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(directory, file), 'utf8');
      entries.push({
        name: path.basename(file, '.md'),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  return setCache(type, pluginsDir, entries);
}

function discoverCommands(rootDir) {
  return discoverMarkdownEntries(rootDir, 'commands');
}

function discoverAgents(rootDir) {
  return discoverMarkdownEntries(rootDir, 'agents');
}

function discoverSkills(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const cached = getCache('skills', pluginsDir);
  if (cached) return cached;

  const skills = [];
  for (const plugin of discoverPlugins(rootDir)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    for (const name of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      const content = fs.readFileSync(skillFile, 'utf8');
      skills.push({ name, plugin, dir: name, frontmatter: parseFrontmatter(content) });
    }
  }

  return setCache('skills', pluginsDir, skills);
}

function getCommandMappings(rootDir) {
  return discoverCommands(rootDir).map(({ plugin, file }) => [file, plugin, file]);
}

function getCodexSkillMappings(rootDir) {
  return discoverCommands(rootDir).map(({ name, plugin, file, frontmatter }) => [
    name,
    plugin,
    file,
    frontmatter.description || '',
  ]);
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  return plugins.length ? new RegExp(`(${plugins.join('|')})`, 'g') : /$^/g;
}

function discoverAll(rootDir) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir),
  };
}

function invalidateCache() {
  cache.plugins = null;
  cache.commands = null;
  cache.agents = null;
  cache.skills = null;
}

function getCursorRuleMappings(rootDir) {
  return discoverCommands(rootDir).map(({ name, plugin, file, frontmatter }) => [
    `agentsys-${plugin}-${name}`,
    plugin,
    file,
    frontmatter.description || '',
    'command',
    '',
  ]);
}

function getKiroSteeringMappings(rootDir) {
  return getCodexSkillMappings(rootDir);
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
