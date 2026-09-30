import { createRequire } from "module";
import { pathToFileURL } from "url";
import fs from "fs/promises";
import path from "path";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const require = createRequire(import.meta.url);
let customConfigContent = null;

const moduleLoader = {
  require(filename) {
    return require(filename);
  },

  async import(filename) {
    return import(pathToFileURL(filename).href);
  },
};

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(loadedModule) {
  return loadedModule && loadedModule.default
    ? loadedModule.default
    : loadedModule;
}

async function loadConfigModule(filename) {
  try {
    return moduleLoader.require(filename);
  } catch (error) {
    if (error.code !== "ERR_REQUIRE_ESM") {
      throw error;
    }
    return moduleLoader.import(filename);
  }
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
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

    const loadedModule = await loadConfigModule(getConfigPath());
    return getModuleExports(loadedModule);
  },
};

export default config;

