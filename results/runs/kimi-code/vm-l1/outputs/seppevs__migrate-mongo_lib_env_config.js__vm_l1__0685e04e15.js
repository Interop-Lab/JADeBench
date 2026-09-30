import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
let customConfigContent = null;

const requireFromProject = createRequire(path.resolve("package.json"));

const moduleLoader = {
  require(modulePath) {
    return requireFromProject(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(requiredModule) {
  return requiredModule.default || requiredModule;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
    globalThis.customConfigContent = configContent;
  },

  async shouldExist() {
    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
    } catch {
      return;
    }

    throw new Error(`config file already exists: ${configPath}`);
  },

  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },

  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }

    const configPath = getConfigPath();

    try {
      return getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (error?.code !== "ERR_REQUIRE_ESM") {
        throw error;
      }

      return getModuleExports(await moduleLoader.import(pathToFileURL(configPath).href));
    }
  },
};

globalThis.module_loader_default = moduleLoader;
globalThis.DEFAULT_CONFIG_FILE_NAME = DEFAULT_CONFIG_FILE_NAME;
globalThis.customConfigContent = customConfigContent;
globalThis.getConfigPath = getConfigPath;
globalThis.getModuleExports = getModuleExports;
globalThis.config_default = config;

export { config as default };
