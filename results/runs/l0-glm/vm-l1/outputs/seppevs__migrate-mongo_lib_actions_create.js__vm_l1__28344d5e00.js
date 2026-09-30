import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

const date_default = {
  now() {
    return Date.now();
  },
  nowAsString() {
    return new Date().toISOString();
  }
};

const module_loader_default = {
  require(moduleName) {
    return createRequire(import.meta.url)(moduleName);
  },
  import(modulePath) {
    return import(pathToFileURL(modulePath).href);
  }
};

function getConfigPath() {
  return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
}

function getModuleExports(modulePath) {
  return module_loader_default.require(modulePath);
}

function getModuleExports2(modulePath) {
  return module_loader_default.import(modulePath);
}

const config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(configContent) {
    customConfigContent = configContent;
  },
  shouldExist() {
    return fs.access(getConfigPath());
  },
  shouldNotExist() {
    return fs.access(getConfigPath()).then(
      () => { throw new Error(`Config file '${DEFAULT_CONFIG_FILE_NAME}' should not exist`); },
      () => {}
    );
  },
  getConfigFilename() {
    return DEFAULT_CONFIG_FILE_NAME;
  },
  read() {
    if (customConfigContent !== null) {
      return Promise.resolve(customConfigContent);
    }
    return fs.readFile(getConfigPath(), 'utf8').then(content => {
      customConfigContent = content;
      return content;
    });
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
  return path.resolve(resolveMigrationsDirPath(), resolveSampleMigrationFileName());
}

const migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  shouldExist() {
    return fs.access(resolveMigrationsDirPath());
  },
  shouldNotExist() {
    return fs.access(resolveMigrationsDirPath()).then(
      () => { throw new Error(`Migrations directory '${DEFAULT_MIGRATIONS_DIR_NAME}' should not exist`); },
      () => {}
    );
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
    return fs.access(resolveSampleMigrationPath()).then(() => true, () => false);
  }
};

function create_default(migrationName) {
  return {
    name: migrationName,
    up(db) {},
    down(db) {}
  };
}

export { create_default as default };
