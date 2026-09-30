import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const DEFAULT_CONFIG_FILE_NAME = 'umzug.config.js';
const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let customConfigContent = null;

const date = (value = Date.now()) => {
  const current = new Date(value);
  return new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
    current.getHours(),
    current.getMinutes(),
    current.getSeconds(),
    current.getMilliseconds()
  );
};

const dateAsString = () => {
  const value = date();
  const pad = number => String(number).padStart(2, '0');

  return (
    String(value.getFullYear()) +
    pad(value.getMonth() + 1) +
    pad(value.getDate()) +
    pad(value.getHours()) +
    pad(value.getMinutes()) +
    pad(value.getSeconds()) +
    String(value.getMilliseconds()).padStart(3, '0')
  );
};

const dateDefault = {
  now: date,
  nowAsString: dateAsString
};

function getConfigPath() {
  const configuredPath =
    globalThis?.umzug?.configPath ??
    globalThis?.UMZUG_CONFIG_PATH ??
    null;

  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.join(process.cwd(), configuredPath);
}

function getModuleExports(moduleValue) {
  return moduleValue?.default ?? moduleValue;
}

const configDefault = {
  DEFAULT_CONFIG_FILE_NAME,

  set(value) {
    customConfigContent = value;
  },

  async shouldExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
    } catch {
      throw new Error(`Could not find configuration file at ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();

    try {
      await fs.access(configPath);
      throw new Error(`Configuration file already exists at ${configPath}`);
    } catch (error) {
      if (error?.message === `Configuration file already exists at ${configPath}`) {
        throw error;
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
      let loaded;

      try {
        loaded = require(configPath);
      } catch (error) {
        if (
          error?.code !== 'ERR_REQUIRE_ESM' &&
          error?.code !== 'ERR_UNKNOWN_FILE_EXTENSION'
        ) {
          throw error;
        }

        loaded = await import(pathToFileURL(configPath).href);
      }

      loaded = getModuleExports(loaded);

      if (globalThis?.umzug?.migrationsDir) {
        loaded = {
          ...loaded,
          migrationsDir: globalThis.umzug.migrationsDir
        };
      }

      return loaded;
    } catch (error) {
      if (
        error?.code === 'MODULE_NOT_FOUND' ||
        error?.code === 'ERR_MODULE_NOT_FOUND'
      ) {
        throw new Error(`Could not load configuration file at ${configPath}`);
      }

      throw error;
    }
  }
};

async function resolveMigrationsDirPath() {
  let migrationsDir;

  try {
    const config = await configDefault.read();
    migrationsDir = config?.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  } catch {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }

  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let extension;

  try {
    const config = await configDefault.read();
    extension = config?.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (!extension.startsWith('.')) {
    throw new Error('Migration file extension must start with a dot');
  }

  return extension;
}

async function resolveSampleMigrationFileName() {
  return `sample-migration${await resolveMigrationFileExtension()}`;
}

async function resolveSampleMigrationPath() {
  return path.join(
    await resolveMigrationsDirPath(),
    await resolveSampleMigrationFileName()
  );
}

function getModuleExports2(moduleValue) {
  return moduleValue?.default ?? moduleValue;
}

const migrationsDirDefault = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,

  async shouldExist() {
    const migrationsDir = await resolveMigrationsDirPath();

    try {
      await fs.access(migrationsDir);
    } catch {
      throw new Error(`Could not find migrations directory at ${migrationsDir}`);
    }
  },

  async shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error(`Migrations directory already exists at ${migrationsDir}`);

    try {
      await fs.access(migrationsDir);
      throw error;
    } catch (caught) {
      if (caught === error) {
        throw caught;
      }
    }
  },

  async getFileNames() {
    const migrationsDir = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleName = await resolveSampleMigrationFileName();
    const entries = await fs.readdir(migrationsDir);

    return entries
      .filter(
        entry =>
          path.extname(entry) === extension &&
          path.basename(entry) !== sampleName
      )
      .sort();
  },

  async loadMigration(filename) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filenamePath = path.join(migrationsDir, filename);

    try {
      const loaded = require(filenamePath);
      return getModuleExports2(loaded);
    } catch (error) {
      if (
        error?.code !== 'ERR_REQUIRE_ESM' &&
        error?.code !== 'ERR_UNKNOWN_FILE_EXTENSION'
      ) {
        throw error;
      }

      const loaded = await import(pathToFileURL(filenamePath).href);
      return getModuleExports2(loaded);
    }
  },

  async loadFileHash(filename) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, filename);
    const hash = crypto.createHash('sha256');
    const contents = await fs.readFile(filePath);

    hash.update(contents);
    return hash.digest('hex');
  },

  async doesSampleMigrationExist() {
    try {
      await fs.access(await resolveSampleMigrationPath());
      return true;
    } catch {
      return false;
    }
  }
};

async function create(name) {
  if (!name) {
    throw new Error('Migration name is required');
  }

  await migrationsDirDefault.shouldExist();

  const migrationsDir = await migrationsDirDefault.resolve();
  const sampleExists = await migrationsDirDefault.doesSampleMigrationExist();

  let templatePath;

  if (sampleExists) {
    templatePath = await migrationsDirDefault.resolveSampleMigrationPath();
  } else {
    const config = await configDefault.read();
    const extension =
      config?.migrationFileExtension || DEFAULT_MIGRATION_EXT;

    templatePath = path.join(
      __dirname,
      'templates',
      `sample-migration${extension.startsWith('.') ? extension : `.${extension}`}`
    );
  }

  const fileName =
    `${dateDefault.nowAsString()}-${name.split(' ').join('_')}` +
    await migrationsDirDefault.resolveMigrationFileExtension();

  const destination = path.join(migrationsDir, fileName);

  await fs.cp(templatePath, destination);

  return fileName;
}

export { create as default };
