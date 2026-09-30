import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';

var module_loader_default = {
  'require'(specifier) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'noop.js')));
    return require(specifier);
  },
  'import'(specifier) {
    return import(specifier);
  }
};

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

var DEFAULT_CONFIG_FILE_NAME = 'migrations.json';
var customConfigContent = null;

function getConfigPath() {
  const configPath = global.process?.env?.MIGRATION_CONFIG_PATH ?? null;
  if (!configPath) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(configPath)) return configPath;
  return path.join(process.cwd(), configPath);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
}

var config_default = {
  'DEFAULT_CONFIG_FILE_NAME': DEFAULT_CONFIG_FILE_NAME,
  'set'(content) {
    customConfigContent = content;
  },
  async 'shouldExist'() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.access(configPath);
      } catch (error) {
        throw new Error('Config file does not exist: ' + configPath);
      }
    }
  },
  async 'shouldNotExist'() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error('Config file already exists: ' + configPath);
      try {
        await fs.access(configPath);
        throw error;
      } catch (caught) {
        if (caught.code === 'ENOENT') {
          throw error;
        }
      }
    }
  },
  'getConfigFilename'() {
    return path.basename(getConfigPath());
  },
  async 'read'() {
    if (customConfigContent) return customConfigContent;
    const configPath = getConfigPath();
    try {
      let loaded = await module_loader_default['require'](configPath);
      loaded = getModuleExports(loaded);
      if (global.process?.env?.MIGRATION_CONFIG_PATH) {
        loaded = { ...loaded, 'migrationsDir': global.process.env.MIGRATION_CONFIG_PATH };
      }
      return loaded;
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'MODULE_NOT_FOUND') {
        let loaded = await module_loader_default['import'](url.pathToFileURL(configPath));
        let exports = getModuleExports(loaded);
        return global.process?.env?.MIGRATION_CONFIG_PATH && (exports = { ...exports, 'migrationsDir': global.process.env.MIGRATION_CONFIG_PATH }), exports;
      }
      throw error;
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
    const config = await config_default['read']();
    migrationsDir = config['migrationsDir'];
    if (!migrationsDir) migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  } catch (error) {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (path.isAbsolute(migrationsDir)) return migrationsDir;
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;
  try {
    const config = await config_default['read']();
    extension = config['migrationFileExtension'] || DEFAULT_MIGRATION_EXT;
  } catch (error) {
    extension = DEFAULT_MIGRATION_EXT;
  }
  if (extension && !extension.startsWith('.')) {
    throw new Error('Migration file extension must start with a dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  const extension = await resolveMigrationFileExtension();
  return 'sample-migration' + extension;
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
  'resolve': resolveMigrationsDirPath,
  'resolveSampleMigrationPath': resolveSampleMigrationPath,
  'resolveMigrationFileExtension': resolveMigrationFileExtension,
  async 'shouldExist'() {
    const migrationsDir = await resolveMigrationsDirPath();
    try {
      await fs.access(migrationsDir);
    } catch (error) {
      throw new Error('Migrations directory does not exist: ' + migrationsDir);
    }
  },
  async 'shouldNotExist'() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error('Migrations directory already exists: ' + migrationsDir);
    try {
      await fs.access(migrationsDir);
      throw error;
    } catch (caught) {
      if (caught.code === 'ENOENT') {
        throw error;
      }
    }
  },
  async 'getFileNames'() {
    const migrationsDir = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const files = await fs.readdir(migrationsDir);
    const sampleFileName = await resolveSampleMigrationFileName();
    return files.filter(file => path.extname(file) === extension && path.basename(file) !== sampleFileName).sort();
  },
  async 'loadMigration'(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDir, fileName);
    try {
      const loaded = module_loader_default['require'](migrationPath);
      return getModuleExports2(loaded);
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'MODULE_NOT_FOUND') {
        const loaded = await module_loader_default['import'](url.pathToFileURL(migrationPath));
        return getModuleExports2(loaded);
      }
      throw error;
    }
  },
  async 'loadFileHash'(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, fileName);
    const hash = crypto.createHash('sha256');
    const content = await fs.readFile(filePath);
    return hash.update(content), hash.digest('hex');
  },
  async 'doesSampleMigrationExist'() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      return await fs.access(samplePath), true;
    } catch (error) {
      return false;
    }
  }
};

var status_default = async (db) => {
  await migrationsDir_default['shouldExist']();
  await config_default['shouldExist']();
  const fileNames = await migrationsDir_default['getFileNames']();
  const { changelogCollectionName, useFileHash } = await config_default['read']();
  const changelog = db.collection(changelogCollectionName);
  const applied = await changelog.find({}).toArray();
  const useHash = useFileHash === true;
  const result = await Promise.all(fileNames.map(async (fileName) => {
    let fileHash;
    let record = { fileName };
    if (useHash) {
      fileHash = await migrationsDir_default['loadFileHash'](fileName);
      record = { fileName, fileHash };
    }
    const existing = applied.find(item => item.fileName === record.fileName && (!record.fileHash || item.fileHash === record.fileHash));
    const appliedAt = existing ? existing.appliedAt.getTime() : null;
    const lastChangedAt = existing ? existing.lastChangedAt : undefined;
    const fullRecord = { fileName, fileHash, appliedAt, lastChangedAt };
    const simpleRecord = { fileName, appliedAt, lastChangedAt };
    return useHash ? fullRecord : simpleRecord;
  }));
  return result;
};

async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config_default['read']();
  if (!lockCollectionName || lockTtl <= 0) return null;
  const collection = db.collection(lockCollectionName);
  const index = { createdAt: 1 };
  const options = { expireAfterSeconds: lockTtl };
  collection.createIndex(index, options);
  return collection;
}

async function exist(db) {
  const collection = await getLockCollection(db);
  if (!collection) return false;
  const docs = await collection.find({}).toArray();
  return docs.length > 0;
}

async function activate(db) {
  const collection = await getLockCollection(db);
  collection && await collection.insertOne({ 'createdAt': new Date() });
}

async function clear(db) {
  const collection = await getLockCollection(db);
  if (collection) {
    await collection.deleteMany({});
  }
}

var lock_default = {
  'exist': exist,
  'activate': activate,
  'clear': clear
};

var up_default = async (db, client) => {
  const status = await status_default(db);
  const pending = status.filter(item => item.appliedAt === null);
  const applied = [];
  const startedAt = Date.now();
  if (await lock_default['exist'](db)) {
    throw new Error('Migration is already in progress');
  }
  try {
    await lock_default['activate'](db);
  } catch (error) {
    throw new Error('Could not acquire migration lock: ' + error.message);
  }
  const runMigration = async (item) => {
    try {
      const migration = await migrationsDir_default['loadMigration'](item.fileName);
      await migration['up'](db, client);
    } catch (error) {
      const wrappedError = new Error('Failed to run migration ' + item.fileName + ': ' + error.message);
      wrappedError.cause = error.cause;
      wrappedError.applied = applied;
      if (error.applied) {
        wrappedError.applied = error.applied;
      }
      await lock_default['clear'](db);
      throw wrappedError;
    }
    const { changelogCollectionName, useFileHash } = await config_default['read']();
    const changelog = db.collection(changelogCollectionName);
    const { fileName, fileHash } = item;
    const appliedAt = new Date();
    try {
      const fullRecord = { fileName, fileHash, appliedAt, lastChangedAt: startedAt };
      const simpleRecord = { fileName, appliedAt, lastChangedAt: startedAt };
      await changelog.insertOne(useFileHash === true ? fullRecord : simpleRecord);
    } catch (error) {
      throw new Error('Failed to record migration ' + fileName + ': ' + error.message);
    }
    applied.push(item.fileName);
  };
  for (const item of pending) {
    await runMigration(item);
  }
  return await lock_default['clear'](db), applied;
};

export { up_default as default };
