// ../work/seppevs__migrate-mongo/lib/utils/date.js
var now = (dateString = Date.now()) => {
  const date = new Date(dateString);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
};
var nowAsString = () => {
  const d = now();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  const hour = `0${d.getHours()}`.slice(-2);
  const minutes = `0${d.getMinutes()}`.slice(-2);
  const seconds = `0${d.getSeconds()}`.slice(-2);
  return `${d.getFullYear()}${month}${day}${hour}${minutes}${seconds}`;
};
var date_default = { now, nowAsString };

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

// ../work/seppevs__migrate-mongo/lib/env/migrationsDir.js
import fs2 from "fs/promises";
import path3 from "path";
import url2 from "url";
import crypto from "crypto";
var DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
var DEFAULT_MIGRATION_EXT = ".js";
async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const configContent = await config_default.read();
    migrationsDir = configContent.migrationsDir;
    if (!migrationsDir) {
      migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (err) {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (path3.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }
  return path3.join(process.cwd(), migrationsDir);
}
async function resolveMigrationFileExtension() {
  let migrationFileExtension;
  try {
    const configContent = await config_default.read();
    migrationFileExtension = configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    migrationFileExtension = DEFAULT_MIGRATION_EXT;
  }
  if (migrationFileExtension && !migrationFileExtension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return migrationFileExtension;
}
async function resolveSampleMigrationFileName() {
  const migrationFileExtention = await resolveMigrationFileExtension();
  return `sample-migration${migrationFileExtention}`;
}
async function resolveSampleMigrationPath() {
  const migrationsDir = await resolveMigrationsDirPath();
  const sampleMigrationSampleFileName = await resolveSampleMigrationFileName();
  return path3.join(migrationsDir, sampleMigrationSampleFileName);
}
function getModuleExports2(module) {
  return module.default ? module.default : module;
}
var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  async shouldExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    try {
      await fs2.stat(migrationsDir);
    } catch (err) {
      throw new Error(`migrations directory does not exist: ${migrationsDir}`);
    }
  },
  async shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error(
      `migrations directory already exists: ${migrationsDir}`
    );
    try {
      await fs2.stat(migrationsDir);
      throw error;
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw error;
      }
    }
  },
  async getFileNames() {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationExt = await resolveMigrationFileExtension();
    const files = await fs2.readdir(migrationsDir);
    const sampleMigrationFileName = await resolveSampleMigrationFileName();
    return files.filter((file) => path3.extname(file) === migrationExt && path3.basename(file) !== sampleMigrationFileName).sort();
  },
  async loadMigration(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationPath = path3.join(migrationsDir, fileName);
    try {
      const result = module_loader_default.require(migrationPath);
      return getModuleExports2(result);
    } catch (e) {
      if (e.code === "ERR_REQUIRE_ESM" || e.code === "ERR_REQUIRE_ASYNC_MODULE") {
        const loadedImport = await module_loader_default.import(url2.pathToFileURL(migrationPath));
        return getModuleExports2(loadedImport);
      }
      throw e;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path3.join(migrationsDir, fileName);
    const hash = crypto.createHash("sha256");
    const input = await fs2.readFile(filePath);
    hash.update(input);
    return hash.digest("hex");
  },
  async doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      await fs2.stat(samplePath);
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ../work/seppevs__migrate-mongo/lib/actions/create.js
import fs3 from "fs/promises";
import path4 from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
var create_default = async (description) => {
  if (!description) {
    throw new Error("Missing parameter: description");
  }
  await migrationsDir_default.shouldExist();
  const migrationsDirPath = await migrationsDir_default.resolve();
  const migrationExtension = await migrationsDir_default.resolveMigrationFileExtension();
  let source;
  if (await migrationsDir_default.doesSampleMigrationExist()) {
    source = await migrationsDir_default.resolveSampleMigrationPath();
  } else {
    const configContent = await config_default.read();
    source = path4.join(__dirname, `../../samples/${configContent.moduleSystem}/migration.js`);
  }
  const filename = `${date_default.nowAsString()}-${description.split(" ").join("_")}${migrationExtension}`;
  const destination = path4.join(migrationsDirPath, filename);
  await fs3.cp(source, destination);
  return filename;
};
export {
  create_default as default
};
