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

async function getModuleExports(modulePath) {
  const require = createRequire(import.meta.url);
  return require(modulePath);
}

async function getModuleExports2(modulePath) {
  const fileUrl = pathToFileURL(path.resolve(modulePath)).href;
  return import(fileUrl);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  
  set(config) {
    customConfigContent = config;
  },
  
  shouldExist() {
    return fs.access(getConfigPath()).then(() => true).catch(() => false);
  },
  
  shouldNotExist() {
    return fs.access(getConfigPath()).then(() => false).catch(() => true);
  },
  
  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },
  
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const configPath = getConfigPath();
    const require = createRequire(import.meta.url);
    return require(configPath);
  }
};

function resolveMigrationsDirPath() {
  return path.resolve(process.cwd(), DEFAULT_MIGRATIONS_DIR_NAME);
}

function resolveMigrationFileExtension() {
  return DEFAULT_MIGRATION_EXT;
}

function resolveSampleMigrationFileName() {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  return `${timestamp}-migration${DEFAULT_MIGRATION_EXT}`;
}

function resolveSampleMigrationPath() {
  return path.join(resolveMigrationsDirPath(), resolveSampleMigrationFileName());
}

const migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  
  async shouldExist() {
    try {
      await fs.access(resolveMigrationsDirPath());
      return true;
    } catch {
      return false;
    }
  },
  
  async shouldNotExist() {
    try {
      await fs.access(resolveMigrationsDirPath());
      return false;
    } catch {
      return true;
    }
  },
  
  async getFileNames() {
    const dirPath = resolveMigrationsDirPath();
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith(DEFAULT_MIGRATION_EXT)).sort();
  },
  
  async loadMigration(fileName) {
    const filePath = path.join(resolveMigrationsDirPath(), fileName);
    return getModuleExports(filePath);
  },
  
  async loadFileHash(fileName) {
    const filePath = path.join(resolveMigrationsDirPath(), fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  },
  
  async doesSampleMigrationExist() {
    try {
      await fs.access(resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  }
};

const status_default = async (db) => {
  const collection = db.collection('migrations');
  const docs = await collection.find({}).toArray();
  return docs.map(doc => ({
    fileName: doc.fileName,
    appliedAt: doc.appliedAt
  }));
};

function getLockCollection(db) {
  return db.collection('migrations_lock');
}

async function exist(db) {
  const lockCollection = getLockCollection(db);
  const lock = await lockCollection.findOne({ _id: 'lock' });
  return lock !== null;
}

async function activate(db) {
  const lockCollection = getLockCollection(db);
  await lockCollection.insertOne({ _id: 'lock', createdAt: new Date() });
}

async function clear(db) {
  const lockCollection = getLockCollection(db);
  await lockCollection.deleteOne({ _id: 'lock' });
}

const lock_default = {
  exist,
  activate,
  clear
};

const up_default = async (db, config) => {
  const { getFileNames, loadMigration } = migrationsDir_default;
  const fileNames = await getFileNames();
  
  const appliedMigrations = await status_default(db);
  const appliedFileNames = new Set(appliedMigrations.map(m => m.fileName));
  
  const pendingMigrations = fileNames.filter(f => !appliedFileNames.has(f));
  
  for (const fileName of pendingMigrations) {
    const migration = await loadMigration(fileName);
    if (typeof migration.up === 'function') {
      await migration.up(db);
    }
    await db.collection('migrations').insertOne({
      fileName,
      appliedAt: new Date()
    });
  }
  
  return pendingMigrations;
};

export { up_default as default };
