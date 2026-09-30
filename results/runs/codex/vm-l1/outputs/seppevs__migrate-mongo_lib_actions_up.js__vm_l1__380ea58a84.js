import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";

let customConfigContent = null;

const moduleLoader = {
  require(modulePath) {
    const packageUrl = pathToFileURL(path.join(process.cwd(), "package.json"));
    return createRequire(packageUrl)(modulePath);
  },

  import(modulePath) {
    return import(modulePath);
  },
};

function getConfigPath() {
  const configuredPath = global.options?.file;
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function getModuleExports(loadedModule) {
  return loadedModule.default || loadedModule;
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
      if (error.code !== "ENOENT") throw error;
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    let configContent;
    try {
      configContent = getModuleExports(moduleLoader.require(configPath));
    } catch (error) {
      const mustUseImport =
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE";
      if (!mustUseImport) throw error;

      const importedModule = await moduleLoader.import(pathToFileURL(configPath));
      configContent = getModuleExports(importedModule);
    }

    if (global.options?.migrationsDir) {
      configContent.migrationsDir = global.options.migrationsDir;
    }

    return configContent;
  },
};

async function resolveMigrationsDirPath() {
  const configContent = await config.read();
  const configuredPath = configContent.migrationsDir || DEFAULT_MIGRATIONS_DIR_NAME;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

async function resolveMigrationFileExtension() {
  const configContent = await config.read();
  const extension = configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  if (!extension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
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
      if (error.code !== "ENOENT") throw error;
    }
  },

  async getFileNames() {
    const migrationsPath = await resolveMigrationsDirPath();
    const extension = await resolveMigrationFileExtension();
    const sampleFileName = await resolveSampleMigrationFileName();
    const fileNames = await fs.readdir(migrationsPath);

    return fileNames
      .filter(
        (fileName) =>
          path.extname(fileName) === extension &&
          path.basename(fileName, extension) !== path.basename(sampleFileName, extension),
      )
      .sort();
  },

  async loadMigration(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    try {
      return getModuleExports(moduleLoader.require(migrationPath));
    } catch (error) {
      const mustUseImport =
        error.code === "ERR_REQUIRE_ESM" ||
        error.code === "ERR_REQUIRE_ASYNC_MODULE";
      if (!mustUseImport) throw error;

      const importedModule = await moduleLoader.import(pathToFileURL(migrationPath));
      return getModuleExports(importedModule);
    }
  },

  async loadFileHash(fileName) {
    const migrationPath = path.join(await resolveMigrationsDirPath(), fileName);
    const hash = crypto.createHash("sha256");
    hash.update(await fs.readFile(migrationPath));
    return hash.digest("hex");
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

async function status(database) {
  await migrationsDir.shouldExist();
  await config.shouldExist();

  const fileNames = await migrationsDir.getFileNames();
  const configContent = await config.read();
  const changelogCollection = database.collection(configContent.changelogCollectionName);
  const changelog = await changelogCollection.find({}).toArray();

  return Promise.all(
    fileNames.map(async (fileName) => {
      const fileHash = configContent.useFileHash
        ? await migrationsDir.loadFileHash(fileName)
        : undefined;
      const changelogEntry = changelog.find(
        (entry) =>
          entry.fileName === fileName &&
          (!configContent.useFileHash || entry.fileHash === fileHash),
      );

      if (!changelogEntry) {
        return {
          fileName,
          ...(configContent.useFileHash ? { fileHash } : {}),
          appliedAt: "PENDING",
          migrationBlock: undefined,
        };
      }

      return {
        fileName,
        ...(configContent.useFileHash ? { fileHash } : {}),
        appliedAt: changelogEntry.appliedAt.toJSON(),
        migrationBlock: changelogEntry.migrationBlock,
      };
    }),
  );
}

async function getLockCollection(database) {
  const configContent = await config.read();
  const collection = database.collection(configContent.lockCollectionName);
  if (configContent.lockTtl > 0) {
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: configContent.lockTtl },
    );
  }
  return collection;
}

const lock = {
  async exist(database) {
    const collection = await getLockCollection(database);
    return (await collection.find({}).toArray()).length > 0;
  },

  async activate(database) {
    const collection = await getLockCollection(database);
    await collection.insertOne({ createdAt: new Date() });
  },

  async clear(database) {
    const collection = await getLockCollection(database);
    await collection.deleteMany({});
  },
};

async function up(database, client) {
  const pendingMigrations = (await status(database)).filter(
    (migrationStatus) => migrationStatus.appliedAt === "PENDING",
  );
  const migrationBlock = Date.now();

  if (await lock.exist(database)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }

  try {
    await lock.activate(database);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }

  const migrated = [];
  try {
    for (const migrationStatus of pendingMigrations) {
      const { fileName, fileHash } = migrationStatus;
      try {
        const migration = await migrationsDir.loadMigration(fileName);
        await migration.up(database, client);
      } catch (error) {
        const migrationError = new Error(
          `Could not migrate up ${fileName}: ${error.message}`,
        );
        migrationError.stack = error.stack;
        migrationError.migrated = migrated;
        migrationError.errInfo = error.errInfo;
        migrationError.additionalInfo = error.additionalInfo;
        await lock.clear(database);
        throw migrationError;
      }

      const configContent = await config.read();
      const changelogCollection = database.collection(configContent.changelogCollectionName);
      const changelogEntry = {
        fileName,
        ...(configContent.useFileHash ? { fileHash } : {}),
        appliedAt: new Date(),
        migrationBlock,
      };

      try {
        await changelogCollection.insertOne(changelogEntry);
      } catch (error) {
        throw new Error(`Could not update changelog: ${error.message}`);
      }

      migrated.push(fileName);
    }
  } finally {
    await lock.clear(database);
  }

  return migrated;
}

export default up;
