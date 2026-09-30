var util = require('util');
var path = require('path');
var EE = require('events').EventEmitter;
var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object').isPlainObject;
var fined = require('fined');

var findCwd = require('./lib/find_cwd');
var arrayFind = require('./lib/array_find');
var findConfig = require('./lib/find_config');
var fileSearch = require('./lib/file_search');
var needsLookup = require('./lib/needs_lookup');
var parseOptions = require('./lib/parse_options');
var silentRequire = require('./lib/silent_require');
var buildConfigName = require('./lib/build_config_name');
var registerLoader = require('./lib/register_loader');
var getNodeFlags = require('./lib/get_node_flags');

function isString(obj) {
  return typeof obj === 'string';
}

function Liftoff(opts) {
  EE.call(this);
  extend(this, opts);
}

util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(moduleName, basedir) {
  try {
    this.emit('require', moduleName);
    var result = require(resolve.sync(moduleName, { basedir: basedir }));
    this.emit('require:success', moduleName, result);
    return result;
  } catch (error) {
    this.emit('require:fail', moduleName, error);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};
  var preload = opts.preload || [];
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  var searchPaths = this.searchPaths.slice();
  var configName = this.configName;
  var cwd = findCwd(opts);
  var extensions = this.extensions;
  var self = this;

  function findConfigFile(configName, searchPaths) {
    var configFiles = {};
    if (!configName) return configFiles;
    return findConfig({
      configNameSearch: buildConfigName({
        configName: configName,
        extensions: Object.keys(extensions)
      }),
      searchPaths: searchPaths,
      configPath: configFiles[configName]
    });
  }

  function findConfigFiles(configFiles) {
    var results = {};
    Object.keys(configFiles).forEach(function(key) {
      var configFile = configFiles[key];
      if (configFile) {
        results[key] = findConfigFile(configFile, searchPaths);
      }
    });
    return results;
  }

  var configFiles = {};
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.reduce(function(acc, configFile) {
      var found = fined({
        path: configFile,
        cwd: cwd,
        extensions: extensions
      });
      if (found) {
        acc[configFile] = found;
      }
      return acc;
    }, {});
  }

  var config = Object.keys(configFiles).reduce(function(acc, key) {
    var configFile = configFiles[key];
    if (configFile) {
      acc[key] = silentRequire(configFile);
    }
    return acc;
  }, {});

  var configPath = arrayFind(Object.keys(config), function(key) {
    if (isString(config[key])) {
      return config[key];
    }
  });

  var preloadModule = arrayFind(Object.keys(config), function(key) {
    if (Array.isArray(config[key])) {
      if (config[key].every(isString)) {
        return config[key];
      }
    }
    if (isString(config[key])) {
      return config[key];
    }
  });

  opts.cwd ? searchPaths = [cwd] : searchPaths.unshift(cwd);

  var configNameSearch = buildConfigName({
    configName: configName,
    extensions: Object.keys(this.extensions)
  });

  var foundConfigPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: opts.configPath || configPath
  });

  var configBase;
  if (foundConfigPath) {
    configBase = path.dirname(foundConfigPath);
    if (!opts.cwd) {
      cwd = configBase;
    }
  }

  var modulePath, modulePackage;
  try {
    var delimiter = path.delimiter;
    var nodePaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePaths
    });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {}

  if (!modulePath && foundConfigPath) {
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
    preload: preload.concat(preloadModule || []),
    completion: opts.completion,
    configNameSearch: configNameSearch,
    configPath: foundConfigPath,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage || {},
    configFiles: configFiles,
    config: config
  };
};

Liftoff.prototype.getV8Flags = function(callback) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function(err, flags) {
      if (err) {
        callback(err);
      } else {
        callback(null, flags);
      }
    });
  } else {
    process.nextTick(callback.bind(null, null, this.v8flags));
  }
};

Liftoff.prototype.preloadModules = function(modules, callback) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }
  var self = this;
  modules.forEach(function(module) {
    self.requireLocal(module, process.cwd());
  });
  if (callback) {
    callback();
  }
};

Liftoff.prototype.prepare = function(opts, callback) {
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  process.title = this.processTitle;
  var env = this.buildEnvironment(opts);
  callback.call(this, env);
};

Liftoff.prototype.execute = function(env, argv, callback) {
  var completion = env.completion;
  if (completion && this.completion) {
    return this.completion(completion);
  }
  if (typeof argv === 'function') {
    callback = argv;
    argv = undefined;
  }
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  this.getV8Flags(function(err, flags) {
    if (err) {
      throw err;
    }
    flags = flags || [];
    flaggedRespawn(flags, process.argv, argv, respawn.bind(this));
    function respawn(respawnArgs, respawnArgv, respawnFlags) {
      if (respawnFlags) {
        registerLoader(respawnFlags, this);
      }
      var env = this.buildEnvironment(opts);
      this.preloadModules(env.preload, function() {
        callback.call(this, env, argv);
      }.bind(this));
    }
  }.bind(this));
};

function preloadModules(modules, callback) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }
  modules.forEach(function(module) {
    require(module);
  });
  if (callback) {
    callback();
  }
}

function toUnique(array) {
  return array.filter(function(item, index, self) {
    return self.indexOf(item) === index;
  });
}

module.exports = Liftoff;
