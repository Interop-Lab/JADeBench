'use strict';

var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object').isPlainObject;
var fined = require('fined');
var rechoir = require('rechoir');

function isString(value) {
  return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
}

function findCwd(options) {
  return path.resolve(options.cwd || process.cwd());
}

function arrayFind(array, predicate) {
  for (var index = 0; index < array.length; index++) {
    if (predicate(array[index], index, array)) return array[index];
  }
}

function fileSearch(name, searchPaths) {
  for (var index = 0; index < searchPaths.length; index++) {
    var result = fined({ path: name, cwd: searchPaths[index] });
    if (result) return result.path;
  }
}

function findConfig(options) {
  var result = fined({
    path: options.configPath || options.configNameSearch,
    cwd: options.searchPaths[0],
    findUp: !options.configPath,
  });
  return result && result.path;
}

function silentRequire(modulePath) {
  if (!modulePath) return;
  try {
    return require(modulePath);
  } catch (error) {
    return;
  }
}

function buildConfigName(options) {
  return (options.extensions || []).map(function (extension) {
    return options.configName + extension;
  });
}

function registerLoader(configPath, extensions, cwd) {
  if (!configPath) return;
  return rechoir.prepare(extensions, configPath, cwd, true);
}

function parseOptions(configPath, cwd, extensions) {
  var located = fined(configPath, { cwd: cwd, extensions: extensions, findUp: true });
  if (!located) return;
  registerLoader(located.path, extensions, cwd);
  return located.path;
}

function getNodeFlags() {
  var allowed = process.allowedNodeEnvironmentFlags;
  if (!allowed) return [];
  return process.execArgv.filter(function (flag) {
    return allowed.has(flag.split('=')[0]);
  });
}

function preloadModules(modules, callback) {
  modules = modules || [];
  if (!Array.isArray(modules)) modules = [modules];
  try {
    modules.forEach(function (moduleName) { require(moduleName); });
    callback();
  } catch (error) {
    callback(error);
  }
}

function Liftoff(options) {
  EventEmitter.call(this);
  options = extend({ extensions: { '.js': null }, searchPaths: [] }, options);
  this.extensions = options.extensions;
  this.searchPaths = options.searchPaths;
  this.name = options.name;
  this.configName = options.configName;
  this.moduleName = options.moduleName;
  this.processTitle = options.processTitle;
  this.v8flags = options.v8flags;
  this.completions = options.completions;
  this.configFiles = options.configFiles;
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function (moduleName, basedir) {
  try {
    this.emit('preload:before', moduleName);
    var localModule = require(resolve.sync(moduleName, { basedir: basedir }));
    this.emit('preload:success', moduleName, localModule);
    return localModule;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
  }
};

Liftoff.prototype.buildEnvironment = function (options) {
  options = options || {};
  var preload = options.preload || [];
  if (!Array.isArray(preload)) preload = [preload];
  var searchPaths = this.searchPaths.slice();
  var configName = this.configName;
  var cwd = findCwd(options);
  var extensions = this.extensions;
  var configFiles = [];

  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(function (configFile) {
      return parseOptions(configFile, cwd, extensions);
    });
  }
  var configs = configFiles.map(function (configFile) {
    return configFile ? silentRequire(configFile) || {} : {};
  });
  var configuredPath = arrayFind(configs, function (config) {
    return Object.prototype.hasOwnProperty.call(config, configName) && isString(config[configName]);
  });
  configuredPath = configuredPath && configuredPath[configName];
  var configuredPreload = arrayFind(configs, function (config) {
    if (!Object.prototype.hasOwnProperty.call(config, 'preload')) return false;
    return Array.isArray(config.preload) ? config.preload.every(isString) : isString(config.preload);
  });
  configuredPreload = configuredPreload && configuredPreload.preload;

  if (options.cwd) searchPaths = [cwd];
  else searchPaths.push(cwd);
  var configNameSearch = buildConfigName({ configName: configName, extensions: Object.keys(extensions) });
  var configPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: options.configPath || configuredPath,
  });
  var configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!options.cwd) cwd = configBase;
  }

  var modulePath;
  var modulePackage;
  try {
    var nodePaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
    modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: nodePaths });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {}
  if (!modulePath && configPath) {
    var packagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(packagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(path.dirname(packagePath), modulePackage.main || 'index.js');
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }
  return {
    cwd: cwd,
    preload: preload.concat(configuredPreload || []),
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

Liftoff.prototype.launch = function (callback) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function (error, flags) {
      error ? callback(error) : callback(null, flags);
    });
  } else {
    process.nextTick(function () { callback(null, this.v8flags); }.bind(this));
  }
};

Liftoff.prototype.prepare = function (options, callback) {
  if (typeof callback !== 'function') throw new Error('You must provide a callback function.');
  process.title = this.processTitle;
  callback.call(this, this.buildEnvironment(options));
};

Liftoff.prototype.execute = function (environment, forcedFlags, callback) {
  if (environment.completion && this.completions) return this.completions(environment.completion);
  if (typeof forcedFlags === 'function') {
    callback = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof callback !== 'function') throw new Error('You must provide a callback function.');
  this.launch(function (error, flags) {
    if (error) throw error;
    flaggedRespawn(flags || [], process.argv, forcedFlags, function (ready, child, argv) {
      if (!ready) return callback(null, environment, child, argv);
      preloadModules(environment.preload, function (preloadError) {
        if (preloadError) return callback(preloadError, environment, child, argv);
        if (environment.configPath) {
          registerLoader(environment.configPath, this.extensions, environment.configBase);
        }
        callback(null, environment, child, argv);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

module.exports = Liftoff;
