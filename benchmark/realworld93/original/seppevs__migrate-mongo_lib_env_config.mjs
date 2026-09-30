// ../work/seppevs__migrate-mongo/lib/utils/module-loader.js
import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
var module_loader_default = {
  require(requirePath) {
    const requireFunc = createRequire(pathToFileURL(path.join(process.cwd(), "package.json")));
    return requireFunc(requirePath);
  },
  import(importPath) {
    return import(importPath);
  }
};

// ../work/seppevs__migrate-mongo/lib/env/config.js
import fs from "fs/promises";
import path2 from "path";
import url from "url";
var DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
var customConfigContent = null;
function getConfigPath() {
  const fileOptionValue = global.options?.file ?? null;
  if (!fileOptionValue) {
    return path2.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path2.isAbsolute(fileOptionValue)) {
    return fileOptionValue;
  }
  return path2.join(process.cwd(), fileOptionValue);
}
function getModuleExports(module) {
  return module.default ? module.default : module;
}
var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(configContent) {
    customConfigContent = configContent;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.stat(configPath);
      } catch (err) {
        throw new Error(`config file does not exist: ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error(`config file already exists: ${configPath}`);
      try {
        await fs.stat(configPath);
        throw error;
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw error;
        }
      }
    }
  },
  getConfigFilename() {
    return path2.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const configPath = getConfigPath();
    try {
      let config = await module_loader_default.require(configPath);
      config = getModuleExports(config);
      if (global.options?.migrationsDir) {
        config = { ...config, migrationsDir: global.options.migrationsDir };
      }
      return config;
    } catch (e) {
      if (e.code === "ERR_REQUIRE_ESM" || e.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let loadedImport = await module_loader_default.import(url.pathToFileURL(configPath));
        let config = getModuleExports(loadedImport);
        if (global.options?.migrationsDir) {
          config = { ...config, migrationsDir: global.options.migrationsDir };
        }
        return config;
      }
      throw e;
    }
  }
};
export {
  config_default as default
};
