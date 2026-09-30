import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function now(timestamp) {
  if (timestamp === undefined) {
    timestamp = Date.now();
  }

  const date = new Date(timestamp);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

function nowAsString() {
  const date = now();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);
  const second = ('0' + date.getSeconds()).slice(-2);

  return '' + date.getFullYear() + month + day + hour + minute + second;
}

const moduleLoader = {
  require(moduleName) {
    const localRequire = createRequire(
      pathToFileURL(path.join(process.cwd(), 'package.json')),
    );
    return localRequire(moduleName);
  },

  import(specifier) {
    return import(specifier);
  },
};

function getConfigPath() {
  const file = global.options?.file ?? null;
  if (!file) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(file)) {
    return file;
  }
  return path.join(process.cwd(), file);
}

function getModuleExports(moduleValue) {
  return moduleValue.default ? moduleValue.default : moduleValue;
}

let customConfigContent = null;

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(content) {
    customConfigContent = content;
  },

  async shouldExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    try {
      await fs.stat(configPath);
    } catch {
      throw new Error('config file does not exist: ' + configPath);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    const existsError = new Error('config file already exists: ' + configPath);
    try {
      await fs.stat(configPath);
      throw existsError;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw existsError;
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
      let loadedConfig = getModuleExports(await moduleLoader.require(configPath));
      if (global.options?.migrationsDir) {
        loadedConfig = {
          ...loadedConfig,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return loadedConfig;
    } catch (error) {
      if (
        error.code === 'ERR_REQUIRE_ESM' ||
        error.code === 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        const namespace = await moduleLoader.import(pathToFileURL(configPath));
        let loadedConfig = getModuleExports(namespace);
        if (global.options?.migrationsDir) {
          loadedConfig = {
            ...loadedConfig,
            migrationsDir: global.options.migrationsDir,
          };
        }
        return loadedConfig;
      }
      throw error;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDirPath;
  try {
    const loadedConfig = await config.read();
    migrationsDirPath =
      loadedConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDirPath = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDirPath)) {
    return migrationsDirPath;
  }
  return path.join(process.cwd(), migrationsDirPath);
}

async function resolveMigrationFileExtension() {
  let extension;
  try {
    const loadedConfig = await config.read();
    extension = loadedConfig.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (!extension || !extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return 'sample-migration' + (await resolveMigrationFileExtension());
}

async function resolveSampleMigrationPath() {
  const migrationsDirPath = await resolveMigrationsDirPath();
  const sampleFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDirPath, sampleFileName);
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    try {
      await fs.stat(migrationsDirPath);
    } catch {
      throw new Error(
        'migrations directory does not exist: ' + migrationsDirPath,
      );
    }
  },

  async shouldNotExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const existsError = new Error(
      'migrations directory already exists: ' + migrationsDirPath,
    );
    try {
      await fs.stat(migrationsDirPath);
      throw existsError;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw existsError;
      }
    }
  },

  async getFileNames() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const fileNames = await fs.readdir(migrationsDirPath);
    const sampleFileName = await resolveSampleMigrationFileName();

    return fileNames
      .filter(
        (fileName) =>
          path.extname(fileName) === extension &&
          path.basename(fileName) !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDirPath, fileName);
    try {
      return getModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      if (
        error.code === 'ERR_REQUIRE_ESM' ||
        error.code === 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        const namespace = await moduleLoader.import(
          pathToFileURL(migrationPath),
        );
        return getModuleExports(namespace);
      }
      throw error;
    }
  },

  async loadFileHash(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDirPath, fileName);
    const hash = crypto.createHash('sha256');
    const contents = await fs.readFile(migrationPath);
    hash.update(contents);
    return hash.digest('hex');
  },

  async doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      await fs.stat(samplePath);
      return true;
    } catch {
      return false;
    }
  },
};

async function create(description) {
  if (!description) {
    throw new Error('Missing parameter: description');
  }

  await migrationsDir.shouldExist();
  const migrationsDirPath = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let sourcePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    sourcePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const loadedConfig = await config.read();
    sourcePath = path.join(
      __dirname,
      '../../samples/' + loadedConfig.moduleSystem + '/migration.js',
    );
  }

  const fileName =
    '' +
    nowAsString() +
    '-' +
    description.split(' ').join('_') +
    extension;
  const destinationPath = path.join(migrationsDirPath, fileName);

  await fs.cp(sourcePath, destinationPath);
  return fileName;
}

export { create as default };
