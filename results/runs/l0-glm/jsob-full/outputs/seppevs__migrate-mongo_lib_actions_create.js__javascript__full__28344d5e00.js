import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

var module_loader_default = {
  require(moduleName) {
    const require = createRequire(pathToFileURL(path.join(process.cwd(), 'noop')));
    return require(moduleName);
  },
  import(moduleName) {
    return import(moduleName);
  }
};

var DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
var customConfigContent = null;

function getConfigPath() {
  const configPath = global['migrate-mongo']?.configPath ?? null;
  if (!configPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configPath)) {
    return configPath;
  }
  return path.join(process.cwd(), configPath);
}

function getModuleExports(module) {
  return module.__esModule ? module.default : module;
}

var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(content) {
    customConfigContent = content;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.access(configPath);
      } catch (err) {
        throw new Error(`Could not find migrate-mongo config file ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error(`migrate-mongo config file already exists: ${configPath}`);
      try {
        await fs.access(configPath);
        throw error;
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw error;
        }
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
      let config = await module_loader_default.require(configPath);
      config = getModuleExports(config);
      if (global['migrate-mongo']?.migrationsDir) {
        config = { ...config, migrationsDir: global['migrate-mongo'].migrationsDir };
      }
      return config;
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        let config = await module_loader_default.import(pathToFileURL(configPath));
        config = getModuleExports(config);
        if (global['migrate-mongo']?.migrationsDir) {
          config = { ...config, migrationsDir: global['migrate-mongo'].migrationsDir };
        }
        return config;
      }
      throw err;
    }
  }
};

var DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
var DEFAULT_MIGRATION_EXT = '.js';

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const config = await config_default.read();
    migrationsDir = config.migrationsDir;
    if (!migrationsDir) {
      migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (err) {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (path.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }
  return path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  let migrationFileExtension;
  try {
    const config = await config_default.read();
    migrationFileExtension = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    migrationFileExtension = DEFAULT_MIGRATION_EXT;
  }
  if (migrationFileExtension && !migrationFileExtension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }
  return migrationFileExtension;
}

async function resolveSampleMigrationFileName() {
  const migrationFileExtension = await resolveMigrationFileExtension();
  return 'sample-migration' + migrationFileExtension;
}

async function resolveSampleMigrationPath() {
  const migrationsDirPath = await resolveMigrationsDirPath();
  const sampleMigrationFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDirPath, sampleMigrationFileName);
}

function getModuleExports2(module) {
  return module.__esModule ? module.default : module;
}

var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  async shouldExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    try {
      await fs.access(migrationsDirPath);
    } catch (err) {
      throw new Error(`migrations directory does not exist: ${migrationsDirPath}`);
    }
  },
  async shouldNotExist() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const error = new Error(`migrations directory already exists: ${migrationsDirPath}`);
    try {
      await fs.access(migrationsDirPath);
      throw error;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw error;
      }
    }
  },
  async getFileNames() {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationFileExtension = await resolveMigrationFileExtension();
    const files = await fs.readdir(migrationsDirPath);
    const sampleMigrationFileName = await resolveSampleMigrationFileName();
    return files
      .filter(file => path.extname(file) === migrationFileExtension && path.basename(file) !== sampleMigrationFileName)
      .sort();
  },
  async loadMigration(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDirPath, fileName);
    try {
      const module = module_loader_default.require(migrationPath);
      return getModuleExports2(module);
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        const module = await module_loader_default.import(pathToFileURL(migrationPath));
        return getModuleExports2(module);
      }
      throw err;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDirPath = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDirPath, fileName);
    const hash = crypto.createHash('sha256');
    const data = await fs.readFile(filePath);
    hash.update(data);
    return hash.digest('hex');
  },
  async doesSampleMigrationExist() {
    const sampleMigrationPath = await resolveSampleMigrationPath();
    try {
      await fs.access(sampleMigrationPath);
      return true;
    } catch (err) {
      return false;
    }
  }
};

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

var now = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

var nowAsString = () => {
  const nowDate = now();
  const year = nowDate.getFullYear();
  const month = ('0' + (nowDate.getMonth() + 1)).slice(-2);
  const day = ('0' + nowDate.getDate()).slice(-2);
  const hours = ('0' + nowDate.getHours()).slice(-2);
  const minutes = ('0' + nowDate.getMinutes()).slice(-2);
  const seconds = ('0' + nowDate.getSeconds()).slice(-2);
  return '' + year + month + day + hours + minutes + seconds;
};

var date_default = { now, nowAsString };

var create_default = async (description) => {
  if (!description) {
    throw new Error('Missing parameter: description');
  }
  await migrationsDir_default.shouldExist();
  const migrationsDirPath = await migrationsDir_default.resolve();
  const migrationFileExtension = await migrationsDir_default.resolveMigrationFileExtension();
  let source;
  if (await migrationsDir_default.doesSampleMigrationExist()) {
    source = await migrationsDir_default.resolveSampleMigrationPath();
  } else {
    const config = await config_default.read();
    source = path.join(__dirname, `../samples/${config.migrationFileExtension || '.js'}`);
  }
  const filename = date_default.nowAsString() + '-' + description.replace(/\s/g, '_') + migrationFileExtension;
  const destination = path.join(migrationsDirPath, filename);
  await fs.copyFile(source, destination);
  return filename;
};

export { create_default as default };
