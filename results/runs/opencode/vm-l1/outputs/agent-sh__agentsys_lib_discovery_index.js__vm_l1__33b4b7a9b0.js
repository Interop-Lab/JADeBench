/**
 * Convention-based discovery for plugins, commands, agents, and skills.
 *
 * A root directory contains a `plugins` directory. A valid plugin contains
 * `.claude-plugin/plugin.json`; its other resources follow the conventions
 * documented below.
 */

const fs = require("fs");
const path = require("path");

let cache = null;
let cacheRoot = null;

/** Parse the simple string-valued YAML subset used in Markdown headers. */
function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") return {};

  const frontmatter = {};
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") break;

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!key) continue;

    if (!value) {
      frontmatter[key] = [];
      continue;
    }
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return frontmatter;
}

function isValidPluginName(name) {
  return typeof name !== "string" || /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginsDir(rootDir) {
  return path.join(rootDir || process.cwd(), "plugins");
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function discoverPlugins(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  if (!isDirectory(pluginsDir)) return [];

  return fs
    .readdirSync(pluginsDir)
    .filter((pluginName) => {
      if (!isValidPluginName(pluginName)) return false;
      const manifest = path.join(
        pluginsDir,
        pluginName,
        ".claude-plugin",
        "plugin.json",
      );
      return isDirectory(path.join(pluginsDir, pluginName)) && isFile(manifest);
    })
    .sort();
}

function discoverMarkdownResources(rootDir, resourceDirectory) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const resources = [];

  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, resourceDirectory);
    if (!isDirectory(directory)) continue;

    for (const file of fs.readdirSync(directory).sort()) {
      if (!file.endsWith(".md")) continue;
      const filePath = path.join(directory, file);
      if (!isFile(filePath)) continue;

      resources.push({
        name: file.slice(0, -3),
        plugin,
        file,
        frontmatter: parseFrontmatter(fs.readFileSync(filePath, "utf8")),
      });
    }
  }
  return resources;
}

function discoverCommands(rootDir) {
  return discoverMarkdownResources(rootDir, "commands");
}

function discoverAgents(rootDir) {
  return discoverMarkdownResources(rootDir, "agents");
}

function discoverSkills(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const skills = [];

  for (const plugin of discoverPlugins(rootDir)) {
    const directory = path.join(pluginsDir, plugin, "skills");
    if (!isDirectory(directory)) continue;

    for (const skillDirectory of fs.readdirSync(directory).sort()) {
      const skillFile = path.join(directory, skillDirectory, "SKILL.md");
      if (!isFile(skillFile)) continue;

      skills.push({
        name: skillDirectory,
        plugin,
        dir: skillDirectory,
        frontmatter: parseFrontmatter(fs.readFileSync(skillFile, "utf8")),
      });
    }
  }
  return skills;
}

function getCache(rootDir) {
  return cacheRoot === rootDir ? cache : null;
}

function setCache(rootDir, value) {
  cacheRoot = rootDir;
  cache = value;
}

function invalidateCache() {
  cache = null;
  cacheRoot = null;
}

function discoverAll(rootDir) {
  const resolvedRoot = rootDir || process.cwd();
  const cached = getCache(resolvedRoot);
  if (cached) return cached;

  const discovery = {
    plugins: discoverPlugins(resolvedRoot),
    commands: discoverCommands(resolvedRoot),
    agents: discoverAgents(resolvedRoot),
    skills: discoverSkills(resolvedRoot),
  };
  setCache(resolvedRoot, discovery);
  return discovery;
}

function getCommandMappings(rootDir) {
  return discoverCommands(rootDir).map(({ plugin, file }) => [file, plugin, file]);
}

function getCodexSkillMappings(rootDir) {
  return discoverCommands(rootDir).map(({ name, plugin, file, frontmatter }) => [
    name,
    plugin,
    file,
    frontmatter.description || "",
  ]);
}

function getCursorRuleMappings(rootDir) {
  return discoverCommands(rootDir).map(({ name, plugin, file, frontmatter }) => [
    `agentsys-${plugin}-${name}`,
    plugin,
    file,
    frontmatter.description || "",
    "command",
    "",
  ]);
}

function getKiroSteeringMappings(rootDir) {
  return discoverCommands(rootDir).map(({ name, plugin, file, frontmatter }) => [
    name,
    plugin,
    file,
    frontmatter.description || "",
  ]);
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  if (plugins.length === 0) return /$^/g;
  return new RegExp(`(${plugins.join("|")})`, "g");
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
