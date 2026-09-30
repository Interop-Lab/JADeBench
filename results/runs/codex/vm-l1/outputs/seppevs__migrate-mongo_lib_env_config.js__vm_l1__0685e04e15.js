import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const moduleLoader = {
  require(modulePath) {
    const packageUrl = pathToFileURL(path.join(process.cwd(), "package.json"));
    return createRequire(packageUrl)(modulePath);
  },
};

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
let customConfigContent = null;

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(loadedModule) {
  return loadedModule.default || loadedModule;
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
    try {
      await fs.stat(configPath);
    } catch {
      return;
    }

    throw new Error(`config file already exists: ${configPath}`);
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const loadedModule = moduleLoader.require(getConfigPath());
    return getModuleExports(loadedModule);
  },
};

export { config as default };
