import { createRequire } from "module";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

function now(value) {
  const date = value === undefined ? new Date(Date.now()) : new Date(value);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function nowAsString() {
  const date = now();
  const pad = (value) => `0${value}`.slice(-2);

  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

const moduleLoader = {
  require(modulePath) {
    const localRequire = createRequire(
      pathToFileURL(path.join(process.cwd(), "package.json")),
    );
    return localRequire(modulePath);
  },
  import(moduleUrl) {
    return import(moduleUrl);
  },
};

let customConfigContent;

function getConfigPath() {
  const configuredFile = global.options?.file || DEFAULT_CONFIG_FILE_NAME;
  if (path.isAbsolute(configuredFile)) return configuredFile;
  return path.join(process.cwd(), configuredFile);
}

function getModuleExports(module) {
  return module.default || module;
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
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    throw new Error(`config file already exists: ${configPath}`);
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    let loadedConfig;
    try {
      loadedConfig = getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (
        error.code !== "ERR_REQUIRE_ESM" &&
        error.code !== "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        throw error;
      }
      loadedConfig = getModuleExports(
        await moduleLoader.import(pathToFileURL(configPath)),
      );
    }

    if (global.options?.migrationsDir) {
      loadedConfig.migrationsDir = global.options.migrationsDir;
    }
    return loadedConfig;
  },
};

async function resolveMigrationsDirPath() {
  const loadedConfig = await config.read();
  const migrationsDir =
    loadedConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  if (path.isAbsolute(migrationsDir)) return migrationsDir;
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  const loadedConfig = await config.read();
  const extension = loadedConfig.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  if (!extension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(
    await resolveMigrationsDirPath(),
    await resolveSampleMigrationFileName(),
  );
}

function getMigrationModuleExports(module) {
  return module.default || module;
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directoryPath = await resolveMigrationsDirPath();
    try {
      await fs.stat(directoryPath);
    } catch {
      throw new Error(`migrations directory does not exist: ${directoryPath}`);
    }
  },

  async shouldNotExist() {
    const directoryPath = await resolveMigrationsDirPath();
    try {
      await fs.stat(directoryPath);
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    throw new Error(`migrations directory already exists: ${directoryPath}`);
  },

  async getFileNames() {
    const directoryPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const fileNames = await fs.readdir(directoryPath);

    return fileNames
      .filter(
        (fileName) =>
          path.extname(fileName) === extension &&
          path.basename(fileName) !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName,
    );
    try {
      return getMigrationModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      if (
        error.code !== "ERR_REQUIRE_ESM" &&
        error.code !== "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        throw error;
      }
      return getMigrationModuleExports(
        await moduleLoader.import(pathToFileURL(migrationPath)),
      );
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName,
    );
    return crypto
      .createHash("sha256")
      .update(await fs.readFile(migrationPath))
      .digest("hex");
  },

  async doesSampleMigrationExist() {
    try {
      await fs.stat(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function create(description) {
  if (!description) throw new Error("Missing parameter: description");

  await migrationsDir.shouldExist();
  const directoryPath = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let samplePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    samplePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const loadedConfig = await config.read();
    samplePath = path.join(
      __dirname,
      `../../samples/${loadedConfig.moduleSystem}/migration.js`,
    );
  }

  const fileName = `${nowAsString()}-${description.split(" ").join("_")}${extension}`;
  await fs.cp(samplePath, path.join(directoryPath, fileName));
  return fileName;
}

export { create as default };
