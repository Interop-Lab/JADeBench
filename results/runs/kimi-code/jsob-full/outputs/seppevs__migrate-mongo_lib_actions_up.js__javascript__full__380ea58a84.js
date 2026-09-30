import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function getCliOptions() {
  return global.options ?? {};
}

function getConfigPath() {
  const configFile = getCliOptions().file;
  if (!configFile) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  return path.isAbsolute(configFile) ? configFile : path.join(process.cwd(), configFile);
}

function getDefaultExport(module) {
  return module.default ? module.default : module;
}

function requireFromWorkingDirectory(modulePath) {
  const require = createRequire(pathToFileURL(path.join(process.cwd(), '__migrate_mongo_loader__.js')));
  return require(modulePath);
}

async function loadModule(modulePath) {
  try {
    return getDefaultExport(requireFromWorkingDirectory(modulePath));
  } catch (error) {
    if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
      throw error;
    }
    return getDefaultExport(await import(pathToFileURL(modulePath)));
  }
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
    const alreadyExists = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.stat(configPath);
      throw alreadyExists;
    } catch (error) {
      if (error.code !== 'ENOENT') throw alreadyExists;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;
    const loadedConfig = await loadModule(getConfigPath());
    const migrationsDir = getCliOptions().migrationsDir;
    return migrationsDir ? { ...loadedConfig, migrationsDir } : loadedConfig;
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  try {
    migrationsDir = (await config.read()).migrationsDir || migrationsDir;
  } catch {}
  return path.isAbsolute(migrationsDir) ? migrationsDir : path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension = DEFAULT_MIGRATION_EXT;
  try {
    extension = (await config.read()).migrationFileExtension || extension;
  } catch {}
  if (extension && !extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(await resolveMigrationsDirPath(), await resolveSampleMigrationFileName());
}

const migrationsDir = {
  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
    } catch {
      throw new Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleName = await resolveSampleMigrationFileName();
    return (await fs.readdir(directory))
      .filter((fileName) => path.extname(fileName) === extension && path.basename(fileName) !== sampleName)
      .sort();
  },

  async loadMigration(fileName) {
    return loadModule(path.join(await resolveMigrationsDirPath(), fileName));
  },

  async loadFileHash(fileName) {
    const contents = await fs.readFile(path.join(await resolveMigrationsDirPath(), fileName));
    return crypto.createHash('sha256').update(contents).digest('hex');
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

async function migrationStatus(database) {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = await database.collection(changelogCollectionName).find({}).toArray();

  return Promise.all(fileNames.map(async (fileName) => {
    const fileHash = useFileHash === true ? await migrationsDir.loadFileHash(fileName) : undefined;
    const appliedMigration = changelog.find((entry) =>
      entry.fileName === fileName && (!fileHash || entry.fileHash === fileHash));
    const appliedAt = appliedMigration ? appliedMigration.appliedAt.toJSON() : 'PENDING';
    const migrationBlock = appliedMigration?.migrationBlock;

    return useFileHash === true
      ? { fileName, fileHash, appliedAt, migrationBlock }
      : { fileName, appliedAt, migrationBlock };
  }));
}

async function getLockCollection(database) {
  const { lockCollectionName, lockTtl } = await config.read();
  if (!lockCollectionName || lockTtl <= 0) return null;

  const collection = database.collection(lockCollectionName);
  await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: lockTtl });
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
  const pendingMigrations = (await migrationStatus(database))
    .filter((migration) => migration.appliedAt === 'PENDING');
  const migrated = [];
  const migrationBlock = Date.now();

  if (await lock.exist(database)) {
    throw new Error('Could not migrate up, a lock is held.');
  }

  try {
    await lock.activate(database);
  } catch (error) {
    throw new Error(`Could not acquire a lock: ${error.message}`);
  }

  for (const pendingMigration of pendingMigrations) {
    try {
      const migration = await migrationsDir.loadMigration(pendingMigration.fileName);
      await migration.up(database, client);
    } catch (cause) {
      const error = new Error(`Could not migrate up ${pendingMigration.fileName}: ${cause.message}`);
      error.cause = cause.cause;
      error.migrated = migrated;
      if (cause.errInfo) error.additionalInfo = cause.errInfo;
      await lock.clear(database);
      throw error;
    }

    const { changelogCollectionName, useFileHash } = await config.read();
    const changelog = database.collection(changelogCollectionName);
    const { fileName, fileHash } = pendingMigration;
    const appliedAt = new Date();

    try {
      const entry = useFileHash === true
        ? { fileName, fileHash, appliedAt, migrationBlock }
        : { fileName, appliedAt, migrationBlock };
      await changelog.insertOne(entry);
    } catch (error) {
      throw new Error(`Could not update changelog: ${error.message}`);
    }

    migrated.push(fileName);
  }

  await lock.clear(database);
  return migrated;
}

export { up as default };
