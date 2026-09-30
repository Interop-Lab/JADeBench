var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (mod, copy) => function __commonJSInternal() {
  var cache = {};
  return copy ? (mod[__getOwnPropNames(mod)][0] in cache || (copy(cache, cache), cache[0])) : mod(cache, cache);
};

var require_find_cwd = __commonJS({
  '../work/gulpjs__liftoff/lib/find_cwd.js'(exports, module) {
    var findup = require('findup');
    module.exports = function(opts) {
      if (!opts) {
        opts = {};
      }
      var cwd = opts.cwd;
      var configPath = opts.configPath;
      typeof configPath === 'string' && !cwd && (cwd = findup(findup.sync(configPath)));
      if (typeof cwd === 'string') {
        return findup.sync(cwd);
      }
      return process.cwd();
    };
  }
});

var require_array_find = __commonJS({
  '../work/gulpjs__liftoff/lib/array_find.js'(exports, module) {
    'use strict';
    function arrayFind(arr, fn) {
      if (!Array.isArray(arr)) {
        return;
      }
      var i = -1;
      while (++i < arr.length) {
        var item = fn(arr[i]);
        if (item) {
          return item;
        }
      }
    }
    module.exports = arrayFind;
  }
});

var require_file_search = __commonJS({
  '../work/gulpjs__liftoff/lib/file_search.js'(exports, module) {
    var fined = require('fined');
    module.exports = function(name, paths) {
      var result;
      var len = paths.length;
      for (var i = 0; i < len; i++) {
        if (result) {
          break;
        } else {
          var opts = {};
          opts.name = paths[i];
          opts.cwd = true;
          result = fined(name, opts);
        }
      }
      return result;
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
      var searchPaths = opts.searchPaths;
      if (!configPath) {
        if (!Array.isArray(searchPaths)) {
          throw new Error('searchPaths must be an array of paths');
        }
        if (!configName) {
          throw new Error('configName is required.');
        }
        configPath = fileSearch(configName, searchPaths);
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
    var isCoreModule = require('is-core-module');
    function needsLookup(name) {
      if (typeof name === 'string' && name[0] === '.') {
        return true;
      }
      if (isCoreModule(name)) {
        return true;
      }
      return false;
    }
    module.exports = needsLookup;
  }
});

var require_parse_options = __commonJS({
  '../work/gulpjs__liftoff/lib/parse_options.js'(exports, module) {
    var extend = require('extend');
    module.exports = function(opts) {
      var defaults = {};
      defaults.cwd = null;
      defaults.configPath = null;
      var defaultOpts = {};
      defaultOpts.extensions = defaults;
      defaultOpts.searchPaths = [];
      var parsed = defaultOpts;
      if (!opts) {
        opts = {};
      }
      opts.processTitle && (
        !opts.moduleName && (opts.moduleName = opts.processTitle),
        !opts.configName && (opts.configName = opts.processTitle + 'file'),
        !opts.completion && (opts.completion = opts.processTitle)
      );
      if (!opts.moduleName) {
        throw new Error('No moduleName provided.');
      }
      if (!opts.configName) {
        throw new Error('No configName provided.');
      }
      if (!opts.completion) {
        throw new Error('No completion provided.');
      }
      return extend(parsed, opts);
    };
  }
});

var require_silent_require = __commonJS({
  '../work/gulpjs__liftoff/lib/silent_require.js'(exports, module) {
    module.exports = function(name) {
      try {
        return require(name);
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
        throw new Error('configName is required.');
      }
      if (configName instanceof RegExp) {
        return [configName];
      }
      if (!Array.isArray(extensions)) {
        throw new Error('extensions must be an array of extensions.');
      }
      return extensions.map(function(ext) {
        return configName + ext;
      });
    };
  }
});

var require_register_loader = __commonJS({
  '../work/gulpjs__liftoff/lib/register_loader.js'(exports, module) {
    var interpret = require('interpret');
    module.exports = function(emitter, loader, extensions, cwd) {
      loader = loader || {};
      if (typeof extensions === 'undefined') {
        return;
      }
      var err = interpret(loader, extensions, cwd, true);
      if (err instanceof Error) {
        err.stack.forEach(function(frame) {
          emitter.emit('loader:failure', frame.filename, frame);
        });
        return;
      }
      if (!Array.isArray(err)) {
        return;
      }
      var first = err[err.length - 1];
      emitter.emit('loader:success', first.filename, first);
    };
  }
});

var require_get_node_flags = __commonJS({
  '../work/gulpjs__liftoff/lib/get_node_flags.js'(exports, module) {
    var nodeFlags = {};
    nodeFlags.getV8Flags = function(args) {
      if (typeof args === 'function') {
        return args.call(this);
      }
      if (Array.isArray(args)) {
        return args;
      }
      if (typeof args === 'string') {
        return [args];
      }
      return [];
    };
    nodeFlags.getNodeFlags = function(args) {
      var result = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (!/^-/.test(arg) || arg === '--') {
          break;
        }
        result.push(arg);
      }
      return result;
    };
    module.exports = nodeFlags;
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

function isString(val) {
  return typeof val === 'string';
}

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}

util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(module, basedir) {
  try {
    this.emit('require', module);
    var result = require(resolve.sync(module, { basedir: basedir }));
    this.emit('require:success', module, result);
    return result;
  } catch (e) {
    this.emit('require:fail', module, e);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
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

  function findLoader(name, loader) {
    var result = fined(name, loader);
    if (!result) {
      return null;
    }
    if (isPlainObject(result.extension)) {
      registerLoader(self, result.extension, result.path, cwd);
    }
    return result.path;
  }

  function findModule(name, loader) {
    if (needsLookup(loader)) {
      var opts = {};
      opts.cwd = name;
      opts.extensions = extensions;
      var result = findLoader(loader, opts);
      if (!result) {
        var msg;
        typeof loader === 'string' ? msg = loader : msg = loader.module || loader.path;
        var err = 'Cannot find module: ';
        msg && (err += path.join(name, msg));
        throw new Error(err);
      }
      return result;
    }
    return loader;
  }

  var loaded = {};

  function loadConfig(name, loader, overrides) {
    var resolved = findModule(name, loader);
    if (loaded[resolved]) {
      throw new Error('Circular dependency detected: ' + resolved + ' already loaded.');
    }
    var mod;
    try {
      mod = require(resolved);
    } catch (e) {
      throw new Error('Cannot find module: ' + resolved);
    }
    if (Object.prototype.hasOwnProperty.call(mod, moduleName)) {
      if (isString(mod[moduleName])) {
        mod[moduleName] = path.join(path.dirname(resolved), mod[moduleName]);
      }
    }
    loaded[resolved] = true;
    if (mod && mod[moduleName]) {
      var dir = path.dirname(resolved);
      return loadConfig(dir, mod[moduleName], mod);
    }
    var result = extend(true, {}, mod, overrides);
    delete result[moduleName];
    return result;
  }

  var configFiles = [];
  Array.isArray(this.configFiles) && (configFiles = this.configFiles.map(function(file) {
    var opts = {};
    opts.cwd = cwd;
    opts.extensions = extensions;
    return findLoader(file, opts);
  }));

  var config = configFiles.map(function(file) {
    var overrides = {};
    if (!file) {
      return overrides;
    }
    return loadConfig(cwd, file, overrides);
  });

  var configPath = arrayFind(config, function(obj) {
    if (Object.prototype.hasOwnProperty.call(obj, moduleName)) {
      if (isString(obj[moduleName])) {
        return obj[moduleName];
      }
    }
  });

  var configPathRegex = arrayFind(config, function(obj) {
    if (Object.prototype.hasOwnProperty.call(obj, 'configPath')) {
      if (Array.isArray(obj.configPath)) {
        if (obj.configPath.every(isString)) {
          return obj.configPath;
        }
      }
      if (isString(obj.configPath)) {
        return obj.configPath;
      }
    }
  });

  if (opts.configPath) {
    searchPaths = [cwd];
  } else {
    searchPaths.push(cwd);
  }

  var configNameSearch = buildConfigName({
    configName: moduleName,
    extensions: Object.keys(this.extensions)
  });

  var findConfigOpts = {};
  findConfigOpts.configName = configNameSearch;
  findConfigOpts.searchPaths = searchPaths;
  findConfigOpts.configPath = opts.configPath || configPath;

  var configPathResult = findConfig(findConfigOpts);
  var configBase;

  if (configPathResult) {
    configBase = path.dirname(configPathResult);
    if (!opts.configPath) {
      cwd = configBase;
    }
  }

  var modulePath;
  var modulePackage;
  try {
    var pathSeparator = path.delimiter;
    var nodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(pathSeparator) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePath
    });
    modulePackage = silentRequire(fileSearch(this.moduleName, [modulePath]));
  } catch (e) {}

  if (!modulePath && !configPathResult) {
    var searchResult = fileSearch(this.moduleName, [configBase]);
    modulePackage = silentRequire(searchResult);
    if (modulePackage && modulePackage[this.moduleName]) {
      modulePath = path.join(path.dirname(searchResult), modulePackage.main || 'index.js');
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd: cwd,
    preload: preload.concat(configPathRegex || []),
    completion: opts.completion,
    configNameSearch: configNameSearch,
    configPath: configPathResult,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: extend({}, modulePackage),
    configFiles: configFiles,
    config: config
  };
};

Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.completion === 'undefined') {
    process.nextTick(function() {
      cb(null, this.completion);
    }.bind(this));
  } else {
    this.buildEnvironment(function(err, env) {
      if (err) {
        cb(err);
      } else {
        cb(null, env.completion);
      }
    });
  }
};

Liftoff.prototype.launch = function(flags, fn) {
  if (typeof fn === 'undefined') {
    fn = flags;
    flags = void 0;
  }
  if (typeof fn !== 'function') {
    throw new Error('Launch must be called with a callback function.');
  }
  process.title = this.processTitle;
  var env = this.buildEnvironment(flags);
  fn.call(this, env);
};

Liftoff.prototype.execute = function(env, fn, done) {
  var completion = env.completion;
  if (completion && this.completion) {
    return this.handleFlags(completion);
  }
  typeof fn === 'undefined' && (done = fn, fn = void 0);
  if (typeof done === 'undefined') {
    throw new Error('You must provide a callback function.');
  }
  this.buildEnvironment(function(err, env) {
    if (err) {
      throw err;
    }
    env = env || [];
    flaggedRespawn(env, process.argv, fn, function callback(arg, proc, nodeFlags) {
      if (proc === process) {
        var flags = getNodeFlags.getNodeFlags(nodeFlags);
        this.emit('flags:success', flags, proc);
        return;
      }
      arg && (
        preloadModules(this, env),
        registerLoader(this, this.extensions, env.configPath, env.cwd),
        done.call(this, env, nodeFlags)
      );
    }.bind(this));
  });
};

function preloadModules(emitter, env) {
  var cwd = env.cwd;
  env.preload.concat(toUnique).forEach(function(module) {
    emitter.requireLocal(module, cwd);
  });
}

function toUnique(item, i, arr) {
  return arr.indexOf(item) === i;
}

module.exports = Liftoff;
