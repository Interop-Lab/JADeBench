import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

let customConfigContent = null;

function now(offset = 0) {
  const date = new Date(Date.now() + offset);

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
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

const moduleLoader = {
  require(modulePath) {
    const requireFromWorkingDirectory = createRequire(
      pathToFileURL(path.join(process.cwd(), "package.json")),
    );
    return requireFromWorkingDirectory(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function getConfigPath() {
  const configuredPath = global.options?.file;
  const configPath = configuredPath || DEFAULT_CONFIG_FILE_NAME;

  return path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);
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
    if (customConfigContent) {
      throw new Error(`config file already exists: ${getConfigPath()}`);
    }

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
    let configContent;

    try {
      configContent = getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (
        error.code !== "ERR_REQUIRE_ESM" &&
        error.code !== "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        throw error;
      }

      configContent = getModuleExports(
        await moduleLoader.import(pathToFileURL(configPath).href),
      );
    }

    if (global.options?.migrationsDir) {
      configContent.migrationsDir = global.options.migrationsDir;
    }

    return configContent;
  },
};

async function resolveMigrationsDirPath() {
  const configContent = await config.read();
  const configuredPath =
    configContent.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

async function resolveMigrationFileExtension() {
  const configContent = await config.read();
  const extension =
    configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;

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

function getImportedModuleExports(loadedModule) {
  return loadedModule.default || loadedModule;
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
    const fileNames = await fs.readdir(directoryPath);
    const sampleFileName = await resolveSampleMigrationFileName();

    return fileNames
      .filter(
        (fileName) =>
          fileName !== sampleFileName && fileName.endsWith(extension),
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName,
    );

    try {
      return getImportedModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      if (
        error.code !== "ERR_REQUIRE_ESM" &&
        error.code !== "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        throw error;
      }

      return getImportedModuleExports(
        await moduleLoader.import(pathToFileURL(migrationPath).href),
      );
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName,
    );
    const contents = await fs.readFile(migrationPath);

    return crypto.createHash("sha256").update(contents).digest("hex");
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
  if (!description) {
    throw new Error("Missing parameter: description");
  }

  await migrationsDir.shouldExist();

  const migrationsDirectory = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();
  const hasSampleMigration = await migrationsDir.doesSampleMigrationExist();
  let sourcePath;

  if (hasSampleMigration) {
    sourcePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const configContent = await config.read();
    sourcePath = path.join(
      __dirname,
      `../../samples/${configContent.moduleSystem}/migration.js`,
    );
  }
  const fileName = `${nowAsString()}-${description
    .split(" ")
    .join("_")}${extension}`;

  await fs.cp(sourcePath, path.join(migrationsDirectory, fileName));
  return fileName;
}

export default create;
