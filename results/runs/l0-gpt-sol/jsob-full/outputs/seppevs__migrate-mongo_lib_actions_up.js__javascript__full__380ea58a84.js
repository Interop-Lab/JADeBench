import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const require = createRequire(import.meta.url);

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.migrateMongo?.config;
  if (!configuredPath) {
    return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.resolve(process.cwd(), configuredPath);
}

function getModuleExports(moduleExports) {
  return moduleExports?.default ?? moduleExports;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`Config file "${configPath}" does not exist`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
      throw new Error(`Config file "${configPath}" already exists`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }

    const configPath = getConfigPath();

    try {
      let loaded = getModuleExports(require(configPath));

      if (global.migrateMongo?.migrationsDir) {
        loaded = {
          ...loaded,
          migrationsDir: global.migrateMongo.migrationsDir
        };
      }

      return loaded;
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }

      let loaded = getModuleExports(
        await import(pathToFileURL(configPath).toString())
      );

      if (global.migrateMongo?.migrationsDir) {
        loaded = {
          ...loaded,
          migrationsDir: global.migrateMongo.migrationsDir
        };
      }

      return loaded;
    }
  }
};

async function resolveMigrationsDirPath() {
  let migrationsDir;

  try {
    const loadedConfig = await config.read();
    migrationsDir = loadedConfig?.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }

  return path.resolve(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;

  try {
    const loadedConfig = await config.read();
    extension =
      loadedConfig?.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (extension && !extension.startsWith('.')) {
    extension = `.${extension}`;
  }

  return extension;
}

async function resolveSampleMigrationFileName() {
  return `init${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(
    await resolveMigrationsDirPath(),
    await resolveSampleMigrationFileName()
  );
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();

    try {
      await fs.access(migrationsDirPath);
    } catch {
      throw new Error(`Migrations directory "${migrationsDirPath}" does not exist`);
    }
  },

  async shouldNotExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const error = new Error(
      `Migrations directory "${migrationsDirPath}" already exists`
    );

    try {
      await fs.access(migrationsDirPath);
      throw error;
    } catch (caughtError) {
      if (caughtError.code !== 'ENOENT') {
        throw caughtError;
      }
    }
  },

  async getFileNames() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleMigrationFileName = await resolveSampleMigrationFileName();
    const fileNames = await fs.readdir(migrationsDirPath);

    return fileNames
      .filter(fileName => path.extname(fileName) === extension)
      .filter(fileName => path.basename(fileName) !== sampleMigrationFileName)
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(
      await resolveMigrationsDirPath(),
      fileName
    );

    try {
      return getModuleExports(require(migrationPath));
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }

      return getModuleExports(
        await import(pathToFileURL(migrationPath).toString())
      );
    }
  },

  async loadFileHash(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDirPath, fileName);
    const contents = await fs.readFile(filePath);
    const hash = crypto.createHash('md5');

    hash.update(contents);
    return hash.digest('hex');
  },

  async doesSampleMigrationExist() {
    try {
      await fs.access(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  }
};

const status = async db => {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = db.collection(changelogCollectionName);
  const appliedMigrations = await changelog.find({}).toArray();

  return Promise.all(
    fileNames.map(async fileName => {
      let migration = { fileName };

      if (useFileHash) {
        migration.fileHash = await migrationsDir.loadFileHash(fileName);
      }

      const appliedMigration = appliedMigrations.find(
        record =>
          record.fileName === migration.fileName &&
          (!migration.fileHash || record.fileHash === migration.fileHash)
      );

      return {
        fileName,
        appliedAt: appliedMigration
          ? appliedMigration.appliedAt.toISOString()
          : 'PENDING',
        fileHash: appliedMigration ? appliedMigration.fileHash : undefined
      };
    })
  );
};

async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config.read();

  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }

  const collection = db.collection(lockCollectionName);

  await collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: lockTtl }
  );

  return collection;
}

async function exist(db) {
  const lockCollection = await getLockCollection(db);

  if (!lockCollection) {
    return false;
  }

  const result = await lockCollection.find({}).count();
  return result > 0;
}

async function activate(db) {
  const lockCollection = await getLockCollection(db);

  if (lockCollection) {
    await lockCollection.insertOne({ createdAt: new Date() });
  }
}

async function clear(db) {
  const lockCollection = await getLockCollection(db);

  if (lockCollection) {
    await lockCollection.deleteMany({});
  }
}

const lock = {
  exist,
  activate,
  clear
};

const up = async (db, client) => {
  const migrations = await status(db);
  const pendingMigrations = migrations.filter(
    migration => migration.appliedAt === 'PENDING'
  );
  const appliedMigrations = [];

  if (await lock.exist(db)) {
    throw new Error('Lock exists');
  }

  try {
    await lock.activate(db);
  } catch (error) {
    throw new Error(`Could not acquire lock: ${error.message}`);
  }

  const runMigration = async migration => {
    try {
      const loadedMigration = await migrationsDir.loadMigration(
        migration.fileName
      );

      await loadedMigration.up(db, client);
    } catch (error) {
      const migrationError = new Error(
        `Could not migrate ${migration.fileName}: ${error.message}`
      );

      migrationError.code = error.code;
      migrationError.stack = error.stack;
      migrationError.migration = appliedMigrations;

      await lock.clear(db);
      throw migrationError;
    }

    const {
      changelogCollectionName,
      useFileHash
    } = await config.read();

    const changelog = db.collection(changelogCollectionName);
    const { fileName, fileHash } = migration;
    const appliedAt = new Date();

    const recordWithHash = {
      fileName,
      fileHash,
      appliedAt,
      timestamp: Date.now()
    };

    const recordWithoutHash = {
      fileName,
      appliedAt,
      timestamp: Date.now()
    };

    await changelog.insertOne(
      useFileHash ? recordWithHash : recordWithoutHash
    );

    appliedMigrations.push(fileName);
  };

  for (const migration of pendingMigrations) {
    await runMigration(migration);
  }

  await lock.clear(db);
  return appliedMigrations;
};

export { up as default };
