import path from 'node:path';
import { cp, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getConfigPath() {
  const configFile = global.options?.file || DEFAULT_CONFIG_FILE_NAME;
  return path.isAbsolute(configFile) ? configFile : path.join(process.cwd(), configFile);
}

function getModuleExports(module) {
  return module.default || module;
}

const moduleLoader = {
  require(modulePath) {
    return require(modulePath);
  },

  import(modulePath) {
    return import(pathToFileURL(modulePath).href);
  },
};

let customConfigContent = null;

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (customConfigContent) return;

    const configPath = getConfigPath();
    try {
      await stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      throw new Error(`config file already exists: ${getConfigPath()}`);
    }

    const configPath = getConfigPath();
    try {
      await stat(configPath);
      throw new Error(`config file already exists: ${configPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    let loadedConfig;
    try {
      loadedConfig = moduleLoader.require(configPath);
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
        throw error;
      }
      loadedConfig = await moduleLoader.import(configPath);
    }

    const configContent = getModuleExports(loadedConfig);
    global.options ??= {};
    global.options.migrationsDir = configContent.migrationsDir;
    return configContent;
  },
};

function now(timestamp = Date.now()) {
  return new Date(timestamp);
}

function nowAsString() {
  const date = now();
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]
    .map(value => String(value).padStart(2, '0'))
    .join('');
}

async function resolveMigrationsDirPath() {
  const configContent = await config.read();
  const configuredPath = configContent.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  return path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
}

async function resolveMigrationFileExtension() {
  const configContent = await config.read();
  const extension = configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  if (!extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return extension;
}

async function resolveSampleMigrationPath() {
  return path.join(
    await resolveMigrationsDirPath(),
    `sample-migration${await resolveMigrationFileExtension()}`,
  );
}

const migrationsDir = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directory = await resolveMigrationsDirPath();
    try {
      await stat(directory);
    } catch {
      throw new Error(`migrations directory does not exist: ${directory}`);
    }
  },

  async doesSampleMigrationExist() {
    try {
      await stat(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  },
};

export default async function create(description) {
  if (!description) throw new Error('Missing parameter: description');

  await migrationsDir.shouldExist();
  const migrationsDirectory = await migrationsDir.resolve();
  const extension = await migrationsDir.resolveMigrationFileExtension();

  let sampleMigrationPath;
  if (await migrationsDir.doesSampleMigrationExist()) {
    sampleMigrationPath = await migrationsDir.resolveSampleMigrationPath();
  } else {
    const { moduleSystem } = await config.read();
    sampleMigrationPath = path.join(__dirname, `../../samples/${moduleSystem}/migration.js`);
  }

  const fileName = `${nowAsString()}-${description.split(' ').join('_')}${extension}`;
  await cp(sampleMigrationPath, path.join(migrationsDirectory, fileName));
  return fileName;
}
