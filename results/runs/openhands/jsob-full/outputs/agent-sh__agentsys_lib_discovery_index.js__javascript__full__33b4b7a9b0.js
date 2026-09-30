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
  if (!content || !content.startsWith('---')) {
    return {};
  }

  const closingMarker = content.indexOf('\n---', 3);
  if (closingMarker === -1) {
    return {};
  }

  const frontmatter = {};
  const lines = content.substring(4, closingMarker).split('\n');
  let listKey = null;
  let listItems = null;

  for (const line of lines) {
    const listItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (listItemMatch && listKey && listItems) {
      let value = listItemMatch[1].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      listItems.push(value);
      continue;
    }

    const separator = line.indexOf(':');
    if (separator <= 0) {
      continue;
    }

    if (listKey && listItems) {
      frontmatter[listKey] = listItems;
      listKey = null;
      listItems = null;
    }

    const key = line.substring(0, separator).trim();
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    let value = line.substring(separator + 1).trim();
    if (value === '') {
      listKey = key;
      listItems = [];
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }

  if (listKey && listItems) {
    frontmatter[listKey] = listItems;
  }

  return frontmatter;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(root) {
  if (!root) {
    root = path.resolve(__dirname, '..', '..');
  }
  return path.join(root, 'plugins');
}

function getCache(root) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  if (cache && cacheRoot === resolvedRoot) {
    return cache;
  }
  return null;
}

function setCache(root, key, value) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  if (!cache || cacheRoot !== resolvedRoot) {
    cache = {};
    cacheRoot = resolvedRoot;
  }
  cache[key] = value;
}

function discoverPlugins(root) {
  const cached = getCache(root);
  if (cached && cached.plugins) {
    return cached.plugins;
  }

  const pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  const plugins = fs
    .readdirSync(pluginsDir)
    .filter((name) => {
      if (!isValidPluginName(name)) {
        return false;
      }
      const manifest = path.join(pluginsDir, name, '.claude-plugin', 'plugin.json');
      return fs.existsSync(manifest);
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownEntries(root, type) {
  const cached = getCache(root);
  if (cached && cached[type]) {
    return cached[type];
  }

  const pluginsDir = resolvePluginsDir(root);
  const plugins = discoverPlugins(root);
  const entries = [];

  for (const plugin of plugins) {
    const entriesDir = path.join(pluginsDir, plugin, type);
    if (!fs.existsSync(entriesDir)) {
      continue;
    }

    const files = fs
      .readdirSync(entriesDir)
      .filter((file) => file.endsWith('.md'))
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(entriesDir, file), 'utf8');
      entries.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, type, entries);
  return entries;
}

function discoverCommands(root) {
  return discoverMarkdownEntries(root, 'commands');
}

function discoverAgents(root) {
  return discoverMarkdownEntries(root, 'agents');
}

function discoverSkills(root) {
  const cached = getCache(root);
  if (cached && cached.skills) {
    return cached.skills;
  }

  const pluginsDir = resolvePluginsDir(root);
  const plugins = discoverPlugins(root);
  const skills = [];

  for (const plugin of plugins) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) {
      continue;
    }

    for (const skillDir of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
      if (!fs.existsSync(skillFile)) {
        continue;
      }

      const content = fs.readFileSync(skillFile, 'utf8');
      skills.push({
        name: skillDir,
        plugin,
        dir: skillDir,
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
  return discoverCommands(root).map((command) => [
    command.file,
    command.plugin,
    command.file,
  ]);
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map((command) => {
    const description =
      command.frontmatter['codex-description'] ||
      command.frontmatter.description ||
      '';
    return [command.name, command.plugin, command.file, description];
  });
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map((command) => {
    const description =
      command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description ||
      '';
    const type = command.frontmatter.type || 'command';
    const globs = command.frontmatter.globs || '';

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
  return discoverCommands(root).map((command) => {
    const description =
      command.frontmatter['kiro-description'] ||
      command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description ||
      '';
    return [command.name, command.plugin, command.file, description];
  });
}

function getPluginPrefixRegex(root) {
  const plugins = discoverPlugins(root);
  if (plugins.length === 0) {
    return /$^/g;
  }

  const escapedPlugins = plugins.map((plugin) =>
    plugin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  return new RegExp(`(${escapedPlugins.join('|')})`, 'g');
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
