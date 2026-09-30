import { writeFileSync } from 'fs';
import path from 'path';

const packageLockPath = path.join(process.cwd(), 'package-lock.json');

function toIntegrity(metadata) {
  if (metadata.integrity) return metadata.integrity;
  if (metadata.shasum) return `sha1-${Buffer.from(metadata.shasum, 'hex').toString('base64')}`;
  return undefined;
}

const notEmpty = value => value && Object.keys(value).length > 0;

function flatten(dependencies, parentPath, packages) {
  Object.keys(dependencies).forEach(name => {
    const metadata = dependencies[name];
    const packagePath = `${parentPath}node_modules/${name}`;
    const packageInfo = {};
    if (metadata.name && metadata.name !== name) packageInfo.name = metadata.name;
    packageInfo.version = metadata.version;
    const resolved = metadata.tarball || metadata.url;
    if (resolved) packageInfo.resolved = resolved;
    const integrity = toIntegrity(metadata);
    if (integrity) packageInfo.integrity = integrity;
    if (metadata.hasInstallScript) packageInfo.hasInstallScript = true;
    if (metadata.license) packageInfo.license = metadata.license;
    if (metadata.engines) packageInfo.engines = metadata.engines;
    if (metadata.os) packageInfo.os = metadata.os;
    if (metadata.cpu) packageInfo.cpu = metadata.cpu;
    if (metadata.libc) packageInfo.libc = metadata.libc;
    if (metadata.bin) packageInfo.bin = metadata.bin;
    if (notEmpty(metadata.requires)) packageInfo.dependencies = metadata.requires;
    if (notEmpty(metadata.optionalDependencies)) packageInfo.optionalDependencies = metadata.optionalDependencies;
    if (notEmpty(metadata.peerDependencies)) packageInfo.peerDependencies = metadata.peerDependencies;
    if (metadata.funding) packageInfo.funding = metadata.funding;
    packages[packagePath] = packageInfo;
    if (metadata.dependencies) flatten(metadata.dependencies, `${packagePath}/`, packages);
  });
  return packages;
}

function resolveFrom(packages, from, name) {
  let current = from;
  while (true) {
    const candidate = `${current ? `${current}/` : ''}node_modules/${name}`;
    if (packages[candidate]) return candidate;
    if (!current) return null;
    const parent = current.lastIndexOf('/node_modules/');
    current = parent === -1 ? '' : current.slice(0, parent);
  }
}

function reachable(packages, roots, includeOptional) {
  const result = {};
  const pending = roots.map(name => resolveFrom(packages, '', name)).filter(Boolean);
  while (pending.length) {
    const packagePath = pending.pop();
    if (result[packagePath]) continue;
    result[packagePath] = true;
    let packageInfo = packages[packagePath];
    let dependencyBase = packagePath;
    if (packageInfo && packageInfo.link) {
      dependencyBase = packageInfo.resolved;
      packageInfo = packages[packageInfo.resolved];
    }
    if (!packageInfo) continue;
    const dependencies = Object.assign({}, packageInfo.dependencies);
    if (includeOptional) Object.assign(dependencies, packageInfo.optionalDependencies);
    else Object.keys(packageInfo.optionalDependencies || {}).forEach(name => delete dependencies[name]);
    Object.keys(dependencies).forEach(name => {
      const resolved = resolveFrom(packages, dependencyBase, name);
      if (resolved) pending.push(resolved);
    });
  }
  return result;
}

function locker(rootPackage, dependencyTree, extraPackages = []) {
  const packages = {};
  const rootInfo = { name: rootPackage.name, version: rootPackage.version };
  if (rootPackage.license) rootInfo.license = rootPackage.license;
  if (rootPackage.workspaces) rootInfo.workspaces = rootPackage.workspaces;
  if (notEmpty(rootPackage.dependencies)) rootInfo.dependencies = rootPackage.dependencies;
  if (notEmpty(rootPackage.devDependencies)) rootInfo.devDependencies = rootPackage.devDependencies;
  if (notEmpty(rootPackage.optionalDependencies)) rootInfo.optionalDependencies = rootPackage.optionalDependencies;
  packages[''] = rootInfo;
  flatten(dependencyTree, '', packages);
  extraPackages.forEach(entry => {
    const packagePath = path.relative(process.cwd(), entry.path.split(path.sep).join('/'));
    const info = { name: entry.pkg.name, version: entry.pkg.version };
    if (entry.pkg.license) info.license = entry.pkg.license;
    if (notEmpty(entry.pkg.dependencies)) info.dependencies = entry.pkg.dependencies;
    if (notEmpty(entry.pkg.devDependencies)) info.devDependencies = entry.pkg.devDependencies;
    if (notEmpty(entry.pkg.optionalDependencies)) info.optionalDependencies = entry.pkg.optionalDependencies;
    if (notEmpty(entry.pkg.peerDependencies)) info.peerDependencies = entry.pkg.peerDependencies;
    if (entry.pkg.engines) info.engines = entry.pkg.engines;
    if (entry.pkg.os) info.os = entry.pkg.os;
    if (entry.pkg.cpu) info.cpu = entry.pkg.cpu;
    if (entry.pkg.libc) info.libc = entry.pkg.libc;
    if (entry.pkg.bin) info.bin = entry.pkg.bin;
    if (entry.pkg.hasInstallScript) info.hasInstallScript = true;
    if (entry.pkg.resolved) info.resolved = entry.pkg.resolved;
    if (entry.pkg.integrity) info.integrity = entry.pkg.integrity;
    packages[packagePath] = info;
    packages[`node_modules/${entry.name}`] = { resolved: packagePath, link: true };
    if (entry.pkg.dependencies) flatten(entry.pkg.dependencies, `${packagePath}/`, packages);
  });
  const productionRoots = [
    ...Object.keys(rootPackage.dependencies || {}),
    ...extraPackages.map(entry => entry.name)
  ];
  const developmentRoots = [
    ...Object.keys(rootPackage.devDependencies || {}),
    ...extraPackages.flatMap(entry => Object.keys(entry.pkg.devDependencies || {}))
  ];
  const optionalRoots = [
    ...Object.keys(rootPackage.optionalDependencies || {}),
    ...extraPackages.flatMap(entry => Object.keys(entry.pkg.optionalDependencies || {}))
  ];
  const production = reachable(packages, productionRoots, false);
  const development = reachable(packages, developmentRoots, false);
  const optional = reachable(packages, [...productionRoots, ...optionalRoots], true);
  const devOptional = reachable(packages, developmentRoots, true);
  Object.keys(packages).forEach(packagePath => {
    if (packagePath === '') return;
    const info = packages[packagePath];
    if (production[packagePath] && development[packagePath]) info.dev = true;
    else if (development[packagePath]) info.dev = true;
    if (optional[packagePath] && !production[packagePath]) info.optional = true;
    if (devOptional[packagePath] && development[packagePath] && !optional[packagePath]) info.devOptional = true;
  });
  const sortedPackages = {};
  Object.keys(packages).sort().forEach(packagePath => { sortedPackages[packagePath] = packages[packagePath]; });
  const lockfile = { name: rootPackage.name, version: rootPackage.version, lockfileVersion: 3, requires: true, packages: sortedPackages };
  writeFileSync(packageLockPath, `${JSON.stringify(lockfile, null, 2)}\n`);
}

const locker_default = locker;
export { locker_default as default };
