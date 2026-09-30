import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

const DEFAULT_CONFIG_FILE_NAME = 'migration-config.js';

let customConfigContent = null;

function getConfigPath() {
  const configFile = global.pgmConfig?.configFile ?? null;

  if (!configFile) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  if (path.isAbsolute(configFile)) {
    return configFile;
  }

  return path.join(process.cwd(), configFile);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
}

const requireFromCurrentDirectory = createRequire(
  pathToFileURL(path.join(process.cwd(), 'noop.js')),
);

const moduleLoader = {
  require(modulePath) {
    return requireFromCurrentDirectory(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function applyGlobalOverrides(config) {
  if (global.pgmConfig?.migrationsDir) {
    return {
      ...config,
      migrationsDir: global.pgmConfig.migrationsDir,
    };
  }

  return config;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(content) {
    customConfigContent = content;
  },

  async shouldExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`Configuration file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    const alreadyExistsError = new Error(
      `Configuration file already exists: ${configPath}`,
    );

    try {
      await fs.access(configPath);
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
      const loadedModule = moduleLoader.require(configPath);
      return applyGlobalOverrides(getModuleExports(loadedModule));
    } catch (error) {
      if (
        error.code === 'ERR_REQUIRE_ESM' ||
        error.code === 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        const loadedModule = await moduleLoader.import(
          pathToFileURL(configPath),
        );
        return applyGlobalOverrides(getModuleExports(loadedModule));
      }

      throw error;
    }
  },
};

export default config;
