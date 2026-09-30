import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const moduleLoader = {
  require(modulePath) {
    const requireFromWorkingDirectory = createRequire(
      pathToFileURL(path.join(process.cwd(), "package.json")),
    );
    return requireFromWorkingDirectory(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
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

function getModuleExports(module) {
  return module.default ? module.default : module;
}

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
      throw new Error(`config file does not exist: ${configPath}`);
    }
  },

  async shouldNotExist() {
    if (customConfigContent) {
      return;
    }

    const configPath = getConfigPath();
    const alreadyExistsError = new Error(
      `config file already exists: ${configPath}`,
    );
    try {
      await fs.stat(configPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw alreadyExistsError;
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
      let loadedConfig = await moduleLoader.require(configPath);
      loadedConfig = getModuleExports(loadedConfig);
      if (global.options?.migrationsDir) {
        loadedConfig = {
          ...loadedConfig,
          migrationsDir: global.options.migrationsDir,
        };
      }
      return loadedConfig;
    } catch (error) {
      if (
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        const importedModule = await moduleLoader.import(
          pathToFileURL(configPath),
        );
        let loadedConfig = getModuleExports(importedModule);
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

const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const loadedConfig = await config.read();
    migrationsDir = loadedConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
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
    const loadedConfig = await config.read();
    extension = loadedConfig.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch {
    extension = DEFAULT_MIGRATION_EXT;
  }

  if (extension && !extension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
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
      if (error.code !== "ENOENT") {
        throw alreadyExistsError;
      }
    }
  },

  async getFileNames() {
    const migrationsPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const entries = await fs.readdir(migrationsPath);
    const sampleFileName = await resolveSampleMigrationFileName();
    return entries
      .filter(
        (fileName) =>
          path.extname(fileName) === extension && fileName !== sampleFileName,
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationsPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsPath, fileName);
    try {
      return getModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      if (
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        const importedModule = await moduleLoader.import(
          pathToFileURL(migrationPath),
        );
        return getModuleExports(importedModule);
      }
      throw error;
    }
  },

  async loadFileHash(fileName) {
    const migrationsPath = await resolveMigrationsDirPath();
    const contents = await fs.readFile(path.join(migrationsPath, fileName));
    const hash = crypto.createHash("sha256");
    hash.update(contents);
    return hash.digest("hex");
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

async function getMigrationStatus(database) {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = database.collection(changelogCollectionName);
  const appliedMigrations = await changelog.find({}).toArray();
  const includeFileHash = useFileHash === true;

  return Promise.all(
    fileNames.map(async (fileName) => {
      let fileHash;
      let identity = { fileName };
      if (includeFileHash) {
        fileHash = await migrationsDir.loadFileHash(fileName);
        identity = { fileName, fileHash };
      }

      const appliedMigration = appliedMigrations.find(
        (entry) =>
          entry.fileName === identity.fileName &&
          (!identity.fileHash || entry.fileHash === identity.fileHash),
      );
      const appliedAt = appliedMigration
        ? appliedMigration.appliedAt.toJSON()
        : "PENDING";
      const migrationBlock = appliedMigration?.migrationBlock;
      const status = { fileName, appliedAt, migrationBlock };
      return useFileHash ? { fileName, fileHash, appliedAt, migrationBlock } : status;
    }),
  );
}

async function getLockCollection(database) {
  const { lockCollectionName, lockTtl } = await config.read();
  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }

  const collection = database.collection(lockCollectionName);
  collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: lockTtl });
  return collection;
}

const lock = {
  async exist(database) {
    const collection = await getLockCollection(database);
    if (!collection) {
      return false;
    }
    const locks = await collection.find({}).toArray();
    return locks.length > 0;
  },

  async activate(database) {
    const collection = await getLockCollection(database);
    if (collection) {
      await collection.insertOne({ createdAt: new Date() });
    }
  },

  async clear(database) {
    const collection = await getLockCollection(database);
    if (collection) {
      await collection.deleteMany({});
    }
  },
};

async function up(database, client) {
  const status = await getMigrationStatus(database);
  const pendingMigrations = status.filter(
    (migration) => migration.appliedAt === "PENDING",
  );
  const migrated = [];
  const migrationBlock = Date.now();

  if (await lock.exist(database)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }

  try {
    await lock.activate(database);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }

  const migrate = async (pendingMigration) => {
    try {
      const migration = await migrationsDir.loadMigration(
        pendingMigration.fileName,
      );
      await migration.up(database, client);
    } catch (error) {
      const migrationError = new Error(
        `Could not migrate up ${pendingMigration.fileName}: ${error.message}`,
      );
      migrationError.stack = error.stack;
      migrationError.migrated = migrated;
      if (error.errInfo) {
        migrationError.additionalInfo = error.errInfo;
      }
      await lock.clear(database);
      throw migrationError;
    }

    const { changelogCollectionName, useFileHash } = await config.read();
    const changelog = database.collection(changelogCollectionName);
    const { fileName, fileHash } = pendingMigration;
    const appliedAt = new Date();
    const changelogEntry = useFileHash === true
      ? { fileName, fileHash, appliedAt, migrationBlock }
      : { fileName, appliedAt, migrationBlock };

    try {
      await changelog.insertOne(changelogEntry);
    } catch (error) {
      throw new Error(`Could not update changelog: ${error.message}`);
    }
    migrated.push(fileName);
  };

  for (const pendingMigration of pendingMigrations) {
    await migrate(pendingMigration);
  }

  await lock.clear(database);
  return migrated;
}

export { up as default };
