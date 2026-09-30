import { writeFileSync } from 'fs';
import path from 'path';

const pkgLockJSON = path.join(process.cwd(), 'package-lock.json');

function toIntegrity(dependency) {
  return dependency.integrity;
}

function notEmpty(value) {
  return value && Object.keys(value).length > 0;
}

function flatten(dependencies, prefix, packages) {
  for (const [requestedName, dependency] of Object.entries(dependencies || {})) {
    const packageName = dependency.name || requestedName;
    const packagePath = `${prefix}node_modules/${requestedName}`;
    const packageEntry = {
      ...(packageName !== requestedName ? { name: packageName } : {}),
      version: dependency.version,
      resolved: dependency.tarball,
      integrity: toIntegrity(dependency),
      ...(dependency.hasInstallScript ? { hasInstallScript: true } : {}),
      ...(dependency.license ? { license: dependency.license } : {}),
      ...(notEmpty(dependency.engines) ? { engines: dependency.engines } : {}),
      ...(notEmpty(dependency.os) ? { os: dependency.os } : {}),
      ...(notEmpty(dependency.cpu) ? { cpu: dependency.cpu } : {}),
      ...(notEmpty(dependency.libc) ? { libc: dependency.libc } : {}),
      ...(notEmpty(dependency.bin) ? { bin: dependency.bin } : {}),
      ...(notEmpty(dependency.requires) ? { dependencies: dependency.requires } : {}),
      ...(notEmpty(dependency.optionalDependencies)
        ? { optionalDependencies: dependency.optionalDependencies }
        : {}),
      ...(notEmpty(dependency.peerDependencies)
        ? { peerDependencies: dependency.peerDependencies }
        : {}),
      ...(dependency.funding ? { funding: dependency.funding } : {}),
    };

    packages[packagePath] = packageEntry;
    flatten(dependency.dependencies, `${packagePath}/`, packages);
  }

  return packages;
}

function resolveFrom(packages, from, dependencyName) {
  let current = from;
  while (true) {
    const candidate = current
      ? `${current}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (candidate in packages) return candidate;
    if (!current) return null;

    const parentMarker = current.lastIndexOf('/node_modules/');
    current = parentMarker < 0 ? '' : current.slice(0, parentMarker);
  }
}

function reachable(packages, dependencyNames, result = {}) {
  const pending = (dependencyNames || [])
    .map((name) => resolveFrom(packages, '', name))
    .filter(Boolean);

  while (pending.length) {
    const packagePath = pending.pop();
    if (result[packagePath]) continue;
    result[packagePath] = true;

    const dependency = packages[packagePath];
    for (const childName of Object.keys(dependency?.dependencies || {})) {
      const childPath = resolveFrom(packages, packagePath, childName);
      if (childPath && !result[childPath]) pending.push(childPath);
    }
  }

  return result;
}

function locker(packageJSON, dependencyTree, workspacePackages = []) {
  const rootPackage = {
    name: packageJSON.name,
    version: packageJSON.version,
    ...(packageJSON.license ? { license: packageJSON.license } : {}),
    ...(notEmpty(packageJSON.workspaces) ? { workspaces: packageJSON.workspaces } : {}),
    ...(notEmpty(packageJSON.dependencies) ? { dependencies: packageJSON.dependencies } : {}),
    ...(notEmpty(packageJSON.devDependencies)
      ? { devDependencies: packageJSON.devDependencies }
      : {}),
    ...(notEmpty(packageJSON.optionalDependencies)
      ? { optionalDependencies: packageJSON.optionalDependencies }
      : {}),
  };

  const packages = { '': rootPackage };
  flatten(dependencyTree, '', packages);

  const production = reachable(packages, Object.keys(packageJSON.dependencies || {}));
  const optional = reachable(packages, Object.keys(packageJSON.optionalDependencies || {}));
  const development = reachable(packages, Object.keys(packageJSON.devDependencies || {}));

  for (const [packagePath, dependency] of Object.entries(packages)) {
    if (!packagePath) continue;
    if (!production[packagePath] && development[packagePath]) dependency.dev = true;
    if (optional[packagePath]) dependency.optional = true;
    if (!production[packagePath] && development[packagePath] && optional[packagePath]) {
      dependency.devOptional = true;
    }
  }

  for (const workspace of workspacePackages || []) {
    const relativeDirectory = path.relative(process.cwd(), workspace.dir).replaceAll(path.sep, '/');
    const manifest = workspace.pkg;
    packages[relativeDirectory] = {
      name: manifest.name,
      version: manifest.version,
      ...(manifest.license ? { license: manifest.license } : {}),
      ...(notEmpty(manifest.dependencies) ? { dependencies: manifest.dependencies } : {}),
      ...(notEmpty(manifest.devDependencies)
        ? { devDependencies: manifest.devDependencies }
        : {}),
      ...(notEmpty(manifest.optionalDependencies)
        ? { optionalDependencies: manifest.optionalDependencies }
        : {}),
      ...(notEmpty(manifest.peerDependencies)
        ? { peerDependencies: manifest.peerDependencies }
        : {}),
      ...(notEmpty(manifest.bin) ? { bin: manifest.bin } : {}),
      ...(notEmpty(manifest.engines) ? { engines: manifest.engines } : {}),
    };
    packages[`node_modules/${workspace.name}`] = { resolved: relativeDirectory, link: true };
  }

  const lockfile = {
    name: packageJSON.name,
    version: packageJSON.version,
    lockfileVersion: 3,
    requires: true,
    packages,
  };
  writeFileSync(pkgLockJSON, `${JSON.stringify(lockfile, null, 2)}\n`);
}

Object.assign(globalThis, {
  pkgLockJSON,
  toIntegrity,
  notEmpty,
  flatten,
  resolveFrom,
  reachable,
  locker,
  locker_default: locker,
});

export { locker as default };
