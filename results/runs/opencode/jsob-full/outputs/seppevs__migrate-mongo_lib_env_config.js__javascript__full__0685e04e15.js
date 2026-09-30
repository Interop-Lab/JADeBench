import { createRequire } from "module";
import { pathToFileURL } from "url";
import fs from "fs/promises";
import path from "path";

const moduleLoader = {
  require(modulePath) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), "package.json")));
    return require(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.join(process.cwd(), configuredPath);
}

function getModuleExports(loadedModule) {
  return loadedModule.__esModule ? loadedModule.default : loadedModule;
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
      await fs.stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    const alreadyExistsError = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.stat(configPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== "ENOENT") throw alreadyExistsError;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let loadedConfig = await moduleLoader.require(configPath);
      loadedConfig = getModuleExports(loadedConfig);
      if (global.options?.migrationsDir) {
        loadedConfig = {
          ...loadedConfig,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return loadedConfig;
    } catch (error) {
      if (error.code === "ERR_REQUIRE_ESM" || error.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let loadedConfig = await moduleLoader.import(pathToFileURL(configPath));
        loadedConfig = getModuleExports(loadedConfig);
        if (global.options?.migrationsDir) {
          loadedConfig = {
            ...loadedConfig,
            migrationsDir: global.options.migrationsDir,
          };
        }
        return loadedConfig;
      }
      throw error;
    }
  },
};

export default config;
