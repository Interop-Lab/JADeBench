var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/gulpjs__liftoff/lib/find_cwd.js
var require_find_cwd = __commonJS({
  "../work/gulpjs__liftoff/lib/find_cwd.js"(exports2, module2) {
    var path2 = require("path");
    module2.exports = function(opts) {
      if (!opts) {
        opts = {};
      }
      var cwd = opts.cwd;
      var configPath = opts.configPath;
      if (typeof configPath === "string" && !cwd) {
        cwd = path2.dirname(path2.resolve(configPath));
      }
      if (typeof cwd === "string") {
        return path2.resolve(cwd);
      }
      return process.cwd();
    };
  }
});

// ../work/gulpjs__liftoff/lib/array_find.js
var require_array_find = __commonJS({
  "../work/gulpjs__liftoff/lib/array_find.js"(exports2, module2) {
    "use strict";
    function arrayFind2(arr, fn) {
      if (!Array.isArray(arr)) {
        return;
      }
      var idx = 0;
      while (idx < arr.length) {
        var result = fn(arr[idx]);
        if (result) {
          return result;
        }
        idx++;
      }
    }
    module2.exports = arrayFind2;
  }
});

// ../work/gulpjs__liftoff/lib/file_search.js
var require_file_search = __commonJS({
  "../work/gulpjs__liftoff/lib/file_search.js"(exports2, module2) {
    var findup = require("findup-sync");
    module2.exports = function(search, paths) {
      var path2;
      var len = paths.length;
      for (var i = 0; i < len; i++) {
        if (path2) {
          break;
        } else {
          path2 = findup(search, { cwd: paths[i], nocase: true });
        }
      }
      return path2;
    };
  }
});

// ../work/gulpjs__liftoff/lib/find_config.js
var require_find_config = __commonJS({
  "../work/gulpjs__liftoff/lib/find_config.js"(exports2, module2) {
    var fs = require("fs");
    var path2 = require("path");
    var fileSearch2 = require_file_search();
    module2.exports = function(opts) {
      opts = opts || {};
      var configNameSearch = opts.configNameSearch;
      var configPath = opts.configPath;
      var searchPaths = opts.searchPaths;
      if (!configPath) {
        if (!Array.isArray(searchPaths)) {
          throw new Error(
            "Please provide an array of paths to search for config in."
          );
        }
        if (!configNameSearch) {
          throw new Error("Please provide a configNameSearch.");
        }
        configPath = fileSearch2(configNameSearch, searchPaths);
      }
      if (configPath && fs.existsSync(configPath)) {
        return path2.resolve(configPath);
      }
      return null;
    };
  }
});

// ../work/gulpjs__liftoff/lib/needs_lookup.js
var require_needs_lookup = __commonJS({
  "../work/gulpjs__liftoff/lib/needs_lookup.js"(exports2, module2) {
    "use strict";
    var isPlainObject2 = require("is-plain-object").isPlainObject;
    function needsLookup2(xtends) {
      if (typeof xtends === "string" && xtends[0] === ".") {
        return true;
      }
      if (isPlainObject2(xtends)) {
        return true;
      }
      return false;
    }
    module2.exports = needsLookup2;
  }
});

// ../work/gulpjs__liftoff/lib/parse_options.js
var require_parse_options = __commonJS({
  "../work/gulpjs__liftoff/lib/parse_options.js"(exports2, module2) {
    var extend2 = require("extend");
    module2.exports = function(opts) {
      var defaults = {
        extensions: {
          ".js": null,
          ".json": null
        },
        searchPaths: []
      };
      if (!opts) {
        opts = {};
      }
      if (opts.name) {
        if (!opts.processTitle) {
          opts.processTitle = opts.name;
        }
        if (!opts.configName) {
          opts.configName = opts.name + "file";
        }
        if (!opts.moduleName) {
          opts.moduleName = opts.name;
        }
      }
      if (!opts.processTitle) {
        throw new Error("You must specify a processTitle.");
      }
      if (!opts.configName) {
        throw new Error("You must specify a configName.");
      }
      if (!opts.moduleName) {
        throw new Error("You must specify a moduleName.");
      }
      return extend2(defaults, opts);
    };
  }
});

// ../work/gulpjs__liftoff/lib/silent_require.js
var require_silent_require = __commonJS({
  "../work/gulpjs__liftoff/lib/silent_require.js"(exports2, module2) {
    module2.exports = function(path2) {
      try {
        return require(path2);
      } catch (e) {
      }
    };
  }
});

// ../work/gulpjs__liftoff/lib/build_config_name.js
var require_build_config_name = __commonJS({
  "../work/gulpjs__liftoff/lib/build_config_name.js"(exports2, module2) {
    module2.exports = function(opts) {
      opts = opts || {};
      var configName = opts.configName;
      var extensions = opts.extensions;
      if (!configName) {
        throw new Error("Please specify a configName.");
      }
      if (configName instanceof RegExp) {
        return [configName];
      }
      if (!Array.isArray(extensions)) {
        throw new Error("Please provide an array of valid extensions.");
      }
      return extensions.map(function(ext) {
        return configName + ext;
      });
    };
  }
});

// ../work/gulpjs__liftoff/lib/register_loader.js
var require_register_loader = __commonJS({
  "../work/gulpjs__liftoff/lib/register_loader.js"(exports2, module2) {
    var rechoir = require("rechoir");
    module2.exports = function(eventEmitter, extensions, configPath, cwd) {
      extensions = extensions || {};
      if (typeof configPath !== "string") {
        return;
      }
      var autoloads = rechoir.prepare(extensions, configPath, cwd, true);
      if (autoloads instanceof Error) {
        autoloads.failures.forEach(function(failed) {
          eventEmitter.emit("loader:failure", failed.moduleName, failed.error);
        });
        return;
      }
      if (!Array.isArray(autoloads)) {
        return;
      }
      var succeeded = autoloads[autoloads.length - 1];
      eventEmitter.emit("loader:success", succeeded.moduleName, succeeded.module);
    };
  }
});

// ../work/gulpjs__liftoff/lib/get_node_flags.js
var require_get_node_flags = __commonJS({
  "../work/gulpjs__liftoff/lib/get_node_flags.js"(exports2, module2) {
    function arrayOrFunction(arrayOrFunc, env) {
      if (typeof arrayOrFunc === "function") {
        return arrayOrFunc.call(this, env);
      }
      if (Array.isArray(arrayOrFunc)) {
        return arrayOrFunc;
      }
      if (typeof arrayOrFunc === "string") {
        return [arrayOrFunc];
      }
      return [];
    }
    function fromReorderedArgv(reorderedArgv) {
      var nodeFlags = [];
      for (var i = 1, n = reorderedArgv.length; i < n; i++) {
        var arg = reorderedArgv[i];
        if (!/^-/.test(arg) || arg === "--") {
          break;
        }
        nodeFlags.push(arg);
      }
      return nodeFlags;
    }
    module2.exports = {
      arrayOrFunction,
      fromReorderedArgv
    };
  }
});

// ../work/gulpjs__liftoff/index.js
var util = require("util");
var path = require("path");
var EE = require("events").EventEmitter;
var extend = require("extend");
var resolve = require("resolve");
var flaggedRespawn = require("flagged-respawn");
var isPlainObject = require("is-plain-object").isPlainObject;
var fined = require("fined");
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
  return typeof val === "string";
}
function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}
util.inherits(Liftoff, EE);
Liftoff.prototype.requireLocal = function(moduleName, basedir) {
  try {
    this.emit("preload:before", moduleName);
    var result = require(resolve.sync(moduleName, { basedir }));
    this.emit("preload:success", moduleName, result);
    return result;
  } catch (e) {
    this.emit("preload:failure", moduleName, e);
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
  var exts = this.extensions;
  var eventEmitter = this;
  function findAndRegisterLoader(pathObj, defaultObj) {
    var found = fined(pathObj, defaultObj);
    if (!found) {
      return null;
    }
    if (isPlainObject(found.extension)) {
      registerLoader(eventEmitter, found.extension, found.path, cwd);
    }
    return found.path;
  }
  function getModulePath(cwd2, xtends) {
    if (needsLookup(xtends)) {
      var defaultObj = { cwd: cwd2, extensions: exts };
      var foundPath = findAndRegisterLoader(xtends, defaultObj);
      if (!foundPath) {
        var name;
        if (typeof xtends === "string") {
          name = xtends;
        } else {
          name = xtends.path || xtends.name;
        }
        var msg = "Unable to locate one of your extends.";
        if (name) {
          msg += " Looking for file: " + path.resolve(cwd2, name);
        }
        throw new Error(msg);
      }
      return foundPath;
    }
    return xtends;
  }
  var visited = {};
  function loadConfig(cwd2, xtends, preferred) {
    var configFilePath = getModulePath(cwd2, xtends);
    if (visited[configFilePath]) {
      throw new Error(
        "We encountered a circular extend for file: " + configFilePath + ". Please remove the recursive extends."
      );
    }
    var configFile;
    try {
      configFile = require(configFilePath);
    } catch (e) {
      throw new Error(
        "Encountered error when loading config file: " + configFilePath
      );
    }
    if (Object.prototype.hasOwnProperty.call(configFile, configName)) {
      if (isString(configFile[configName])) {
        configFile[configName] = path.resolve(path.dirname(configFilePath), configFile[configName]);
      }
    }
    visited[configFilePath] = true;
    if (configFile && configFile.extends) {
      var nextCwd = path.dirname(configFilePath);
      return loadConfig(nextCwd, configFile.extends, configFile);
    }
    var config2 = extend(true, {}, configFile, preferred);
    delete config2.extends;
    return config2;
  }
  var configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map(function(pathObj) {
      var defaultObj = { cwd, extensions: exts };
      return findAndRegisterLoader(pathObj, defaultObj);
    });
  }
  var config = configFiles.map(function(startingLocation) {
    var defaultConfig = {};
    if (!startingLocation) {
      return defaultConfig;
    }
    return loadConfig(cwd, startingLocation, defaultConfig);
  });
  var configPathOverride = arrayFind(config, function(cfg) {
    if (Object.prototype.hasOwnProperty.call(cfg, configName)) {
      if (isString(cfg[configName])) {
        return cfg[configName];
      }
    }
  });
  var additionPreloads = arrayFind(config, function(cfg) {
    if (Object.prototype.hasOwnProperty.call(cfg, "preload")) {
      if (Array.isArray(cfg.preload)) {
        if (cfg.preload.every(isString)) {
          return cfg.preload;
        }
      }
      if (isString(cfg.preload)) {
        return cfg.preload;
      }
    }
  });
  if (opts.cwd) {
    searchPaths = [cwd];
  } else {
    searchPaths.unshift(cwd);
  }
  var configNameSearch = buildConfigName({
    configName,
    extensions: Object.keys(this.extensions)
  });
  var configPath = findConfig({
    configNameSearch,
    searchPaths,
    configPath: opts.configPath || configPathOverride
  });
  var configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!opts.cwd) {
      cwd = configBase;
    }
  }
  var modulePath;
  var modulePackage;
  try {
    var delim = path.delimiter;
    var paths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delim) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths
    });
    modulePackage = silentRequire(fileSearch("package.json", [modulePath]));
  } catch (e) {
  }
  if (!modulePath && configPath) {
    var modulePackagePath = fileSearch("package.json", [configBase]);
    modulePackage = silentRequire(modulePackagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(
        path.dirname(modulePackagePath),
        modulePackage.main || "index.js"
      );
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }
  return {
    cwd,
    preload: preload.concat(additionPreloads || []),
    completion: opts.completion,
    configNameSearch,
    configPath,
    configBase,
    modulePath,
    modulePackage: modulePackage || {},
    configFiles,
    config
  };
};
Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.v8flags === "function") {
    this.v8flags(function(err, flags) {
      if (err) {
        cb(err);
      } else {
        cb(null, flags);
      }
    });
  } else {
    process.nextTick(
      function() {
        cb(null, this.v8flags);
      }.bind(this)
    );
  }
};
Liftoff.prototype.prepare = function(opts, fn) {
  if (typeof fn !== "function") {
    throw new Error("You must provide a callback function.");
  }
  process.title = this.processTitle;
  var env = this.buildEnvironment(opts);
  fn.call(this, env);
};
Liftoff.prototype.execute = function(env, forcedFlags, fn) {
  var completion = env.completion;
  if (completion && this.completions) {
    return this.completions(completion);
  }
  if (typeof forcedFlags === "function") {
    fn = forcedFlags;
    forcedFlags = void 0;
  }
  if (typeof fn !== "function") {
    throw new Error("You must provide a callback function.");
  }
  this.handleFlags(
    function(err, flags) {
      if (err) {
        throw err;
      }
      flags = flags || [];
      flaggedRespawn(flags, process.argv, forcedFlags, execute.bind(this));
      function execute(ready, child, argv) {
        if (child !== process) {
          var execArgv = getNodeFlags.fromReorderedArgv(argv);
          this.emit("respawn", execArgv, child);
        }
        if (ready) {
          preloadModules(this, env);
          registerLoader(this, this.extensions, env.configPath, env.cwd);
          fn.call(this, env, argv);
        }
      }
    }.bind(this)
  );
};
function preloadModules(inst, env) {
  var basedir = env.cwd;
  env.preload.filter(toUnique).forEach(function(module2) {
    inst.requireLocal(module2, basedir);
  });
}
function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}
module.exports = Liftoff;
