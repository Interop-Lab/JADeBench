import { writeFileSync } from "fs";
import path from "path";

const packageLockPath = path.join(process.cwd(), "package-lock.json");

/** Return npm's integrity value, deriving a SHA-1 SRI value for old locks. */
function toIntegrity(packageInfo) {
  if (packageInfo.integrity) return packageInfo.integrity;
  if (!packageInfo.shasum) return undefined;
  return `sha1-${Buffer.from(packageInfo.shasum, "hex").toString("base64")}`;
}

/** Preserve falsy values; otherwise report whether a value has own keys. */
function notEmpty(value) {
  return value && Object.keys(value).length > 0;
}

const copiedPackageFields = [
  "hasInstallScript",
  "license",
  "engines",
  "os",
  "cpu",
  "libc",
  "bin",
  "optionalDependencies",
  "peerDependencies",
  "funding",
];

/**
 * Convert the nested dependency tree used by old npm lockfiles into the
 * path-keyed `packages` map used by lockfile version 3.
 */
function flatten(dependencies, parentPath = "", packages = {}) {
  for (const [dependencyName, dependency] of Object.entries(dependencies || {})) {
    const packagePath = `${parentPath}node_modules/${dependencyName}`;
    const entry = {};

    if (dependency.name) entry.name = dependency.name;
    if (dependency.version !== undefined) entry.version = dependency.version;

    const resolved = dependency.tarball ?? dependency.url;
    if (resolved !== undefined) entry.resolved = resolved;

    const integrity = toIntegrity(dependency);
    if (integrity !== undefined) entry.integrity = integrity;

    for (const field of copiedPackageFields) {
      if (notEmpty(dependency[field])) entry[field] = dependency[field];
    }
    if (notEmpty(dependency.requires)) entry.dependencies = dependency.requires;

    packages[packagePath] = entry;
    if (dependency.dependencies) {
      flatten(dependency.dependencies, `${packagePath}/`, packages);
    }
  }
  return packages;
}

/** Find where a named dependency resolves when walking toward the root. */
function resolveFrom(packagePaths, fromPath, dependencyName) {
  let directory = fromPath;
  while (true) {
    const candidate = directory
      ? `${directory}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (packagePaths.includes(candidate)) return candidate;

    const marker = directory.lastIndexOf("/node_modules/");
    if (marker < 0) return null;
    directory = directory.slice(0, marker);
  }
}

/** Collect package records reachable through dependency declarations. */
function reachable(packagePaths, initialPaths, packages) {
  const found = {};
  const pending = [...initialPaths];

  while (pending.length) {
    const packagePath = pending.pop();
    if (!packagePath || found[packagePath] || !packages[packagePath]) continue;
    found[packagePath] = true;

    const nestedPrefix = `${packagePath}/node_modules/`;
    for (const candidate of packagePaths) {
      if (candidate.startsWith(nestedPrefix)) pending.push(candidate);
    }

    const entry = packages[packagePath];
    for (const dependencyName of Object.keys({
      ...(entry.dependencies || {}),
      ...(entry.optionalDependencies || {}),
    })) {
      const resolved = resolveFrom(packagePaths, packagePath, dependencyName);
      if (resolved) pending.push(resolved);
    }
  }
  return found;
}

/** Build and write a lockfile-version-3 package lock. */
function locker(manifest, dependencyTree, omittedPackages = []) {
  const root = {};
  for (const field of [
    "name",
    "version",
    "license",
    "workspaces",
    "dependencies",
    "devDependencies",
    "optionalDependencies",
  ]) {
    if (notEmpty(manifest[field])) root[field] = manifest[field];
  }

  const packages = { "": root };
  flatten(dependencyTree, "", packages);

  for (const omitted of omittedPackages) delete packages[omitted];

  const packagePaths = Object.keys(packages);
  const productionRoots = Object.keys({
    ...(manifest.dependencies || {}),
    ...(manifest.optionalDependencies || {}),
  })
    .map((name) => resolveFrom(packagePaths, "", name))
    .filter(Boolean);
  const production = reachable(packagePaths, productionRoots, packages);

  const optionalRoots = Object.keys(manifest.optionalDependencies || {})
    .map((name) => resolveFrom(packagePaths, "", name))
    .filter(Boolean);
  const optional = reachable(packagePaths, optionalRoots, packages);

  for (const packagePath of packagePaths) {
    if (!packagePath) continue;
    if (!production[packagePath]) packages[packagePath].dev = true;
    if (optional[packagePath]) packages[packagePath].optional = true;
  }

  const lockfile = {
    name: manifest.name,
    version: manifest.version,
    lockfileVersion: 3,
    requires: true,
    packages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(lockfile, null, 2)}\n`);
}

Object.assign(globalThis, {
  pkgLockJSON: packageLockPath,
  toIntegrity,
  notEmpty,
  flatten,
  resolveFrom,
  reachable,
  locker,
  locker_default: locker,
});

export default locker;
