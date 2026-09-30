"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");
const EventEmitter = require("events").EventEmitter;
const extend = require("extend");
const resolve = require("resolve");
const flaggedRespawn = require("flagged-respawn");
const isPlainObject = require("is-plain-object").isPlainObject;
const fined = require("fined");
const findUp = require("findup-sync");
const rechoir = require("rechoir");

function arrayFind(array, predicate) {
  for (let index = 0; index < array.length; index += 1) {
    if (predicate(array[index], index, array)) return true;
  }
  return null;
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (_) {
    return undefined;
  }
}

function findCwd(cwd) {
  if (!cwd) return process.cwd();
  const resolved = path.resolve(cwd);
  try {
    return fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved);
  } catch (_) {
    return process.cwd();
  }
}

function buildConfigName(configName, extensions) {
  if (!configName) throw new Error("Please specify a configName.");
  const names = [];
  Object.keys(extensions).forEach((extension) => {
    names.push(configName.endsWith(extension) ? configName : configName + extension);
  });
  return names;
}

function fileSearch(cwd, names) {
  for (let index = 0; index < names.length; index += 1) {
    const found = findUp(names[index], { cwd, nocase: true });
    if (found) return found;
  }
  return null;
}

function findConfig(paths) {
  if (!Array.isArray(paths)) {
    throw new Error("Please provide an array of paths to search for config in.");
  }
  return arrayFind(paths, (candidate) => fs.existsSync(candidate))
    ? paths.find((candidate) => fs.existsSync(candidate))
    : null;
}

function parseOptions(options) {
  options = extend({}, options);

  if (options.name) {
    options.processTitle = options.processTitle || options.name;
    options.configName = options.configName || `${options.name}file`;
    options.moduleName = options.moduleName || options.name;
  }
  if (!options.processTitle) throw new Error("You must specify a processTitle.");

  options.extensions = extend({ ".js": null, ".json": null }, options.extensions);
  options.searchPaths = options.searchPaths || [];
  return options;
}

function normalizePreload(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function locateModule(moduleName, cwd) {
  if (!moduleName) return { modulePath: null, modulePackage: {} };
  try {
    const modulePath = resolve.sync(moduleName, { basedir: cwd });
    let packagePath;
    try {
      packagePath = resolve.sync(`${moduleName}/package.json`, { basedir: cwd });
    } catch (_) {
      packagePath = null;
    }
    return {
      modulePath,
      modulePackage: packagePath ? silentRequire(packagePath) || {} : {},
    };
  } catch (_) {
    return { modulePath: null, modulePackage: {} };
  }
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
  const cwd = findCwd(options.cwd);
  const preload = normalizePreload(options.preload);
  const configNameSearch = buildConfigName(this.configName, this.extensions);

  let configPath = options.configPath || null;
  if (configPath) {
    configPath = path.resolve(cwd, configPath);
    if (!fs.existsSync(configPath)) configPath = null;
  } else {
    configPath = fileSearch(cwd, configNameSearch);
  }

  const configBase = configPath ? path.dirname(configPath) : cwd;
  const located = locateModule(this.moduleName, configBase);
  const configFiles = configPath ? [configPath] : [];
  const config = configFiles.map(silentRequire).filter(Boolean);

  return {
    cwd,
    preload,
    completion: options.completion,
    configNameSearch,
    configPath,
    configBase,
    modulePath: located.modulePath,
    modulePackage: located.modulePackage || {},
    configFiles,
    config,
  };
};

Liftoff.prototype.handleFlags = function handleFlags(callback) {
  if (typeof this.v8flags === "function") {
    this.v8flags(callback);
  } else {
    process.nextTick(callback.bind(this, null, this.v8flags));
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

  this.handleFlags((error, v8flags) => {
    if (error) throw error;
    flaggedRespawn(v8flags || [], process.argv, forcedFlags, (ready, child, argv) => {
      if (child !== process) {
        this.emit("respawn", argv, child);
      }
      if (!ready) return;

      environment.preload.filter((value, index, values) => values.indexOf(value) === index)
        .forEach((moduleName) => this.requireLocal(moduleName, environment.cwd));

      if (environment.configPath) {
        rechoir.prepare(this.extensions, environment.configPath, environment.cwd);
      }
      callback.call(this, environment, argv);
    });
  });
  return undefined;
};

module.exports = Liftoff;
