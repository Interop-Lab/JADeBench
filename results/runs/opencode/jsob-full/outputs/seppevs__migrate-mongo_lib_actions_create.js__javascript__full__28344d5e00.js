import { createRequire } from "module";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import crypto from "crypto";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXTENSION = ".js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const requireFromWorkingDirectory = createRequire(
  pathToFileURL(path.join(process.cwd(), "package.json")),
);

let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function getDefaultExport(module) {
  return module.default ? module.default : module;
}

async function importModule(modulePath) {
  return import(pathToFileURL(modulePath));
}

function applyMigrationsDirectoryOverride(config) {
  if (!global.options?.migrationsDir) return config;
  return { ...config, migrationsDir: global.options.migrationsDir };
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(content) {
    customConfigContent = content;
  },

  async shouldExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    try {
      await fs.stat(configPath);
    } catch {
      throw Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    const alreadyExists = Error(`config file already exists: ${configPath}`);
    try {
      await fs.stat(configPath);
      throw alreadyExists;
    } catch (error) {
      if (error.code !== "ENOENT") throw alreadyExists;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      const loaded = getDefaultExport(requireFromWorkingDirectory(configPath));
      return applyMigrationsDirectoryOverride(loaded);
    } catch (error) {
      if (
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        const loaded = getDefaultExport(await importModule(configPath));
        return applyMigrationsDirectoryOverride(loaded);
      }
      throw error;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    migrationsDir = (await config.read()).migrationsDir;
    if (!migrationsDir) migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  return path.isAbsolute(migrationsDir)
    ? migrationsDir
    : path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;
  try {
    extension =
      (await config.read()).migrationFileExtension ||
      DEFAULT_MIGRATION_EXTENSION;
  } catch {
    extension = DEFAULT_MIGRATION_EXTENSION;
  }

  if (extension && !extension.startsWith(".")) {
    throw Error("migrationFileExtension must start with dot");
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

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
    } catch {
      throw Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    const alreadyExists = Error(
      `migrations directory already exists: ${directory}`,
    );
    try {
      await fs.stat(directory);
      throw alreadyExists;
    } catch (error) {
      if (error.code !== "ENOENT") throw alreadyExists;
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const entries = await fs.readdir(directory);
    return entries
      .filter(
        (entry) =>
          path.extname(entry) === extension &&
          path.basename(entry) !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName,
    );
    try {
      return getDefaultExport(requireFromWorkingDirectory(migrationPath));
    } catch (error) {
      if (
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        return getDefaultExport(await importModule(migrationPath));
      }
      throw error;
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

function currentUtcTimeAsLocalDate(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

function currentTimestamp() {
  const date = currentUtcTimeAsLocalDate();
  const pad = (value) => String(value).padStart(2, "0");
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

async function createMigration(description) {
  if (!description) throw Error("Missing parameter: description");

  await migrationsDir.shouldExist();
  const directory = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let templatePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    templatePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const loadedConfig = await config.read();
    templatePath = path.join(
      dirname,
      `../../samples/${loadedConfig.moduleSystem}/migration.js`,
    );
  }

  const fileName = `${currentTimestamp()}-${description
    .split(" ")
    .join("_")}${extension}`;
  await fs.cp(templatePath, path.join(directory, fileName));
  return fileName;
}

export { createMigration as default };
