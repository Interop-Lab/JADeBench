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

function getDefaultExport(module) {
  return module.default ? module.default : module;
}

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.join(process.cwd(), configuredPath);
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
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    const existsError = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.stat(configPath);
      throw existsError;
    } catch (error) {
      if (error.code !== "ENOENT") throw existsError;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let loadedConfig = getDefaultExport(await moduleLoader.require(configPath));
      if (global.options?.migrationsDir) {
        loadedConfig = { ...loadedConfig, migrationsDir: global.options.migrationsDir };
      }
      return loadedConfig;
    } catch (error) {
      if (error.code !== "ERR_REQUIRE_ESM" && error.code !== "ERR_REQUIRE_ASYNC_MODULE") {
        throw error;
      }

      let loadedConfig = getDefaultExport(
        await moduleLoader.import(pathToFileURL(configPath)),
      );
      if (global.options?.migrationsDir) {
        loadedConfig = { ...loadedConfig, migrationsDir: global.options.migrationsDir };
      }
      return loadedConfig;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    migrationsDir = (await config.read()).migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
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
    extension = (await config.read()).migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }
  if (extension && !extension.startsWith(".")) {
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

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
    } catch {
      throw new Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    const existsError = new Error(`migrations directory already exists: ${directory}`);
    try {
      await fs.stat(directory);
      throw existsError;
    } catch (error) {
      if (error.code !== "ENOENT") throw existsError;
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleName = await resolveSampleMigrationFileName();
    const files = await fs.readdir(directory);
    return files
      .filter(file => path.extname(file) === extension && path.basename(file) !== sampleName)
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return getDefaultExport(moduleLoader.require(migrationPath));
    } catch (error) {
      if (error.code === "ERR_REQUIRE_ESM" || error.code === "ERR_REQUIRE_ASYNC_MODULE") {
        return getDefaultExport(await moduleLoader.import(pathToFileURL(migrationPath)));
      }
      throw error;
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const hash = crypto.createHash("sha256");
    hash.update(await fs.readFile(migrationPath));
    return hash.digest("hex");
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

async function getMigrationStatus(database) {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = await database.collection(changelogCollectionName).find({}).toArray();

  return Promise.all(fileNames.map(async fileName => {
    let fileHash;
    let migrationIdentity = { fileName };
    if (useFileHash === true) {
      fileHash = await migrationsDir.loadFileHash(fileName);
      migrationIdentity = { fileName, fileHash };
    }

    const appliedMigration = changelog.find(entry =>
      entry.fileName === migrationIdentity.fileName &&
      (!migrationIdentity.fileHash || entry.fileHash === migrationIdentity.fileHash));
    const appliedAt = appliedMigration ? appliedMigration.appliedAt.toJSON() : "PENDING";
    const migrationBlock = appliedMigration?.migrationBlock;

    return useFileHash
      ? { fileName, fileHash, appliedAt, migrationBlock }
      : { fileName, appliedAt, migrationBlock };
  }));
}

async function getLockCollection(database) {
  const { lockCollectionName, lockTtl } = await config.read();
  if (!lockCollectionName || lockTtl <= 0) return null;

  const collection = database.collection(lockCollectionName);
  collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: lockTtl },
  );
  return collection;
}

const lock = {
  async exist(database) {
    const collection = await getLockCollection(database);
    if (!collection) return false;
    return (await collection.find({}).toArray()).length > 0;
  },

  async activate(database) {
    const collection = await getLockCollection(database);
    if (collection) await collection.insertOne({ createdAt: new Date() });
  },

  async clear(database) {
    const collection = await getLockCollection(database);
    if (collection) await collection.deleteMany({});
  },
};

async function up(database, client) {
  const status = await getMigrationStatus(database);
  const pendingMigrations = status.filter(migration => migration.appliedAt === "PENDING");
  const migrated = [];
  const migrationBlock = Date.now();

  if (await lock.exist(database)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }

  try {
    await lock.activate(database);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }

  for (const pendingMigration of pendingMigrations) {
    try {
      const migration = await migrationsDir.loadMigration(pendingMigration.fileName);
      await migration.up(database, client);
    } catch (error) {
      const migrationError = new Error(
        `Could not migrate up ${pendingMigration.fileName}: ${error.message}`,
      );
      migrationError.stack = error.stack;
      migrationError.migrated = migrated;
      if (error.errInfo) migrationError.additionalInfo = error.errInfo;
      await lock.clear(database);
      throw migrationError;
    }

    const { changelogCollectionName, useFileHash } = await config.read();
    const changelog = database.collection(changelogCollectionName);
    const appliedMigration = {
      fileName: pendingMigration.fileName,
      appliedAt: new Date(),
      migrationBlock,
    };
    if (useFileHash === true) appliedMigration.fileHash = pendingMigration.fileHash;

    try {
      await changelog.insertOne(appliedMigration);
    } catch (error) {
      throw new Error(`Could not update changelog: ${error.message}`);
    }
    migrated.push(pendingMigration.fileName);
  }

  await lock.clear(database);
  return migrated;
}

export { up as default };
