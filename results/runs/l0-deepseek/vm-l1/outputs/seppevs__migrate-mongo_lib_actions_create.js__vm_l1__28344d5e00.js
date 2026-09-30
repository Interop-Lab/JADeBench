import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const require = createRequire(import.meta.url);

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

function getModuleExports2(modulePath) {
  return require(modulePath);
}

const config = {
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
    return getConfigPath();
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

const migrationsDir = {
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
    return fs.readFile(path.join(resolveMigrationsDirPath(), fileName))
      .then(content => crypto.createHash('sha256').update(content).digest('hex'));
  },
  doesSampleMigrationExist() {
    return fs.access(resolveSampleMigrationPath()).then(() => true).catch(() => false);
  }
};

function now(date = new Date()) {
  return date;
}

function nowAsString() {
  return new Date().toISOString();
}

const date = {
  now,
  nowAsString
};

const moduleLoader = {
  require(modulePath) {
    return require(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  }
};

function create(configContent) {
  customConfigContent = configContent;
  return {
    config,
    migrationsDir,
    date,
    moduleLoader
  };
}

export default create;
