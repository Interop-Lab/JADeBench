const Liftoff = (() => {
  const util = require('util');
  const path = require('path');
  const EE = require('events').EventEmitter;
  const extend = require('extend');
  const resolve = require('resolve');
  const flaggedRespawn = require('flagged-respawn');
  const isPlainObject = require('is-plain-object').isPlainObject;
  const fined = require('fined');

  const findCwd = require('../work/gulpjs__liftoff/lib/find_cwd.js');
  const arrayFind = require('../work/gulpjs__liftoff/lib/array_find.js');
  const findConfig = require('../work/gulpjs__liftoff/lib/find_config.js');
  const fileSearch = require('../work/gulpjs__liftoff/lib/file_search.js');
  const needsLookup = require('../work/gulpjs__liftoff/lib/needs_lookup.js');
  const parseOptions = require('../work/gulpjs__liftoff/lib/parse_options.js');
  const silentRequire = require('../work/gulpjs__liftoff/lib/silent_require.js');
  const buildConfigName = require('../work/gulpjs__liftoff/lib/build_config_name.js');
  const registerLoader = require('../work/gulpjs__liftoff/lib/register_loader.js');
  const getNodeFlags = require('../work/gulpjs__liftoff/lib/get_node_flags.js');

  function isString(value) {
    return typeof value === 'string';
  }

  function Liftoff(opts) {
    opts = opts || {};
    this.name = opts.name;
    this.moduleName = opts.moduleName || this.name;
    this.configName = opts.configName || this.moduleName + 'file';
    this.extensions = opts.extensions || {};
    this.configFiles = opts.configFiles || {};
    this.v8flags = opts.v8flags;
    this.completions = opts.completions;
    this.searchPaths = opts.searchPaths || [];
    if (!Array.isArray(this.searchPaths)) {
      this.searchPaths = [this.searchPaths];
    }
  }

  util.inherits(Liftoff, EE);

  Liftoff.prototype.requireLocal = function(moduleName, basedir) {
    try {
      this.emit('preload:before', moduleName);
      const result = require(resolve.sync(moduleName, { basedir }));
      this.emit('preload:success', moduleName, result);
      return result;
    } catch (err) {
      this.emit('preload:failure', moduleName, err);
    }
  };

  Liftoff.prototype.buildEnvironment = function(opts) {
    opts = opts || {};
    let preload = opts.preload || [];
    if (!Array.isArray(preload)) {
      preload = [preload];
    }

    const searchPaths = this.searchPaths.slice();
    const configName = this.configName;
    let cwd = findCwd(opts);
    const extensions = this.extensions;
    const self = this;

    function resolveModule(moduleName, options) {
      const result = {};
      if (!moduleName) {
        return result;
      }
      const modulePath = fined(moduleName, options);
      if (modulePath) {
        result.path = modulePath.path;
        result.cwd = modulePath.cwd;
        result.base = modulePath.base;
      }
      return result;
    }

    function findConfigFile(cwd, modulePath, result) {
      const config = {};
      if (!modulePath) {
        return config;
      }
      const configPath = fined(modulePath, { cwd, extensions });
      if (configPath) {
        config.path = configPath.path;
        config.cwd = configPath.cwd;
        config.base = configPath.base;
      }
      return config;
    }

    const configFiles = [];
    if (Array.isArray(this.configFiles)) {
      configFiles.push(...this.configFiles.map(file => resolveModule(file, { cwd, extensions })));
    }

    const configs = configFiles.map(file => {
      const result = {};
      if (!file) {
        return result;
      }
      return findConfigFile(cwd, file, result);
    });

    const configPath = arrayFind(configs, config => {
      if (Object.prototype.hasOwnProperty.call(config, configName)) {
        if (isString(config[configName])) {
          return config[configName];
        }
      }
    });

    const preloadConfig = arrayFind(configs, config => {
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
      searchPaths.length = 0;
      searchPaths.push(cwd);
    } else {
      searchPaths.unshift(cwd);
    }

    const configNameSearch = buildConfigName({
      configName,
      extensions: Object.keys(this.extensions)
    });

    const foundConfig = findConfig({
      configNameSearch,
      searchPaths,
      configPath: opts.configPath || configPath
    });

    let configBase;
    if (foundConfig) {
      configBase = path.dirname(foundConfig);
      if (!opts.cwd) {
        cwd = configBase;
      }
    }

    let modulePath;
    let modulePackage;
    try {
      const delimiter = path.delimiter;
      const nodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : [];
      modulePath = resolve.sync(this.moduleName, {
        basedir: configBase || cwd,
        paths: nodePath
      });
      modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
    } catch (err) {}

    if (!modulePath && foundConfig) {
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
      preload: preload.concat(preloadConfig || []),
      completion: opts.completion,
      configNameSearch,
      configPath: foundConfig,
      configBase,
      modulePath,
      modulePackage: modulePackage || {},
      configFiles,
      config: configs
    };
  };

  Liftoff.prototype.handleFlags = function(cb) {
    if (typeof this.v8flags === 'function') {
      this.v8flags((err, flags) => {
        if (err) {
          cb(err);
        } else {
          cb(null, flags);
        }
      });
    } else {
      process.nextTick(cb.bind(this, null, this.v8flags));
    }
  };

  Liftoff.prototype.prepare = function(opts, fn) {
    if (typeof fn !== 'function') {
      throw new Error('You must provide a callback function.');
    }
    process.title = this.processTitle;
    const env = this.buildEnvironment(opts);
    fn.call(this, env);
  };

  Liftoff.prototype.execute = function(env, forcedFlags, fn) {
    const completion = env.completion;
    if (completion && this.completions) {
      return this.completions(completion);
    }
    if (typeof forcedFlags === 'function') {
      fn = forcedFlags;
      forcedFlags = undefined;
    }
    if (typeof fn !== 'function') {
      throw new Error('You must provide a callback function.');
    }
    this.handleFlags((err, flags) => {
      if (err) {
        throw err;
      }
      flags = flags || [];
      flaggedRespawn(flags, process.argv, forcedFlags, (ready, child, argv) => {
        if (ready) {
          fn.call(this, env);
        } else if (child) {
          registerLoader(child, argv);
        }
      });
    });
  };

  function preloadModules(env, callback) {
    const preload = env.preload;
    if (!preload || preload.length === 0) {
      return callback();
    }
    let index = 0;
    function next(err) {
      if (err) {
        return callback(err);
      }
      if (index >= preload.length) {
        return callback();
      }
      const moduleName = preload[index++];
      try {
        env.modulePackage = env.modulePackage || {};
        env.modulePackage[moduleName] = require(moduleName);
        next();
      } catch (err) {
        next(err);
      }
    }
    next();
  }

  function toUnique(array, key, value) {
    const seen = new Set();
    return array.filter(item => {
      const k = item[key];
      if (seen.has(k)) {
        return false;
      }
      seen.add(k);
      return true;
    });
  }

  return Liftoff;
})();

module.exports = Liftoff;
