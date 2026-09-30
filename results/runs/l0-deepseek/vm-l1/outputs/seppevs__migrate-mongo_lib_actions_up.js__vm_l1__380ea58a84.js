const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function getConfigPath() {
  return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(modulePath) {
  return require(modulePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
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
  read() {
    if (customConfigContent) {
      return Promise.resolve(customConfigContent);
    }
    return fs.readFile(getConfigPath(), 'utf8');
  }
};

function resolveMigrationsDirPath() {
  return path.resolve(process.cwd(), DEFAULT_MIGRATIONS_DIR_NAME);
}

function resolveMigrationFileExtension() {
  return DEFAULT_MIGRATION_EXT;
}

function resolveSampleMigrationFileName() {
  return `sample-migration${DEFAULT_MIGRATION_EXT}`;
}

function resolveSampleMigrationPath() {
  return path.join(resolveMigrationsDirPath(), resolveSampleMigrationFileName());
}

function getModuleExports2(modulePath) {
  return require(modulePath);
}

const migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  shouldExist() {
    return fs.access(resolveMigrationsDirPath()).then(() => true).catch(() => false);
  },
  shouldNotExist() {
    return fs.access(resolveMigrationsDirPath()).then(() => false).catch(() => true);
  },
  getFileNames() {
    return fs.readdir(resolveMigrationsDirPath());
  },
  loadMigration(fileName) {
    return require(path.join(resolveMigrationsDirPath(), fileName));
  },
  loadFileHash(fileName) {
    return fs.readFile(path.join(resolveMigrationsDirPath(), fileName)).then(content => {
      return crypto.createHash('sha256').update(content).digest('hex');
    });
  },
  doesSampleMigrationExist() {
    return fs.access(resolveSampleMigrationPath()).then(() => true).catch(() => false);
  }
};

const status_default = (status) => {
  return status;
};

function getLockCollection(collection) {
  return collection;
}

function exist(lock) {
  return lock !== undefined && lock !== null;
}

function activate(lock) {
  return lock;
}

function clear(lock) {
  return undefined;
}

const lock_default = {
  exist,
  activate,
  clear
};

const up_default = (a, b) => {
  return a + b;
};

export { up_default as default };
