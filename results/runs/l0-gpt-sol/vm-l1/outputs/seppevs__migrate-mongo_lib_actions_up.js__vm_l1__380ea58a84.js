import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const require = createRequire(import.meta.url);

const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
const DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
const DEFAULT_MIGRATION_EXT = ".js";
const LOCK_ID = "migrate-mongo-lock";
const LOCK_VALUE = "locked";

async function loadModule(filePath, preferESModules = false) {
  const absolutePath = path.resolve(filePath);

  if (!preferESModules) {
    try {
      const loaded = require(absolutePath);
      return loaded?.default ?? loaded;
    } catch (error) {
      if (
        error?.code !== "ERR_REQUIRE_ESM" &&
        error?.code !== "ERR_REQUIRE_ASYNC_MODULE"
      ) {
        throw error;
      }
    }
  }

  const loaded = await import(pathToFileURL(absolutePath).href);
  return loaded.default ?? loaded;
}

async function readConfig() {
  const configPath = path.resolve(
    process.cwd(),
    process.env.MIGRATE_MONGO_CONFIG || DEFAULT_CONFIG_FILE_NAME
  );

  const config = await loadModule(configPath);

  return {
    migrationsDir: DEFAULT_MIGRATIONS_DIR_NAME,
    migrationFileExtension: DEFAULT_MIGRATION_EXT,
    useFileHash: false,
    ...config
  };
}

async function resolveMigrationsDirPath() {
  const config = await readConfig();
  return path.resolve(process.cwd(), config.migrationsDir);
}

async function resolveMigrationFileExtension() {
  const config = await readConfig();
  return config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
}

async function getMigrationFileNames() {
  const migrationsDir = await resolveMigrationsDirPath();
  const extension = await resolveMigrationFileExtension();
  const entries = await fs.readdir(migrationsDir);

  return entries
    .filter(fileName => fileName.endsWith(extension))
    .sort();
}

async function loadMigration(fileName) {
  const config = await readConfig();
  const migrationsDir = await resolveMigrationsDirPath();
  const migrationPath = path.resolve(migrationsDir, fileName);
  const preferESModules =
    config.moduleSystem === "esm" ||
    path.extname(migrationPath).toLowerCase() === ".mjs";

  return loadModule(migrationPath, preferESModules);
}

async function loadFileHash(fileName) {
  const migrationsDir = await resolveMigrationsDirPath();
  const contents = await fs.readFile(path.resolve(migrationsDir, fileName));

  return crypto
    .createHash("sha256")
    .update(contents)
    .digest("hex");
}

async function getStatus(db) {
  const config = await readConfig();
  const migrationFiles = await getMigrationFileNames();
  const changelog = await db
    .collection(config.changelogCollectionName)
    .find({})
    .sort({ appliedAt: 1 })
    .toArray();

  return Promise.all(
    migrationFiles.map(async fileName => {
      const migrated = changelog.find(entry => entry.fileName === fileName);

      if (!migrated) {
        return {
          fileName,
          fileHash: null,
          appliedAt: "PENDING"
        };
      }

      if (config.useFileHash) {
        const fileHash = await loadFileHash(fileName);

        if (fileHash !== migrated.fileHash) {
          return {
            fileName,
            fileHash,
            appliedAt: "MIGRATION CHANGED"
          };
        }
      }

      return {
        fileName,
        fileHash: migrated.fileHash ?? null,
        appliedAt:
          migrated.appliedAt &&
          typeof migrated.appliedAt.toJSON === "function"
            ? migrated.appliedAt.toJSON()
            : migrated.appliedAt
      };
    })
  );
}

async function getLockCollection(db) {
  const config = await readConfig();
  const collectionName =
    config.lockCollectionName ||
    `${config.changelogCollectionName}_lock`;

  return db.collection(collectionName);
}

async function activateLock(lockCollection) {
  const config = await readConfig();

  if (config.lockTtl > 0 && typeof lockCollection.createIndex === "function") {
    await lockCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: config.lockTtl }
    );
  }

  try {
    await lockCollection.insertOne({
      _id: LOCK_ID,
      value: LOCK_VALUE,
      createdAt: new Date()
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error(
        "Could not acquire migration lock. Another migration process is currently running."
      );
    }
    throw error;
  }
}

async function clearLock(lockCollection) {
  await lockCollection.deleteOne({ _id: LOCK_ID });
}

const up = async (db, client) => {
  const config = await readConfig();
  const changelogCollection = db.collection(config.changelogCollectionName);
  const lockCollection = await getLockCollection(db);

  const migrationFiles = await getMigrationFileNames();
  const migrationStatus = await getStatus(db);
  const pendingMigrations = migrationFiles.filter(fileName => {
    const status = migrationStatus.find(item => item.fileName === fileName);
    return status?.appliedAt === "PENDING";
  });

  if (pendingMigrations.length === 0) {
    return [];
  }

  await activateLock(lockCollection);

  const appliedMigrations = [];

  try {
    for (const fileName of pendingMigrations) {
      const migration = await loadMigration(fileName);

      if (typeof migration?.up !== "function") {
        throw new TypeError(
          `Migration ${fileName} does not export an up function`
        );
      }

      await migration.up(db, client);

      const changelogEntry = {
        fileName,
        appliedAt: new Date()
      };

      if (config.useFileHash) {
        changelogEntry.fileHash = await loadFileHash(fileName);
      }

      await changelogCollection.insertOne(changelogEntry);
      appliedMigrations.push(fileName);
    }
  } finally {
    await clearLock(lockCollection);
  }

  return appliedMigrations;
};

export { up as default };
