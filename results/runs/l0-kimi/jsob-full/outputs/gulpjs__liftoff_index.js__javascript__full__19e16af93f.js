var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_find_cwd = __commonJS({
  '../work/gulpjs__liftoff/lib/find_cwd.js'(exports, module) {
    var path = require('path');
    module.exports = function(opts) {
      if (!opts) opts = {};
      var cwd = opts.cwd;
      var configPath = opts.configPath;
      if (typeof configPath !== 'string' && !cwd) {
        cwd = path.dirname(path.resolve(configPath));
      }
      if (typeof cwd !== 'string') {
        return process.cwd();
      }
      return path.resolve(cwd);
    };
  }
});

var require_array_find = __commonJS({
  '../work/gulpjs__liftoff/lib/array_find.js'(exports, module) {
    'use strict';
    module.exports = function(arr, predicate) {
      if (!Array.isArray(arr)) return;
      var i = -1;
      while (++i < arr.length) {
        var result = predicate(arr[i]);
        if (result) return result;
      }
    };
  }
});

var require_file_search = __commonJS({
  '../work/gulpjs__liftoff/lib/file_search.js'(exports, module) {
    var fs = require('fs');
    module.exports = function(basedir, config) {
      var found;
      for (var i = 0; i < config.length; i++) {
        if (found) break;
        var filepath = config[i];
        if (fs.existsSync(filepath)) {
          found = fs.realpathSync(filepath);
        }
      }
      return found;
    };
  }
});

var require_find_config = __commonJS({
  '../work/gulpjs__liftoff/lib/find_config.js'(exports, module) {
    var fs = require('fs');
    var path = require('path');
    var fileSearch = require_file_search();
    module.exports = function(opts) {
      opts = opts || {};
      var configName = opts.configName;
      var configPath = opts.configPath;
      var extensions = opts.extensions;
      if (!configPath) {
        if (!Array.isArray(extensions)) {
          throw new Error('You must specify extensions to search for config files.');
        }
        if (!configName) {
          throw new Error('You must specify a configName.');
        }
        configPath = fileSearch(configName, extensions);
      }
      if (configPath && fs.existsSync(configPath)) {
        return path.resolve(configPath);
      }
      return null;
    };
  }
});

var require_needs_lookup = __commonJS({
  '../work/gulpjs__liftoff/lib/needs_lookup.js'(exports, module) {
    'use strict';
    var path = require('path');
    var pathIsAbsolute = path.isAbsolute;
    module.exports = function(value) {
      if (typeof value === 'string' && value[0] === '.') return true;
      if (pathIsAbsolute(value)) return true;
      return false;
    };
  }
});

var require_parse_options = __commonJS({
  '../work/gulpjs__liftoff/lib/parse_options.js'(exports, module) {
    var extend = require('extend');
    module.exports = function(opts) {
      var defaults = {
        extensions: {
          '.js': null,
          '.json': null
        },
        searchPaths: []
      };
      if (!opts) opts = {};
      if (opts.extensions) {
        if (!opts.configName && opts.name) {
          opts.configName = opts.name;
        }
        if (!opts.moduleName && opts.name) {
          opts.moduleName = opts.name;
        }
        if (!opts.modulePackage && opts.name) {
          opts.modulePackage = opts.name;
        }
      }
      if (!opts.configName) {
        throw new Error('You must specify a configName.');
      }
      if (!opts.moduleName) {
        throw new Error('You must specify a moduleName.');
      }
      return extend(defaults, opts);
    };
  }
});

var require_silent_require = __commonJS({
  '../work/gulpjs__liftoff/lib/silent_require.js'(exports, module) {
    module.exports = function(id) {
      try {
        return require(id);
      } catch (e) {}
    };
  }
});

var require_build_config_name = __commonJS({
  '../work/gulpjs__liftoff/lib/build_config_name.js'(exports, module) {
    module.exports = function(opts) {
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
        throw new Error('You must specify extensions to search for config files.');
      }
      return extensions.map(function(ext) {
        return configName + ext;
      });
    };
  }
});

var require_register_loader = __commonJS({
  '../work/gulpjs__liftoff/lib/register_loader.js'(exports, module) {
    var rechoir = require('rechoir');
    module.exports = function(liftoff, opts, extensions, cwd) {
      opts = opts || {};
      if (typeof extensions !== 'object') {
        return;
      }
      var results = rechoir.prepare(opts, extensions, cwd, true);
      if (results instanceof Error) {
        results.failures.forEach(function(failure) {
          liftoff.emit('requireFail', failure.moduleName, failure.error);
        });
        return;
      }
      if (!Array.isArray(results)) return;
      var successful = results[results.length - 1];
      liftoff.emit('require', successful.moduleName, successful.module);
    };
  }
});

var require_get_node_flags = __commonJS({
  '../work/gulpjs__liftoff/lib/get_node_flags.js'(exports, module) {
    function formatNodeFlags(flags) {
      if (typeof flags === 'function') {
        return flags.call(this);
      }
      if (Array.isArray(flags)) {
        return flags;
      }
      if (typeof flags === 'string') {
        return [flags];
      }
      return [];
    }
    function filterNodeFlags(flags) {
      var result = [];
      for (var i = 0; i < flags.length; i++) {
        var flag = flags[i];
        if (!/^-/.test(flag) || flag === '--') break;
        result.push(flag);
      }
      return result;
    }
    module.exports = {
      formatNodeFlags: formatNodeFlags,
      filterNodeFlags: filterNodeFlags
    };
  }
});

var util = require('util');
var path = require('path');
var EE = require('events').EventEmitter;
var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object').isPlainObject;
var fined = require('fined');
var findCwd = require_find_cwd();
var arrayFind = require_array_find();
var findConfig = require_find_config();
var fileSearch = require_file_search();
var needsLookup = require_needs_lookup();
var parseOptions = require_parse_options();
var silentRequire = require_silent_require();
var buildConfigName = require_build_config_name();
var registerLoader = require_register_loader();
var getNodeFlags = require_get_node_flags();

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}

util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(module, basedir) {
  try {
    this.emit('requireLocal', module);
    var result = require(resolve.sync(module, { basedir: basedir }));
    this.emit('requireLocalSuccess', module, result);
    return result;
  } catch (err) {
    this.emit('requireLocalFail', module, err);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};
  var preload = opts.preload || [];
  if (!Array.isArray(preload)) {
    preload = [preload];
  }
  var cwd = this.cwd || findCwd(opts);
  var configName = this.configName;
  var extensions = this.extensions;
  var self = this;

  function findByPath(filepath, opts) {
    var result = fined(filepath, opts);
    if (!result) return null;
    if (isPlainObject(result.extension)) {
      registerLoader(self, result.extension, result.extension, cwd);
    }
    return result.path;
  }

  function locateConfigFile(name, configPath) {
    if (needsLookup(configPath)) {
      var opts = { cwd: cwd, extensions: extensions };
      var found = findByPath(configPath, opts);
      if (!found) {
        var lookupName;
        if (typeof configPath === 'string') {
          lookupName = configPath;
        } else {
          lookupName = configPath.name || configPath.module;
        }
        var msg = 'Unable to find ';
        if (lookupName) {
          msg += '"' + lookupName + '" ';
        }
        throw new Error(msg);
      }
      return found;
    }
    return configPath;
  }

  var loaded = {};
  function loadConfigFile(cwd, configPath, baseConfig) {
    var fullPath = locateConfigFile(cwd, configPath);
    if (loaded[fullPath]) {
      throw new Error('Config file already loaded: ' + fullPath);
    }
    var result;
    try {
      result = require(fullPath);
    } catch (e) {
      throw new Error('Failed to load config file: ' + fullPath);
    }
    if (Object.prototype.hasOwnProperty.call(result, configName)) {
      if (isString(result[configName])) {
        result[configName] = path.resolve(path.dirname(fullPath), result[configName]);
      }
    }
    loaded[fullPath] = true;
    var config = extend(true, {}, result, baseConfig);
    delete config[configName];
    if (result && result.extends) {
      var parentPath = path.dirname(fullPath);
      return loadConfigFile(parentPath, result.extends, config);
    }
    return config;
  }

  var configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(function(file) {
      return findByPath(file, { cwd: cwd, extensions: extensions });
    });
  }

  var configs = configFiles.map(function(file) {
    var base = {};
    if (!file) return base;
    return loadConfigFile(cwd, file, base);
  });

  var config = arrayFind(configs, function(cfg) {
    if (Object.prototype.hasOwnProperty.call(cfg, configName)) {
      if (isString(cfg[configName])) {
        return cfg[configName];
      }
      if (Array.isArray(cfg[configName])) {
        if (cfg[configName].every(isString)) {
          return cfg[configName];
        }
      }
      if (isString(cfg[configName])) {
        return cfg[configName];
      }
    }
  });

  var completions = arrayFind(configs, function(cfg) {
    if (Object.prototype.hasOwnProperty.call(cfg, configName)) {
      if (Array.isArray(cfg[configName])) {
        if (cfg[configName].every(isString)) {
          return cfg[configName];
        }
      }
      if (isString(cfg[configName])) {
        return cfg[configName];
      }
    }
  });

  if (opts.cwd) {
    cwd = [cwd];
  } else {
    cwd.push(cwd);
  }

  var configNameSearch = buildConfigName({ configName: configName, extensions: Object.keys(this.extensions) });
  var configSearch = {
    configNameSearch: configNameSearch,
    searchPaths: cwd,
    configPath: opts.configPath || config
  };
  var configPath = findConfig(configSearch);
  var configBase;

  if (configPath) {
    configBase = path.dirname(configPath);
    if (!opts.cwd) {
      cwd = configBase;
    }
  }

  var modulePath, modulePackage;
  try {
    var delimiter = path.delimiter;
    var paths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : [];
    modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: paths });
    modulePackage = silentRequire(fileSearch(modulePath, [modulePath]));
  } catch (e) {}

  if (!modulePath && configPath) {
    var searchPath = fileSearch(modulePath, [configBase]);
    modulePackage = silentRequire(searchPath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.resolve(path.dirname(searchPath), modulePackage.main || 'index');
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd: cwd,
    preload: preload.concat(completions || []),
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

Liftoff.prototype.launch = function(cb) {
  if (typeof this.launch !== 'function') {
    this.launch(function(env) {
      if (env) {
        cb(env);
      } else {
        cb(null, env);
      }
    });
  } else {
    process.nextTick(function() {
      cb(null, this);
    }.bind(this));
  }
};

Liftoff.prototype.execute = function(env, cb) {
  if (typeof cb !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  process.title = this.processTitle;
  var env = this.buildEnvironment(env);
  cb.call(this, env);
};

Liftoff.prototype.run = function(env, cb, thisArg) {
  var completion = env.completion;
  if (completion && this.completionHandler) {
    return this.completionHandler(completion);
  }
  if (typeof cb !== 'function') {
    thisArg = cb;
    cb = undefined;
  }
  if (typeof thisArg !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  this.buildEnvironment(function(err, env) {
    if (err) throw err;
    env = env || [];
    flaggedRespawn(env, process.argv, cb, thisArg.bind(this));
  }.bind(this));
};

function preloadModules(liftoff, env) {
  var cwd = env.cwd;
  env.preload.filter(toUnique).forEach(function(module) {
    liftoff.requireLocal(module, cwd);
  });
}

function toUnique(value, index, self) {
  return self.indexOf(value) === index;
}

module.exports = Liftoff;
