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
function parseFrontmatter(_0x29a747) {
  if (!_0x29a747 || !_0x29a747.startsWith("---")) {
    return {};
  }
  const _0x3f242c = _0x29a747.indexOf("\n---", 3);
  if (_0x3f242c === -1) {
    return {};
  }
  const _0x1e33e3 = _0x29a747.substring(4, _0x3f242c);
  const _0x1da582 = {};
  const _0x1f271d = _0x1e33e3.split("\n");
  let _0x4be17e = null;
  let _0x1a314b = null;
  for (const _0xe6befd of _0x1f271d) {
    const _0x49d965 = _0xe6befd.match(/^\s+-\s+(.+)$/);
    if (_0x49d965 && _0x4be17e && _0x1a314b) {
      let _0x5052c5 = _0x49d965[1].trim();
      if (_0x5052c5.startsWith("\"") && _0x5052c5.endsWith("\"") || _0x5052c5.startsWith("'") && _0x5052c5.endsWith("'")) {
        _0x5052c5 = _0x5052c5.slice(1, -1);
      }
      _0x1a314b.push(_0x5052c5);
      continue;
    }
    const _0xb571b7 = _0xe6befd.indexOf(":");
    if (_0xb571b7 > 0) {
      if (_0x4be17e && _0x1a314b) {
        _0x1da582[_0x4be17e] = _0x1a314b;
        _0x4be17e = null;
        _0x1a314b = null;
      }
      const _0x3a532a = _0xe6befd.substring(0, _0xb571b7).trim();
      if (_0x3a532a === "__proto__" || _0x3a532a === "constructor" || _0x3a532a === "prototype") {
        continue;
      }
      let _0x50ca05 = _0xe6befd.substring(_0xb571b7 + 1).trim();
      if (_0x50ca05 === "") {
        _0x4be17e = _0x3a532a;
        _0x1a314b = [];
      } else {
        if (_0x50ca05.startsWith("\"") && _0x50ca05.endsWith("\"") || _0x50ca05.startsWith("'") && _0x50ca05.endsWith("'")) {
          _0x50ca05 = _0x50ca05.slice(1, -1);
        }
        _0x1da582[_0x3a532a] = _0x50ca05;
        _0x4be17e = null;
        _0x1a314b = null;
      }
    }
  }
  if (_0x4be17e && _0x1a314b) {
    _0x1da582[_0x4be17e] = _0x1a314b;
  }
  return _0x1da582;
}
function isValidPluginName(_0x5a7014) {
  return /^[a-z0-9][a-z0-9-]*$/.test(_0x5a7014);
}
function resolvePluginsDir(_0x5144f4) {
  if (!_0x5144f4) {
    _0x5144f4 = path.resolve(__dirname, "..", "..");
  }
  return path.join(_0x5144f4, "plugins");
}
function discoverPlugins(_0x572c14) {
  const _0x3554b4 = getCache(_0x572c14);
  if (_0x3554b4 && _0x3554b4.plugins) {
    return _0x3554b4.plugins;
  }
  const _0x1f1bdd = resolvePluginsDir(_0x572c14);
  if (!fs.existsSync(_0x1f1bdd)) {
    return [];
  }
  const _0x165529 = fs.readdirSync(_0x1f1bdd);
  const _0x575752 = _0x165529.filter(_0x2c37fa => {
    if (!isValidPluginName(_0x2c37fa)) {
      return false;
    }
    const _0x586b82 = path.join(_0x1f1bdd, _0x2c37fa, ".claude-plugin", "plugin.json");
    return fs.existsSync(_0x586b82);
  }).sort();
  setCache(_0x572c14, "plugins", _0x575752);
  return _0x575752;
}
function discoverCommands(_0x5301bd) {
  const _0x5a4469 = getCache(_0x5301bd);
  if (_0x5a4469 && _0x5a4469.commands) {
    return _0x5a4469.commands;
  }
  const _0x29db27 = resolvePluginsDir(_0x5301bd);
  const _0x17b526 = discoverPlugins(_0x5301bd);
  const _0x13e225 = [];
  for (const _0x182cce of _0x17b526) {
    const _0x4b3de1 = path.join(_0x29db27, _0x182cce, "commands");
    if (!fs.existsSync(_0x4b3de1)) {
      continue;
    }
    const _0x209473 = fs.readdirSync(_0x4b3de1).filter(_0x58767d => _0x58767d.endsWith(".md")).sort();
    for (const _0xc9ef0f of _0x209473) {
      const _0x3a5334 = path.join(_0x4b3de1, _0xc9ef0f);
      const _0x12f625 = fs.readFileSync(_0x3a5334, "utf8");
      const _0x390460 = parseFrontmatter(_0x12f625);
      _0x13e225.push({
        name: _0xc9ef0f.replace(/\.md$/, ""),
        plugin: _0x182cce,
        file: _0xc9ef0f,
        frontmatter: _0x390460
      });
    }
  }
  setCache(_0x5301bd, "commands", _0x13e225);
  return _0x13e225;
}
function discoverAgents(_0x35de89) {
  const _0x2351d0 = getCache(_0x35de89);
  if (_0x2351d0 && _0x2351d0.agents) {
    return _0x2351d0.agents;
  }
  const _0x56d966 = resolvePluginsDir(_0x35de89);
  const _0x2af2a1 = discoverPlugins(_0x35de89);
  const _0x2da07b = [];
  for (const _0x33c160 of _0x2af2a1) {
    const _0x122191 = path.join(_0x56d966, _0x33c160, "agents");
    if (!fs.existsSync(_0x122191)) {
      continue;
    }
    const _0xcf3e8 = fs.readdirSync(_0x122191).filter(_0xab7d63 => _0xab7d63.endsWith(".md")).sort();
    for (const _0xdb9d82 of _0xcf3e8) {
      const _0x43359d = path.join(_0x122191, _0xdb9d82);
      const _0x1a9c80 = fs.readFileSync(_0x43359d, "utf8");
      const _0xfc7ad8 = parseFrontmatter(_0x1a9c80);
      _0x2da07b.push({
        name: _0xdb9d82.replace(/\.md$/, ""),
        plugin: _0x33c160,
        file: _0xdb9d82,
        frontmatter: _0xfc7ad8
      });
    }
  }
  setCache(_0x35de89, "agents", _0x2da07b);
  return _0x2da07b;
}
function discoverSkills(_0x35d02f) {
  const _0xbfd202 = getCache(_0x35d02f);
  if (_0xbfd202 && _0xbfd202.skills) {
    return _0xbfd202.skills;
  }
  const _0x78a964 = resolvePluginsDir(_0x35d02f);
  const _0x40c2f7 = discoverPlugins(_0x35d02f);
  const _0x1528f7 = [];
  for (const _0x426b23 of _0x40c2f7) {
    const _0x1954e4 = path.join(_0x78a964, _0x426b23, "skills");
    if (!fs.existsSync(_0x1954e4)) {
      continue;
    }
    const _0xfea06a = fs.readdirSync(_0x1954e4).sort();
    for (const _0x3b2c97 of _0xfea06a) {
      const _0x7c4d39 = path.join(_0x1954e4, _0x3b2c97, "SKILL.md");
      if (fs.existsSync(_0x7c4d39)) {
        const _0x13f96f = fs.readFileSync(_0x7c4d39, "utf8");
        const _0x362ba3 = parseFrontmatter(_0x13f96f);
        const _0xda4525 = {
          name: _0x3b2c97,
          plugin: _0x426b23,
          dir: _0x3b2c97,
          frontmatter: _0x362ba3
        };
        _0x1528f7.push(_0xda4525);
      }
    }
  }
  setCache(_0x35d02f, "skills", _0x1528f7);
  return _0x1528f7;
}
function getCommandMappings(_0x41f28b) {
  const _0x5543a4 = discoverCommands(_0x41f28b);
  return _0x5543a4.map(_0x10fe1a => [_0x10fe1a.file, _0x10fe1a.plugin, _0x10fe1a.file]);
}
function getCodexSkillMappings(_0x46e87a) {
  const _0x2a36ed = discoverCommands(_0x46e87a);
  return _0x2a36ed.map(_0x20f9c1 => {
    const _0x3aabf8 = _0x20f9c1.frontmatter["codex-description"] || _0x20f9c1.frontmatter.description || "";
    return [_0x20f9c1.name, _0x20f9c1.plugin, _0x20f9c1.file, _0x3aabf8];
  });
}
function getPluginPrefixRegex(_0x423229) {
  const _0x5c3dd6 = discoverPlugins(_0x423229);
  if (_0x5c3dd6.length === 0) {
    return /$^/g;
  }
  const _0x54c76d = _0x5c3dd6.map(_0x5b2537 => _0x5b2537.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("(" + _0x54c76d.join("|") + ")", "g");
}
function discoverAll(_0x9c2e0b) {
  return {
    plugins: discoverPlugins(_0x9c2e0b),
    commands: discoverCommands(_0x9c2e0b),
    agents: discoverAgents(_0x9c2e0b),
    skills: discoverSkills(_0x9c2e0b)
  };
}
function getCache(_0x4f6f59) {
  const _0x250816 = _0x4f6f59 || path.resolve(__dirname, "..", "..");
  if (_cache && _cacheRoot === _0x250816) {
    return _cache;
  }
  return null;
}
function setCache(_0x31d90e, _0xf5c85a, _0x55f081) {
  const _0x1b0864 = _0x31d90e || path.resolve(__dirname, "..", "..");
  if (!_cache || _cacheRoot !== _0x1b0864) {
    _cache = {};
    _cacheRoot = _0x1b0864;
  }
  _cache[_0xf5c85a] = _0x55f081;
}
function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}
function getCursorRuleMappings(_0x3098c8) {
  const _0x4e620e = discoverCommands(_0x3098c8);
  return _0x4e620e.map(_0x39c6d2 => {
    const _0x39349e = _0x39c6d2.frontmatter["cursor-description"] || _0x39c6d2.frontmatter["codex-description"] || _0x39c6d2.frontmatter.description || "";
    const _0x1b921d = _0x39c6d2.frontmatter.type || "command";
    const _0x3b3b2c = _0x39c6d2.frontmatter.globs || "";
    return ["agentsys-" + _0x39c6d2.plugin + "-" + _0x39c6d2.name, _0x39c6d2.plugin, _0x39c6d2.file, _0x39349e, _0x1b921d, _0x3b3b2c];
  });
}
function getKiroSteeringMappings(_0x4f64bf) {
  const _0x2cf06f = discoverCommands(_0x4f64bf);
  return _0x2cf06f.map(_0xa9dcf9 => {
    const _0x1635cf = _0xa9dcf9.frontmatter["kiro-description"] || _0xa9dcf9.frontmatter["cursor-description"] || _0xa9dcf9.frontmatter["codex-description"] || _0xa9dcf9.frontmatter.description || "";
    return [_0xa9dcf9.name, _0xa9dcf9.plugin, _0xa9dcf9.file, _0x1635cf];
  });
}
const _0x16cbf2 = {
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
module.exports = _0x16cbf2;