import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";

// A value supplied through set() takes precedence over a configuration file.
// As in the recovered implementation, only truthy values do so.
let customConfigContent = null;

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(module) {
  return module.default || module;
}

const moduleLoader = {
  require(modulePath) {
    const require = createRequire(path.join(process.cwd(), "package.json"));
    return require(modulePath);
  },

  import(modulePath) {
    return import(pathToFileURL(modulePath).href);
  },
};

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
    } catch {
      return;
    }
    throw new Error(`config file already exists: ${configPath}`);
  },

  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      return getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (error && error.code === "ERR_REQUIRE_ESM") {
        return getModuleExports(await moduleLoader.import(configPath));
      }
      throw error;
    }
  },
};

export default config;
