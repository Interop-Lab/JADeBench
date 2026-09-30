import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const moduleLoader = {
  require(modulePath) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'noop.js')));
    return require(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';
const PENDING = 'PENDING';
let customConfigContent = null;

function getConfigPath() {
  const configFile = global.options?.file ?? null;
  if (!configFile) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  return path.isAbsolute(configFile) ? configFile : path.join(process.cwd(), configFile);
}

function unwrapDefaultExport(module) {
  return module.__esModule ? module.default : module;
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
      await fs.access(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    const error = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.access(configPath);
      throw error;
    } catch (accessError) {
      if (accessError.code !== 'ENOENT') throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;
    const configPath = getConfigPath();
    try {
      let result = unwrapDefaultExport(moduleLoader.require(configPath));
      if (global.options?.migrationsDir) {
        result = { ...result, migrationsDir: global.options.migrationsDir };
      }
      return result;
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'ERR_REQUIRE_ASYNC_MODULE') {
        let result = unwrapDefaultExport(
          await moduleLoader.import(pathToFileURL(configPath)),
        );
        if (global.options?.migrationsDir) {
          result = { ...result, migrationsDir: global.options.migrationsDir };
        }
        return result;
      }
      throw error;
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
  if (extension && !extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with a dot');
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
      await fs.access(directory);
    } catch {
      throw new Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    const error = new Error(`migrations directory already exists: ${directory}`);
    try {
      await fs.access(directory);
      throw error;
    } catch (accessError) {
      if (accessError.code !== 'ENOENT') throw error;
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const files = await fs.readdir(directory);
    return files
      .filter((fileName) =>
        path.extname(fileName) === extension &&
        path.basename(fileName) !== sampleFileName)
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return unwrapDefaultExport(moduleLoader.require(migrationPath));
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'ERR_REQUIRE_ASYNC_MODULE') {
        return unwrapDefaultExport(
          await moduleLoader.import(pathToFileURL(migrationPath)),
        );
      }
      throw error;
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const hash = crypto.createHash('sha256');
    hash.update(await fs.readFile(migrationPath));
    return hash.digest('hex');
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
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = await db.collection(changelogCollectionName).find({}).toArray();
  const includeFileHash = useFileHash === true;

  return Promise.all(fileNames.map(async (fileName) => {
    const fileHash = includeFileHash
      ? await migrationsDir.loadFileHash(fileName)
      : undefined;
    const entry = changelog.find((item) =>
      item.fileName === fileName && (!fileHash || item.fileHash === fileHash));
    const appliedAt = entry ? entry.appliedAt.toISOString() : PENDING;
    const migrationBlock = entry?.migrationBlock;

    return includeFileHash
      ? { fileName, fileHash, appliedAt, migrationBlock }
      : { fileName, appliedAt, migrationBlock };
  }));
}

async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config.read();
  if (!lockCollectionName || lockTtl <= 0) return null;

  const collection = db.collection(lockCollectionName);
  collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: lockTtl });
  return collection;
}

const lock = {
  async exist(db) {
    const collection = await getLockCollection(db);
    if (!collection) return false;
    return (await collection.find({}).toArray()).length > 0;
  },

  async activate(db) {
    const collection = await getLockCollection(db);
    if (collection) await collection.insertOne({ createdAt: new Date() });
  },

  async clear(db) {
    const collection = await getLockCollection(db);
    if (collection) await collection.deleteMany({});
  },
};

async function up(db, client) {
  const pendingMigrations = (await status(db)).filter(
    (migration) => migration.appliedAt === PENDING,
  );
  const migrated = [];
  const migrationBlock = Date.now();

  if (await lock.exist(db)) {
    throw new Error('Could not migrate up because a lock is active.');
  }
  try {
    await lock.activate(db);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }

  const migrate = async (pendingMigration) => {
    try {
      const migration = await migrationsDir.loadMigration(pendingMigration.fileName);
      await migration.up(db, client);
    } catch (cause) {
      const error = new Error(
        `Could not migrate up ${pendingMigration.fileName}: ${cause.message}`,
      );
      error.stack = cause.stack;
      error.migrated = migrated;
      if (cause.errInfo) error.additionalInfo = cause.errInfo;
      await lock.clear(db);
      throw error;
    }

    const { changelogCollectionName, useFileHash } = await config.read();
    const changelog = db.collection(changelogCollectionName);
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
  };

  for (const pendingMigration of pendingMigrations) {
    await migrate(pendingMigration);
  }
  await lock.clear(db);
  return migrated;
}

export { up as default };
