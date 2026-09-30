// ../work/seppevs__migrate-mongo/lib/utils/module-loader.js
import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
var module_loader_default = {
  require(requirePath) {
    const requireFunc = createRequire(pathToFileURL(path.join(process.cwd(), "package.json")));
    return requireFunc(requirePath);
  },
  import(importPath) {
    return import(importPath);
  }
};

// ../work/seppevs__migrate-mongo/lib/env/config.js
import fs from "fs/promises";
import path2 from "path";
import url from "url";
var DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";
var customConfigContent = null;
function getConfigPath() {
  const fileOptionValue = global.options?.file ?? null;
  if (!fileOptionValue) {
    return path2.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }
  if (path2.isAbsolute(fileOptionValue)) {
    return fileOptionValue;
  }
  return path2.join(process.cwd(), fileOptionValue);
}
function getModuleExports(module) {
  return module.default ? module.default : module;
}
var config_default = {
  DEFAULT_CONFIG_FILE_NAME,
  set(configContent) {
    customConfigContent = configContent;
  },
  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.stat(configPath);
      } catch (err) {
        throw new Error(`config file does not exist: ${configPath}`);
      }
    }
  },
  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      const error = new Error(`config file already exists: ${configPath}`);
      try {
        await fs.stat(configPath);
        throw error;
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw error;
        }
      }
    }
  },
  getConfigFilename() {
    return path2.basename(getConfigPath());
  },
  async read() {
    if (customConfigContent) {
      return customConfigContent;
    }
    const configPath = getConfigPath();
    try {
      let config = await module_loader_default.require(configPath);
      config = getModuleExports(config);
      if (global.options?.migrationsDir) {
        config = { ...config, migrationsDir: global.options.migrationsDir };
      }
      return config;
    } catch (e) {
      if (e.code === "ERR_REQUIRE_ESM" || e.code === "ERR_REQUIRE_ASYNC_MODULE") {
        let loadedImport = await module_loader_default.import(url.pathToFileURL(configPath));
        let config = getModuleExports(loadedImport);
        if (global.options?.migrationsDir) {
          config = { ...config, migrationsDir: global.options.migrationsDir };
        }
        return config;
      }
      throw e;
    }
  }
};

// ../work/seppevs__migrate-mongo/lib/env/migrationsDir.js
import fs2 from "fs/promises";
import path3 from "path";
import url2 from "url";
import crypto from "crypto";
var DEFAULT_MIGRATIONS_DIR_NAME = "migrations";
var DEFAULT_MIGRATION_EXT = ".js";
async function resolveMigrationsDirPath() {
  let migrationsDir;
  try {
    const configContent = await config_default.read();
    migrationsDir = configContent.migrationsDir;
    if (!migrationsDir) {
      migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (err) {
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }
  if (path3.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }
  return path3.join(process.cwd(), migrationsDir);
}
async function resolveMigrationFileExtension() {
  let migrationFileExtension;
  try {
    const configContent = await config_default.read();
    migrationFileExtension = configContent.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    migrationFileExtension = DEFAULT_MIGRATION_EXT;
  }
  if (migrationFileExtension && !migrationFileExtension.startsWith(".")) {
    throw new Error("migrationFileExtension must start with dot");
  }
  return migrationFileExtension;
}
async function resolveSampleMigrationFileName() {
  const migrationFileExtention = await resolveMigrationFileExtension();
  return `sample-migration${migrationFileExtention}`;
}
async function resolveSampleMigrationPath() {
  const migrationsDir = await resolveMigrationsDirPath();
  const sampleMigrationSampleFileName = await resolveSampleMigrationFileName();
  return path3.join(migrationsDir, sampleMigrationSampleFileName);
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
      await fs2.stat(migrationsDir);
    } catch (err) {
      throw new Error(`migrations directory does not exist: ${migrationsDir}`);
    }
  },
  async shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error(
      `migrations directory already exists: ${migrationsDir}`
    );
    try {
      await fs2.stat(migrationsDir);
      throw error;
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw error;
      }
    }
  },
  async getFileNames() {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationExt = await resolveMigrationFileExtension();
    const files = await fs2.readdir(migrationsDir);
    const sampleMigrationFileName = await resolveSampleMigrationFileName();
    return files.filter((file) => path3.extname(file) === migrationExt && path3.basename(file) !== sampleMigrationFileName).sort();
  },
  async loadMigration(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const migrationPath = path3.join(migrationsDir, fileName);
    try {
      const result = module_loader_default.require(migrationPath);
      return getModuleExports2(result);
    } catch (e) {
      if (e.code === "ERR_REQUIRE_ESM" || e.code === "ERR_REQUIRE_ASYNC_MODULE") {
        const loadedImport = await module_loader_default.import(url2.pathToFileURL(migrationPath));
        return getModuleExports2(loadedImport);
      }
      throw e;
    }
  },
  async loadFileHash(fileName) {
    const migrationsDir = await resolveMigrationsDirPath();
    const filePath = path3.join(migrationsDir, fileName);
    const hash = crypto.createHash("sha256");
    const input = await fs2.readFile(filePath);
    hash.update(input);
    return hash.digest("hex");
  },
  async doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
      await fs2.stat(samplePath);
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ../work/seppevs__migrate-mongo/lib/actions/status.js
var status_default = async (db) => {
  await migrationsDir_default.shouldExist();
  await config_default.shouldExist();
  const fileNames = await migrationsDir_default.getFileNames();
  const { changelogCollectionName, useFileHash } = await config_default.read();
  const changelogCollection = db.collection(changelogCollectionName);
  const changelog = await changelogCollection.find({}).toArray();
  const useFileHashTest = useFileHash === true;
  const statusTable = await Promise.all(fileNames.map(async (fileName) => {
    let fileHash;
    let findTest = { fileName };
    if (useFileHashTest) {
      fileHash = await migrationsDir_default.loadFileHash(fileName);
      findTest = { fileName, fileHash };
    }
    const itemInLog = changelog.find(
      (item) => item.fileName === findTest.fileName && (!findTest.fileHash || item.fileHash === findTest.fileHash)
    );
    const appliedAt = itemInLog ? itemInLog.appliedAt.toJSON() : "PENDING";
    const migrationBlock = itemInLog ? itemInLog.migrationBlock : void 0;
    return useFileHash ? { fileName, fileHash, appliedAt, migrationBlock } : { fileName, appliedAt, migrationBlock };
  }));
  return statusTable;
};

// ../work/seppevs__migrate-mongo/lib/utils/lock.js
async function getLockCollection(db) {
  const { lockCollectionName, lockTtl } = await config_default.read();
  if (!lockCollectionName || lockTtl <= 0) {
    return null;
  }
  const lockCollection = db.collection(lockCollectionName);
  lockCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: lockTtl });
  return lockCollection;
}
async function exist(db) {
  const lockCollection = await getLockCollection(db);
  if (!lockCollection) {
    return false;
  }
  const foundLocks = await lockCollection.find({}).toArray();
  return foundLocks.length > 0;
}
async function activate(db) {
  const lockCollection = await getLockCollection(db);
  if (lockCollection) {
    await lockCollection.insertOne({ createdAt: /* @__PURE__ */ new Date() });
  }
}
async function clear(db) {
  const lockCollection = await getLockCollection(db);
  if (lockCollection) {
    await lockCollection.deleteMany({});
  }
}
var lock_default = { exist, activate, clear };

// ../work/seppevs__migrate-mongo/lib/actions/up.js
var up_default = async (db, client) => {
  const statusItems = await status_default(db);
  const pendingItems = statusItems.filter((item) => item.appliedAt === "PENDING");
  const migrated = [];
  const migrationBlock = Date.now();
  if (await lock_default.exist(db)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }
  try {
    await lock_default.activate(db);
  } catch (err) {
    throw new Error(`Could not create a lock: ${err.message}`);
  }
  const migrateItem = async (item) => {
    try {
      const migration = await migrationsDir_default.loadMigration(item.fileName);
      await migration.up(db, client);
    } catch (err) {
      const error = new Error(
        `Could not migrate up ${item.fileName}: ${err.message}`
      );
      error.stack = err.stack;
      error.migrated = migrated;
      if (err.errInfo) {
        error.additionalInfo = err.errInfo;
      }
      await lock_default.clear(db);
      throw error;
    }
    const { changelogCollectionName, useFileHash } = await config_default.read();
    const changelogCollection = db.collection(changelogCollectionName);
    const { fileName, fileHash } = item;
    const appliedAt = /* @__PURE__ */ new Date();
    try {
      await changelogCollection.insertOne(useFileHash === true ? { fileName, fileHash, appliedAt, migrationBlock } : { fileName, appliedAt, migrationBlock });
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
    migrated.push(item.fileName);
  };
  for (const item of pendingItems) {
    await migrateItem(item);
  }
  await lock_default.clear(db);
  return migrated;
};
export {
  up_default as default
};
