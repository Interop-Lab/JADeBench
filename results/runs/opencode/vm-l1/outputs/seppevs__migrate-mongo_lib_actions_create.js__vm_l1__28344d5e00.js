import { createRequire } from "module";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

const moduleFilename = fileURLToPath(import.meta.url);
const moduleDirectory = path.dirname(moduleFilename);
let customConfigContent = null;

const date = {
  now(value) {
    return value || new Date();
  },

  nowAsString() {
    const value = this.now();
    const pad = (part) => String(part).padStart(2, "0");
    return [
      value.getFullYear(),
      pad(value.getMonth() + 1),
      pad(value.getDate()),
      pad(value.getHours()),
      pad(value.getMinutes()),
      pad(value.getSeconds()),
    ].join("");
  },
};

function getModuleExports(loadedModule) {
  return loadedModule?.default || loadedModule;
}

const moduleLoader = {
  require(moduleName) {
    const packageFileUrl = pathToFileURL(path.join(process.cwd(), "package.json"));
    return createRequire(packageFileUrl)(moduleName);
  },

  async import(moduleName) {
    return import(moduleName);
  },
};

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    try {
      await fs.stat(getConfigPath());
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`config file does not exist: ${getConfigPath()}`);
      }
      throw error;
    }
  },

  async shouldNotExist() {
    try {
      await fs.stat(getConfigPath());
      throw new Error(`config file already exists: ${getConfigPath()}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;
    return getModuleExports(moduleLoader.require(getConfigPath()));
  },
};

async function readConfig() {
  return config.read();
}

async function resolveMigrationsDirPath() {
  const { migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME } = await readConfig();
  return path.isAbsolute(migrationsDir)
    ? migrationsDir
    : path.resolve(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  const { migrationFileExtension = DEFAULT_MIGRATION_EXT } = await readConfig();
  if (!migrationFileExtension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return migrationFileExtension;
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

async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`migrations directory does not exist: ${directory}`);
      }
      throw error;
    }
  },

  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
      throw new Error(`migrations directory already exists: ${directory}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    return (await fs.readdir(directory))
      .filter((fileName) => fileName.endsWith(extension))
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    return getModuleExports(moduleLoader.require(migrationPath));
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const contents = await fs.readFile(migrationPath);
    return crypto.createHash("sha256").update(contents).digest("hex");
  },

  async doesSampleMigrationExist() {
    return pathExists(await resolveSampleMigrationPath());
  },
};

async function createMigration(description) {
  await migrationsDir.shouldExist();

  const migrationFileExtension = await resolveMigrationFileExtension();
  const migrationFileName = `${date.nowAsString()}-${description.replace(/\s+/g, "_")}${migrationFileExtension}`;
  const migrationDirectory = await resolveMigrationsDirPath();
  const sampleMigrationPath = await resolveSampleMigrationPath();
  const { moduleSystem } = await readConfig();

  const templatePath = await migrationsDir.doesSampleMigrationExist()
    ? sampleMigrationPath
    : path.join(moduleDirectory, `../../samples/${moduleSystem}/migration.js`);

  await fs.cp(templatePath, path.join(migrationDirectory, migrationFileName));
  return migrationFileName;
}

export default createMigration;
