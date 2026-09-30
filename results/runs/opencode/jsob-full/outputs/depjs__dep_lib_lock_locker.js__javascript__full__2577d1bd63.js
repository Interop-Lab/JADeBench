import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');

const notEmpty = value => value && Object.keys(value).length > 0;

const toIntegrity = dependency => {
  if (dependency.integrity) return dependency.integrity;
  if (dependency._integrity) return dependency._integrity;
  if (dependency.shasum) {
    return `sha1-${Buffer.from(dependency.shasum, 'hex').toString('base64')}`;
  }
  return undefined;
};

const packageMetadata = (dependency, installedName) => {
  const result = {};
  if (dependency.name && dependency.name !== installedName) result.name = dependency.name;
  result.version = dependency.version;

  const resolved = dependency.resolved || dependency._resolved;
  if (resolved) result.resolved = resolved;

  const integrity = toIntegrity(dependency);
  if (integrity) result.integrity = integrity;
  if (dependency.bundleDependencies) result.inBundle = true;
  if (dependency.dev) result.dev = true;
  if (dependency.optional) result.optional = true;
  if (dependency.os) result.os = dependency.os;
  if (dependency.cpu) result.cpu = dependency.cpu;
  if (dependency.engines) result.engines = dependency.engines;
  if (notEmpty(dependency.dependencies)) result.dependencies = dependency.dependencies;
  if (notEmpty(dependency.optionalDependencies)) result.optionalDependencies = dependency.optionalDependencies;
  if (notEmpty(dependency.peerDependencies)) result.peerDependencies = dependency.peerDependencies;
  if (dependency.devOptional) result.devOptional = dependency.devOptional;
  return result;
};

const flatten = (dependencies, prefix, packages) => {
  Object.keys(dependencies).forEach(name => {
    const dependency = dependencies[name];
    const location = `${prefix}node_modules/${name}`;
    packages[location] = packageMetadata(dependency, name);
    if (dependency.dependencies) {
      flatten(dependency.dependencies, `${location}/`, packages);
    }
  });
  return packages;
};

const resolveFrom = (packages, from, name) => {
  let current = from;
  while (true) {
    const location = `${current ? `${current}/` : ''}node_modules/${name}`;
    if (packages[location]) return location;
    if (!current) return null;
    const slash = current.lastIndexOf('/');
    current = slash === -1 ? '' : current.slice(0, slash);
  }
};

const reachable = (packages, names, includePeers) => {
  const queue = names.map(name => resolveFrom(packages, '', name)).filter(Boolean);
  const seen = {};
  while (queue.length) {
    const initialLocation = queue.shift();
    if (seen[initialLocation]) continue;
    seen[initialLocation] = true;

    let location = initialLocation;
    let dependency = packages[location];
    if (dependency && dependency.link) {
      location = dependency.resolved;
      dependency = packages[location];
    }
    if (!dependency) continue;

    const requirements = Object.assign({}, dependency.dependencies);
    if (includePeers) {
      Object.assign(requirements, dependency.peerDependencies);
    } else {
      Object.keys(dependency.peerDependencies || {}).forEach(name => delete requirements[name]);
    }
    Object.keys(requirements).forEach(name => {
      const resolved = resolveFrom(packages, location, name);
      if (resolved) queue.push(resolved);
    });
  }
  return seen;
};

const workspaceMetadata = pkg => {
  const result = { name: pkg.name, version: pkg.version };
  if (pkg.license) result.license = pkg.license;
  if (notEmpty(pkg.dependencies)) result.dependencies = pkg.dependencies;
  if (notEmpty(pkg.devDependencies)) result.devDependencies = pkg.devDependencies;
  if (notEmpty(pkg.optionalDependencies)) result.optionalDependencies = pkg.optionalDependencies;
  if (notEmpty(pkg.peerDependencies)) result.peerDependencies = pkg.peerDependencies;
  if (pkg.engines) result.engines = pkg.engines;
  if (pkg.bin) result.bin = pkg.bin;
  return result;
};

const locker = (pkg, dependencies, workspaces = []) => {
  const packages = {};
  const root = { name: pkg.name, version: pkg.version };
  if (pkg.license) root.license = pkg.license;
  if (pkg.workspaces) root.workspaces = pkg.workspaces;
  if (notEmpty(pkg.dependencies)) root.dependencies = pkg.dependencies;
  if (notEmpty(pkg.devDependencies)) root.devDependencies = pkg.devDependencies;
  if (notEmpty(pkg.optionalDependencies)) root.optionalDependencies = pkg.optionalDependencies;
  packages[''] = root;

  flatten(dependencies, '', packages);

  for (const workspace of workspaces) {
    const location = path.relative(process.cwd(), workspace.relative).split(path.sep).join('/');
    packages[location] = workspaceMetadata(workspace.pkg);
    packages[`node_modules/${workspace.pkg.name}`] = { resolved: location, link: true };
  }

  const workspaceDev = workspaces.flatMap(workspace => Object.keys(workspace.pkg.devDependencies || {}));
  const workspaceOptional = workspaces.flatMap(workspace => Object.keys(workspace.pkg.optionalDependencies || {}));
  const productionRoots = [
    ...Object.keys(pkg.dependencies || {}),
    ...workspaces.map(workspace => workspace.pkg.name),
  ];
  const developmentRoots = [...Object.keys(pkg.devDependencies || {}), ...workspaceDev];
  const optionalRoots = [...Object.keys(pkg.optionalDependencies || {}), ...workspaceOptional];

  const production = reachable(packages, productionRoots, false);
  const development = reachable(packages, developmentRoots, false);
  const productionWithPeers = reachable(packages, [...productionRoots, ...optionalRoots], true);
  const developmentWithPeers = reachable(packages, developmentRoots, true);

  Object.keys(packages).forEach(location => {
    if (!location || production[location]) return;
    if (development[location]) {
      packages[location].dev = true;
      return;
    }
    if (productionWithPeers[location] && developmentWithPeers[location]) {
      packages[location].devOptional = true;
    } else if (productionWithPeers[location]) {
      packages[location].optional = true;
    } else if (developmentWithPeers[location]) {
      packages[location].dev = true;
    }
  });

  const sortedPackages = {};
  Object.keys(packages).sort().forEach(location => {
    sortedPackages[location] = packages[location];
  });

  const lockfile = {
    name: pkg.name,
    version: pkg.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };
  writeFileSync(packageLockPath, `${JSON.stringify(lockfile, null, 2)}\n`);
};

export default locker;
