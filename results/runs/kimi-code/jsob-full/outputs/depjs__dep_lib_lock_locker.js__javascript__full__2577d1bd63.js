import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');

function hasEntries(value) {
  return value && Object.keys(value).length > 0;
}

function toIntegrity(packageData) {
  if (packageData.integrity) return packageData.integrity;
  if (packageData.shasum) {
    return `sha1-${Buffer.from(packageData.shasum, 'hex').toString('base64')}`;
  }
  return undefined;
}

function copyPackageMetadata(dependencyName, packageData) {
  const metadata = {};

  if (packageData.name && packageData.name !== dependencyName) {
    metadata.name = packageData.name;
  }
  metadata.version = packageData.version;

  const resolved = packageData.tarball || packageData.url;
  if (resolved) metadata.resolved = resolved;

  const integrity = toIntegrity(packageData);
  if (integrity) metadata.integrity = integrity;

  if (packageData.hasInstallScript) metadata.hasInstallScript = true;
  if (packageData.license) metadata.license = packageData.license;
  if (packageData.engines) metadata.engines = packageData.engines;
  if (packageData.os) metadata.os = packageData.os;
  if (packageData.cpu) metadata.cpu = packageData.cpu;
  if (packageData.libc) metadata.libc = packageData.libc;
  if (packageData.bin) metadata.bin = packageData.bin;
  if (hasEntries(packageData.requires)) metadata.dependencies = packageData.requires;
  if (hasEntries(packageData.optionalDependencies)) {
    metadata.optionalDependencies = packageData.optionalDependencies;
  }
  if (hasEntries(packageData.peerDependencies)) {
    metadata.peerDependencies = packageData.peerDependencies;
  }
  if (packageData.funding) metadata.funding = packageData.funding;

  return metadata;
}

function resolveDependency(packages, fromPath, dependencyName) {
  let directory = fromPath;
  while (true) {
    const candidate = `${directory ? `${directory}/` : ''}node_modules/${dependencyName}`;
    if (packages[candidate]) return candidate;
    if (!directory) return null;

    const separator = directory.lastIndexOf('/node_modules/');
    directory = separator === -1 ? '' : directory.slice(0, separator);
  }
}

function flattenDependencies(dependencies, prefix, packages) {
  for (const dependencyName of Object.keys(dependencies)) {
    const dependency = dependencies[dependencyName];
    const packagePath = `${prefix}node_modules/${dependencyName}`;

    packages[packagePath] = copyPackageMetadata(dependencyName, dependency);
    if (dependency.dependencies) {
      flattenDependencies(dependency.dependencies, `${packagePath}/`, packages);
    }
  }
  return packages;
}

function findReachablePackages(packages, dependencyNames, includeOptional) {
  const reachable = {};
  const queue = dependencyNames
    .map((name) => resolveDependency(packages, '', name))
    .filter(Boolean);

  while (queue.length) {
    const packagePath = queue.pop();
    if (reachable[packagePath]) continue;
    reachable[packagePath] = true;

    let packageData = packages[packagePath];
    let dependencyBase = packagePath;
    if (packageData?.link) {
      dependencyBase = packageData.resolved;
      packageData = packages[packageData.resolved];
    }
    if (!packageData) continue;

    const dependencies = Object.assign({}, packageData.dependencies);
    if (includeOptional) {
      Object.assign(dependencies, packageData.optionalDependencies);
    } else {
      for (const name of Object.keys(packageData.optionalDependencies || {})) {
        delete dependencies[name];
      }
    }

    for (const name of Object.keys(dependencies)) {
      const resolved = resolveDependency(packages, dependencyBase, name);
      if (resolved) queue.push(resolved);
    }
  }

  return reachable;
}

function workspacePath(workspace) {
  return path.relative(process.cwd(), workspace.dir).split(path.sep).join('/');
}

function createWorkspacePackages(workspaces) {
  const packages = {};

  for (const workspace of workspaces) {
    const relativePath = workspacePath(workspace);
    const manifest = workspace.pkg;
    const metadata = {
      name: manifest.name,
      version: manifest.version,
    };

    if (manifest.license) metadata.license = manifest.license;
    if (hasEntries(manifest.dependencies)) metadata.dependencies = manifest.dependencies;
    if (hasEntries(manifest.devDependencies)) metadata.devDependencies = manifest.devDependencies;
    if (hasEntries(manifest.optionalDependencies)) {
      metadata.optionalDependencies = manifest.optionalDependencies;
    }
    if (hasEntries(manifest.peerDependencies)) {
      metadata.peerDependencies = manifest.peerDependencies;
    }
    if (manifest.engines) metadata.engines = manifest.engines;
    if (manifest.bin) metadata.bin = manifest.bin;

    packages[relativePath] = metadata;
    packages[`node_modules/${workspace.name}`] = {
      resolved: relativePath,
      link: true,
    };
  }

  return packages;
}

function markDependencyKinds(packages, rootManifest, workspaces) {
  const productionNames = [
    ...Object.keys(rootManifest.dependencies || {}),
    ...workspaces.map((workspace) => workspace.name),
  ];
  const developmentNames = [
    ...Object.keys(rootManifest.devDependencies || {}),
    ...workspaces.flatMap((workspace) => Object.keys(workspace.pkg.devDependencies || {})),
  ];
  const optionalNames = [
    ...Object.keys(rootManifest.optionalDependencies || {}),
    ...workspaces.flatMap((workspace) => Object.keys(workspace.pkg.optionalDependencies || {})),
  ];

  const production = findReachablePackages(packages, productionNames, false);
  const development = findReachablePackages(packages, developmentNames, false);
  const productionWithOptional = findReachablePackages(
    packages,
    [...productionNames, ...optionalNames],
    true,
  );
  const developmentWithOptional = findReachablePackages(packages, developmentNames, true);

  for (const packagePath of Object.keys(packages)) {
    if (!packagePath || production[packagePath]) continue;

    if (development[packagePath]) {
      packages[packagePath].dev = true;
      continue;
    }

    const optionalInProduction = productionWithOptional[packagePath];
    const optionalInDevelopment = developmentWithOptional[packagePath];
    if (optionalInProduction && optionalInDevelopment) {
      packages[packagePath].devOptional = true;
    } else if (optionalInProduction) {
      packages[packagePath].optional = true;
    } else if (optionalInDevelopment) {
      packages[packagePath].devOptional = true;
    }
  }
}

function locker(rootManifest, dependencyTree, workspaces = []) {
  const packages = createWorkspacePackages(workspaces);

  const rootPackage = {
    name: rootManifest.name,
    version: rootManifest.version,
  };
  if (rootManifest.license) rootPackage.license = rootManifest.license;
  if (rootManifest.workspaces) rootPackage.workspaces = rootManifest.workspaces;
  if (hasEntries(rootManifest.dependencies)) rootPackage.dependencies = rootManifest.dependencies;
  if (hasEntries(rootManifest.devDependencies)) rootPackage.devDependencies = rootManifest.devDependencies;
  if (hasEntries(rootManifest.optionalDependencies)) {
    rootPackage.optionalDependencies = rootManifest.optionalDependencies;
  }

  packages[''] = rootPackage;
  flattenDependencies(dependencyTree, '', packages);
  markDependencyKinds(packages, rootManifest, workspaces);

  const sortedPackages = {};
  for (const packagePath of Object.keys(packages).sort()) {
    sortedPackages[packagePath] = packages[packagePath];
  }

  const lockfile = {
    name: rootManifest.name,
    version: rootManifest.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(lockfile, null, 2)}\n`);
}

export default locker;
