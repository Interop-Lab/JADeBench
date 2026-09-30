import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXTENSION = '.js';

let customConfig = null;

function utcNow(timestamp = Date.now()) {
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

function timestampNow() {
  const date = utcNow();
  const pad = (value) => `0${value}`.slice(-2);

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

const moduleLoader = {
  require(modulePath) {
    const requireFromWorkingDirectory = createRequire(
      pathToFileURL(path.join(process.cwd(), 'package.json')),
    );

    return requireFromWorkingDirectory(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function unwrapDefaultExport(moduleExports) {
  return moduleExports.default ? moduleExports.default : moduleExports;
}

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

async function loadConfigModule(configPath) {
  try {
    const requiredModule = await moduleLoader.require(configPath);
    return unwrapDefaultExport(requiredModule);
  } catch (error) {
    if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
      throw error;
    }

    const importedModule = await moduleLoader.import(pathToFileURL(configPath));
    return unwrapDefaultExport(importedModule);
  }
}

function applyMigrationsDirectoryOverride(config) {
  if (!global.options?.migrationsDir) {
    return config;
  }

  return {
    ...config,
    migrationsDir: global.options.migrationsDir,
  };
}

const config = {
  DEFAULT_CONFIG_FILE_NAME,

  set(content) {
    customConfig = content;
  },

  async shouldExist() {
    if (customConfig) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.stat(configPath);
    } catch {
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfig) {
      return;
    }

    const configPath = getConfigPath();
    const alreadyExistsError = new Error(`config file already exists: ${configPath}`);

    try {
      await fs.stat(configPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return;
      }

      throw alreadyExistsError;
    }

    throw alreadyExistsError;
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfig) {
      return customConfig;
    }

    const loadedConfig = await loadConfigModule(getConfigPath());
    return applyMigrationsDirectoryOverride(loadedConfig);
  },
};

async function resolveMigrationsDirectoryPath() {
  let migrationsDirectory;

  try {
    const loadedConfig = await config.read();
    migrationsDirectory = loadedConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDirectory = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDirectory)) {
    return migrationsDirectory;
  }

  return path.join(process.cwd(), migrationsDirectory);
}

async function resolveMigrationFileExtension() {
  let extension;

  try {
    const loadedConfig = await config.read();
    extension = loadedConfig.migrationFileExtension || DEFAULT_MIGRATION_EXTENSION;
  } catch {
    extension = DEFAULT_MIGRATION_EXTENSION;
  }

  if (extension && !extension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }

  return extension;
}

async function resolveSampleMigrationFileName() {
  const extension = await resolveMigrationFileExtension();
  return `sample-migration${extension}`;
}

async function resolveSampleMigrationPath() {
  const migrationsDirectory = await resolveMigrationsDirectoryPath();
  const sampleFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDirectory, sampleFileName);
}

async function loadMigrationModule(migrationPath) {
  try {
    return unwrapDefaultExport(moduleLoader.require(migrationPath));
  } catch (error) {
    if (error.code !== 'ERR_REQUIRE_ESM' && error.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
      throw error;
    }

    const importedModule = await moduleLoader.import(pathToFileURL(migrationPath));
    return unwrapDefaultExport(importedModule);
  }
}

const migrationsDirectory = {
  resolve: resolveMigrationsDirectoryPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const directoryPath = await resolveMigrationsDirectoryPath();

    try {
      await fs.stat(directoryPath);
    } catch {
      throw new Error(`migrations directory does not exist: ${directoryPath}`);
    }
  },

  async shouldNotExist() {
    const directoryPath = await resolveMigrationsDirectoryPath();
    const alreadyExistsError = new Error(
      `migrations directory already exists: ${directoryPath}`,
    );

    try {
      await fs.stat(directoryPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return;
      }

      throw alreadyExistsError;
    }

    throw alreadyExistsError;
  },

  async getFileNames() {
    const directoryPath = await resolveMigrationsDirectoryPath();
    const extension = await resolveMigrationFileExtension();
    const fileNames = await fs.readdir(directoryPath);
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
    const directoryPath = await resolveMigrationsDirectoryPath();
    const migrationPath = path.join(directoryPath, fileName);
    return loadMigrationModule(migrationPath);
  },

  async loadFileHash(fileName) {
    const directoryPath = await resolveMigrationsDirectoryPath();
    const filePath = path.join(directoryPath, fileName);
    const hash = crypto.createHash('sha256');
    const contents = await fs.readFile(filePath);

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

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

async function createMigration(description) {
  if (!description) {
    throw new Error('Missing parameter: description');
  }

  await migrationsDirectory.shouldExist();

  const directoryPath = await migrationsDirectory.resolve();
  const extension = await migrationsDirectory.resolveMigrationFileExtension();
  let templatePath;

  if (await migrationsDirectory.doesSampleMigrationExist()) {
    templatePath = await migrationsDirectory.resolveSampleMigrationPath();
  } else {
    const loadedConfig = await config.read();
    templatePath = path.join(
      currentDirectory,
      '../../samples/',
      loadedConfig.moduleSystem,
      '/migration.js',
    );
  }

  const fileName = `${timestampNow()}-${description.split(' ').join('_')}${extension}`;
  const destinationPath = path.join(directoryPath, fileName);

  await fs.cp(templatePath, destinationPath);
  return fileName;
}

export { createMigration as default };
