import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

let customConfigContent = null;

const moduleLoader = {
  require(filePath) {
    return createRequire(import.meta.url)(filePath);
  },
  async import(filePath) {
    return import(pathToFileURL(filePath).href);
  },
};

function getConfigPath() {
  const configuredPath = globalThis.options?.file || DEFAULT_CONFIG_FILE_NAME;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function getModuleExports(loadedModule) {
  return loadedModule?.default ?? loadedModule;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,
  set(configContent) {
    customConfigContent = configContent;
  },
  async shouldExist() {
    try {
      await fs.access(getConfigPath());
    } catch {
      throw new Error(`Config file does not exist: ${getConfigPath()}`);
    }
  },
  async shouldNotExist() {
    try {
      await fs.access(getConfigPath());
    } catch {
      return;
    }
    throw new Error(`Config file already exists: ${getConfigPath()}`);
  },
  getConfigFilename() {
    return path.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) return customConfigContent;
    await this.shouldExist();
    const configPath = getConfigPath();
    try {
      return getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      if (!["ERR_REQUIRE_ESM", "ERR_REQUIRE_ASYNC_MODULE"].includes(error?.code)) throw error;
      return getModuleExports(await moduleLoader.import(configPath));
    }
  },
};

async function resolveMigrationsDirPath() {
  const settings = await config.read();
  const configuredPath = settings.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

async function resolveMigrationFileExtension() {
  const settings = await config.read();
  const extension = settings.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  if (!extension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(await resolveMigrationsDirPath(), await resolveSampleMigrationFileName());
}

function getModuleExports2(loadedModule) {
  const migration = getModuleExports(loadedModule);
  return migration?.up || migration?.down ? migration : loadedModule;
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      const stat = await fs.stat(directory);
      if (!stat.isDirectory()) throw new Error();
    } catch {
      throw new Error(`Migrations directory does not exist: ${directory}`);
    }
  },
  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.access(directory);
    } catch {
      return;
    }
    throw new Error(`Migrations directory already exists: ${directory}`);
  },
  async getFileNames() {
    await this.shouldExist();
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    return (await fs.readdir(directory))
      .filter((fileName) => fileName.endsWith(extension) && fileName !== sampleFileName)
      .sort();
  },
  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return getModuleExports2(moduleLoader.require(migrationPath));
    } catch (error) {
      if (!["ERR_REQUIRE_ESM", "ERR_REQUIRE_ASYNC_MODULE"].includes(error?.code)) throw error;
      return getModuleExports2(await moduleLoader.import(pathToFileURL(migrationPath).href));
    }
  },
  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const contents = await fs.readFile(migrationPath);
    return crypto.createHash("sha256").update(contents).digest("hex");
  },
  async doesSampleMigrationExist() {
    try {
      await fs.access(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  },
};

async function status(db) {
  const settings = await config.read();
  const migrationFiles = await migrationsDir.getFileNames();
  const changelog = await db
    .collection(settings.changelogCollectionName)
    .find({}, { projection: { _id: 0 } })
    .sort({ appliedAt: 1 })
    .toArray();
  const appliedByName = new Map(changelog.map((entry) => [entry.fileName, entry]));
  return migrationFiles.map((fileName) => {
    const applied = appliedByName.get(fileName);
    return {
      fileName,
      appliedAt: applied?.appliedAt || "PENDING",
      ...(applied?.checksum ? { checksum: applied.checksum } : {}),
    };
  });
}

async function getLockCollection(db) {
  const settings = await config.read();
  const collection = db.collection(settings.lockCollectionName);
  await collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: settings.lockTtl },
  );
  return collection;
}

async function exist(db) {
  return (await (await getLockCollection(db)).find({}).toArray()).length > 0;
}

async function activate(db) {
  await (await getLockCollection(db)).insertOne({ createdAt: new Date() });
}

async function clear(db) {
  await (await getLockCollection(db)).deleteMany({});
}

const lock = { exist, activate, clear };

async function up(db, client) {
  const settings = await config.read();
  const changelog = db.collection(settings.changelogCollectionName);
  if (await lock.exist(db)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }
  try {
    await lock.activate(db);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }
  try {
    const migrationStatus = await status(db);
    const pendingMigrations = migrationStatus.filter(
      (migration) => migration.appliedAt === "PENDING",
    );
    const completed = [];
    for (const { fileName } of pendingMigrations) {
      const migration = await migrationsDir.loadMigration(fileName);
      await migration.up(db, client);
      const changelogEntry = { fileName, appliedAt: new Date() };
      if (settings.useFileHash) {
        changelogEntry.checksum = await migrationsDir.loadFileHash(fileName);
      }
      await changelog.insertOne(changelogEntry);
      completed.push(fileName);
    }
    return completed;
  } finally {
    await lock.clear(db);
  }
}

export { up as default };
