import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const nativeRequire = createRequire(import.meta.url);

const moduleLoader = {
  require(modulePath) {
    const resolvedPath = path.resolve(modulePath);
    const moduleId = nativeRequire.resolve(resolvedPath);
    delete nativeRequire.cache[moduleId];
    return nativeRequire(moduleId);
  },

  import(modulePath) {
    const moduleUrl =
      modulePath instanceof URL
        ? modulePath.href
        : pathToFileURL(path.resolve(modulePath)).href;

    return import(moduleUrl);
  }
};

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
let customConfigContent = null;

function getConfigPath() {
  const configFileName =
    process.env.MIGRATE_MONGO_CONFIG_FILE || DEFAULT_CONFIG_FILE_NAME;

  return path.join(process.cwd(), configFileName);
}

async function getModuleExports(modulePath) {
  try {
    return moduleLoader.require(modulePath);
  } catch (error) {
    if (error?.code !== "ERR_REQUIRE_ESM") {
      throw error;
    }

    const importedModule = await moduleLoader.import(modulePath);
    return importedModule.default;
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
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }

    await this.shouldExist();
    return getModuleExports(getConfigPath());
  }
};

export default config;
