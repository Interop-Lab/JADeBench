import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function getConfigPath() {
  return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(filePath) {
  const require = createRequire(import.meta.url);
  const fileUrl = pathToFileURL(filePath).href;
  return require(fileUrl);
}

function getModuleExports2(filePath) {
  const require = createRequire(import.meta.url);
  return require(filePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  shouldExist() {
    const configPath = getConfigPath();
    return fs.access(configPath).then(() => undefined).catch(() => {
      throw new Error(`Config file "${configPath}" doesn't exist.`);
    });
  },
  shouldNotExist() {
    const configPath = getConfigPath();
    return fs.access(configPath).then(() => {
      throw new Error(`Config file "${configPath}" already exists.`);
    }).catch(() => undefined);
  },
  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },
  read() {
    if (customConfigContent !== null) {
      return Promise.resolve(customConfigContent);
    }
    return getModuleExports(getConfigPath());
  }
};

function resolveMigrationsDirPath() {
  return path.resolve(process.cwd(), DEFAULT_MIGRATIONS_DIR_NAME);
}

function resolveMigrationFileExtension() {
  return DEFAULT_MIGRATION_EXT;
}

function resolveSampleMigrationFileName() {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-sample`;
}

function resolveSampleMigrationPath() {
  return path.resolve(resolveMigrationsDirPath(), resolveSampleMigrationFileName() + resolveMigrationFileExtension());
}

const migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  shouldExist() {
    return fs.access(resolveMigrationsDirPath()).then(() => undefined).catch(() => {
      throw new Error(`migrations directory "${resolveMigrationsDirPath()}" doesn't exist.`);
    });
  },
  shouldNotExist() {
    return fs.access(resolveMigrationsDirPath()).then(() => {
      throw new Error(`migrations directory "${resolveMigrationsDirPath()}" already exists.`);
    }).catch(() => undefined);
  },
  async getFileNames() {
    const dir = resolveMigrationsDirPath();
    const files = await fs.readdir(dir);
    return files.filter(file => file.endsWith(DEFAULT_MIGRATION_EXT)).sort();
  },
  loadMigration(fileName) {
    const filePath = path.resolve(resolveMigrationsDirPath(), fileName);
    return getModuleExports2(filePath);
  },
  async loadFileHash(fileName) {
    const filePath = path.resolve(resolveMigrationsDirPath(), fileName);
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  },
  doesSampleMigrationExist() {
    return fs.access(resolveSampleMigrationPath()).then(() => true).catch(() => false);
  }
};

const status_default = async (db) => {
  const config = await config_default.read();
  const migrationsCollection = db.collection(config.migrationsCollection || 'migrations');
  const files = await migrationsDir_default.getFileNames();
  const applied = await migrationsCollection.find({}).sort({ timestamp: 1 }).toArray();
  const status = files.map(fileName => {
    const appliedRecord = applied.find(record => record.fileName === fileName);
    return {
      fileName,
      appliedAt: appliedRecord ? appliedRecord.appliedAt : 'PENDING'
    };
  });
  return status;
};

function getLockCollection(db) {
  const config = config_default.read();
  return db.collection('migrations_lock');
}

async function exist(db) {
  const lockCollection = getLockCollection(db);
  const lock = await lockCollection.findOne({});
  return !!lock;
}

async function activate(db) {
  const lockCollection = getLockCollection(db);
  await lockCollection.insertOne({ locked: true, created: new Date() });
}

async function clear(db) {
  const lockCollection = getLockCollection(db);
  await lockCollection.deleteMany({});
}

const lock_default = {
  exist,
  activate,
  clear
};

const up_default = async (db, client) => {
  const config = await config_default.read();
  const migrationsCollection = db.collection(config.migrationsCollection || 'migrations');
  const lockCollection = getLockCollection(db);
  
  const lock = await lockCollection.findOne({});
  if (lock && lock.locked) {
    throw new Error('Migrations are locked. Another process may be running migrations.');
  }
  
  await lockCollection.insertOne({ locked: true, created: new Date() });
  
  try {
    const files = await migrationsDir_default.getFileNames();
    const applied = await migrationsCollection.find({}).sort({ timestamp: 1 }).toArray();
    
    for (const fileName of files) {
      if (!applied.find(record => record.fileName === fileName)) {
        const migration = migrationsDir_default.loadMigration(fileName);
        if (migration.up) {
          await migration.up(db, client);
        }
        await migrationsCollection.insertOne({
          fileName,
          appliedAt: new Date(),
          hash: await migrationsDir_default.loadFileHash(fileName)
        });
      }
    }
  } finally {
    await lockCollection.deleteMany({});
  }
};

export { up_default as default };
