'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const extend = require('extend');
const resolve = require('resolve');
const flaggedRespawn = require('flagged-respawn');
const isPlainObject = require('is-plain-object').isPlainObject;
const fined = require('fined');
const findup = require('findup-sync');
const rechoir = require('rechoir');

function findCwd(options) {
  options = options || {};
  let cwd = options.cwd;

  if (typeof options.configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(options.configPath));
  }

  return typeof cwd === 'string' ? path.resolve(cwd) : process.cwd();
}

function arrayFind(items, predicate) {
  if (!Array.isArray(items)) return undefined;

  for (let index = 0; index < items.length; index += 1) {
    const result = predicate(items[index]);
    if (result) return result;
  }

  return undefined;
}

function fileSearch(filename, searchPaths) {
  let found;

  for (let index = 0; index < searchPaths.length && !found; index += 1) {
    found = findup(filename, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return found;
}

function findConfig(options) {
  options = options || {};
  let configPath = options.configPath;

  if (!configPath) {
    if (!Array.isArray(options.searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!options.configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(options.configNameSearch, options.searchPaths);
  }

  return configPath && fs.existsSync(configPath) ? path.resolve(configPath) : null;
}

function needsLookup(value) {
  return (typeof value === 'string' && value[0] === '.') || isPlainObject(value);
}

function parseOptions(options) {
  const defaults = {
    extensions: { '.js': null, '.json': null },
    searchPaths: [],
  };

  options = options || {};
  if (options.name) {
    if (!options.processTitle) options.processTitle = options.name;
    if (!options.configName) options.configName = options.name + 'file';
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
  } catch (error) {
    return undefined;
  }
}

function buildConfigName(options) {
  options = options || {};

  if (!options.configName) throw new Error('Please specify a configName.');
  if (options.configName instanceof RegExp) return [options.configName];
  if (!Array.isArray(options.extensions)) {
    throw new Error('Please provide an array of extensions.');
  }

  return options.extensions.map((extension) => options.configName + extension);
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
  const loaded = attempts[attempts.length - 1];
  emitter.emit('loader:success', loaded.moduleName, loaded.module);
}

function flagsFromReorderedArgv(argv) {
  const flags = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!/^-/.test(argument) || argument === '--') break;
    flags.push(argument);
  }
  return flags;
}

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(options) {
  EventEmitter.call(this);
  extend(this, parseOptions(options));
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(name, basedir) {
  try {
    this.emit('preload:before', name);
    const localModule = require(resolve.sync(name, { basedir }));
    this.emit('preload:success', name, localModule);
    return localModule;
  } catch (error) {
    this.emit('preload:failure', name, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  options = options || {};

  let requestedPreloads = options.preload || [];
  if (!Array.isArray(requestedPreloads)) requestedPreloads = [requestedPreloads];

  let searchPaths = this.searchPaths.slice();
  const configName = this.configName;
  let cwd = findCwd(options);
  const extensions = this.extensions;
  const liftoff = this;

  function locateFile(file, lookupOptions) {
    const located = fined(file, lookupOptions);
    if (!located) return null;
    if (isPlainObject(located.extension)) {
      registerLoader(liftoff, located.extension, located.path, cwd);
    }
    return located.path;
  }

  function resolveExtendedConfig(baseDirectory, extension) {
    if (!needsLookup(extension)) return extension;

    const located = locateFile(extension, { cwd: baseDirectory, extensions });
    if (located) return located;

    const requestedPath = typeof extension === 'string'
      ? extension
      : extension.path || extension.name;
    let message = 'Unable to locate one of your extends.';
    if (requestedPath) {
      message += ' Looking for file: ' + path.resolve(baseDirectory, requestedPath);
    }
    throw new Error(message);
  }

  const loading = Object.create(null);

  function loadConfig(baseDirectory, configReference, childConfig) {
    const configPath = resolveExtendedConfig(baseDirectory, configReference);
    if (loading[configPath]) {
      throw new Error(
        'We encountered a circular extend for file: ' + configPath +
        '. Please remove the recursive extends.'
      );
    }

    let config;
    try {
      config = require(configPath);
    } catch (error) {
      throw new Error('Encountered error when loading config file: ' + configPath);
    }

    if (Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName])) {
      config[configName] = path.resolve(path.dirname(configPath), config[configName]);
    }

    loading[configPath] = true;
    if (config && config.extends) {
      return loadConfig(path.dirname(configPath), config.extends, config);
    }

    const merged = extend(true, {}, config, childConfig);
    delete merged.extends;
    return merged;
  }

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map((configFile) =>
      locateFile(configFile, { cwd, extensions })
    );
  }

  const configs = configFiles.map((configFile) =>
    configFile ? loadConfig(cwd, configFile, {}) : {}
  );

  const configPathFromFile = arrayFind(configs, (config) => {
    if (Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName])) {
      return config[configName];
    }
    return undefined;
  });

  const configPreloads = arrayFind(configs, (config) => {
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
    configPath: options.configPath || configPathFromFile,
  });

  let configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!options.cwd) cwd = configBase;
  }

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
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {
    // The local module is optional.
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
    preload: requestedPreloads.concat(configPreloads || []),
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
  process.nextTick(() => callback(null, this.v8flags));
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
        this.emit('respawn', flagsFromReorderedArgv(argv), child);
      }
      if (ready) {
        preloadModules(this, environment);
        registerLoader(this, this.extensions, environment.configPath, environment.cwd);
        callback.call(this, environment, argv);
      }
    });
  });
};

function preloadModules(liftoff, environment) {
  environment.preload.filter(toUnique).forEach((moduleName) => {
    liftoff.requireLocal(moduleName, environment.cwd);
  });
}

function toUnique(value, index, values) {
  return values.indexOf(value) === index;
}

module.exports = Liftoff;
