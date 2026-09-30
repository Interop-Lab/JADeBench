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
const findUp = require('findup-sync');
const rechoir = require('rechoir');

function findCwd(options) {
  options = options || {};

  let cwd = options.cwd;
  const configPath = options.configPath;

  if (typeof configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(configPath));
  }

  if (typeof cwd === 'string') {
    return path.resolve(cwd);
  }

  return process.cwd();
}

function arrayFind(array, iterator) {
  if (!Array.isArray(array)) return undefined;

  for (let index = 0; index < array.length; index += 1) {
    const result = iterator(array[index]);
    if (result) return result;
  }
}

function fileSearch(filename, searchPaths) {
  let found;

  for (let index = 0; index < searchPaths.length; index += 1) {
    if (found) break;
    found = findUp(filename, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return found;
}

function findConfig(options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
}

function needsLookup(value) {
  if (typeof value === 'string' && value[0] === '.') return true;
  if (isPlainObject(value)) return true;
  return false;
}

function parseOptions(options) {
  const defaults = {
    extensions: {
      '.js': null,
      '.json': null,
    },
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
  } catch (error) {
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
    throw new Error('Please provide an array of extensions.');
  }

  return extensions.map((extension) => configName + extension);
}

function registerLoader(context, extensions, configPath, cwd) {
  extensions = extensions || {};
  if (typeof configPath !== 'string') return;

  const attempts = rechoir.prepare(extensions, configPath, cwd, true);
  if (attempts instanceof Error) {
    attempts.failures.forEach((failure) => {
      context.emit('loader:failure', failure.moduleName, failure.error);
    });
    return;
  }

  if (!Array.isArray(attempts)) return;
  const loader = attempts[attempts.length - 1];
  context.emit('loader:success', loader.moduleName, loader.module);
}

function arrayOrFunction(value, argv) {
  if (typeof value === 'function') return value.call(this, argv);
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}

function fromReorderedArgv(argv) {
  const flags = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!/^-/u.test(argument) || argument === '--') break;
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

Liftoff.prototype.requireLocal = function requireLocal(moduleName, basedir) {
  try {
    this.emit('preload:before', moduleName);
    const loadedModule = require(resolve.sync(moduleName, { basedir }));
    this.emit('preload:success', moduleName, loadedModule);
    return loadedModule;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
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
  const context = this;

  function resolveConfiguredFile(filename, lookupOptions) {
    const resolved = fined(filename, lookupOptions);
    if (!resolved) return null;

    if (isPlainObject(resolved.extension)) {
      registerLoader(context, resolved.extension, resolved.path, cwd);
    }
    return resolved.path;
  }

  function resolveExtendedConfig(base, value) {
    if (!needsLookup(value)) return value;

    const resolved = resolveConfiguredFile(value, {
      cwd: base,
      extensions,
    });

    if (!resolved) {
      const requested = typeof value === 'string' ? value : value.path || value.name;
      let message = 'Unable to locate one of your extends.';
      if (requested) message += ` Looking for file: ${path.resolve(base, requested)}`;
      throw new Error(message);
    }

    return resolved;
  }

  const loading = Object.create(null);

  function loadConfig(base, filename, childConfig) {
    const configPath = resolveExtendedConfig(base, filename);
    if (loading[configPath]) {
      throw new Error(
        `We encountered a circular extend for file: ${configPath}. ` +
          'Please remove the recursive extends.',
      );
    }

    let config;
    try {
      config = require(configPath);
    } catch (error) {
      throw new Error(`Encountered error when loading config file: ${configPath}`);
    }

    if (Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName])) {
      config[configName] = path.resolve(path.dirname(configPath), config[configName]);
    }

    loading[configPath] = true;
    if (config && config.extends) {
      config = loadConfig(path.dirname(configPath), config.extends, config);
    }

    const merged = extend(true, {}, config, childConfig);
    delete merged.extends;
    return merged;
  }

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map((filename) =>
      resolveConfiguredFile(filename, { cwd, extensions }),
    );
  }

  const config = configFiles.map((configPath) => {
    if (!configPath) return {};
    return loadConfig(cwd, configPath, {});
  });

  const configuredPath = arrayFind(config, (loadedConfig) => {
    if (
      Object.prototype.hasOwnProperty.call(loadedConfig, configName) &&
      isString(loadedConfig[configName])
    ) {
      return loadedConfig[configName];
    }
  });

  const configuredPreload = arrayFind(config, (loadedConfig) => {
    if (!Object.prototype.hasOwnProperty.call(loadedConfig, 'preload')) return undefined;
    if (Array.isArray(loadedConfig.preload) && loadedConfig.preload.every(isString)) {
      return loadedConfig.preload;
    }
    if (isString(loadedConfig.preload)) return loadedConfig.preload;
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
    configPath: options.configPath || configuredPath,
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
  } catch (error) {}

  if (!modulePath && configPath) {
    const packagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(packagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(
        path.dirname(packagePath),
        modulePackage.main || 'index.js',
      );
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd,
    preload: preload.concat(configuredPreload || []),
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
  if (typeof this.v8flags === 'function') {
    this.v8flags((error, flags) => {
      if (error) callback(error);
      else callback(null, flags);
    });
  } else {
    process.nextTick(() => callback(null, this.v8flags));
  }
};

Liftoff.prototype.prepare = function prepare(options, callback) {
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  process.title = this.processTitle;
  const environment = this.buildEnvironment(options);
  callback.call(this, environment);
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
    flags = flags || [];

    flaggedRespawn(
      flags,
      process.argv,
      forcedFlags,
      function onRespawn(ready, child, argv) {
        if (child !== process) {
          const respawnFlags = fromReorderedArgv(argv);
          this.emit('respawn', respawnFlags, child);
        }

        if (ready) {
          preloadModules(this, environment);
          registerLoader(this, this.extensions, environment.configPath, environment.cwd);
          callback.call(this, environment, argv);
        }
      }.bind(this),
    );
  });
};

function preloadModules(context, environment) {
  const cwd = environment.cwd;
  environment.preload.filter(toUnique).forEach((moduleName) => {
    context.requireLocal(moduleName, cwd);
  });
}

function toUnique(value, index, array) {
  return array.indexOf(value) === index;
}

module.exports = Liftoff;
