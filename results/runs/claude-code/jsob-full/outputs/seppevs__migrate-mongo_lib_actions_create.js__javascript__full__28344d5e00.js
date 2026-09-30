import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function now(dateValue = Date.now()) {
  const date = new Date(dateValue);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

function nowAsString() {
  const date = now();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${date.getFullYear()}${month}${day}${hours}${minutes}${seconds}`;
}

const moduleLoader = {
  require(modulePath) {
    const require = createRequire(
      pathToFileURL(path.join(process.cwd(), 'noop.js')),
    );
    return require(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

function getModuleExports(module) {
  return module.default ? module.default : module;
}

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.join(process.cwd(), configuredPath);
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;
    const configPath = getConfigPath();
    const error = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.access(configPath);
      throw error;
    } catch (caughtError) {
      if (caughtError.code !== 'ENOENT') throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let loadedConfig = moduleLoader.require(configPath);
      loadedConfig = getModuleExports(loadedConfig);
      if (global.options?.migrationsDir) {
        loadedConfig = {
          ...loadedConfig,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return loadedConfig;
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
        throw error;
      }

      let loadedConfig = await moduleLoader.import(pathToFileURL(configPath));
      loadedConfig = getModuleExports(loadedConfig);
      if (global.options?.migrationsDir) {
        loadedConfig = {
          ...loadedConfig,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return loadedConfig;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const loadedConfig = await config.read();
    migrationsDir = loadedConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  return path.isAbsolute(migrationsDir)
    ? migrationsDir
    : path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;
  try {
    const loadedConfig = await config.read();
    extension = loadedConfig.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (!extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(
    await resolveMigrationsDirPath(),
    await resolveSampleMigrationFileName(),
  );
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directoryPath = await resolveMigrationsDirPath();
    try {
      await fs.access(directoryPath);
    } catch {
      throw new Error(`migrations directory does not exist: ${directoryPath}`);
    }
  },

  async shouldNotExist() {
    const directoryPath = await resolveMigrationsDirPath();
    const error = new Error(`migrations directory already exists: ${directoryPath}`);
    try {
      await fs.access(directoryPath);
      throw error;
    } catch (caughtError) {
      if (caughtError.code !== 'ENOENT') throw error;
    }
  },

  async getFileNames() {
    const directoryPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const fileNames = await fs.readdir(directoryPath);
    return fileNames
      .filter(
        (fileName) =>
          path.extname(fileName) === extension && fileName !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return getModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
        throw error;
      }
      return getModuleExports(
        await moduleLoader.import(pathToFileURL(migrationPath)),
      );
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const hash = crypto.createHash('sha256');
    hash.update(await fs.readFile(migrationPath));
    return hash.digest('hex');
  },

  async doesSampleMigrationExist() {
    try {
      await fs.access(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function create(description) {
  if (!description) throw new Error('Missing parameter: description');

  await migrationsDir.shouldExist();
  const migrationsDirectory = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let sourcePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    sourcePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const loadedConfig = await config.read();
    sourcePath = path.join(
      __dirname,
      `../../samples/${loadedConfig.moduleSystem}/migration.js`,
    );
  }

  const fileName = `${nowAsString()}-${description.split(' ').join('_')}${extension}`;
  await fs.cp(sourcePath, path.join(migrationsDirectory, fileName));
  return fileName;
}

export { create as default };
