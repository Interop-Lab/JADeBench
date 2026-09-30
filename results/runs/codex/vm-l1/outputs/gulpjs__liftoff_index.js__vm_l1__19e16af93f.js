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
  if (options.cwd) {
    return path.resolve(options.cwd);
  }
  return process.cwd();
}

function arrayFind(values, callback) {
  for (let index = 0; index < values.length; index += 1) {
    const result = callback(values[index], index, values);
    if (result) {
      return result;
    }
  }
  return undefined;
}

function fileSearch(fileNames, searchPaths) {
  const names = Array.isArray(fileNames) ? fileNames : [fileNames];

  return arrayFind(searchPaths, (searchPath) => {
    let directory = searchPath;
    try {
      if (fs.statSync(directory).isFile()) {
        directory = path.dirname(directory);
      }
    } catch (error) {
      directory = path.extname(directory) ? path.dirname(directory) : directory;
    }

    while (true) {
      const match = arrayFind(names, (fileName) => {
        const candidate = path.join(directory, fileName);
        try {
          if (fs.statSync(candidate).isFile()) {
            return candidate;
          }
        } catch (error) {
          if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
            throw error;
          }
        }
        return undefined;
      });
      if (match) {
        return match;
      }

      const parent = path.dirname(directory);
      if (parent === directory) {
        return undefined;
      }
      directory = parent;
    }
  });
}

function findConfig(options) {
  if (options.configPath) {
    return path.resolve(options.configPath);
  }
  return fileSearch(options.configNameSearch, options.searchPaths);
}

function needsLookup(moduleName) {
  return isString(moduleName) && moduleName[0] !== '.' && !path.isAbsolute(moduleName);
}

function parseOptions(options) {
  const parsed = options || {};
  parsed.name = parsed.name || 'unknown';
  parsed.extensions = parsed.extensions || { '.js': null };
  parsed.searchPaths = parsed.searchPaths || [];
  parsed.processTitle = parsed.processTitle || parsed.name;
  parsed.configName = parsed.configName || parsed.name + 'file';
  parsed.moduleName = parsed.moduleName || parsed.name;
  return parsed;
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    return undefined;
  }
}

function buildConfigName(options) {
  return options.extensions.map((extension) => options.configName + extension);
}

function registerLoader(extensions, configPath) {
  if (!configPath) {
    return;
  }
  const loader = extensions[path.extname(configPath)];
  if (loader == null) {
    return;
  }

  const loaders = Array.isArray(loader) ? loader : [loader];
  loaders.forEach((loaderModule) => {
    if (typeof loaderModule === 'function') {
      loaderModule();
    } else {
      require(loaderModule);
    }
  });
}

function getNodeFlags(argv) {
  if (!Array.isArray(argv)) {
    return [];
  }
  return argv
    .filter((argument) => isString(argument) && argument[0] === '-')
    .filter(toUnique);
}

function Liftoff(options) {
  EventEmitter.call(this);

  const parsed = parseOptions(options);
  this.extensions = parsed.extensions;
  this.searchPaths = parsed.searchPaths;
  this.name = parsed.name;
  this.v8flags = parsed.v8flags;
  this.processTitle = parsed.processTitle;
  this.configName = parsed.configName;
  this.moduleName = parsed.moduleName;
  this.configFiles = parsed.configFiles;
  this.completions = parsed.completions;
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(moduleName, cwd) {
  try {
    this.emit('preload:before', moduleName);
    const loadedModule = require(resolve.sync(moduleName, { basedir: cwd }));
    this.emit('preload:success', moduleName, loadedModule);
    return loadedModule;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  const environmentOptions = options || {};
  let preload = environmentOptions.preload || [];
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  let searchPaths = this.searchPaths.slice();
  const configName = this.configName;
  let cwd = findCwd(environmentOptions);
  const extensions = this.extensions;

  const locateFile = (file, locateOptions) => {
    let fileName = file;
    let finedOptions = locateOptions;
    if (isPlainObject(file)) {
      fileName = file.name;
      finedOptions = extend({}, locateOptions, file);
      delete finedOptions.name;
    }

    const found = fined(fileName, finedOptions);
    if (!found) {
      return undefined;
    }

    const foundPath = isString(found) ? found : found.path;
    const extension = isString(found) ? path.extname(found) : found.extension;
    const loader = extensions[extension];
    registerLoader(extensions, foundPath);
    return foundPath;
  };

  const loadConfig = (configPath) => {
    const extension = path.extname(configPath);
    const loader = extensions[extension];
    if (loader != null && needsLookup(loader)) {
      locateFile(loader, { cwd: path.dirname(configPath), extensions });
    }
    return require(configPath);
  };

  const loadedConfigs = Object.create(null);
  const readConfig = (configCwd, configPath, result) => {
    if (loadedConfigs[configPath]) {
      return result;
    }
    loadedConfigs[configPath] = true;

    let config = loadConfig(configPath);
    if (config && Object.prototype.hasOwnProperty.call(config, configName)) {
      config = config[configName];
    }
    if (!isPlainObject(config)) {
      return result;
    }

    if (isString(config.extends)) {
      const parentPath = path.resolve(configCwd, config.extends);
      result = readConfig(path.dirname(parentPath), parentPath, result);
    }
    return extend(true, result, config);
  };

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map((configFile) =>
      locateFile(configFile, { cwd, extensions }),
    );
  }

  const config = configFiles.map((configPath) => {
    if (!configPath) {
      return {};
    }
    return readConfig(cwd, configPath, {});
  });

  const configuredPath = arrayFind(config, (value) => {
    if (Object.prototype.hasOwnProperty.call(value, configName) && isString(value[configName])) {
      return value[configName];
    }
    return undefined;
  });

  const configuredPreload = arrayFind(config, (value) => {
    if (!Object.prototype.hasOwnProperty.call(value, 'preload')) {
      return undefined;
    }
    if (Array.isArray(value.preload) && value.preload.every(isString)) {
      return value.preload;
    }
    return isString(value.preload) ? value.preload : undefined;
  });

  if (environmentOptions.cwd) {
    searchPaths = [cwd];
  } else {
    searchPaths.unshift(cwd);
  }

  const configNameSearch = buildConfigName({
    configName,
    extensions: Object.keys(this.extensions),
  });
  const configPath = findConfig({
    configNameSearch,
    searchPaths,
    configPath: environmentOptions.configPath || configuredPath,
  });
  let configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!environmentOptions.cwd) {
      cwd = configBase;
    }
  }

  let modulePath;
  let modulePackage;
  try {
    const nodePaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePaths,
    });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {
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
    completion: environmentOptions.completion,
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
      if (error) {
        callback(error);
      } else {
        callback(null, flags);
      }
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
    if (error) {
      throw error;
    }
    flaggedRespawn(flags || [], process.argv, forcedFlags, (ready, child, argv) => {
      if (!ready) {
        this.emit('respawn', child, getNodeFlags(argv));
        return;
      }

      registerLoader(this.extensions, environment.configPath);
      preloadModules(environment.preload);
      callback.call(this, environment);
    });
  });
};

function preloadModules(modules) {
  modules.forEach((moduleName) => {
    require(moduleName);
  });
}

function toUnique(value, index, values) {
  return values.indexOf(value) === index;
}

module.exports = Liftoff;
