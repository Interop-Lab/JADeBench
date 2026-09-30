import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const requireFromProject = createRequire(
  pathToFileURL(path.join(process.cwd(), 'package.json')),
);

let customConfigContent = null;

function getConfigPath() {
  const configFile = global.options?.configFile ?? null;

  if (!configFile) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  return path.isAbsolute(configFile)
    ? configFile
    : path.join(process.cwd(), configFile);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
}

function applyMigrationsDir(config) {
  if (!global.options?.migrationsDir) {
    return config;
  }

  return {
    ...config,
    migrationsDir: global.options.migrationsDir,
  };
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    try {
      await fs.stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    const alreadyExistsError = new Error(`config file already exists: ${configPath}`);

    try {
      await fs.stat(configPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw alreadyExistsError;
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
    try {
      const loadedConfig = requireFromProject(configPath);
      return applyMigrationsDir(getModuleExports(loadedConfig));
    } catch (error) {
      if (
        error.code !== 'ERR_REQUIRE_ESM' &&
        error.code !== 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        throw error;
      }

      const loadedConfig = await import(pathToFileURL(configPath).href);
      return applyMigrationsDir(getModuleExports(loadedConfig));
    }
  },
};

export { config as default };
