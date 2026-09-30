import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';

var module_loader_default = {
  require(moduleName) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')));
    return require(moduleName);
  },
  import(moduleName) {
    return import(moduleName);
  }
};

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

var DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
var customConfigContent = null;

function getConfigPath() {
  const globalConfigPath = global?.migrateMongoConfig ?? null;
  if (!globalConfigPath) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(globalConfigPath)) return globalConfigPath;
  return path.join(process.cwd(), globalConfigPath);
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
        await fs.access(configPath);
      } catch (err) {
        throw new Error(`Could not find migrate-mongo config file at ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const err = new Error(`Config file already exists at ${configPath}`);
      try {
        await fs.access(configPath);
        throw err;
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw err;
        }
      }
    }
  },
  getConfigFilename() {
    return path.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) return customConfigContent;
    const configPath = getConfigPath();
    try {
      let config = await module_loader_default.require(configPath);
      config = getModuleExports(config);
      if (global?.migrateMongoConfig?.migrationsDir) {
        config = { ...config, migrationsDir: global.migrateMongoConfig.migrationsDir };
      }
      return config;
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        let config = await module_loader_default.import(url.pathToFileURL(configPath));
        let configExports = getModuleExports(config);
        if (global?.migrateMongoConfig?.migrationsDir) {
          configExports = { ...configExports, migrationsDir: global.migrateMongoConfig.migrationsDir };
        }
        return configExports;
      }
      throw err;
    }
  }
};

import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import crypto from 'crypto';

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
  if (path.isAbsolute(migrationsDir)) return migrationsDir;
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let migrationFileExtension;
  try {
    const config = await config_default.read();
    migrationFileExtension = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    migrationFileExtension = DEFAULT_MIGRATION_EXT;
  }
  if (migrationFileExtension && !migrationFileExtension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with a dot');
  }
  return migrationFileExtension;
}

async function resolveSampleMigrationFileName() {
  const migrationFileExtension = await resolveMigrationFileExtension();
  return 'sample' + migrationFileExtension;
}

async function resolveSampleMigrationPath() {
  const migrationsDirPath = await resolveMigrationsDirPath();
  const sampleMigrationFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDirPath, sampleMigrationFileName);
}

function getModuleExports2(module) {
  return module.default ? module.default : module;
}

var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath: resolveSampleMigrationPath,
  resolveMigrationFileExtension: resolveMigrationFileExtension,
  async shouldExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    try {
      await fs.access(migrationsDirPath);
    } catch (err) {
      throw new Error(`Could not find migrations directory at ${migrationsDirPath}`);
    }
  },
  async shouldNotExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const err = new Error(`Migrations directory already exists at ${migrationsDirPath}`);
    try {
      await fs.access(migrationsDirPath);
      throw err;
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw err;
      }
    }
  },
  async getFileNames() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationFileExtension = await resolveMigrationFileExtension();
    const files = await fs.readdir(migrationsDirPath);
    const sampleMigrationFileName = await resolveSampleMigrationFileName();
    return files.filter(file => path.extname(file) === migrationFileExtension && path.basename(file) !== sampleMigrationFileName).sort();
  },
  async loadMigration(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDirPath, fileName);
    try {
      const migration = module_loader_default.require(migrationPath);
      return getModuleExports2(migration);
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        const migration = await module_loader_default.import(url.pathToFileURL(migrationPath));
        return getModuleExports2(migration);
      }
      throw err;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDirPath, fileName);
    const hash = crypto.createHash('sha256');
    const data = await fs.readFile(filePath);
    hash.update(data);
    return hash.digest('hex');
  },
  async doesSampleMigrationExist() {
    const sampleMigrationPath = await resolveSampleMigrationPath();
    try {
      await fs.access(sampleMigrationPath);
      return true;
    } catch (err) {
      return false;
    }
  }
};

var status_default = async db => {
  await migrationsDir_default.shouldExist();
  await config_default.shouldExist();
  const fileNames = await migrationsDir_default.getFileNames();
  const { changelogCollectionName, useFileHash } = await config_default.read();
  const changelogCollection = db.collection(changelogCollectionName);
  const changelog = await changelogCollection.find({}).toArray();
  const useHash = useFileHash === true;
  const statusItems = await Promise.all(fileNames.map(async fileName => {
    let fileHash;
    let appliedAt = 'PENDING';
    let fileNameObj = { fileName };
    if (useHash) {
      fileHash = await migrationsDir_default.loadFileHash(fileName);
      fileNameObj = { fileName, fileHash };
    }
    const appliedItem = changelog.find(item => item.fileName === fileNameObj.fileName && (!fileNameObj.fileHash || item.fileHash === fileNameObj.fileHash));
    appliedAt = appliedItem ? appliedItem.appliedAt.toISOString() : 'PENDING';
    const failedAt = appliedItem ? appliedItem.failedAt : undefined;
    const itemWithHash = { fileName, fileHash, appliedAt, failedAt };
    const itemWithoutHash = { fileName, appliedAt, failedAt };
    return useHash ? itemWithHash : itemWithoutHash;
  }));
  return statusItems;
};

async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config_default.read();
  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }
  const lockCollection = db.collection(lockCollectionName);
  const indexOptions = { expireAfterSeconds: lockTtl };
  await lockCollection.createIndex({ createdAt: 1 }, indexOptions);
  return lockCollection;
}

async function exist(db) {
  const lockCollection = await getLockCollection(db);
  if (!lockCollection) {
    return false;
  }
  const lock = await lockCollection.find({}).toArray();
  return lock.length > 0;
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

const lock = {};
lock.exist = exist;
lock.activate = activate;
lock.clear = clear;
var lock_default = lock;

var up_default = async (db, client) => {
  const statusItems = await status_default(db);
  const pendingItems = statusItems.filter(item => item.appliedAt === 'PENDING');
  const migratedItems = [];
  const startedAt = Date.now();
  if (await lock_default.exist(db)) {
    throw new Error('Migration already in progress.');
  }
  try {
    await lock_default.activate(db);
  } catch (err) {
    throw new Error('Could not acquire lock. ' + err.message);
  }
  const migrateItem = async item => {
    try {
      const migration = await migrationsDir_default.loadMigration(item.fileName);
      await migration.up(db, client);
    } catch (err) {
      const failedItem = new Error(`Could not migrate up ${item.fileName}: ${err.message}`);
      failedItem.stack = err.stack;
      failedItem.migrated = migratedItems;
      if (err.failedAt) {
        failedItem.failedAt = err.failedAt;
      }
      await lock_default.clear(db);
      throw failedItem;
    }
    const { changelogCollectionName, useFileHash } = await config_default.read();
    const changelogCollection = db.collection(changelogCollectionName);
    const { fileName, fileHash } = item;
    const appliedAt = new Date();
    try {
      const itemWithHash = { fileName, fileHash, appliedAt, startedAt };
      const itemWithoutHash = { fileName, appliedAt, startedAt };
      await changangelogCollection.insertOne(useHash === true ? itemWithHash : itemWithoutHash);
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
    migratedItems.push(item.fileName);
  };
  for (const item of pendingItems) {
    await migrateItem(item);
  }
  await lock_default.clear(db);
  return migratedItems;
};

export { up_default as default };
