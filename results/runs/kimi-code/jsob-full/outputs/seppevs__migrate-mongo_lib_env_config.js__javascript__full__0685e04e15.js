import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.__migrateMongo?.configPath ?? null;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }
  return path.join(process.cwd(), configuredPath);
}

const moduleLoader = {
  require(filename) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'noop.js')));
    return require(filename);
  },
  import(filename) {
    return import(filename);
  }
};

function getModuleExports(module) {
  return module.default ? module.default : module;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    try {
      await fs.access(configPath);
      throw new Error(`config file already exists: ${configPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let loaded;
      try {
        loaded = moduleLoader.require(configPath);
      } catch (error) {
        if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
          throw error;
        }
        loaded = await moduleLoader.import(pathToFileURL(configPath).href);
      }

      let result = getModuleExports(loaded);
      if (global.__migrateMongo?.migrationsDir) {
        result = { ...result, migrationsDir: global.__migrateMongo.migrationsDir };
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
};

export { config as default };
