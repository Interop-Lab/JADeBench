import { createHash } from 'crypto';
import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

const moduleLoader = {
  require(modulePath) {
    const require = createRequire(
      pathToFileURL(path.join(process.cwd(), 'package.json')),
    );
    return require(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function getDefaultExport(module) {
  return module.default ? module.default : module;
}

function now(timestamp = Date.now()) {
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
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${date.getFullYear()}${month}${day}${hours}${minutes}${seconds}`;
}

let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }
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
      await fs.stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) return;

    const configPath = getConfigPath();
    const alreadyExistsError = new Error(
      `config file already exists: ${configPath}`,
    );
    try {
      await fs.stat(configPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== 'ENOENT') throw alreadyExistsError;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let configContent = await moduleLoader.require(configPath);
      configContent = getDefaultExport(configContent);
      if (global.options?.migrationsDir) {
        configContent = {
          ...configContent,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return configContent;
    } catch (error) {
      if (
        error.code !== 'ERR_REQUIRE_ESM'
        && error.code !== 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        throw error;
      }

      let configContent = await moduleLoader.import(pathToFileURL(configPath));
      configContent = getDefaultExport(configContent);
      if (global.options?.migrationsDir) {
        configContent = {
          ...configContent,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return configContent;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const configContent = await config.read();
    migrationsDir = configContent.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDir)) return migrationsDir;
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;
  try {
    const configContent = await config.read();
    extension = configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (extension && !extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  const migrationsDir = await resolveMigrationsDirPath();
  const sampleFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDir, sampleFileName);
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const migrationsPath = await resolveMigrationsDirPath();
    try {
      await fs.stat(migrationsPath);
    } catch {
      throw new Error(`migrations directory does not exist: ${migrationsPath}`);
    }
  },

  async shouldNotExist() {
    const migrationsPath = await resolveMigrationsDirPath();
    const alreadyExistsError = new Error(
      `migrations directory already exists: ${migrationsPath}`,
    );
    try {
      await fs.stat(migrationsPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== 'ENOENT') throw alreadyExistsError;
    }
  },

  async getFileNames() {
    const migrationsPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const fileNames = await fs.readdir(migrationsPath);
    const sampleFileName = await resolveSampleMigrationFileName();
    return fileNames
      .filter(
        fileName => path.extname(fileName) === extension
          && path.basename(fileName) !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationsPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsPath, fileName);
    try {
      return getDefaultExport(moduleLoader.require(migrationPath));
    } catch (error) {
      if (
        error.code === 'ERR_REQUIRE_ESM'
        || error.code === 'ERR_REQUIRE_ASYNC_MODULE'
      ) {
        const migration = await moduleLoader.import(
          pathToFileURL(migrationPath),
        );
        return getDefaultExport(migration);
      }
      throw error;
    }
  },

  async loadFileHash(fileName) {
    const migrationsPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsPath, fileName);
    const hash = createHash('sha256');
    hash.update(await fs.readFile(migrationPath));
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function create(description) {
  if (!description) throw new Error('Missing parameter: description');

  await migrationsDir.shouldExist();
  const migrationsPath = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let sourcePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    sourcePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const configContent = await config.read();
    sourcePath = path.join(
      __dirname,
      `../../samples/${configContent.moduleSystem}/migration.js`,
    );
  }

  const fileName = `${nowAsString()}-${description.split(' ').join('_')}${extension}`;
  const destinationPath = path.join(migrationsPath, fileName);
  await fs.cp(sourcePath, destinationPath);
  return fileName;
}

export { create as default };
