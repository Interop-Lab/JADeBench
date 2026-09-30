"use strict";

const path = require("path");
const util = require("util");
const EventEmitter = require("events").EventEmitter;
const extend = require("extend");
const resolve = require("resolve");
const flaggedRespawn = require("flagged-respawn");
const fined = require("fined");
const isPlainObject = require("is-plain-object").isPlainObject;
const rechoir = require("rechoir");

function isString(value) {
  return (
    typeof value === "string" ||
    Object.prototype.toString.call(value) === "[object String]"
  );
}

function findCwd(options) {
  return options.cwd ? path.resolve(options.cwd) : process.cwd();
}

function arrayFind(array, predicate) {
  for (let index = 0; index < array.length; index += 1) {
    if (predicate(array[index], index, array)) return array[index];
  }
  return undefined;
}

function fileSearch(filename, searchPaths) {
  for (const searchPath of searchPaths) {
    const result = fined(filename, { cwd: searchPath });
    if (result) return result.path;
  }
  return null;
}

function findConfig(options) {
  if (options.configPath) {
    const explicit = fined(options.configPath, {
      cwd: options.searchPaths[0],
      extensions: [""],
    });
    return explicit && explicit.path;
  }

  for (const searchPath of options.searchPaths) {
    const result = fined({
      path: options.configNameSearch,
      cwd: searchPath,
      findUp: true,
    });
    if (result) return result.path;
  }
  return null;
}

function needsLookup(extension, extensions) {
  return Boolean(extensions[extension]) && !require.extensions[extension];
}

function silentRequire(modulePath) {
  if (!modulePath) return undefined;
  try {
    return require(modulePath);
  } catch (_) {
    return undefined;
  }
}

function buildConfigName(options) {
  return options.extensions.map((extension) => options.configName + extension);
}

function registerLoader(extension, extensions, cwd) {
  if (!needsLookup(extension, extensions)) return true;
  return rechoir.prepare(extensions, `file${extension}`, cwd, true);
}

function getNodeFlags() {
  return process.allowedNodeEnvironmentFlags
    ? Array.from(process.allowedNodeEnvironmentFlags)
    : [];
}

function parseOptions(options) {
  options = options || {};
  if (!options.processTitle && !options.name) {
    throw new Error("You must specify a processTitle.");
  }

  const parsed = extend({}, options);
  parsed.extensions = parsed.extensions || {};
  parsed.searchPaths = parsed.searchPaths || [];
  parsed.processTitle = parsed.processTitle || parsed.name;
  parsed.configName = parsed.configName || parsed.name || parsed.processTitle;
  parsed.moduleName = parsed.moduleName || parsed.name || parsed.processTitle;
  return parsed;
}

function Liftoff(options) {
  EventEmitter.call(this);
  extend(this, parseOptions(options));
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(moduleName, basedir) {
  try {
    this.emit("preload:before", moduleName);
    const loaded = require(resolve.sync(moduleName, { basedir }));
    this.emit("preload:success", moduleName, loaded);
    return loaded;
  } catch (error) {
    this.emit("preload:failure", moduleName, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  options = options || {};
  let preload = options.preload || [];
  if (!Array.isArray(preload)) preload = [preload];

  let cwd = findCwd(options);
  let searchPaths = this.searchPaths.slice();
  const extensions = this.extensions;

  const configFiles = Array.isArray(this.configFiles)
    ? this.configFiles.map((description) => {
        if (isString(description)) {
          description = { name: description };
        }
        return fined(description, {
          cwd,
          extensions,
          findUp: true,
        });
      })
    : [];

  const config = configFiles.map((found) => {
    if (!found) return {};
    const extension = found.extension || path.extname(found.path);
    registerLoader(extension, extensions, cwd);
    const loaded = silentRequire(found.path);
    return isPlainObject(loaded) ? loaded : {};
  });

  const configuredPath = arrayFind(config, (entry) =>
    Object.prototype.hasOwnProperty.call(entry, this.configName) &&
    isString(entry[this.configName])
  );
  const configPathOption = configuredPath && configuredPath[this.configName];

  const configuredPreload = arrayFind(config, (entry) => {
    if (!Object.prototype.hasOwnProperty.call(entry, "preload")) return false;
    return Array.isArray(entry.preload)
      ? entry.preload.every(isString)
      : isString(entry.preload);
  });

  if (options.cwd) searchPaths = [cwd];
  else searchPaths.unshift(cwd);

  const configNameSearch = buildConfigName({
    configName: this.configName,
    extensions: Object.keys(extensions),
  });
  const configPath = findConfig({
    configNameSearch,
    searchPaths,
    configPath: options.configPath || configPathOption,
  });
  const configBase = configPath ? path.dirname(configPath) : undefined;
  if (configPath && !options.cwd) cwd = configBase;

  let modulePath;
  let modulePackage;
  try {
    const nodePaths = process.env.NODE_PATH
      ? process.env.NODE_PATH.split(path.delimiter)
      : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePaths,
    });
    modulePackage = silentRequire(fileSearch("package.json", [modulePath]));
  } catch (_) {
    // The local module is optional.
  }

  if (!modulePath && configPath) {
    const packagePath = fileSearch("package.json", [configBase]);
    modulePackage = silentRequire(packagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(
        path.dirname(packagePath),
        modulePackage.main || "index.js"
      );
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  const extraPreload = configuredPreload ? configuredPreload.preload : [];
  return {
    cwd,
    preload: preload.concat(extraPreload || []),
    completion: options.completion,
    configNameSearch,
    configPath,
    configBase,
    modulePath,
    modulePackage: modulePackage || {},
    configFiles,
    config,
  };
};

Liftoff.prototype.handleFlags = function handleFlags(callback) {
  if (typeof this.v8flags === "function") {
    this.v8flags((error, flags) => callback(error, flags));
  } else {
    process.nextTick(() => callback(null, this.v8flags));
  }
};

Liftoff.prototype.prepare = function prepare(options, callback) {
  if (typeof callback !== "function") {
    throw new Error("You must provide a callback function.");
  }
  process.title = this.processTitle;
  callback.call(this, this.buildEnvironment(options));
};

Liftoff.prototype.execute = function execute(environment, forcedFlags, callback) {
  if (environment.completion && this.completions) {
    return this.completions(environment.completion);
  }
  if (typeof forcedFlags === "function") {
    callback = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof callback !== "function") {
    throw new Error("You must provide a callback function.");
  }

  this.handleFlags((error, flags) => {
    if (error) throw error;
    flaggedRespawn(flags || [], process.argv, forcedFlags, (ready, child, argv) => {
      if (ready) {
        preloadModules.call(this, environment.preload, environment.cwd);
        if (environment.configPath) {
          registerLoader(
            path.extname(environment.configPath),
            this.extensions,
            environment.configBase
          );
        }
      }
      callback.call(this, environment, child, argv);
    });
  });
};

function preloadModules(modules, cwd) {
  modules.filter(toUnique).forEach((moduleName) => {
    this.requireLocal(moduleName, cwd);
  });
}

function toUnique(value, index, values) {
  return values.indexOf(value) === index;
}

module.exports = Liftoff;
