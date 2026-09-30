import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

const localRequire = createRequire(
  pathToFileURL(path.join(process.cwd(), 'package.json'))
);

const moduleLoader = {
  require(filename) {
    return localRequire(filename);
  },
  import(filename) {
    return import(filename);
  }
};

function getConfigPath() {
  const configuredPath = global.options?.file;

  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.join(process.cwd(), configuredPath);
}

function getModuleExports(module) {
  return module.default || module;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
    return customConfigContent;
  },

  async shouldExist() {
    if (customConfigContent) {
      return customConfigContent;
    }

    const configPath = getConfigPath();
    try {
      await fs.stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    const configPath = getConfigPath();

    if (customConfigContent) {
      throw new Error(`config file already exists: ${configPath}`);
    }

    try {
      await fs.stat(configPath);
      throw new Error(`config file already exists: ${configPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }

    const configPath = getConfigPath();
    let loadedConfig;

    try {
      loadedConfig = getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (
        error.code !== 'ERR_REQUIRE_ESM' &&
        error.code !== 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        throw error;
      }

      loadedConfig = getModuleExports(
        await moduleLoader.import(pathToFileURL(configPath))
      );
    }

    if (global.options?.migrationsDir) {
      loadedConfig = {
        ...loadedConfig,
        migrationsDir: global.options.migrationsDir
      };
    }

    return loadedConfig;
  }
};

export default config;
