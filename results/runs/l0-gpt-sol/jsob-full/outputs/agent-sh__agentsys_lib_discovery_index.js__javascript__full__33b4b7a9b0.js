/**
 * Plugin Discovery Module
 *
 * Convention-based filesystem scanning to discover plugins, commands,
 * agents, and skills.
 */

var fs = require('fs');
var path = require('path');

var _cache = null;
var _cacheRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return {};
  }

  var end = content.indexOf('\n---', 3);
  if (end === -1) {
    return {};
  }

  var result = {};
  var lines = content.substring(3, end).split('\n');
  var pendingKey = null;
  var pendingList = null;

  for (var line of lines) {
    var listItem = line.match(/^\s+-\s+(.+)$/);

    if (listItem && pendingKey && pendingList) {
      var item = listItem[1].trim();

      if (
        (item.startsWith('"') && item.endsWith('"')) ||
        (item.startsWith("'") && item.endsWith("'"))
      ) {
        item = item.slice(1, -1);
      }

      pendingList.push(item);
      continue;
    }

    var colon = line.indexOf(':');
    if (colon === -1) {
      continue;
    }

    if (pendingKey && pendingList) {
      result[pendingKey] = pendingList;
      pendingKey = null;
      pendingList = null;
    }

    var key = line.substring(0, colon).trim();
    if (
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      continue;
    }

    var value = line.substring(colon + 1).trim();

    if (value === '') {
      pendingKey = key;
      pendingList = [];
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
    pendingKey = null;
    pendingList = null;
  }

  if (pendingKey && pendingList) {
    result[pendingKey] = pendingList;
  }

  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(root) {
  if (!root) {
    root = path.join(__dirname, '..', '..');
  }

  return path.join(root, 'plugins');
}

function getCache(root) {
  var cacheRoot = root || path.join(__dirname, '..', '..');

  if (_cache && _cacheRoot === cacheRoot) {
    return _cache;
  }

  return null;
}

function setCache(root, key, value) {
  var cacheRoot = root || path.join(__dirname, '..', '..');

  if (!_cache || _cacheRoot !== cacheRoot) {
    _cache = {};
    _cacheRoot = cacheRoot;
  }

  _cache[key] = value;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function discoverPlugins(root) {
  var cached = getCache(root);
  if (cached && cached.plugins) {
    return cached.plugins;
  }

  var pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  var plugins = fs.readdirSync(pluginsDir)
    .filter(function (pluginName) {
      if (!isValidPluginName(pluginName)) {
        return false;
      }

      var manifest = path.join(
        pluginsDir,
        pluginName,
        '.claude-plugin',
        'plugin.json'
      );

      return fs.existsSync(manifest);
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownFiles(root, directoryName, cacheKey) {
  var cached = getCache(root);
  if (cached && cached[cacheKey]) {
    return cached[cacheKey];
  }

  var pluginsDir = resolvePluginsDir(root);
  var plugins = discoverPlugins(root);
  var discovered = [];

  for (var plugin of plugins) {
    var directory = path.join(pluginsDir, plugin, directoryName);

    if (!fs.existsSync(directory)) {
      continue;
    }

    var files = fs.readdirSync(directory)
      .filter(function (file) {
        return file.endsWith('.md');
      })
      .sort();

    for (var file of files) {
      var filePath = path.join(directory, file);
      var content = fs.readFileSync(filePath, 'utf8');

      discovered.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: parseFrontmatter(content)
      });
    }
  }

  setCache(root, cacheKey, discovered);
  return discovered;
}

function discoverCommands(root) {
  return discoverMarkdownFiles(root, 'commands', 'commands');
}

function discoverAgents(root) {
  return discoverMarkdownFiles(root, 'agents', 'agents');
}

function discoverSkills(root) {
  var cached = getCache(root);
  if (cached && cached.skills) {
    return cached.skills;
  }

  var pluginsDir = resolvePluginsDir(root);
  var plugins = discoverPlugins(root);
  var skills = [];

  for (var plugin of plugins) {
    var skillsDir = path.join(pluginsDir, plugin, 'skills');

    if (!fs.existsSync(skillsDir)) {
      continue;
    }

    var skillNames = fs.readdirSync(skillsDir).sort();

    for (var skillName of skillNames) {
      var skillFile = path.join(skillsDir, skillName, 'SKILL.md');

      if (!fs.existsSync(skillFile)) {
        continue;
      }

      var content = fs.readFileSync(skillFile, 'utf8');

      skills.push({
        name: skillName,
        plugin: plugin,
        file: skillName,
        frontmatter: parseFrontmatter(content)
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
    skills: discoverSkills(root)
  };
}

function getCommandMappings(root) {
  return discoverCommands(root).map(function (command) {
    return [command.name, command.plugin, command.file];
  });
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map(function (command) {
    var frontmatter = command.frontmatter || {};
    var description =
      frontmatter['codex-description'] ||
      frontmatter.description ||
      '';

    return [
      command.name,
      command.plugin,
      command.file,
      description
    ];
  });
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map(function (command) {
    var frontmatter = command.frontmatter || {};
    var description =
      frontmatter['cursor-description'] ||
      frontmatter.description ||
      frontmatter['argument-hint'] ||
      '';

    var globs = frontmatter.globs || '**/*';
    var alwaysApply = frontmatter.alwaysApply || '';

    return [
      'cursor-' + command.plugin + '-' + command.name,
      command.plugin,
      command.file,
      description,
      globs,
      alwaysApply
    ];
  });
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map(function (command) {
    var frontmatter = command.frontmatter || {};
    var description =
      frontmatter['kiro-description'] ||
      frontmatter.description ||
      frontmatter['argument-hint'] ||
      frontmatter.name ||
      '';

    return [
      command.name,
      command.plugin,
      command.file,
      description
    ];
  });
}

function getPluginPrefixRegex(root) {
  var plugins = discoverPlugins(root);

  if (plugins.length === 0) {
    return /$^/g;
  }

  var escaped = plugins.map(function (plugin) {
    return plugin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });

  return new RegExp('(' + escaped.join('|') + ')', 'g');
}

module.exports = {
  parseFrontmatter: parseFrontmatter,
  isValidPluginName: isValidPluginName,
  discoverPlugins: discoverPlugins,
  discoverCommands: discoverCommands,
  discoverAgents: discoverAgents,
  discoverSkills: discoverSkills,
  discoverAll: discoverAll,
  getCommandMappings: getCommandMappings,
  getCodexSkillMappings: getCodexSkillMappings,
  getCursorRuleMappings: getCursorRuleMappings,
  getKiroSteeringMappings: getKiroSteeringMappings,
  getPluginPrefixRegex: getPluginPrefixRegex,
  invalidateCache: invalidateCache
};
