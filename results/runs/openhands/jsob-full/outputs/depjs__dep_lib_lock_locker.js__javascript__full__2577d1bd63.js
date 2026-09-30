import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');

const toIntegrity = (packageMetadata) => {
  if (packageMetadata.integrity) {
    return packageMetadata.integrity;
  }

  if (packageMetadata.shasum) {
    return `sha1-${Buffer.from(packageMetadata.shasum, 'hex').toString('base64')}`;
  }

  return undefined;
};

const notEmpty = (value) => value && Object.keys(value).length > 0;

const flatten = (dependencies, prefix, packages) => {
  Object.keys(dependencies).forEach((dependencyName) => {
    const dependency = dependencies[dependencyName];
    const packagePath = `${prefix}node_modules/${dependencyName}`;
    const packageEntry = {};

    if (dependency.name && dependency.name !== dependencyName) {
      packageEntry.name = dependency.name;
    }

    packageEntry.version = dependency.version;

    const resolved = dependency.tarball || dependency.url;
    if (resolved) {
      packageEntry.resolved = resolved;
    }

    const integrity = toIntegrity(dependency);
    if (integrity) {
      packageEntry.integrity = integrity;
    }

    if (dependency.hasInstallScript) {
      packageEntry.hasInstallScript = true;
    }
    if (dependency.license) {
      packageEntry.license = dependency.license;
    }
    if (dependency.engines) {
      packageEntry.engines = dependency.engines;
    }
    if (dependency.os) {
      packageEntry.os = dependency.os;
    }
    if (dependency.cpu) {
      packageEntry.cpu = dependency.cpu;
    }
    if (dependency.libc) {
      packageEntry.libc = dependency.libc;
    }
    if (dependency.bin) {
      packageEntry.bin = dependency.bin;
    }
    if (notEmpty(dependency.requires)) {
      packageEntry.dependencies = dependency.requires;
    }
    if (notEmpty(dependency.optionalDependencies)) {
      packageEntry.optionalDependencies = dependency.optionalDependencies;
    }
    if (notEmpty(dependency.peerDependencies)) {
      packageEntry.peerDependencies = dependency.peerDependencies;
    }
    if (dependency.funding) {
      packageEntry.funding = dependency.funding;
    }

    packages[packagePath] = packageEntry;

    if (dependency.dependencies) {
      flatten(dependency.dependencies, `${packagePath}/`, packages);
    }
  });

  return packages;
};

const resolveFrom = (packages, parentPath, dependencyName) => {
  let currentPath = parentPath;

  while (true) {
    const packagePath = `${currentPath ? `${currentPath}/` : ''}node_modules/${dependencyName}`;
    if (packages[packagePath]) {
      return packagePath;
    }
    if (!currentPath) {
      return null;
    }

    const parentIndex = currentPath.lastIndexOf('/node_modules/');
    currentPath = parentIndex === -1 ? '' : currentPath.slice(0, parentIndex);
  }
};

const reachable = (packages, rootDependencies, includeOptionalDependencies) => {
  const reachablePackages = {};
  const pendingPaths = rootDependencies
    .map((dependencyName) => resolveFrom(packages, '', dependencyName))
    .filter(Boolean);

  while (pendingPaths.length) {
    const packagePath = pendingPaths.pop();
    if (reachablePackages[packagePath]) {
      continue;
    }

    reachablePackages[packagePath] = true;

    let packageEntry = packages[packagePath];
    let resolutionPath = packagePath;

    if (packageEntry && packageEntry.link) {
      resolutionPath = packageEntry.resolved;
      packageEntry = packages[packageEntry.resolved];
    }
    if (!packageEntry) {
      continue;
    }

    const dependencies = Object.assign({}, packageEntry.dependencies);
    if (includeOptionalDependencies) {
      Object.assign(dependencies, packageEntry.optionalDependencies);
    } else {
      Object.keys(packageEntry.optionalDependencies || {}).forEach((dependencyName) => {
        delete dependencies[dependencyName];
      });
    }

    Object.keys(dependencies).forEach((dependencyName) => {
      const dependencyPath = resolveFrom(packages, resolutionPath, dependencyName);
      if (dependencyPath) {
        pendingPaths.push(dependencyPath);
      }
    });
  }

  return reachablePackages;
};

const locker = (packageJson, dependencies, workspaces = []) => {
  const packages = {};
  const rootPackage = {
    name: packageJson.name,
    version: packageJson.version,
  };

  if (packageJson.license) {
    rootPackage.license = packageJson.license;
  }
  if (packageJson.workspaces) {
    rootPackage.workspaces = packageJson.workspaces;
  }
  if (notEmpty(packageJson.dependencies)) {
    rootPackage.dependencies = packageJson.dependencies;
  }
  if (notEmpty(packageJson.devDependencies)) {
    rootPackage.devDependencies = packageJson.devDependencies;
  }
  if (notEmpty(packageJson.optionalDependencies)) {
    rootPackage.optionalDependencies = packageJson.optionalDependencies;
  }

  packages[''] = rootPackage;
  flatten(dependencies, '', packages);

  workspaces.forEach((workspace) => {
    const workspacePath = path
      .relative(process.cwd(), workspace.dir)
      .split(path.sep)
      .join('/');
    const workspacePackage = {
      name: workspace.pkg.name,
      version: workspace.pkg.version,
    };

    if (workspace.pkg.license) {
      workspacePackage.license = workspace.pkg.license;
    }
    if (notEmpty(workspace.pkg.dependencies)) {
      workspacePackage.dependencies = workspace.pkg.dependencies;
    }
    if (notEmpty(workspace.pkg.devDependencies)) {
      workspacePackage.devDependencies = workspace.pkg.devDependencies;
    }
    if (notEmpty(workspace.pkg.optionalDependencies)) {
      workspacePackage.optionalDependencies = workspace.pkg.optionalDependencies;
    }
    if (notEmpty(workspace.pkg.peerDependencies)) {
      workspacePackage.peerDependencies = workspace.pkg.peerDependencies;
    }
    if (workspace.pkg.bin) {
      workspacePackage.bin = workspace.pkg.bin;
    }
    if (workspace.pkg.engines) {
      workspacePackage.engines = workspace.pkg.engines;
    }

    packages[workspacePath] = workspacePackage;
    packages[`node_modules/${workspace.name}`] = {
      resolved: workspacePath,
      link: true,
    };
  });

  const workspaceDevDependencies = workspaces.flatMap((workspace) =>
    Object.keys(workspace.pkg.devDependencies || {}),
  );
  const workspaceOptionalDependencies = workspaces.flatMap((workspace) =>
    Object.keys(workspace.pkg.optionalDependencies || {}),
  );
  const productionRoots = [
    ...Object.keys(packageJson.dependencies || {}),
    ...workspaces.map((workspace) => workspace.name),
  ];
  const developmentRoots = [
    ...Object.keys(packageJson.devDependencies || {}),
    ...workspaceDevDependencies,
  ];
  const optionalRoots = [
    ...Object.keys(packageJson.optionalDependencies || {}),
    ...workspaceOptionalDependencies,
  ];

  const productionPackages = reachable(packages, productionRoots, false);
  const developmentPackages = reachable(packages, developmentRoots, false);
  const optionalPackages = reachable(
    packages,
    [...productionRoots, ...optionalRoots],
    true,
  );
  const developmentOptionalPackages = reachable(
    packages,
    developmentRoots,
    true,
  );

  Object.keys(packages).forEach((packagePath) => {
    if (packagePath === '' || productionPackages[packagePath]) {
      return;
    }

    if (developmentPackages[packagePath]) {
      packages[packagePath].dev = true;
      return;
    }

    if (developmentOptionalPackages[packagePath]) {
      packages[packagePath].devOptional = true;
    } else if (optionalPackages[packagePath]) {
      packages[packagePath].optional = true;
    }
  });

  const sortedPackages = {};
  Object.keys(packages)
    .sort()
    .forEach((packagePath) => {
      sortedPackages[packagePath] = packages[packagePath];
    });

  const packageLock = {
    name: packageJson.name,
    version: packageJson.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
};

export default locker;
