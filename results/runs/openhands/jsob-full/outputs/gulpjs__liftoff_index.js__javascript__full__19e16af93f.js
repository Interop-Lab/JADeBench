const util = require('util');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const extend = require('extend');
const resolve = require('resolve');
const flaggedRespawn = require('flagged-respawn');
const isPlainObject = require('is-plain-object').isPlainObject;
const fined = require('fined');
const fs = require('fs');
const findUp = require('findup-sync');
const rechoir = require('rechoir');

function findCwd(options) {
  options = options || {};

  let cwd = options.cwd;
  if (typeof options.configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(options.configPath));
  }

  return typeof cwd === 'string' ? path.resolve(cwd) : process.cwd();
}

function arrayFind(values, callback) {
  if (!Array.isArray(values)) return undefined;

  for (let index = 0; index < values.length; index += 1) {
    const result = callback(values[index]);
    if (result) return result;
  }

  return undefined;
}

function fileSearch(filename, searchPaths) {
  let found;
  for (let index = 0; index < searchPaths.length; index += 1) {
    if (found) break;
    found = findUp(filename, { cwd: searchPaths[index], nocase: true });
  }
  return found;
}

function findConfig(options) {
  options = options || {};

  let configPath = options.configPath;
  if (!configPath) {
    if (!Array.isArray(options.searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!options.configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(options.configNameSearch, options.searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) return path.resolve(configPath);
  return null;
}

function needsLookup(configReference) {
  return (
    (typeof configReference === 'string' && configReference[0] === '.') ||
    isPlainObject(configReference)
  );
}

function parseOptions(options) {
  const defaults = {
    extensions: {
      '.js': null,
      '.json': null,
    },
    searchPaths: [],
  };

  options = options || {};
  if (options.name) {
    if (!options.processTitle) options.processTitle = options.name;
    if (!options.configName) options.configName = `${options.name}file`;
    if (!options.moduleName) options.moduleName = options.name;
  }

  if (!options.processTitle) throw new Error('You must specify a processTitle.');
  if (!options.configName) throw new Error('You must specify a configName.');
  if (!options.moduleName) throw new Error('You must specify a moduleName.');

  return extend(defaults, options);
}

function silentRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    return undefined;
  }
}

function buildConfigName(options) {
  options = options || {};
  if (!options.configName) throw new Error('Please specify a configName.');
  if (options.configName instanceof RegExp) return [options.configName];
  if (!Array.isArray(options.extensions)) {
    throw new Error('Please provide an array of valid extensions.');
  }
  return options.extensions.map((extension) => options.configName + extension);
}

function registerLoader(emitter, extensions, configPath, cwd) {
  extensions = extensions || {};
  if (typeof configPath !== 'string') return;

  const attempts = rechoir.prepare(extensions, configPath, cwd, true);
  if (attempts instanceof Error) {
    attempts.failures.forEach((failure) => {
      emitter.emit('loader:failure', failure.moduleName, failure.error);
    });
    return;
  }

  if (!Array.isArray(attempts)) return;
  const loader = attempts[attempts.length - 1];
  emitter.emit('loader:success', loader.moduleName, loader.module);
}

const getNodeFlags = {
  arrayOrFunction(value, argv) {
    if (typeof value === 'function') return value.call(this, argv);
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  },

  fromReorderedArgv(argv) {
    const flags = [];
    for (let index = 1; index < argv.length; index += 1) {
      const argument = argv[index];
      if (!/^-/.test(argument) || argument === '--') break;
      flags.push(argument);
    }
    return flags;
  },
};

function isString(value) {
  return typeof value === 'string';
}

function Liftoff(options) {
  EventEmitter.call(this);
  extend(this, parseOptions(options));
}

util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function requireLocal(moduleName, basedir) {
  try {
    this.emit('preload:before', moduleName);
    const loadedModule = require(resolve.sync(moduleName, { basedir }));
    this.emit('preload:success', moduleName, loadedModule);
    return loadedModule;
  } catch (error) {
    this.emit('preload:failure', moduleName, error);
    return undefined;
  }
};

Liftoff.prototype.buildEnvironment = function buildEnvironment(options) {
  options = options || {};

  let preload = options.preload || [];
  if (!Array.isArray(preload)) preload = [preload];

  let searchPaths = this.searchPaths.slice();
  const configName = this.configName;
  let cwd = findCwd(options);
  const extensions = this.extensions;
  const liftoff = this;

  function lookupConfigFile(configFile, lookupOptions) {
    const result = fined(configFile, lookupOptions);
    if (!result) return null;

    if (isPlainObject(result.extension)) {
      registerLoader(liftoff, result.extension, result.path, cwd);
    }
    return result.path;
  }

  function resolveConfigReference(baseDirectory, configReference) {
    if (!needsLookup(configReference)) return configReference;

    const resolvedPath = lookupConfigFile(configReference, {
      cwd: baseDirectory,
      extensions,
    });
    if (resolvedPath) return resolvedPath;

    const requestedFile =
      typeof configReference === 'string'
        ? configReference
        : configReference.path || configReference.name;
    let message = 'Unable to locate one of your extends.';
    if (requestedFile) {
      message += ` Looking for file: ${path.resolve(baseDirectory, requestedFile)}`;
    }
    throw new Error(message);
  }

  const loadedConfigPaths = {};

  function loadConfig(baseDirectory, configReference, childConfig) {
    const configPath = resolveConfigReference(baseDirectory, configReference);
    if (loadedConfigPaths[configPath]) {
      throw new Error(
        `We encountered a circular extend for file: ${configPath}. ` +
          'Please remove the recursive extends.',
      );
    }

    let config;
    try {
      config = require(configPath);
    } catch (error) {
      throw new Error(`Encountered error when loading config file: ${configPath}`);
    }

    if (
      Object.prototype.hasOwnProperty.call(config, configName) &&
      isString(config[configName])
    ) {
      config[configName] = path.resolve(path.dirname(configPath), config[configName]);
    }

    loadedConfigPaths[configPath] = true;
    if (config && config.extends) {
      return loadConfig(path.dirname(configPath), config.extends, config);
    }

    const mergedConfig = extend(true, {}, config, childConfig);
    delete mergedConfig.extends;
    return mergedConfig;
  }

  let configFiles = [];
  if (Array.isArray(this.configFiles)) {
    configFiles = this.configFiles.map((configFile) =>
      lookupConfigFile(configFile, { cwd, extensions }),
    );
  }

  const config = configFiles.map((configPath) => {
    if (!configPath) return {};
    return loadConfig(cwd, configPath, {});
  });

  const configPathFromConfig = arrayFind(config, (configValue) => {
    if (
      Object.prototype.hasOwnProperty.call(configValue, configName) &&
      isString(configValue[configName])
    ) {
      return configValue[configName];
    }
    return undefined;
  });

  const preloadFromConfig = arrayFind(config, (configValue) => {
    if (!Object.prototype.hasOwnProperty.call(configValue, 'preload')) return undefined;
    if (Array.isArray(configValue.preload) && configValue.preload.every(isString)) {
      return configValue.preload;
    }
    if (isString(configValue.preload)) return configValue.preload;
    return undefined;
  });

  if (options.cwd) searchPaths = [cwd];
  else searchPaths.unshift(cwd);

  const configNameSearch = buildConfigName({
    configName,
    extensions: Object.keys(this.extensions),
  });
  const configPath = findConfig({
    configNameSearch,
    searchPaths,
    configPath: options.configPath || configPathFromConfig,
  });

  let configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    if (!options.cwd) cwd = configBase;
  }

  let modulePath;
  let modulePackage;
  try {
    const modulePaths = process.env.NODE_PATH
      ? process.env.NODE_PATH.split(path.delimiter)
      : [];
    modulePath = resolve.sync(this.moduleName, {
      basedir: configBase || cwd,
      paths: modulePaths,
    });
    modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
  } catch (error) {
    // A missing local module is represented by an undefined modulePath.
  }

  if (!modulePath && configPath) {
    const packagePath = fileSearch('package.json', [configBase]);
    modulePackage = silentRequire(packagePath);
    if (modulePackage && modulePackage.name === this.moduleName) {
      modulePath = path.join(
        path.dirname(packagePath),
        modulePackage.main || 'index.js',
      );
      cwd = configBase;
    } else {
      modulePackage = {};
    }
  }

  return {
    cwd,
    preload: preload.concat(preloadFromConfig || []),
    completion: options.completion,
    configNameSearch,
    configPath,
    configBase,
    modulePath,
    modulePackage: modulePackage || {},
    configFiles,
    config,
  };
};

Liftoff.prototype.handleFlags = function handleFlags(callback) {
  if (typeof this.v8flags === 'function') {
    this.v8flags((error, flags) => {
      if (error) callback(error);
      else callback(null, flags);
    });
  } else {
    process.nextTick(function passConfiguredFlags() {
      callback(null, this.v8flags);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function prepare(options, callback) {
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  process.title = this.processTitle;
  const environment = this.buildEnvironment(options);
  callback.call(this, environment);
};

Liftoff.prototype.execute = function execute(environment, forcedFlags, callback) {
  if (environment.completion && this.completions) {
    return this.completions(environment.completion);
  }

  if (typeof forcedFlags === 'function') {
    callback = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof callback !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags(function handleFlags(error, flags) {
    if (error) throw error;

    flaggedRespawn(
      flags || [],
      process.argv,
      forcedFlags,
      function afterRespawn(ready, child, argv) {
        if (child !== process) {
          const nodeFlags = getNodeFlags.fromReorderedArgv(argv);
          this.emit('respawn', nodeFlags, child);
        }

        if (ready) {
          preloadModules(this, environment);
          registerLoader(this, this.extensions, environment.configPath, environment.cwd);
          callback.call(this, environment, argv);
        }
      }.bind(this),
    );
  }.bind(this));
};

function preloadModules(liftoff, environment) {
  environment.preload.filter(toUnique).forEach((moduleName) => {
    liftoff.requireLocal(moduleName, environment.cwd);
  });
}

function toUnique(value, index, values) {
  return values.indexOf(value) === index;
}

module.exports = Liftoff;
