import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function now() {
  return Date.now();
}

function nowAsString() {
  return new Date().toISOString();
}

const date_default = {
  now,
  nowAsString
};

const module_loader_default = {
  require: createRequire,
  import: (id) => import(id)
};

function getConfigPath() {
  return path.resolve(DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(modulePath) {
  const require = createRequire(import.meta.url);
  return require(modulePath);
}

function getModuleExports2(modulePath) {
  return import(modulePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(configContent) {
    customConfigContent = configContent;
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
      return customConfigContent;
    }
    const require = createRequire(import.meta.url);
    return require(getConfigPath());
  }
};

function resolveMigrationsDirPath() {
  return path.resolve(DEFAULT_MIGRATIONS_DIR_NAME);
}

function resolveMigrationFileExtension() {
  return DEFAULT_MIGRATION_EXT;
}

function resolveSampleMigrationFileName() {
  return `${nowAsString().replace(/[-:.]/g, '')}-migration${DEFAULT_MIGRATION_EXT}`;
}

function resolveSampleMigrationPath() {
  return path.join(resolveMigrationsDirPath(), resolveSampleMigrationFileName());
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
  async getFileNames() {
    const files = await fs.readdir(resolveMigrationsDirPath());
    return files.filter(f => f.endsWith(DEFAULT_MIGRATION_EXT));
  },
  async loadMigration(fileName) {
    const filePath = path.join(resolveMigrationsDirPath(), fileName);
    return getModuleExports(filePath);
  },
  async loadFileHash(fileName) {
    const filePath = path.join(resolveMigrationsDirPath(), fileName);
    const content = await fs.readFile(filePath, 'utf8');
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  },
  async doesSampleMigrationExist() {
    const files = await fs.readdir(resolveMigrationsDirPath());
    return files.some(f => f.includes('-migration'));
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function create_default(name) {
  return {
    name,
    date: date_default,
    config: config_default,
    migrationsDir: migrationsDir_default,
    moduleLoader: module_loader_default
  };
}

export { create_default as default };
