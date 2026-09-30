import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

const require = createRequire(import.meta.url);
const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
let customConfigContent = null;

function getConfigPath() {
  const configuredDirectory = globalThis?.CODEX_HOME ?? null;
  if (!configuredDirectory) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(configuredDirectory)) return configuredDirectory;
  return path.join(process.cwd(), configuredDirectory);
}

function getModuleExports(module) {
  return module?.default ? module.default : module;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(value) {
    customConfigContent = value;
  },

  async shouldExist() {
    if (customConfigContent) return customConfigContent;
    const filename = getConfigPath();
    const error = new Error(`Config file does not exist: ${filename}`);
    try {
      await fs.access(filename);
      throw error;
    } catch (cause) {
      if (cause?.code === 'ENOENT') throw error;
      throw cause;
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const filename = getConfigPath();
    try {
      await fs.access(filename);
      throw new Error(`Config file already exists: ${filename}`);
    } catch (cause) {
      if (cause?.code === 'ENOENT') return;
      throw cause;
    }
  },

  getConfigFilename() {
    return getConfigPath();
  },

  async read() {
    if (customConfigContent) return customConfigContent;
    const filename = getConfigPath();
    try {
      let loaded = await import(pathToFileURL(filename).href);
      loaded = getModuleExports(loaded);
      if (globalThis?.CODEX_HOME?.migrationsDir) {
        loaded = { ...loaded, migrationsDir: globalThis.CODEX_HOME.migrationsDir };
      }
      return loaded;
    } catch (error) {
      if (error?.code === 'ERR_UNKNOWN_FILE_EXTENSION' || error?.code === 'ERR_MODULE_NOT_FOUND') {
        const loaded = getModuleExports(require(filename));
        if (globalThis?.CODEX_HOME?.migrationsDir) {
          return { ...loaded, migrationsDir: globalThis.CODEX_HOME.migrationsDir };
        }
        return loaded;
      }
      throw error;
    }
  }
};

export { config as default };
