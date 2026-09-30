import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');
const dependencyMetadata = [
  'name',
  'version',
  'integrity',
  'hasInstallScript',
  'license',
  'engines',
  'os',
  'cpu',
  'bin',
  'optionalDependencies',
  'peerDependencies',
  'funding',
];

function toIntegrity(dependency) {
  return dependency.integrity || undefined;
}

function notEmpty(value) {
  return value && Object.keys(value).length > 0;
}

function packagePath(parentPath, name) {
  return `${parentPath}node_modules/${name}`;
}

function copyDependencyMetadata(dependency) {
  const result = {};

  for (const property of dependencyMetadata) {
    if (property === 'integrity') {
      const integrity = toIntegrity(dependency);
      if (integrity) result.integrity = integrity;
    } else if (property === 'optionalDependencies' || property === 'peerDependencies') {
      if (notEmpty(dependency[property])) result[property] = dependency[property];
    } else if (dependency[property] !== undefined) {
      result[property] = dependency[property];
    }
  }

  return result;
}

function flatten(dependencies, parentPath = '', packages = {}) {
  for (const [name, dependency] of Object.entries(dependencies)) {
    const location = packagePath(parentPath, name);
    packages[location] = copyDependencyMetadata(dependency);

    if (dependency.dependencies) {
      flatten(dependency.dependencies, `${location}/`, packages);
    }
  }

  return packages;
}

function resolveFrom(packages, from, dependencyName) {
  let location = from;

  while (true) {
    const candidate = location
      ? `${location}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (packages[candidate]) return candidate;
    if (!location) return null;

    const parentBoundary = location.lastIndexOf('/node_modules/');
    location = parentBoundary < 0 ? '' : location.slice(0, parentBoundary);
  }
}

function reachable(packages, dependencyNames) {
  const result = {};
  const pending = dependencyNames
    .map((name) => resolveFrom(packages, '', name))
    .filter(Boolean);

  while (pending.length) {
    const location = pending.pop();
    if (result[location]) continue;

    result[location] = true;
    let dependency = packages[location];
    if (dependency?.link && dependency.resolved) {
      dependency = packages[dependency.resolved] || dependency;
    }

    const childNames = [
      ...Object.keys(dependency?.dependencies || {}),
      ...Object.keys(dependency?.optionalDependencies || {}),
    ];
    for (const name of childNames) {
      const child = resolveFrom(packages, location, name);
      if (child && !result[child]) pending.push(child);
    }
  }

  return result;
}

function copiedPackageMetadata(packageJson) {
  return {
    ...(packageJson.name !== undefined && { name: packageJson.name }),
    ...(packageJson.version !== undefined && { version: packageJson.version }),
    ...(packageJson.license !== undefined && { license: packageJson.license }),
    ...(notEmpty(packageJson.dependencies) && { dependencies: packageJson.dependencies }),
    ...(notEmpty(packageJson.devDependencies) && { devDependencies: packageJson.devDependencies }),
    ...(notEmpty(packageJson.optionalDependencies) && {
      optionalDependencies: packageJson.optionalDependencies,
    }),
    ...(notEmpty(packageJson.peerDependencies) && {
      peerDependencies: packageJson.peerDependencies,
    }),
    ...(notEmpty(packageJson.bin) && { bin: packageJson.bin }),
    ...(notEmpty(packageJson.engines) && { engines: packageJson.engines }),
  };
}

function addWorkspacePackages(packages, workspaces) {
  for (const workspace of workspaces) {
    const relativePath = path.relative(process.cwd(), workspace.dir).replaceAll(path.sep, '/');
    packages[relativePath] = copiedPackageMetadata(workspace.pkg);
  }
}

function addWorkspaceLinks(packages, workspaces) {
  for (const workspace of workspaces) {
    const relativePath = path.relative(process.cwd(), workspace.dir).replaceAll(path.sep, '/');
    packages[`node_modules/${workspace.name}`] = {
      resolved: relativePath,
      link: true,
    };
  }
}

function rootPackage(packageJson) {
  return {
    ...(packageJson.name !== undefined && { name: packageJson.name }),
    ...(packageJson.version !== undefined && { version: packageJson.version }),
    ...(packageJson.license !== undefined && { license: packageJson.license }),
    ...(packageJson.workspaces !== undefined && { workspaces: packageJson.workspaces }),
    ...(notEmpty(packageJson.dependencies) && { dependencies: packageJson.dependencies }),
    ...(notEmpty(packageJson.devDependencies) && { devDependencies: packageJson.devDependencies }),
    ...(notEmpty(packageJson.optionalDependencies) && {
      optionalDependencies: packageJson.optionalDependencies,
    }),
  };
}

function locker(packageJson, dependencies, workspaces = []) {
  const packages = {
    '': rootPackage(packageJson),
  };

  addWorkspacePackages(packages, workspaces);
  flatten(dependencies, '', packages);
  addWorkspaceLinks(packages, workspaces);

  const packageLock = {
    name: packageJson.name,
    version: packageJson.version,
    lockfileVersion: 3,
    requires: true,
    packages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
}

const lockerDefault = locker;

Object.assign(globalThis, {
  pkgLockJSON: packageLockPath,
  toIntegrity,
  notEmpty,
  flatten,
  resolveFrom,
  reachable,
  locker,
  locker_default: lockerDefault,
});

export { lockerDefault as default };
