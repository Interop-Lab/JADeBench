import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs/promises";
import crypto from "crypto";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

const moduleLoader = {
  require(modulePath) {
    const requireFromCurrentDirectory = createRequire(
      pathToFileURL(path.join(process.cwd(), "package.json")),
    );
    return requireFromCurrentDirectory(modulePath);
  },
  import(modulePath) {
    return import(modulePath);
  },
};

let customConfigContent = null;

function getConfigPath() {
  const configuredPath = global.options?.file ?? null;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function getModuleExports(loadedModule) {
  return loadedModule.default ? loadedModule.default : loadedModule;
}

function isEsmRequireError(error) {
  return (
    error.code === "ERR_REQUIRE_ESM" ||
    error.code === "ERR_REQUIRE_ASYNC_MODULE"
  );
}

async function loadModule(modulePath, transform = (value) => value) {
  try {
    return transform(getModuleExports(moduleLoader.require(modulePath)));
  } catch (error) {
    if (!isEsmRequireError(error)) {
      throw error;
    }
    return transform(
      getModuleExports(await moduleLoader.import(pathToFileURL(modulePath))),
    );
  }
}

function applyConfigOverrides(loadedConfig) {
  return global.options?.migrationsDir
    ? { ...loadedConfig, migrationsDir: global.options.migrationsDir }
    : loadedConfig;
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
    const alreadyExistsError = new Error(`config file already exists: ${configPath}`);
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
    return loadModule(getConfigPath(), applyConfigOverrides);
  },
};

async function readConfigValueOrDefault(property, defaultValue) {
  try {
    return (await config.read())[property] || defaultValue;
  } catch {
    return defaultValue;
  }
}

async function resolveMigrationsDirPath() {
  const migrationsDir = await readConfigValueOrDefault(
    "migrationsDir",
    DEFAULT_MIGRATIONS_DIR_NAME,
  );

  return path.isAbsolute(migrationsDir)
    ? migrationsDir
    : path.join(process.cwd(), migrationsDir);
}

async function resolveMigrationFileExtension() {
  const extension = await readConfigValueOrDefault(
    "migrationFileExtension",
    DEFAULT_MIGRATION_EXT,
  );

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
    const directoryPath = await resolveMigrationsDirPath();
    try {
      await fs.stat(directoryPath);
    } catch {
      throw new Error(`migrations directory does not exist: ${directoryPath}`);
    }
  },

  async shouldNotExist() {
    const directoryPath = await resolveMigrationsDirPath();
    const alreadyExistsError = new Error(
      `migrations directory already exists: ${directoryPath}`,
    );
    try {
      await fs.stat(directoryPath);
      throw alreadyExistsError;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw alreadyExistsError;
      }
    }
  },

  async getFileNames() {
    const directoryPath = await resolveMigrationsDirPath();
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
    const directoryPath = await resolveMigrationsDirPath();
    return loadModule(path.join(directoryPath, fileName));
  },

  async loadFileHash(fileName) {
    const directoryPath = await resolveMigrationsDirPath();
    const migrationPath = path.join(directoryPath, fileName);
    const hash = crypto.createHash("sha256");
    hash.update(await fs.readFile(migrationPath));
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

async function getStatus(database) {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const { changelogCollectionName, useFileHash } = await config.read();
  const changelog = database.collection(changelogCollectionName);
  const appliedMigrations = await changelog.find({}).toArray();
  const shouldLoadFileHash = useFileHash === true;

  return Promise.all(
    fileNames.map(async (fileName) => {
      const fileHash = shouldLoadFileHash
        ? await migrationsDir.loadFileHash(fileName)
        : undefined;
      const appliedMigration = appliedMigrations.find(
        (entry) =>
          entry.fileName === fileName &&
          (!fileHash || entry.fileHash === fileHash),
      );
      const appliedAt = appliedMigration
        ? appliedMigration.appliedAt.toJSON()
        : "PENDING";
      const migrationBlock = appliedMigration?.migrationBlock;

      return useFileHash
        ? { fileName, fileHash, appliedAt, migrationBlock }
        : { fileName, appliedAt, migrationBlock };
    }),
  );
}

async function getLockCollection(database) {
  const { lockCollectionName, lockTtl } = await config.read();
  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }

  const lockCollection = database.collection(lockCollectionName);
  lockCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: lockTtl });
  return lockCollection;
}

const lock = {
  async exist(database) {
    const lockCollection = await getLockCollection(database);
    return Boolean(lockCollection) && (await lockCollection.find({}).toArray()).length > 0;
  },

  async activate(database) {
    const lockCollection = await getLockCollection(database);
    if (lockCollection) {
      await lockCollection.insertOne({ createdAt: new Date() });
    }
  },

  async clear(database) {
    const lockCollection = await getLockCollection(database);
    if (lockCollection) {
      await lockCollection.deleteMany({});
    }
  },
};

async function up(database, client) {
  const pendingMigrations = (await getStatus(database)).filter(
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

  for (const migration of pendingMigrations) {
    try {
      const migrationModule = await migrationsDir.loadMigration(migration.fileName);
      await migrationModule.up(database, client);
    } catch (error) {
      const migrationError = new Error(
        `Could not migrate up ${migration.fileName}: ${error.message}`,
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
    const appliedAt = new Date();
    const changelogEntry = useFileHash === true
      ? {
          fileName: migration.fileName,
          fileHash: migration.fileHash,
          appliedAt,
          migrationBlock,
        }
      : {
          fileName: migration.fileName,
          appliedAt,
          migrationBlock,
        };

    try {
      await changelog.insertOne(changelogEntry);
    } catch (error) {
      throw new Error(`Could not update changelog: ${error.message}`);
    }

    migrated.push(migration.fileName);
  }

  await lock.clear(database);
  return migrated;
}

export { up as default };
