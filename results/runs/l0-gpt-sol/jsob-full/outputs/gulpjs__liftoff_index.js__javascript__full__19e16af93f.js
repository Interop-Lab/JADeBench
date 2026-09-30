'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');
var extend = require('extend');
var resolve = require('resolve');
var fined = require('fined');
var isPlainObject = require('is-plain-object').isPlainObject;
var flaggedRespawn = require('flagged-respawn');

function isString(value) {
  return typeof value === 'string';
}

function arrayFind(array, predicate) {
  if (!Array.isArray(array)) {
    return;
  }

  for (var i = 0; i < array.length; i++) {
    var result = predicate(array[i]);
    if (result) {
      return result;
    }
  }
}

function fileSearch(name, paths) {
  for (var i = 0; i < paths.length; i++) {
    var candidate = path.join(paths[i], name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
}

function silentRequire(name) {
  try {
    return require(name);
  } catch (error) {
    return undefined;
  }
}

function needsLookup(name) {
  return typeof name === 'string' && name[0] === '.';
}

function findCwd(options) {
  options = options || {};

  var cwd = options.cwd;
  var cwdPath = options.cwdPath;
  var cwdName = options.cwdName;

  if (!cwd) {
    cwd = process.cwd();
  }

  if (!cwdPath) {
    cwdPath = cwd;
  }

  if (!cwdName) {
    cwdName = path.basename(cwdPath);
  }

  return {
    cwd: cwd,
    cwdPath: cwdPath,
    cwdName: cwdName
  };
}

function parseOptions(options) {
  options = options || {};

  var parsed = {
    name: options.name,
    configName: options.configName,
    extensions: options.extensions || [],
    v8flags: options.v8flags || []
  };

  if (!parsed.name) {
    parsed.name = path.basename(process.argv[1] || '', path.extname(process.argv[1] || ''));
  }

  if (!parsed.configName) {
    parsed.configName = parsed.name + 'file';
  }

  if (!Array.isArray(parsed.extensions)) {
    parsed.extensions = [parsed.extensions];
  }

  if (!Array.isArray(parsed.v8flags)) {
    parsed.v8flags = [parsed.v8flags];
  }

  return parsed;
}

function buildConfigName(options) {
  options = options || {};

  var configName = options.configName;
  var extensions = options.extensions || [];

  if (!configName) {
    throw new Error('configName is required');
  }

  if (configName instanceof RegExp) {
    return [configName];
  }

  if (!Array.isArray(extensions)) {
    throw new Error('extensions must be an array');
  }

  return extensions.map(function (extension) {
    return configName + extension;
  });
}

function findConfig(options) {
  options = options || {};

  var configName = options.configName;
  var cwd = options.cwd;
  var config = options.config;
  var configPath = options.configPath;

  if (!configName) {
    throw new Error('configName is required');
  }

  if (!cwd) {
    cwd = process.cwd();
  }

  if (configPath) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    return null;
  }

  var names = Array.isArray(configName) ? configName : [configName];

  for (var i = 0; i < names.length; i++) {
    var name = names[i];

    if (name instanceof RegExp) {
      var entries = fs.readdirSync(cwd);
      for (var j = 0; j < entries.length; j++) {
        if (name.test(entries[j])) {
          return path.join(cwd, entries[j]);
        }
      }
    } else {
      var candidate = path.join(cwd, name);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function getNodeFlags(args) {
  if (!Array.isArray(args)) {
    return [];
  }

  return args.filter(function (arg) {
    return typeof arg === 'string' && arg.indexOf('--') === 0;
  });
}

function registerLoader(loader, extensions, configPath, cwd) {
  if (!loader || typeof loader !== 'object') {
    return;
  }

  if (!extensions || typeof extensions !== 'object') {
    return;
  }

  Object.keys(extensions).forEach(function (extension) {
    var handler = extensions[extension];

    if (typeof handler === 'string') {
      handler = require(path.resolve(cwd || process.cwd(), handler));
    }

    if (typeof handler === 'function') {
      require.extensions[extension] = handler;
    }
  });
}

function preloadModules(context, modules) {
  if (!Array.isArray(modules)) {
    return;
  }

  modules
    .filter(function (moduleName, index, list) {
      return list.indexOf(moduleName) === index;
    })
    .forEach(function (moduleName) {
      context.require(moduleName);
    });
}

function Liftoff(options) {
  events.EventEmitter.call(this);
  extend(this, parseOptions(options));
}

util.inherits(Liftoff, events.EventEmitter);

Liftoff.prototype.require = function (modulePath, moduleName) {
  this.emit('require', modulePath);

  try {
    var resolved = resolve.sync(modulePath, {
      basedir: this.cwd || process.cwd()
    });
    var loaded = require(resolved);

    if (moduleName && loaded && isString(loaded[moduleName])) {
      loaded[moduleName] = path.resolve(path.dirname(resolved), loaded[moduleName]);
    }

    this.emit('requireSuccess', modulePath, loaded);
    return loaded;
  } catch (error) {
    this.emit('requireFail', modulePath, error);
    throw error;
  }
};

Liftoff.prototype.preload = function (modules, callback) {
  if (typeof modules === 'function') {
    callback = modules;
    modules = [];
  }

  modules = modules || [];

  try {
    preloadModules(this, modules);
    this.emit('preload', modules);
    if (callback) {
      callback();
    }
  } catch (error) {
    if (callback) {
      callback(error);
    } else {
      throw error;
    }
  }
};

Liftoff.prototype.respawn = function (flags, callback) {
  flags = flags || [];
  callback = callback || function () {};

  flaggedRespawn(flags, process.execPath, this.v8flags, function (error) {
    callback(error);
  }, this);
};

Liftoff.prototype.execute = function (env, callback) {
  callback = callback || function () {};

  if (!env) {
    return callback(new Error('Unable to find a configuration file.'));
  }

  if (env.configPath) {
    this.require(env.configPath, this.name);
  }

  callback(null, env);
};

Liftoff.prototype.launch = function (options, callback) {
  options = options || {};
  callback = callback || function () {};

  var cwd = options.cwd || process.cwd();
  var configName = options.configName || this.configName;
  var extensions = options.extensions || this.extensions || [];
  var preload = options.preload || [];
  var completion = options.completion;
  var configPath = options.configPath;

  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  var configNames = buildConfigName({
    configName: configName,
    extensions: extensions
  });

  var foundConfig = findConfig({
    cwd: cwd,
    configName: configNames,
    configPath: configPath
  });

  var configBase = foundConfig ? path.dirname(foundConfig) : cwd;
  var modulePath;
  var modulePackage = {};
  var config = [];
  var cwdPath = cwd;

  if (foundConfig) {
    try {
      modulePath = resolve.sync(foundConfig, {
        basedir: configBase
      });
      modulePackage = silentRequire(path.dirname(modulePath)) || {};
    } catch (error) {
      modulePath = foundConfig;
    }

    config.push(foundConfig);
  }

  var env = {
    cwd: cwdPath,
    preload: preload.slice(),
    completion: completion,
    configNameSearch: configNames,
    configPath: foundConfig,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage,
    configFiles: config,
    config: config
  };

  var self = this;

  function finish() {
    self.emit('preload', preload);
    callback(env);
  }

  if (preload.length) {
    try {
      preloadModules(self, preload);
    } catch (error) {
      self.emit('preloadFail', error);
    }
  }

  if (typeof options.completion === 'function') {
    return options.completion(env, finish);
  }

  if (options.respawn) {
    return self.respawn(options.v8flags || self.v8flags, function () {
      finish();
    });
  }

  finish();
};

Liftoff.prototype.start = function (callback) {
  if (typeof this.constructor === 'function' && typeof callback === 'function') {
    return callback(null, this);
  }
};

module.exports = Liftoff;
