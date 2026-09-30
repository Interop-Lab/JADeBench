import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

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
  const date = now();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return '' + year + month + day + hours + minutes + seconds;
};

var date_default = {
  now,
  nowAsString
};

var module_loader_default = {
  require(request) {
    const requireFn = createRequire(pathToFileURL(path.join(process.cwd(), 'noop.js')));
    return requireFn(request);
  },
  import(request) {
    return import(request);
  }
};

var DEFAULT_CONFIG_FILE_NAME = 'migrations.config.js';
var customConfigContent = null;

function getConfigPath() {
  const configPath = global.process?.env?.CONFIG_PATH ?? null;
  if (!configPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path.isAbsolute(configPath)) {
    return configPath;
  }
  return path.join(process.cwd(), configPath);
}

function getModuleExports(module) {
  return module.default ? module.default : module;
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
      } catch (error) {
        throw new Error('Config file does not exist: ' + configPath);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error('Config file already exists: ' + configPath);
      try {
        await fs.access(configPath);
        throw error;
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw error;
        }
      }
    } else {
      throw new Error('Custom config content is set');
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
      let module = await module_loader_default.require(configPath);
      module = getModuleExports(module);
      if (global.process?.env?.MIGRATIONS_DIR) {
        module = { ...module, migrationsDir: global.process.env.MIGRATIONS_DIR };
      }
      return module;
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'ERR_REQUIRE_ASYNC_MODULE') {
        let module = await module_loader_default.import(pathToFileURL(configPath));
        module = getModuleExports(module);
        if (global.process?.env?.MIGRATIONS_DIR) {
          module = { ...module, migrationsDir: global.process.env.MIGRATIONS_DIR };
        }
        return module;
      }
      throw error;
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
  } catch (error) {
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
    const config = await config_default.read();
    extension = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (error) {
    extension = DEFAULT_MIGRATION_EXT;
  }
  if (extension && !extension.startsWith('.')) {
    throw new Error('Migration file extension must start with a dot');
  }
  return extension;
}

async function resolveSampleMigrationFileName() {
  const extension = await resolveMigrationFileExtension();
  return 'sample-migration' + extension;
}

async function resolveSampleMigrationPath() {
  const migrationsDir = await resolveMigrationsDirPath();
  const sampleFileName = await resolveSampleMigrationFileName();
  return path.join(migrationsDir, sampleFileName);
}

function getModuleExports2(module) {
  return module.default ? module.default : module;
}

var migrationsDir_default = {
  resolve: resolveMigrationsDirPath,
  resolveSampleMigrationPath,
  resolveMigrationFileExtension,
  async shouldExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    try {
      await fs.access(migrationsDir);
    } catch (error) {
      throw new Error('Migrations directory does not exist: ' + migrationsDir);
    }
  },
  async shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error('Migrations directory already exists: ' + migrationsDir);
    try {
      await fs.access(migrationsDir);
      throw error;
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw error;
      }
    }
  },
  async getFileNames() {
    const migrationsDir = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const files = await fs.readdir(migrationsDir);
    const sampleFileName = await resolveSampleMigrationFileName();
    return files
      .filter(file => path.extname(file) === extension && path.basename(file) !== sampleFileName)
      .sort();
  },
  async loadMigration(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, fileName);
    try {
      const module = module_loader_default.require(filePath);
      return getModuleExports2(module);
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM' || error.code === 'ERR_REQUIRE_ASYNC_MODULE') {
        const module = await module_loader_default.import(pathToFileURL(filePath));
        return getModuleExports2(module);
      }
      throw error;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path.join(migrationsDir, fileName);
    const hash = crypto.createHash('sha256');
    const content = await fs.readFile(filePath);
    hash.update(content);
    return hash.digest('hex');
  },
  async doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      await fs.access(samplePath);
      return true;
    } catch (error) {
      return false;
    }
  }
};

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

var create_default = async (name) => {
  if (!name) {
    throw new Error('Migration name is required');
  }
  await migrationsDir_default.shouldExist();
  const migrationsDir = await migrationsDir_default.resolve();
  const extension = await migrationsDir_default.resolveMigrationFileExtension();
  let samplePath;
  if (await migrationsDir_default.doesSampleMigrationExist()) {
    samplePath = await migrationsDir_default.resolveSampleMigrationPath();
  } else {
    const config = await config_default.read();
    samplePath = path.join(__dirname, 'templates', 'sample-migration' + config.migrationFileExtension + ('.js'));
  }
  const fileName = date_default.nowAsString() + '-' + name.replace(' ', '_') + extension;
  const filePath = path.join(migrationsDir, fileName);
  await fs.cp(samplePath, filePath);
  return fileName;
};

export { create_default as default };
