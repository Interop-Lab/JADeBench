import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL as pathToFileURL2 } from 'url';

var DEFAULT_CONFIG_FILE_NAME = 'config.json';
var customConfigContent = null;

function getConfigPath() {
  const envPath = global.process?.env?.CONFIG_PATH ?? null;
  if (!envPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(envPath)) return envPath;
  return path.join(process.cwd(), envPath);
}

var module_loader_default = {
  require(id) {
    const requireFn = createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')));
    return requireFn(id);
  },
  import(id) {
    return import(id);
  }
};

function getModuleExports(mod) {
  return mod.default ? mod.default : mod;
}

var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.access(configPath);
      } catch (err) {
        throw new Error(`Config file does not exist: ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error(`Config file already exists: ${configPath}`);
      try {
        await fs.access(configPath);
        throw error;
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw error;
        }
      }
    }
  },
  getConfigFilename() {
    return path.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) return customConfigContent;
    const configPath = getConfigPath();
    try {
      let mod = await module_loader_default.require(configPath);
      mod = getModuleExports(mod);
      if (global.process?.env?.MIGRATIONS_DIR) {
        mod = { ...mod, migrationsDir: global.process.env.MIGRATIONS_DIR };
      }
      return mod;
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_REQUIRE_ASYNC_MODULE') {
        let mod = await module_loader_default.import(pathToFileURL2(configPath));
        mod = getModuleExports(mod);
        if (global.process?.env?.MIGRATIONS_DIR) {
          mod = { ...mod, migrationsDir: global.process.env.MIGRATIONS_DIR };
        }
        return mod;
      }
      throw err;
    }
  }
};

export { config_default as default };
