import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fsPromises from 'fs/promises';
import url from 'url';
import crypto from 'crypto';

var module_loader_default = {
  require(modulePath) {
    const requireFn = createRequire(pathToFileURL(path.join(process.cwd(), 'node_modules')));
    return requireFn(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  }
};

var DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
var customConfigContent = null;

function getConfigPath() {
  const configPath = global.__migrateMongoConfigPath ?? null;
  if (!configPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configPath)) {
    return configPath;
  }
  return path.join(process.cwd(), configPath);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
}

var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fsPromises.access(configPath);
      } catch (err) {
        throw new Error(`Config file does not exist at ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error(`Config file already exists at ${configPath}`);
      try {
        await fsPromises.access(configPath);
        throw error;
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw error;
        }
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
      let config = await module_loader_default.import(configPath);
      config = getModuleExports(config);
      if (global.__migrateMongoGlobalMigrationsDir) {
        config = { ...config, migrationsDir: global.__migrateMongoGlobalMigrationsDir };
      }
      return config;
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
        let config = await module_loader_default.import(url.pathToFileURL(configPath));
        config = getModuleExports(config);
        if (global.__migrateMongoGlobalMigrationsDir) {
          config = { ...config, migrationsDir: global.__migrateMongoGlobalMigrationsDir };
        }
        return config;
      }
      throw err;
    }
  }
};

var DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
var DEFAULT_MIGRATION_EXT = '.js';

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const config = await config_default.read();
    migrationsDir = config.migrationsDir;
    if (!migrationsDir) {
      migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (err) {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (path.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let migrationExt;
  try {
    const config = await config_default.read();
    migrationExt = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    migrationExt = DEFAULT_MIGRATION_EXT;
  }
  if (migrationExt && !migrationExt.startsWith('.')) {
    throw new Error('migrationFileExtension must start with a dot');
  }
  return migrationExt;
}

async function resolveSampleMigrationFileName() {
  const migrationExt = await resolveMigrationFileExtension();
  return `sample-migration${migrationExt}`;
}

async function resolveSampleMigrationPath() {
  const migrationsDir = await resolveMigrationsDirPath();
  const sampleFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDir, sampleFileName);
}

function getModuleExports2(module) {
  return module.default ? module.default : module;
}

var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  async shouldExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    try {
      await fsPromises.access(migrationsDir);
    } catch (err) {
      throw new Error(`Migrations directory does not exist at ${migrationsDir}`);
    }
  },
  async shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error(`Migrations directory already exists at ${migrationsDir}`);
    try {
      await fsPromises.access(migrationsDir);
      throw error;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw error;
      }
    }
  },
  async getFileNames() {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationExt = await resolveMigrationFileExtension();
    const files = await fsPromises.readdir(migrationsDir);
    const sampleFileName = await resolveSampleMigrationFileName();
    return files
      .filter(file => path.extname(file) === migrationExt && path.basename(file) !== sampleFileName)
      .sort();
  },
  async loadMigration(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, fileName);
    try {
      const module = module_loader_default.require(filePath);
      return getModuleExports2(module);
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'MODULE_NOT_FOUND') {
        const module = await module_loader_default.import(url.pathToFileURL(filePath));
        return getModuleExports2(module);
      }
      throw err;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, fileName);
    const hash = crypto.createHash('md5');
    const content = await fsPromises.readFile(filePath);
    hash.update(content);
    return hash.digest('hex');
  },
  async doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      await fsPromises.access(samplePath);
      return true;
    } catch (err) {
      return false;
    }
  }
};

var status_default = async (db) => {
  await migrationsDir_default.shouldExist();
  await config_default.shouldExist();
  const fileNames = await migrationsDir_default.getFileNames();
  const { changelogCollectionName, useFileHash } = await config_default.read();
  const changelogCollection = db.collection(changelogCollectionName);
  const changelog = await changelogCollection.find({}).toArray();
  const useHash = useFileHash === true;
  return Promise.all(fileNames.map(async (fileName) => {
    let fileHash;
    const baseItem = { fileName };
    let item = baseItem;
    if (useHash) {
      fileHash = await migrationsDir_default.loadFileHash(fileName);
      item = { ...baseItem, fileHash };
    }
    const appliedItem = changelog.find(c => c.fileName === item.fileName && (!item.fileHash || c.fileHash === item.fileHash));
    const appliedAt = appliedItem ? appliedItem.appliedAt.toISOString() : 'PENDING';
    const appliedBy = appliedItem ? appliedItem.appliedBy : undefined;
    const result = {
      fileName,
      appliedAt,
      appliedBy
    };
    const hashResult = {
      fileName,
      fileHash,
      appliedAt,
      appliedBy
    };
    return useHash ? hashResult : result;
  }));
};

async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config_default.read();
  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }
  const lockCollection = db.collection(lockCollectionName);
  const indexOptions = { expireAfterSeconds: lockTtl };
  const indexSpec = { createdAt: 1 };
  lockCollection.createIndex(indexSpec, indexOptions);
  return lockCollection;
}

async function exist(db) {
  const lockCollection = await getLockCollection(db);
  if (!lockCollection) {
    return false;
  }
  const count = await lockCollection.find({}).count();
  return count > 0;
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

var lock_default = { exist, activate, clear };

var up_default = async (db, client) => {
  const status = await status_default(db);
  const pendingMigrations = status.filter(m => m.appliedAt === 'PENDING');
  const appliedMigrations = [];
  const startTime = Date.now();
  if (await lock_default.exist(db)) {
    throw new Error('Migration already in progress');
  }
  try {
    await lock_default.activate(db);
  } catch (err) {
    throw new Error(`Could not activate migration lock: ${err.message}`);
  }
  const migrate = async (migration) => {
    try {
      const migrationModule = await migrationsDir_default.loadMigration(migration.fileName);
      await migrationModule.up(db, client);
    } catch (err) {
      const error = new Error(`Could not migrate up ${migration.fileName}: ${err.message}`);
      error.migrationName = err.migrationName;
      error.migrated = appliedMigrations;
      if (err.stack) {
        error.stack = err.stack;
      }
      await lock_default.clear(db);
      throw error;
    }
    const { changelogCollectionName, useFileHash } = await config_default.read();
    const changelogCollection = db.collection(changelogCollectionName);
    const { fileName, fileHash } = migration;
    const appliedAt = new Date();
    try {
      const docWithHash = {
        fileName,
        fileHash,
        appliedAt,
        appliedBy: startTime
      };
      const docWithoutHash = {
        fileName,
        appliedAt,
        appliedBy: startTime
      };
      await changelogCollection.insertOne(useFileHash === true ? docWithHash : docWithoutHash);
    } catch (err) {
      throw new Error(`Could not save migration to changelog: ${err.message}`);
    }
    appliedMigrations.push(migration.fileName);
  };
  for (const migration of pendingMigrations) {
    await migrate(migration);
  }
  await lock_default.clear(db);
  return appliedMigrations;
};

export { up_default as default };
