const vm_0x4861e9_77ce30 = globalThis['_$77ce30'] || (globalThis['_$77ce30'] = {});

(function() {
  if (!vm_0x4861e9_77ce30['module']) try { vm_0x4861e9_77ce30['module'] = module; } catch(e) {}
  if (!vm_0x4861e9_77ce30['exports']) try { vm_0x4861e9_77ce30['exports'] = exports; } catch(e) {}
  if (!vm_0x4861e9_77ce30['require']) try { vm_0x4861e9_77ce30['require'] = require; } catch(e) {}
  if (!vm_0x4861e9_77ce30['__dirname']) try { vm_0x4861e9_77ce30['__dirname'] = __dirname; } catch(e) {}
  if (!vm_0x4861e9_77ce30['__filename']) try { vm_0x4861e9_77ce30['__filename'] = __filename; } catch(e) {}
})();

const util = require('util');
const path = require('path');
const EE = require('events').EventEmitter;
const extend = require('extend');
const resolve = require('resolve');
const flaggedRespawn = require('flagged-respawn');
const isPlainObject = require('is-plain-object').isPlainObject;
const fined = require('fined');

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(opts) {
  EE.call(this);
  opts = opts || {};
  this.processTitle = opts.processTitle || 'Liftoff';
  this.configName = opts.configName;
  this.extensions = opts.extensions || {};
  this.v8flags = opts.v8flags;
  this.moduleName = opts.moduleName;
  this.completions = opts.completions;
  this.searchPaths = opts.searchPaths || [];
}

util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(moduleName, basedir) {
  try {
    this.emit('require', moduleName);
    const result = require(resolve.sync(moduleName, { basedir: basedir }));
    this.emit('require:success', moduleName, result);
    return result;
  } catch(err) {
    this.emit('require:failure', moduleName, err);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};
  let preload = opts.preload || [];
  if (!Array.isArray(preload)) preload = [preload];
  
  const searchPaths = this.searchPaths.slice();
  const configName = this.configName;
  let cwd = findCwd(opts);
  const extensions = this.extensions;
  const self = this;
  
  function findCwdFn(cwdOpts) {
    return findCwd(cwdOpts);
  }
  
  function needsLookupFn(filepath) {
    return needsLookup(filepath, extensions);
  }
  
  function parseOptionsFn(filepath, options) {
    return parseOptions(filepath, options, configName, extend, isString, path);
  }
  
  const configFiles = [];
  if (Array.isArray(this.searchPaths)) {
    configFiles = this.searchPaths.map(function(searchPath) {
      return findCwdFn({ cwd: cwd, extensions: extensions });
    });
  }
  
  const configs = configFiles.map(function(file) {
    const result = {};
    if (!file) return result;
    return parseOptionsFn(cwd, file, result);
  });
  
  const configPath = arrayFind(configs, function(config) {
    if (Object.prototype.hasOwnProperty.call(config, configName)) {
      if (isString(config[configName])) return config[configName];
    }
  });
  
  const preloadConfig = arrayFind(configs, function(config) {
    if (Object.prototype.hasOwnProperty.call(config, 'preload')) {
      if (Array.isArray(config.preload)) {
        if (config.preload.every(isString)) return config.preload];
      }
      if (isString(config.preload)) return config.preload;
    }
  });
  
  if (opts.cwd) {
    searchPaths = [cwd];
  } else {
    searchPaths.unshift(cwd);
  }
  
  const configNameSearch = buildConfigName({
    configName: configName,
    extensions: Object.keys(this.extensions)
  });
  
  const foundConfigPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: opts.configPath || configPath
  });
  
  let configBase;
  if (foundConfigPath) {
    configBase = path.dirname(foundConfigPath);
    if (!opts.cwd) cwd = configBase;
  }
  
  let modulePath, modulePackage;
  try {
    const delimiter = path.delimiter;
    const nodePaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: nodePaths
    });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch(e) {}
  
  if (!modulePath && foundConfigPath) {
    const pkgPath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(pkgPath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(path.dirname(pkgPath), modulePackage.main || 'index.js');
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
    configPath: foundConfigPath,
    configBase: configBase,
    modulePath: modulePath,
    modulePackage: modulePackage || {},
    configFiles: configFiles,
    config: configs
  };
};

Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function(err, flags) {
      if (err) cb(err);
      else cb(null, flags);
    });
  } else {
    process.nextTick(function() {
      cb(null, this.v8flags);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function(opts, fn) {
  if (typeof fn !== 'function') throw new Error('You must provide a callback function.');
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
  
  if (typeof fn !== 'function') throw new Error('You must provide a callback function.');
  
  this.handleFlags(function(err, flags) {
    if (err) throw err;
    flags = flags || [];
    flaggedRespawn(flags, process.argv, forcedFlags, execute.bind(this));
    
    function execute(ready, child, argv) {
      const nodeFlags = getNodeFlags(env);
      preloadModules(env.preload, function() {
        registerLoader(env, function() {
          fn.call(this, env);
        }.bind(this));
      }.bind(this));
    }
  }.bind(this));
};

function preloadModules(preload, cb) {
  if (!preload || preload.length === 0) return cb();
  let count = 0;
  function next() {
    if (count >= preload.length) return cb();
    const mod = preload[count++];
    try {
      require(mod);
      next();
    } catch(e) {
      cb(e);
    }
  }
  next();
}

function toUnique(arr, key, cb) {
  const seen = new Set();
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const val = key ? item[key] : item;
    if (!seen.has(val)) {
      seen.add(val);
      result.push(item);
    }
  }
  if (cb) cb(null, result);
  return result;
}

function findCwd(opts) {
  opts = opts || {};
  return opts.cwd || process.cwd();
}

function arrayFind(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) return arr[i];
  }
  return undefined;
}

function fileSearch(filename, searchPaths) {
  for (let i = 0; i < searchPaths.length; i++) {
    const filepath = path.join(searchPaths[i], filename);
    try {
      require.resolve(filepath);
      return filepath;
    } catch(e) {}
  }
  return null;
}

function findConfig(opts) {
  const configNameSearch = opts.configNameSearch;
  const searchPaths = opts.searchPaths;
  const configPath = opts.configPath;
  
  if (configPath) return configPath;
  
  for (let i = 0; i < searchPaths.length; i++) {
    for (let j = 0; j < configNameSearch.length; j++) {
      const filepath = path.join(searchPaths[i], configNameSearch[j]);
      try {
        require.resolve(filepath);
        return filepath;
      } catch(e) {}
    }
  }
  return null;
}

function needsLookup(filepath, extensions) {
  const ext = path.extname(filepath);
  return extensions[ext] !== undefined;
}

function parseOptions(filepath, options, configName, extend, isString, path) {
  try {
    const config = require(filepath);
    if (isPlainObject(config)) {
      return extend({}, options, config);
    }
    return options;
  } catch(e) {
    return options;
  }
}

function silentRequire(id) {
  try {
    return require(id);
  } catch(e) {
    return null;
  }
}

function buildConfigName(opts) {
  const configName = opts.configName;
  const extensions = opts.extensions;
  return extensions.map(function(ext) {
    return configName + ext;
  });
}

function registerLoader(env, cb) {
  if (!env.modulePath) return cb();
  const ext = path.extname(env.modulePath);
  if (ext && env.config[ext]) {
    require(env.config[ext]);
  }
  cb();
}

function getNodeFlags(env) {
  return [];
}

vm_0x4861e9_77ce30['toUnique'] = toUnique;
globalThis['toUnique'] = toUnique;

vm_0x4861e9_77ce30['preloadModules'] = preloadModules;
globalThis['preloadModules'] = preloadModules;

vm_0x4861e9_77ce30['Liftoff'] = Liftoff;
globalThis['Liftoff'] = Liftoff;

vm_0x4861e9_77ce30['isString'] = isString;
globalThis['isString'] = isString;

vm_0x4861e9_77ce30['__getOwnPropNames'] = Object.getOwnPropertyNames;
globalThis['__getOwnPropNames'] = Object.getOwnPropertyNames;

vm_0x4861e9_77ce30['__commonJS'] = function(fn, deps) {
  return fn.call(this, deps);
};
globalThis['__commonJS'] = vm_0x4861e9_77ce30['__commonJS'];

vm_0x4861e9_77ce30['require_find_cwd'] = function() { return findCwd; };
globalThis['require_find_cwd'] = vm_0x4861e9_77ce30['require_find_cwd'];

vm_0x4861e9_77ce30['require_array_find'] = function() { return arrayFind; };
globalThis['require_array_find'] = vm_0x4861e9_77ce30['require_array_find'];

vm_0x4861e9_77ce30['require_file_search'] = function() { return fileSearch; };
globalThis['require_file_search'] = vm_0x4861e9_77ce30['require_file_search'];

vm_0x4861e9_77ce30['require_find_config'] = function() { return findConfig; };
globalThis['require_find_config'] = vm_0x4861e9_77ce30['require_find_config'];

vm_0x4861e9_77ce30['require_needs_lookup'] = function() { return needsLookup; };
globalThis['require_needs_lookup'] = vm_0x4861e9_77ce30['require_needs_lookup'];

vm_0x4861e9_77ce30['require_parse_options'] = function() { return parseOptions; };
globalThis['require_parse_options'] = vm_0x4861e9_77ce30['require_parse_options'];

vm_0x4861e9_77ce30['require_silent_require'] = function() { return silentRequire; };
globalThis['require_silent_require'] = vm_0x4861e9_77ce30['require_silent_require'];

vm_0x4861e9_77ce30['require_build_config_name'] = function() { return buildConfigName; };
globalThis['require_build_config_name'] = vm_0x4861e9_77ce30['require_build_config_name'];

vm_0x4861e9_77ce30['require_register_loader'] = function() { return registerLoader; };
globalThis['require_register_loader'] = vm_0x4861e9_77ce30['require_register_loader'];

vm_0x4861e9_77ce30['require_get_node_flags'] = function() { return getNodeFlags; };
globalThis['require_get_node_flags'] = vm_0x4861e9_77ce30['require_get_node_flags'];

vm_0x4861e9_77ce30['util'] = util;
globalThis['util'] = util;

vm_0x4861e9_77ce30['path'] = path;
globalThis['path'] = path;

vm_0x4861e9_77ce30['EE'] = EE;
globalThis['EE'] = EE;

vm_0x4861e9_77ce30['extend'] = extend;
globalThis['extend'] = extend;

vm_0x4861e9_77ce30['resolve'] = resolve;
globalThis['resolve'] = resolve;

vm_0x4861e9_77ce30['flaggedRespawn'] = flaggedRespawn;
globalThis['flaggedRespawn'] = vm_0x4861e9_77ce30['flaggedRespawn'];

vm_0x4861e9_77ce30['isPlainObject'] = isPlainObject;
globalThis['isPlainObject'] = vm_0x4861e9_77ce30['isPlainObject'];

vm_0x4861e9_77ce30['fined'] = fined;
globalThis['fined'] = vm_0x4861e9_77ce30['fined'];

vm_0x4861e9_77ce30['findCwd'] = findCwd;
globalThis['findCwd'] = vm_0x4861e9_77ce30['findCwd'];

vm_0x4861e9_77ce30['arrayFind'] = arrayFind;
globalThis['arrayFind'] = vm_0x4861e9_77ce30['arrayFind'];

vm_0x4861e9_77ce30['findConfig'] = findConfig;
globalThis['findConfig'] = vm_0x4861e9_77ce30['findConfig'];

vm_0x4861e9_77ce30['fileSearch'] = fileSearch;
globalThis['fileSearch'] = vm_0x4861e9_77ce30['fileSearch'];

vm_0x4861e9_77ce30['needsLookup'] = needsLookup;
globalThis['needsLookup'] = vm_0x4861e9_77ce30['needsLookup'];

vm_0x4861e9_77ce30['parseOptions'] = parseOptions;
globalThis['parseOptions'] = vm_0x4861e9_77ce30['parseOptions'];

vm_0x4861e9_77ce30['silentRequire'] = silentRequire;
globalThis['silentRequire'] = vm_0x4861e9_77ce30['silentRequire'];

vm_0x4861e9_77ce30['buildConfigName'] = buildConfigName;
globalThis['buildConfigName'] = vm_0x4861e9_77ce30['buildConfigName'];

vm_0x4861e9_77ce30['registerLoader'] = registerLoader;
globalThis['registerLoader'] = vm_0x4861e9_77ce30['registerLoader'];

vm_0x4861e9_77ce30['getNodeFlags'] = getNodeFlags;
globalThis['getNodeFlags'] = vm_0x4861e9_77ce30['getNodeFlags'];

try {
  Object.defineProperty(vm_0x4861e9_77ce30, 'Object', {
    get: function() { return Object; },
    set: function(v) { Object = v; },
    configurable: true
  });
} catch(e) {}

try {
  Object.defineProperty(vm_0x4861e9_77ce30, 'process', {
    get: function() { return process; },
    set: function(v) { process = v; },
    configurable: true
  });
} catch(e) {}

try {
  Object.defineProperty(vm_0x4861e9_77ce30, 'Array', {
    get: function() { return Array; },
    set: function(v) { Array = v; },
    configurable: true
  });
} catch(e) {}

try {
  Object.defineProperty(vm_0x4861e9_77ce30, 'Error', {
    get: function() { return Error; },
    set: function(v) { Error = v; },
    configurable: true
  });
} catch(e) {}

try {
  Object.defineProperty(vm_0x4861e9_77ce30, 'RegExp', {
    get: function() { return RegExp; },
    set: function(v) { RegExp = v; },
    configurable: true
  });
} catch(e) {}

module.exports = Liftoff;
