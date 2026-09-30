'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const extend = require('extend');
const resolve = require('resolve');
const flaggedRespawn = require('flagged-respawn');
const isPlainObject = require('is-plain-object').isPlainObject;
const fined = require('fined');
const rechoir = require('rechoir');

function arrayFind(values, predicate) {
  if (!Array.isArray(values)) return undefined;
  for (let index = 0; index < values.length; index += 1) {
    const result = predicate(values[index]);
    if (result) return result;
  }
}

function findCwd(options) {
  options = options || {};
  if (!options.cwd && typeof options.configPath === 'string') {
    return path.dirname(path.resolve(options.configPath));
  }
  if (typeof options.cwd === 'string') return path.resolve(options.cwd);
  return process.cwd();
}

function fileSearch(filename, searchPaths) {
  let found;
  for (let index = 0; index < searchPaths.length && !found; index += 1) {
    found = fined(filename, { cwd: searchPaths[index], nocase: true });
  }
  return found && found.path;
}

function searchUp(patterns, cwd) {
  let directory = path.resolve(cwd);
  while (true) {
    for (const pattern of patterns) {
      if (pattern instanceof RegExp) {
        const match = fs.readdirSync(directory).find((name) => pattern.test(name));
        if (match) return path.join(directory, match);
      } else {
        const candidate = path.join(directory, pattern);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function findConfig(options) {
  if (!options.configNameSearch) {
    throw new Error('Please provide a configNameSearch.');
  }
  if (!Array.isArray(options.searchPaths)) {
    throw new Error('Please provide an array of paths to search for config in.');
  }
  const configPath = options.configPath || arrayFind(
    options.searchPaths,
    (searchPath) => searchUp(options.configNameSearch, searchPath)
  );
  if (configPath && fs.existsSync(configPath)) return path.resolve(configPath);
  return null;
}

function needsLookup(value) {
  if (typeof value === 'string' && value[0] === '.') return true;
  return isPlainObject(value);
}

function parseOptions(options) {
  const defaults = {
    extensions: { '.js': null, '.json': null },
    searchPaths: [],
  };
  options = options || {};

  if (options.name) {
    if (!options.processTitle) options.processTitle = options.name;
    if (!options.configName) options.configName = `${options.name}file`;
    if (!options.moduleName) options.moduleName = options.name;
  }
  if (!options.processTitle) throw new Error('You must specify a processTitle.');
  if (!options.configName) throw new Error('You must specify a configName.');
  if (!options.moduleName) throw new Error('You must specify a moduleName.');

  return extend(defaults, options);
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (_) {
    return undefined;
  }
}

function buildConfigName(options) {
  options = options || {};
  const configName = options.configName;
  const extensions = options.extensions;
  if (!configName) throw new Error('Please specify a configName.');
  if (configName instanceof RegExp) return [configName];
  if (!Array.isArray(extensions)) {
    throw new Error('Please provide an array of valid extensions.');
  }
  return extensions.map((extension) => configName + extension);
}

function registerLoader(emitter, extensions, configPath, cwd) {
  extensions = extensions || {};
  if (typeof configPath !== 'string') return;
  const attempts = rechoir.prepare(extensions, configPath, cwd, true);
  if (attempts instanceof Error) {
    attempts.failures.forEach((failure) => {
      emitter.emit('loader:failure', failure.moduleName, failure.error);
    });
    return;
  }
  if (!Array.isArray(attempts)) return;
  const successful = attempts[attempts.length - 1];
  emitter.emit('loader:success', successful.moduleName, successful.module);
}

const getNodeFlags = {
  arrayOrFunction(value, context) {
    if (typeof value === 'function') return value.call(this, context);
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  },

  fromReorderedArgv(argv) {
    const flags = [];
    for (const argument of argv) {
      if (!/^-/.test(argument) || argument === '--') break;
      flags.push(argument);
    }
    return flags;
  },
};

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(options) {
  EventEmitter.call(this);
  extend(this, parseOptions(options));
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(moduleName, basedir) {
  try {
    this.emit('preload:before', moduleName);
    const loaded = require(resolve.sync(moduleName, { basedir }));
    this.emit('preload:success', moduleName, loaded);
    return loaded;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  options = options || {};
  let preload = options.preload || [];
  if (!Array.isArray(preload)) preload = [preload];

  let searchPaths = this.searchPaths.slice();
  const configName = this.configName;
  let cwd = findCwd(options);
  const extensions = this.extensions;
  const instance = this;

  function resolveConfiguredPath(candidate, defaults) {
    const found = fined(candidate, defaults);
    if (!found) return null;
    if (isPlainObject(found.extension)) {
      registerLoader(instance, found.extension, found.path, cwd);
    }
    return found.path;
  }

  function resolveExtend(basedir, target) {
    if (!needsLookup(target)) return target;
    const found = resolveConfiguredPath(target, { cwd: basedir, extensions });
    if (found) return found;
    const requested = typeof target === 'string' ? target : target.path || target.name;
    let message = 'Unable to locate one of your extends.';
    if (requested) message += ` Looking for file: ${path.resolve(basedir, requested)}`;
    throw new Error(message);
  }

  const loading = Object.create(null);
  function loadConfig(basedir, target, childConfig) {
    const configPath = resolveExtend(basedir, target);
    if (loading[configPath]) {
      throw new Error(`We encountered a circular extend for file: ${configPath}. Please remove the recursive extends.`);
    }

    let config;
    try {
      config = require(configPath);
    } catch (_) {
      throw new Error(`Encountered error when loading config file: ${configPath}`);
    }

    if (Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName])) {
      config[configName] = path.resolve(path.dirname(configPath), config[configName]);
    }

    loading[configPath] = true;
    if (config && config.extends) {
      const combinedChild = extend(true, {}, config, childConfig);
      return loadConfig(path.dirname(configPath), config.extends, combinedChild);
    }
    const merged = extend(true, {}, config, childConfig);
    delete merged.extends;
    return merged;
  }

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map((candidate) =>
      resolveConfiguredPath(candidate, { cwd, extensions })
    );
  }
  const configs = configFiles.map((configPath) =>
    configPath ? loadConfig(cwd, configPath, {}) : {}
  );

  const configNameValue = arrayFind(configs, (config) => {
    if (!Object.prototype.hasOwnProperty.call(config, configName)) return undefined;
    return isString(config[configName]) ? config[configName] : undefined;
  });
  const configPreload = arrayFind(configs, (config) => {
    if (!Object.prototype.hasOwnProperty.call(config, 'preload')) return undefined;
    if (Array.isArray(config.preload) && config.preload.every(isString)) return config.preload;
    if (isString(config.preload)) return config.preload;
    return undefined;
  });

  if (options.cwd) searchPaths = [cwd];
  else searchPaths.unshift(cwd);

  const configNameSearch = buildConfigName({
    configName,
    extensions: Object.keys(extensions),
  });
  const configPath = findConfig({
    configNameSearch,
    searchPaths,
    configPath: options.configPath || configNameValue,
  });
  let configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!options.cwd) cwd = configBase;
  }

  let modulePath;
  let modulePackage;
  try {
    const nodePaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePaths,
    });
    modulePackage = silentRequire(fileSearch('package.json', [path.dirname(modulePath)]));
  } catch (_) {
    modulePath = undefined;
  }

  if (!modulePath && configPath) {
    const packagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(packagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(path.dirname(packagePath), modulePackage.main || 'index.js');
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd,
    preload: preload.concat(configPreload || []),
    completion: options.completion,
    configNameSearch,
    configPath,
    configBase,
    modulePath,
    modulePackage: modulePackage || {},
    configFiles,
    config: configs,
  };
};

Liftoff.prototype.handleFlags = function handleFlags(callback) {
  if (typeof this.v8flags === 'function') {
    this.v8flags((error, flags) => {
      if (error) callback(error);
      else callback(null, flags);
    });
    return;
  }
  process.nextTick(() => callback(null, getNodeFlags.arrayOrFunction(this.v8flags, this)));
};

Liftoff.prototype.prepare = function prepare(options, callback) {
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  process.title = this.processTitle;
  callback.call(this, this.buildEnvironment(options));
};

Liftoff.prototype.execute = function execute(environment, forcedFlags, callback) {
  if (environment.completion && this.completions) {
    return this.completions(environment.completion);
  }
  if (typeof forcedFlags === 'function') {
    callback = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags((error, flags) => {
    if (error) throw error;
    flaggedRespawn(flags || [], process.argv, forcedFlags, (ready, child, argv) => {
      if (child !== process) {
        const nodeFlags = getNodeFlags.fromReorderedArgv(argv);
        this.emit('respawn', nodeFlags, child);
      }
      if (ready) {
        environment.preload
          .filter((value, index, values) => values.indexOf(value) === index)
          .forEach((moduleName) => this.requireLocal(moduleName, environment.cwd));
        registerLoader(this, this.extensions, environment.configPath, environment.cwd);
        callback.call(this, environment, argv);
      }
    });
  });
};

module.exports = Liftoff;
