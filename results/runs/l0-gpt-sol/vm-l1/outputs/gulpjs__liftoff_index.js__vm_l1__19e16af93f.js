'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObjectModule = require('is-plain-object');
var fined = require('fined');

var isPlainObject =
  isPlainObjectModule.isPlainObject || isPlainObjectModule;

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function toUnique(value, index, array) {
  return array.indexOf(value) === index;
}

function arrayFind(array, predicate) {
  if (Array.prototype.find) {
    return array.find(predicate);
  }

  for (var index = 0; index < array.length; index++) {
    if (predicate(array[index], index, array)) {
      return array[index];
    }
  }

  return undefined;
}

function findCwd(options) {
  if (options && options.cwd) {
    return path.resolve(options.cwd);
  }

  return process.cwd();
}

function isFile(filename) {
  if (!filename) {
    return false;
  }

  try {
    return fs.statSync(filename).isFile();
  } catch (error) {
    return false;
  }
}

function fileSearch(filename, searchPaths) {
  if (!filename) {
    return null;
  }

  for (var index = 0; index < searchPaths.length; index++) {
    var current = path.resolve(searchPaths[index]);

    try {
      if (fs.statSync(current).isFile()) {
        current = path.dirname(current);
      }
    } catch (error) {
      if (path.extname(current)) {
        current = path.dirname(current);
      }
    }

    while (true) {
      var candidate = path.join(current, filename);

      if (isFile(candidate)) {
        return candidate;
      }

      var parent = path.dirname(current);
      if (parent === current) {
        break;
      }

      current = parent;
    }
  }

  return null;
}

function findConfig(options) {
  options = options || {};

  if (options.configPath) {
    var explicitPath = path.resolve(options.configPath);
    return isFile(explicitPath) ? explicitPath : null;
  }

  var names = options.configNameSearch || [];
  var searchPaths = options.searchPaths || [];

  if (!Array.isArray(names)) {
    names = [names];
  }

  for (var pathIndex = 0; pathIndex < searchPaths.length; pathIndex++) {
    var current = path.resolve(searchPaths[pathIndex]);

    while (true) {
      for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
        var candidate = path.join(current, names[nameIndex]);

        if (isFile(candidate)) {
          return candidate;
        }
      }

      var parent = path.dirname(current);
      if (parent === current) {
        break;
      }

      current = parent;
    }
  }

  return null;
}

function needsLookup(loader) {
  return (
    isString(loader) ||
    Array.isArray(loader) ||
    (loader && typeof loader === 'object' && loader.module)
  );
}

function silentRequire(filename) {
  if (!filename) {
    return null;
  }

  try {
    return require(filename);
  } catch (error) {
    return null;
  }
}

function buildConfigName(options) {
  options = options || {};

  var configNames = Array.isArray(options.configName)
    ? options.configName
    : [options.configName];

  var extensions = options.extensions || [];
  if (!Array.isArray(extensions)) {
    extensions = Object.keys(extensions);
  }

  var names = [];

  configNames.forEach(function (configName) {
    if (!configName) {
      return;
    }

    if (!extensions.length || path.extname(configName)) {
      names.push(configName);
      return;
    }

    extensions.forEach(function (extension) {
      extension = String(extension);
      if (extension.charAt(0) !== '.') {
        extension = '.' + extension;
      }
      names.push(configName + extension);
    });
  });

  return names.filter(toUnique);
}

function normalizeLoaders(loader) {
  if (!loader) {
    return [];
  }

  if (Array.isArray(loader)) {
    return loader;
  }

  if (isString(loader)) {
    return [loader];
  }

  if (loader.module) {
    return Array.isArray(loader.module) ? loader.module : [loader.module];
  }

  return [];
}

function registerLoader(instance, configPath) {
  if (!configPath) {
    return true;
  }

  var extension = path.extname(configPath);
  var loader = instance.extensions && instance.extensions[extension];

  if (!loader) {
    return true;
  }

  var loaders = normalizeLoaders(loader);
  var lastError;

  for (var index = 0; index < loaders.length; index++) {
    var moduleName = loaders[index];

    try {
      instance.emit('loader:before', moduleName);
      var loaded = instance.requireLocal(moduleName, path.dirname(configPath));

      if (loaded === undefined) {
        loaded = require(moduleName);
      }

      instance.emit('loader:success', moduleName, loaded);
      return true;
    } catch (error) {
      lastError = error;
      instance.emit('loader:failure', moduleName, error);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return true;
}

function getNodeFlags() {
  return process.execArgv.slice().filter(toUnique);
}

function preloadModules(instance, modules) {
  if (!modules) {
    return;
  }

  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  modules.filter(Boolean).forEach(function (moduleName) {
    instance.emit('preload:before', moduleName);

    try {
      var loaded = require(moduleName);
      instance.emit('preload:success', moduleName, loaded);
    } catch (error) {
      instance.emit('preload:failure', moduleName, error);
    }
  });
}

function normalizeConfigFile(configFile, options) {
  if (!configFile) {
    return null;
  }

  if (isString(configFile)) {
    configFile = {
      name: configFile,
    };
  }

  var result;

  try {
    result = fined(configFile, options);
  } catch (error) {
    result = null;
  }

  return result || null;
}

function loadConfigFileResult(result, extensions, instance) {
  if (!result) {
    return {};
  }

  if (isString(result)) {
    return result;
  }

  var filename = result.path || result.configPath || result.filepath;

  if (filename && needsLookup(extensions[path.extname(filename)])) {
    registerLoader(instance, filename);
  }

  if (filename) {
    var loaded = silentRequire(filename);
    if (loaded !== null) {
      return loaded;
    }
  }

  return result;
}

function Liftoff(options) {
  EventEmitter.call(this);

  options = extend(
    true,
    {
      name: 'app',
      processTitle: 'app',
      configName: 'appfile',
      moduleName: 'app',
      extensions: {
        '.js': null,
        '.json': null,
      },
      searchPaths: [],
      configFiles: [],
      completions: null,
      v8flags: null,
    },
    options || {}
  );

  this.name = options.name;
  this.processTitle = options.processTitle;
  this.configName = options.configName;
  this.moduleName = options.moduleName;
  this.extensions = options.extensions;
  this.searchPaths = options.searchPaths || [];
  this.configFiles = options.configFiles || [];
  this.completions = options.completions;
  this.v8flags = options.v8flags;
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(moduleName, basedir) {
  try {
    this.emit('preload:before', moduleName);

    var localModule = require(
      resolve.sync(moduleName, {
        basedir: basedir,
      })
    );

    this.emit('preload:success', moduleName, localModule);
    return localModule;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  options = options || {};

  var preload = options.preload || [];
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  var searchPaths = this.searchPaths.slice();
  var configName = this.configName;
  var cwd = findCwd(options);
  var extensions = this.extensions;
  var instance = this;

  function resolveConfigFile(configFile, finedOptions) {
    finedOptions = extend(
      {
        cwd: cwd,
        extensions: extensions,
      },
      finedOptions || {}
    );

    return normalizeConfigFile(configFile, finedOptions);
  }

  function resolveConfigValue(configFile) {
    return loadConfigFileResult(configFile, extensions, instance);
  }

  var configFiles = [];

  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(function (configFile) {
      return resolveConfigFile(configFile, {
        cwd: cwd,
        extensions: extensions,
      });
    });
  }

  var configs = configFiles.map(function (configFile) {
    if (!configFile) {
      return {};
    }

    return resolveConfigValue(configFile);
  });

  var configPathFromFiles = arrayFind(configs, function (config) {
    if (
      config &&
      Object.prototype.hasOwnProperty.call(config, configName) &&
      isString(config[configName])
    ) {
      return config[configName];
    }

    return undefined;
  });

  var preloadFromFiles = arrayFind(configs, function (config) {
    if (!config || !Object.prototype.hasOwnProperty.call(config, 'preload')) {
      return undefined;
    }

    if (Array.isArray(config.preload)) {
      if (config.preload.every(isString)) {
        return config.preload;
      }
      return undefined;
    }

    if (isString(config.preload)) {
      return config.preload;
    }

    return undefined;
  });

  if (options.cwd) {
    searchPaths = [cwd];
  } else {
    searchPaths.unshift(cwd);
  }

  var configNameSearch = buildConfigName({
    configName: configName,
    extensions: Object.keys(this.extensions),
  });

  var configPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: options.configPath || configPathFromFiles,
  });

  var configBase;

  if (configPath) {
    configBase = path.dirname(configPath);

    if (!options.cwd) {
      cwd = configBase;
    }
  }

  var modulePath;
  var modulePackage;

  try {
    var delimiter = path.delimiter;
    var nodePath = process.env.NODE_PATH
      ? process.env.NODE_PATH.split(delimiter)
      : [];

    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePath,
    });

    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {
    modulePath = undefined;
    modulePackage = undefined;
  }

  if (!modulePath && configPath) {
    var packagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(packagePath);

    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(
        path.dirname(packagePath),
        modulePackage.main || 'index.js'
      );
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd: cwd,
    preload: preload.concat(preloadFromFiles || []),
    completion: options.completion,
    configNameSearch: configNameSearch,
    configPath: configPath,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage || {},
    configFiles: configFiles,
    config: configs,
  };
};

Liftoff.prototype.handleFlags = function handleFlags(callback) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function (error, flags) {
      if (error) {
        callback(error);
      } else {
        callback(null, flags);
      }
    });
    return;
  }

  process.nextTick(
    function () {
      callback(null, this.v8flags);
    }.bind(this)
  );
};

Liftoff.prototype.prepare = function prepare(options, callback) {
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  process.title = this.processTitle;

  var environment = this.buildEnvironment(options);
  callback.call(this, environment);
};

Liftoff.prototype.execute = function execute(
  environment,
  forceRespawn,
  callback
) {
  var completion = environment.completion;

  if (completion && this.completions) {
    return this.completions(completion);
  }

  if (typeof forceRespawn === 'function') {
    callback = forceRespawn;
    forceRespawn = undefined;
  }

  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags(
    function (error, flags) {
      if (error) {
        throw error;
      }

      flags = flags || [];

      flaggedRespawn(
        flags,
        process.argv,
        forceRespawn,
        function (ready, child, argv) {
          if (ready) {
            this.emit('respawn', argv || process.argv, child);
            return;
          }

          environment.nodeFlags = getNodeFlags();

          preloadModules(this, environment.preload);

          if (environment.configPath) {
            registerLoader(this, environment.configPath);
          }

          callback.call(this, environment);
        }.bind(this)
      );
    }.bind(this)
  );
};

module.exports = Liftoff;
