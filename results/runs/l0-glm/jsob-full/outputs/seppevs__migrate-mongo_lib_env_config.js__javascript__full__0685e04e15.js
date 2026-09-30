import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

var module_loader_default = {
  require(id) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'noop')));
    return require(id);
  },
  import(id) {
    return import(id);
  }
};

function getModuleExports(mod) {
  return mod.__esModule ? mod.default : mod;
}

var DEFAULT_CONFIG_FILE_NAME = 'migrate.config.js';
var customConfigContent = null;

function getConfigPath() {
  const configPath = global.MIGRATE_CONFIG_PATH ?? null;
  if (!configPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configPath)) return configPath;
  return path.join(process.cwd(), configPath);
}

var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.access(configPath);
      } catch (e) {
        throw new Error('config file does not exist: ' + configPath);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const err = new Error('config file already exists: ' + configPath);
      try {
        await fs.access(configPath);
        throw err;
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  },
  getConfigFilename() {
    return path.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) return customConfigContent;
    const configPath = getConfigPath();
    try {
      let config = await module_loader_default.require(configPath);
      config = getModuleExports(config);
      if (global.MIGRATE_CONFIG_PATH) {
        config = { ...config, migrationsDir: global.MIGRATE_CONFIG_PATH };
      }
      return config;
    } catch (e) {
      if (e.code === 'ERR_REQUIRE_ESM' || e.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        let config = await module_loader_default.import(pathToFileURL(configPath));
        config = getModuleExports(config);
        if (global.MIGRATE_CONFIG_PATH) {
          config = { ...config, migrationsDir: global.MIGRATE_CONFIG_PATH };
        }
        return config;
      }
      throw e;
    }
  }
};

export { config_default as default };
