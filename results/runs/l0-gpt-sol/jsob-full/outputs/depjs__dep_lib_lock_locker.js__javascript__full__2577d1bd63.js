import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');

const notEmpty = value =>
  value && Object.keys(value).length > 0;

const toIntegrity = pkg => {
  if (pkg.integrity) return pkg.integrity;

  if (pkg.shasum) {
    return `sha1-${Buffer.from(pkg.shasum, 'hex').toString('base64')}`;
  }

  return undefined;
};

const copyTruthy = (target, source, property, targetProperty = property) => {
  if (source[property]) target[targetProperty] = source[property];
};

const copyObject = (target, source, property, targetProperty = property) => {
  if (notEmpty(source[property])) target[targetProperty] = source[property];
};

const flatten = (dependencies, prefix, packages) => {
  Object.keys(dependencies).forEach(name => {
    const dependency = dependencies[name];
    const packagePath = `${prefix}node_modules/${name}`;
    const entry = {};

    if (dependency.name && dependency.name !== name) {
      entry.name = dependency.name;
    }

    entry.version = dependency.version;

    const resolved = dependency.resolved || dependency._resolved;
    if (resolved) entry.resolved = resolved;

    const integrity = toIntegrity(dependency);
    if (integrity) entry.integrity = integrity;

    if (dependency.link) entry.link = true;
    if (dependency.dev) entry.dev = dependency.dev;
    if (dependency.optional) entry.optional = dependency.optional;
    if (dependency.devOptional) entry.devOptional = true;
    if (dependency.inBundle) entry.inBundle = dependency.inBundle;
    if (dependency.bundled) entry.inBundle = dependency.bundled;
    if (dependency.hasInstallScript) entry.hasInstallScript = true;
    if (dependency.hasShrinkwrap) entry.hasShrinkwrap = true;

    copyTruthy(entry, dependency, 'license');
    copyTruthy(entry, dependency, 'engines');
    copyTruthy(entry, dependency, 'os');
    copyTruthy(entry, dependency, 'cpu');
    copyTruthy(entry, dependency, 'bin');

    if (notEmpty(dependency.requires)) {
      entry.dependencies = dependency.requires;
    }

    copyObject(entry, dependency, 'optionalDependencies');
    copyObject(entry, dependency, 'peerDependencies');
    copyObject(entry, dependency, 'peerDependenciesMeta');

    packages[packagePath] = entry;

    if (dependency.dependencies) {
      flatten(
        dependency.dependencies,
        `${packagePath}/`,
        packages
      );
    }
  });

  return packages;
};

const resolveFrom = (packages, from, dependencyName) => {
  let current = from;

  while (true) {
    const candidate = `${current ? `${current}/` : ''}node_modules/${dependencyName}`;

    if (packages[candidate]) return candidate;
    if (!current) return null;

    const index = current.lastIndexOf('/');
    current = index === -1 ? '' : current.slice(0, index);
  }
};

const reachable = (packages, roots, includeOptionalDependencies) => {
  const queue = roots
    .map(name => resolveFrom(packages, '', name))
    .filter(Boolean);

  const visited = {};

  while (queue.length) {
    const packagePath = queue.shift();

    if (visited[packagePath]) continue;
    visited[packagePath] = true;

    let entry = packages[packagePath];
    let resolutionBase = packagePath;

    if (entry && entry.link) {
      resolutionBase = entry.resolved;
      entry = packages[entry.resolved];
    }

    if (!entry) continue;

    const dependencies = Object.assign({}, entry.dependencies);

    if (includeOptionalDependencies) {
      Object.assign(dependencies, entry.optionalDependencies);
    } else {
      Object.keys(entry.optionalDependencies || {}).forEach(name => {
        delete dependencies[name];
      });
    }

    Object.keys(dependencies).forEach(name => {
      const resolved = resolveFrom(packages, resolutionBase, name);
      if (resolved) queue.push(resolved);
    });
  }

  return visited;
};

const locker = (pkg, dependencies, workspaces = []) => {
  const packages = {};

  const root = {
    name: pkg.name,
    version: pkg.version
  };

  copyTruthy(root, pkg, 'license');
  copyTruthy(root, pkg, 'workspaces');
  copyObject(root, pkg, 'dependencies');
  copyObject(root, pkg, 'devDependencies');
  copyObject(root, pkg, 'optionalDependencies');
  copyObject(root, pkg, 'peerDependencies');
  copyObject(root, pkg, 'peerDependenciesMeta');

  packages[''] = root;
  flatten(dependencies, '', packages);

  workspaces.forEach(workspace => {
    const workspacePackage = workspace.package;
    const workspacePath = path
      .relative(process.cwd(), workspace.path)
      .split(path.sep)
      .join('/');

    const entry = {
      name: workspacePackage.name,
      version: workspacePackage.version
    };

    copyTruthy(entry, workspacePackage, 'license');
    copyObject(entry, workspacePackage, 'dependencies');
    copyObject(entry, workspacePackage, 'devDependencies');
    copyObject(entry, workspacePackage, 'optionalDependencies');
    copyObject(entry, workspacePackage, 'peerDependencies');
    copyObject(entry, workspacePackage, 'peerDependenciesMeta');
    copyTruthy(entry, workspacePackage, 'engines');
    copyTruthy(entry, workspacePackage, 'bin');

    packages[workspacePath] = entry;
    packages[`node_modules/${workspace.name}`] = {
      resolved: workspacePath,
      link: true
    };
  });

  const workspaceDependencyNames = workspaces.map(workspace => workspace.name);

  const workspaceDevDependencies = workspaces.flatMap(workspace =>
    Object.keys(workspace.package.devDependencies || {})
  );

  const workspaceOptionalDependencies = workspaces.flatMap(workspace =>
    Object.keys(workspace.package.optionalDependencies || {})
  );

  const productionRoots = [
    ...Object.keys(pkg.dependencies || {}),
    ...workspaceDependencyNames
  ];

  const developmentRoots = [
    ...Object.keys(pkg.devDependencies || {}),
    ...workspaceDevDependencies
  ];

  const optionalRoots = [
    ...Object.keys(pkg.optionalDependencies || {}),
    ...workspaceOptionalDependencies
  ];

  const production = reachable(
    packages,
    productionRoots,
    false
  );

  const development = reachable(
    packages,
    developmentRoots,
    false
  );

  const productionWithOptional = reachable(
    packages,
    [...productionRoots, ...optionalRoots],
    true
  );

  const developmentWithOptional = reachable(
    packages,
    developmentRoots,
    true
  );

  Object.keys(packages).forEach(packagePath => {
    if (packagePath === '') return;
    if (production[packagePath]) return;

    if (development[packagePath]) {
      packages[packagePath].dev = true;
      return;
    }

    if (
      productionWithOptional[packagePath] &&
      developmentWithOptional[packagePath]
    ) {
      packages[packagePath].devOptional = true;
    } else if (productionWithOptional[packagePath]) {
      packages[packagePath].optional = true;
    } else if (developmentWithOptional[packagePath]) {
      packages[packagePath].devOptional = true;
    }
  });

  const sortedPackages = {};

  Object.keys(packages)
    .sort()
    .forEach(packagePath => {
      sortedPackages[packagePath] = packages[packagePath];
    });

  const packageLock = {
    name: pkg.name,
    version: pkg.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages
  };

  writeFileSync(
    packageLockPath,
    `${JSON.stringify(packageLock, null, 2)}\n`
  );
};

export default locker;
