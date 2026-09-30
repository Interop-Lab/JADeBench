import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const requireFromHere = createRequire(import.meta.url);
const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent;

function getModuleExports(module) {
  return module.default || module;
}

function getImportedModuleExports(module) {
  return module.default || module;
}

const moduleLoader = {
  require(modulePath) {
    return getModuleExports(requireFromHere(modulePath));
  },

  async import(modulePath) {
    return getImportedModuleExports(await import(pathToFileURL(modulePath).href));
  },
};

function getConfigPath() {
  return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

const config = {
  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) return;

    try {
      await fs.access(getConfigPath());
    } catch {
      throw new Error(`config file does not exist: ${getConfigPath()}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;

    try {
      await fs.access(getConfigPath());
    } catch {
      return;
    }

    throw new Error(`config file already exists: ${getConfigPath()}`);
  },

  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },

  async read() {
    if (customConfigContent) return customConfigContent;
    return moduleLoader.require(getConfigPath());
  },
};

async function resolveMigrationsDirPath() {
  const { migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME } = await config.read();
  return path.resolve(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  const { migrationFileExtension = DEFAULT_MIGRATION_EXT } = await config.read();
  return migrationFileExtension.startsWith('.')
    ? migrationFileExtension
    : `.${migrationFileExtension}`;
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
    try {
      await fs.access(directory);
    } catch {
      return;
    }
    throw new Error(`migrations directory already exists: ${directory}`);
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    return (await fs.readdir(directory))
      .filter((fileName) => path.extname(fileName) === extension)
      .sort();
  },

  async loadMigration(fileName) {
    const filePath = path.join(await resolveMigrationsDirPath(), fileName);
    const { moduleSystem } = await config.read();
    return moduleSystem === 'esm'
      ? moduleLoader.import(filePath)
      : moduleLoader.require(filePath);
  },

  async loadFileHash(fileName) {
    const filePath = path.join(await resolveMigrationsDirPath(), fileName);
    const contents = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(contents).digest('hex');
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

async function status(database) {
  const { changelogCollectionName, useFileHash } = await config.read();
  const migrationFileNames = await migrationsDir.getFileNames();
  const appliedMigrations = await database
    .collection(changelogCollectionName)
    .find({})
    .toArray();

  return Promise.all(
    migrationFileNames.map(async (fileName) => {
      const appliedMigration = appliedMigrations.find(
        (migration) => migration.fileName === fileName,
      );
      const migrationStatus = {
        fileName,
        appliedAt: appliedMigration?.appliedAt ?? 'PENDING',
      };
      if (useFileHash) {
        migrationStatus.fileHash = await migrationsDir.loadFileHash(fileName);
      }
      return migrationStatus;
    }),
  );
}

async function getLockCollection(database) {
  const { lockCollectionName } = await config.read();
  if (!lockCollectionName) return null;

  const collection = database.collection(lockCollectionName);
  await collection.createIndex({ createdAt: 1 }, {});
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
    if (!collection) return;
    await collection.insertOne({ createdAt: new Date() });
  },

  async clear(database) {
    const collection = await getLockCollection(database);
    if (!collection) return;
    await collection.deleteMany({});
  },
};

async function up(database, client) {
  const { changelogCollectionName, useFileHash } = await config.read();
  const pendingMigrations = (await status(database)).filter(
    ({ appliedAt }) => appliedAt === 'PENDING',
  );
  const changelog = database.collection(changelogCollectionName);
  const migrated = [];
  const migrationBlock = Date.now();

  await lock.activate(database);
  try {
    for (const migrationStatus of pendingMigrations) {
      try {
        const migration = await migrationsDir.loadMigration(migrationStatus.fileName);
        await migration.up(database, client);

        const appliedMigration = {
          fileName: migrationStatus.fileName,
          appliedAt: new Date(),
          migrationBlock,
        };
        if (useFileHash) appliedMigration.fileHash = migrationStatus.fileHash;

        await changelog.insertOne(appliedMigration);
        migrated.push(migrationStatus.fileName);
      } catch (error) {
        throw new Error(
          `Could not migrate up ${migrationStatus.fileName}: ${error.message}`,
          { cause: error },
        );
      }
    }
  } finally {
    await lock.clear(database);
  }

  return migrated;
}

export { up as default };
