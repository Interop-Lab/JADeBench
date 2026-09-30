/*
 * Apply every migration whose status is PENDING.
 *
 * The surrounding migration package supplies these collaborators globally in
 * the bundled module environment. Keeping those lookups at call time matches
 * the original module's behavior and also makes them straightforward to stub.
 */

const PENDING = "PENDING";

function getRuntimeDependency(name) {
  const dependency = globalThis[name];
  if (dependency === undefined) {
    throw new ReferenceError(`${name} is not defined`);
  }
  return dependency;
}

async function up(database, migrationOptions) {
  const status = getRuntimeDependency("status_default");
  const lock = getRuntimeDependency("lock_default");
  const migrationsDirectory = getRuntimeDependency("migrationsDir_default");
  const config = getRuntimeDependency("config_default");

  const pendingMigrations = (await status(database)).filter(
    (migration) => migration.appliedAt === PENDING,
  );

  if (await lock.exist(database)) {
    throw new Error("Could not migrate up, a lock is in place.");
  }

  try {
    await lock.activate(database);
  } catch (error) {
    throw new Error(`Could not create a lock: ${error.message}`);
  }

  const appliedFileNames = [];

  try {
    for (const pendingMigration of pendingMigrations) {
      const migration = await migrationsDirectory.loadMigration(
        pendingMigration.fileName,
      );

      await migration.up(database, migrationOptions);

      const { changelogCollectionName, useFileHash } = await config.read();
      const changelogEntry = {
        fileName: pendingMigration.fileName,
        ...(useFileHash ? { fileHash: pendingMigration.fileHash } : {}),
        appliedAt: new Date(),
        migrationBlock: Date.now(),
      };

      await database.collection(changelogCollectionName).insertOne(changelogEntry);
      appliedFileNames.push(pendingMigration.fileName);
    }
  } finally {
    await lock.clear(database);
  }

  return appliedFileNames;
}

export { up as default };
