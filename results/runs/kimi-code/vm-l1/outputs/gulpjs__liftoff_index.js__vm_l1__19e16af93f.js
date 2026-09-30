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

function isString(value) {
  return typeof value === 'string';
}

function findCwd(options) {
  return path.resolve(options.cwd || process.cwd());
}

function findFirst(values, predicate) {
  for (let index = 0; index < values.length; index += 1) {
    const result = predicate(values[index], index, values);
    if (result) return result;
  }
  return undefined;
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    return undefined;
  }
}

function fileSearch(filename, searchPaths) {
  for (const searchPath of searchPaths) {
    const located = fined(filename, {
      cwd: searchPath,
      upward: true,
    });
    if (located) return located.path;
  }
  return undefined;
}

function findConfig(options) {
  if (options.configPath) {
    const configPath = path.resolve(options.configPath);
    return fs.existsSync(configPath) ? configPath : null;
  }
  for (const searchPath of options.searchPaths) {
    for (const configName of options.configNameSearch) {
      const candidate = path.join(searchPath, configName);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function needsLookup(configPath, extensions) {
  return !Object.prototype.hasOwnProperty.call(extensions, path.extname(configPath));
}

function buildConfigName(options) {
  if (!options.configName) throw new Error('Please specify a configName.');
  return options.extensions.map(extension => `${options.configName}${extension}`);
}

function registerLoader(extension, extensions, configPath, cwd) {
  const loader = extensions[extension];
  if (!loader) return;

  const loaders = Array.isArray(loader) ? loader : [loader];
  let lastError;
  for (const loaderName of loaders) {
    try {
      require(resolve.sync(loaderName, { basedir: cwd || path.dirname(configPath) }));
      return;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
}

function getNodeFlags() {
  return process.execArgv.slice();
}

function parseOptions(options) {
  options = options || {};
  if (options.name) {
    options.processTitle = options.processTitle || options.name;
    options.configName = options.configName || `${options.name}file`;
    options.moduleName = options.moduleName || options.name;
  }
  if (!options.processTitle) throw new Error('You must specify a processTitle.');
  if (!options.configName) throw new Error('You must specify a configName.');
  if (!options.moduleName) throw new Error('You must specify a moduleName.');
  options.extensions = options.extensions || { '.js': null, '.json': null };
  options.searchPaths = options.searchPaths || [];
  return options;
}

function Liftoff(options) {
  EventEmitter.call(this);
  options = parseOptions(options);
  this.extensions = options.extensions;
  this.searchPaths = options.searchPaths;
  Object.assign(this, options);
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

  const locateConfigFile = (name, findOptions) => {
    const located = fined(name, findOptions);
    if (!located) return undefined;
    registerLoader(located.extension, extensions, located.path, cwd);
    return located.path;
  };

  const resolveConfigFile = (configPath, configExtensions) => {
    if (!needsLookup(configPath, configExtensions)) return configPath;
    return locateConfigFile(configPath, {
      cwd,
      extensions: configExtensions,
    });
  };

  const loadedConfigs = {};
  const loadConfig = (configCwd, configPath, destination) => {
    const resolvedPath = resolveConfigFile(configPath, extensions);
    if (!resolvedPath || loadedConfigs[resolvedPath]) return destination;
    loadedConfigs[resolvedPath] = true;

    const loaded = silentRequire(resolvedPath);
    if (!isPlainObject(loaded)) return destination;

    const parentConfig = loaded.extends;
    if (parentConfig) {
      const parents = Array.isArray(parentConfig) ? parentConfig : [parentConfig];
      for (const parent of parents) {
        const parentPath = path.resolve(path.dirname(resolvedPath), parent);
        loadConfig(configCwd, parentPath, destination);
      }
    }
    return extend(true, destination, loaded);
  };

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(configFile => locateConfigFile(configFile, {
      cwd,
      extensions,
    }));
  }

  const configs = configFiles.map(configFile => {
    if (!configFile) return {};
    return loadConfig(cwd, configFile, {});
  });

  const configuredPath = findFirst(configs, config => {
    if (Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName])) {
      return config[configName];
    }
    return undefined;
  });

  const configuredPreload = findFirst(configs, config => {
    if (!Object.prototype.hasOwnProperty.call(config, 'preload')) return undefined;
    if (Array.isArray(config.preload) && config.preload.every(isString)) return config.preload;
    if (isString(config.preload)) return config.preload;
    return undefined;
  });

  if (options.cwd) searchPaths = [cwd];
  else searchPaths.unshift(cwd);

  const configNameSearch = buildConfigName({
    configName,
    extensions: Object.keys(this.extensions),
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
    const nodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePath,
    });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {
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
    preload: preload.concat(configuredPreload || []),
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
  } else {
    process.nextTick(() => callback(null, this.v8flags));
  }
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
    flaggedRespawn(flags || [], process.argv, forcedFlags, (ready, child) => {
      if (!ready) return;
      if (child !== process) return;

      const nodeFlags = getNodeFlags();
      preloadModules(environment.preload, nodeFlags);
      if (environment.configPath) {
        registerLoader(
          path.extname(environment.configPath),
          this.extensions,
          environment.configPath,
          environment.cwd,
        );
      }
      callback.call(this, environment, process.argv);
    });
  });
  return undefined;
};

function preloadModules(modules, nodeFlags) {
  modules.filter(toUnique).forEach(moduleName => {
    if (!moduleName) return;
    if (nodeFlags.includes(moduleName)) return;
    require(moduleName);
  });
}

function toUnique(value, index, values) {
  return values.indexOf(value) === index;
}

module.exports = Liftoff;
