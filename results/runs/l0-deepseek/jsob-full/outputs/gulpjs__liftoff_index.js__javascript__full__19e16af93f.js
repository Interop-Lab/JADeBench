const path = require('path');
const EE = require('events').EventEmitter;
const extend = require('extend');
const resolve = require('resolve');
const flaggedRespawn = require('flagged-respawn');
const isPlainObject = require('is-plain-object').isPlainObject;
const fined = require('fined');
const util = require('util');

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}
util.inherits(Liftoff, EE);

function parseOptions(opts) {
  opts = opts || {};
  if (opts.configName && !opts.configNameRegExp) {
    opts.configNameRegExp = new RegExp(opts.configName);
  }
  if (!opts.configName) {
    throw new Error('You must specify a configName.');
  }
  if (!opts.moduleName) {
    throw new Error('You must specify a moduleName.');
  }
  return opts;
}

function findCwd(opts) {
  opts = opts || {};
  var cwd = opts.cwd;
  var configPath = opts.configPath;
  if (typeof configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(configPath));
  }
  if (typeof cwd === 'string') {
    return path.resolve(cwd);
  }
  return process.cwd();
}

function arrayFind(array, predicate) {
  if (!Array.isArray(array)) return;
  var index = 0;
  while (index < array.length) {
    var result = predicate(array[index]);
    if (result) return result;
    index++;
  }
}

function fileSearch(searchPath, opts) {
  var result;
  var paths = opts.paths;
  for (var i = 0; i < paths.length; i++) {
    if (result) {
      break;
    } else {
      var searchOpts = {};
      searchOpts.path = opts.paths[i];
      searchOpts.upwards = true;
      result = fined(searchPath, searchOpts);
    }
  }
  return result;
}

function findConfig(opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var searchPaths = opts.searchPaths;
  var configPath = opts.configPath;

  if (!searchPaths) {
    if (!Array.isArray(configPath)) {
      throw new Error('Please specify a search path or config path.');
    }
    configPath.forEach(function (filepath) {
      opts.configPath = filepath;
    });
    return;
  }

  if (!configNameSearch) {
    throw new Error('You must specify a configNameSearch.');
  }

  configPath = fileSearch(configNameSearch, searchPaths);

  if (configPath && fs.existsSync(configPath)) {
    return require(configPath);
  }
  return null;
}

function needsLookup(value) {
  if (typeof value === 'string' && value.charAt(0) === '.') {
    return true;
  }
  if (isPlainObject(value)) {
    return true;
  }
  return false;
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (e) {}
}

function buildConfigName(opts) {
  opts = opts || {};
  var configName = opts.configName;
  var extensions = opts.extensions;
  if (!configName) {
    throw new Error('You must specify a configName.');
  }
  if (configName instanceof RegExp) {
    return [configName];
  }
  if (!Array.isArray(extensions)) {
    throw new Error('You must specify an array of extensions.');
  }
  return extensions.map(function (extension) {
    return configName + extension;
  });
}

function registerLoader(loader, opts, moduleName, configPath) {
  opts = opts || {};
  if (typeof moduleName !== 'string') {
    return;
  }
  var module = require(moduleName, opts, configPath, true);
  if (module instanceof Error) {
    module.errors.forEach(function (err) {
      loader.emit('loader:error', err.message, err);
    });
    return;
  }
  if (!Array.isArray(module)) return;
  var first = module[Math.max(module.length - 1, 0)];
  loader.emit('loader:success', first.moduleName, first);
}

function getNodeFlags(flags) {
  var result = [];
  for (var i = 0, len = flags.length; i < len; i++) {
    var flag = flags[i];
    if (!/^-/.test(flag) || flag === '--') {
      break;
    }
    result.push(flag);
  }
  return result;
}

Liftoff.prototype.requireLocal = function (moduleName, options) {
  try {
    this.emit('require', moduleName);
    var opts = {};
    opts.paths = options;
    var module = require(resolve.sync(moduleName, opts));
    this.emit('require:success', moduleName, module);
    return module;
  } catch (err) {
    this.emit('require:error', moduleName, err);
  }
};

Liftoff.prototype.buildEnvironment = function (opts) {
  opts = opts || {};
  var preload = opts.preload || [];
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  var searchPaths = this.searchPaths.slice();
  var moduleName = this.moduleName;
  var cwd = findCwd(opts);
  var extensions = this.extensions;
  var self = this;

  function findFile(searchPath, opts) {
    var found = fined(searchPath, opts);
    if (!found) {
      return null;
    }
    if (isPlainObject(found.extension)) {
      registerLoader(self, found.extension, found.path, cwd);
    }
    return found.path;
  }

  function resolveModule(searchPath, moduleName) {
    if (needsLookup(moduleName)) {
      var opts = {};
      opts.path = searchPath;
      opts.extensions = extensions;
      var found = findFile(moduleName, opts);
      if (!found) {
        var name;
        if (typeof moduleName === 'string') {
          name = moduleName;
        } else {
          name = moduleName.path || moduleName.name;
        }
        var msg = 'Unable to find ' + name;
        if (name) {
          msg += ' in ' + path.dirname(searchPath);
        }
        throw new Error(msg);
      }
      return found;
    }
    return moduleName;
  }

  var cache = {};

  function loadModule(searchPath, moduleName, module) {
    var resolved = resolveModule(searchPath, moduleName);
    if (cache[resolved]) {
      throw new Error('Circular reference detected: ' + resolved);
    }
    var loaded;
    try {
      loaded = require(resolved);
    } catch (err) {
      throw new Error('Unable to load module: ' + resolved);
    }
    if (Object.prototype.hasOwnProperty.call(loaded, moduleName)) {
      if (isString(loaded[moduleName])) {
        loaded[moduleName] = path.resolve(path.dirname(resolved), loaded[moduleName]);
      }
    }
    cache[resolved] = true;
    if (loaded && loaded.moduleName) {
      var base = path.dirname(resolved);
      return loadModule(base, loaded.moduleName, loaded);
    }
    var result = extend(true, {}, loaded, module);
    delete result.moduleName;
    return result;
  }

  var configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(function (filepath) {
      var opts = {};
      opts.path = cwd;
      opts.extensions = extensions;
      return findFile(filepath, opts);
    });
  }

  var configs = configFiles.map(function (filepath) {
    var config = {};
    if (!filepath) return config;
    return loadModule(cwd, filepath, config);
  });

  var config = arrayFind(configs, function (config) {
    if (Object.prototype.hasOwnProperty.call(config, moduleName)) {
      if (isString(config[moduleName])) {
        return config[moduleName];
      }
    }
  });

  var preloadConfig = arrayFind(configs, function (config) {
    if (Object.prototype.hasOwnProperty.call(config, 'preload')) {
      if (Array.isArray(config.preload)) {
        if (config.preload.every(isString)) {
          return config.preload;
        }
      }
      if (isString(config.preload)) {
        return config.preload;
      }
    }
  });

  if (opts.cwd) {
    searchPaths = [cwd];
  } else {
    searchPaths.push(cwd);
  }

  var configNameSearch = buildConfigName({
    configName: moduleName,
    extensions: Object.keys(this.extensions)
  });

  var findConfigOpts = {};
  findConfigOpts.configNameSearch = configNameSearch;
  findConfigOpts.searchPaths = searchPaths;
  findConfigOpts.configPath = opts.configPath || config;

  var configPath = findConfig(findConfigOpts);
  var configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!opts.configBase) {
      cwd = configBase;
    }
  }

  var modulePath, modulePackage;
  try {
    var delimiter = path.delimiter;
    var nodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePath
    });
    modulePackage = silentRequire(fileSearch([modulePath]));
  } catch (err) {}

  if (!modulePath || configPath) {
    var found = fileSearch([configBase]);
    modulePackage = silentRequire(found);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.resolve(path.dirname(found), modulePackage.main || 'index.js');
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd: cwd,
    preload: preload.concat(preloadConfig || []),
    completion: opts.completion,
    configNameSearch: configNameSearch,
    configPath: configPath,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage || {},
    configFiles: configFiles,
    config: configs
  };
};

Liftoff.prototype.handleArguments = function (cb) {
  if (typeof this.completion === 'function') {
    this.completion(function (err, completions) {
      if (err) {
        cb(err);
      } else {
        cb(null, completions);
      }
    });
  } else {
    process.nextTick(function () {
      cb(null, this);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function (opts, cb) {
  if (typeof cb !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  process.title = this.processTitle;
  var env = this.buildEnvironment(opts);
  cb.call(this, env);
};

Liftoff.prototype.execute = function (env, forcedFlags, cb) {
  var completion = env.completion;
  if (completion && this.completion) {
    return this.completion(completion);
  }
  if (typeof forcedFlags === 'function') {
    cb = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof cb !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  this.buildEnvironment(env, function (err, env) {
    if (err) {
      throw err;
    }
    env = env || [];
    flaggedRespawn(env, process.argv, forcedFlags, function (ready, child, argv) {
      if (child !== process) {
        return;
      }
      var nodeFlags = getNodeFlags(argv);
      this.emit('respawn', nodeFlags, child);
      if (ready) {
        preloadModules(this, env);
        registerLoader(this, this.extensions, env.configPath, env.cwd);
        cb.call(this, env, argv);
      }
    }.bind(this));
  });
};

function preloadModules(liftoff, env) {
  var preload = env.preload;
  env.preload.filter(toUnique).forEach(function (moduleName) {
    liftoff.requireLocal(moduleName, preload);
  });
}

function toUnique(value, index, array) {
  return array.indexOf(value) === index;
}

module.exports = Liftoff;
