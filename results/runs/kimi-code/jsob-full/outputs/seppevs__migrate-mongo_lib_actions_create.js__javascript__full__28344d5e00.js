import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

let customConfigContent = null;

function now(value = Date.now()) {
  const date = new Date(value);
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
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')));
    return require(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.join(process.cwd(), configuredPath);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(value) {
    customConfigContent = value;
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
    const alreadyExists = new Error(`config file already exists: ${configPath}`);
    try {
      await fs.stat(configPath);
      throw alreadyExists;
    } catch (error) {
      if (error.code !== 'ENOENT') throw alreadyExists;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      let contents = moduleLoader.require(configPath);
      contents = getModuleExports(contents);
      if (global.options?.migrationsDir) {
        contents = { ...contents, migrationsDir: global.options.migrationsDir };
      }
      return contents;
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
        throw error;
      }

      const imported = await moduleLoader.import(pathToFileURL(configPath));
      let contents = getModuleExports(imported);
      if (global.options?.migrationsDir) {
        contents = { ...contents, migrationsDir: global.options.migrationsDir };
      }
      return contents;
    }
  },
};

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const currentConfig = await config.read();
    migrationsDir = currentConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
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
    const currentConfig = await config.read();
    extension = currentConfig.migrationFileExtension || DEFAULT_MIGRATION_EXT;
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
    const directory = await resolveMigrationsDirPath();
    try {
      await fs.stat(directory);
    } catch {
      throw new Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async shouldNotExist() {
    const directory = await resolveMigrationsDirPath();
    const alreadyExists = new Error(`migrations directory already exists: ${directory}`);
    try {
      await fs.stat(directory);
      throw alreadyExists;
    } catch (error) {
      if (error.code !== 'ENOENT') throw alreadyExists;
    }
  },

  async getFileNames() {
    const directory = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const names = await fs.readdir(directory);
    return names
      .filter(name => path.extname(name) === extension && path.basename(name) !== sampleFileName)
      .sort();
  },

  async loadMigration(fileName) {
    const filePath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return getModuleExports(moduleLoader.require(filePath));
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
        throw error;
      }
      return getModuleExports(await moduleLoader.import(pathToFileURL(filePath)));
    }
  },

  async loadFileHash(fileName) {
    const filePath = path.join(await resolveMigrationsDirPath(), fileName);
    const hash = crypto.createHash('sha256');
    hash.update(await fs.readFile(filePath));
    return hash.digest('hex');
  },

  async doesSampleMigrationExist() {
    try {
      await fs.stat(await resolveSampleMigrationPath());
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
  const destinationDirectory = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let sourcePath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    sourcePath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const currentConfig = await config.read();
    sourcePath = path.join(
      __dirname,
      `../../samples/${currentConfig.moduleSystem}/migration.js`,
    );
  }

  const fileName = `${nowAsString()}-${description.split(' ').join('_')}${extension}`;
  await fs.cp(sourcePath, path.join(destinationDirectory, fileName));
  return fileName;
}

export { create as default };
