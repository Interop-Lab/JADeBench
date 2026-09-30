import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATION_EXT = ".js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";

const require = createRequire(import.meta.url);

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

async function loadModule(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    if (error?.code !== "ERR_REQUIRE_ESM") {
      throw error;
    }
    return import(pathToFileURL(modulePath).href);
  }
}

async function readConfig() {
  const configPath = getConfigPath();
  const loadedConfig = await loadModule(configPath);
  return loadedConfig?.default ?? loadedConfig;
}

async function ensureConfigExists() {
  try {
    await fs.access(getConfigPath());
  } catch {
    throw new Error(`config file does not exist: ${getConfigPath()}`);
  }
}

function resolveMigrationsDirPath(migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME) {
  return path.resolve(process.cwd(), migrationsDir);
}

function resolveMigrationFileExtension(
  migrationFileExtension = DEFAULT_MIGRATION_EXT,
) {
  return migrationFileExtension || DEFAULT_MIGRATION_EXT;
}

function resolveSampleMigrationFileName(migrationFileExtension) {
  return `sample-migration${resolveMigrationFileExtension(
    migrationFileExtension,
  )}`;
}

function resolveSampleMigrationPath(
  migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME,
  migrationFileExtension,
) {
  return path.join(
    resolveMigrationsDirPath(migrationsDir),
    resolveSampleMigrationFileName(migrationFileExtension),
  );
}

async function ensureMigrationsDirExists(migrationsDir) {
  const migrationsDirPath = resolveMigrationsDirPath(migrationsDir);

  try {
    await fs.access(migrationsDirPath);
  } catch {
    throw new Error(`migrations directory does not exist: ${migrationsDirPath}`);
  }
}

function now(date) {
  return date || new Date();
}

function nowAsString() {
  return now().toISOString().replace(/[-T:]/g, "").split(".")[0];
}

async function create(description) {
  await ensureConfigExists();

  const {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME,
    migrationFileExtension = DEFAULT_MIGRATION_EXT,
  } = await readConfig();

  await ensureMigrationsDirExists(migrationsDir);

  const extension = resolveMigrationFileExtension(migrationFileExtension);
  const migrationFileName = `${nowAsString()}-${description}${extension}`;
  const migrationFilePath = path.join(
    resolveMigrationsDirPath(migrationsDir),
    migrationFileName,
  );
  const sampleMigrationPath = resolveSampleMigrationPath(
    migrationsDir,
    migrationFileExtension,
  );

  const sampleMigration = await fs.readFile(sampleMigrationPath);
  await fs.writeFile(migrationFilePath, sampleMigration);

  return migrationFileName;
}

export { create as default };
