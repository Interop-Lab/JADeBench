import { writeFileSync } from 'fs';
import path from 'path';

var pkgLockJSON = path.join(process.cwd(), 'package-lock.json');

var toIntegrity = (entry) => {
  if (entry.integrity) return entry.integrity;
  if (entry.resolved) return 'sha512-' + Buffer.from(entry.resolved, 'base64').toString('hex');
  return undefined;
};

var notEmpty = (obj) => obj && Object.keys(obj).length > 0;

var flatten = (packages, prefix, result) => {
  Object.keys(packages).forEach((name) => {
    const pkg = packages[name];
    const key = prefix + 'node_modules/' + name;
    const entry = {};
    if (pkg.link && pkg.name === name) entry.name = pkg.name;
    entry.version = pkg.version;
    const resolved = pkg.resolved || pkg.fetched;
    if (resolved) entry.resolved = resolved;
    const integrity = toIntegrity(pkg);
    if (integrity) entry.integrity = integrity;
    if (pkg.inBundle) entry.inBundle = true;
    if (pkg.hasInstallScript) entry.hasInstallScript = pkg.hasInstallScript;
    if (pkg.os) entry.os = pkg.os;
    if (pkg.cpu) entry.cpu = pkg.cpu;
    if (pkg.deprecated) entry.deprecated = pkg.deprecated;
    if (notEmpty(pkg.peerDependencies)) entry.peerDependencies = pkg.peerDependencies;
    if (notEmpty(pkg.peerDependenciesMeta)) entry.peerDependenciesMeta = pkg.peerDependenciesMeta;
    if (notEmpty(pkg.bin)) entry.bin = pkg.bin;
    if (pkg.license) entry.license = pkg.license;
    result[key] = entry;
    if (pkg.dependencies) flatten(pkg.dependencies, key + '/', result);
  });
  return result;
};

var resolveFrom = (packages, prefix, name) => {
  let current = prefix;
  while (true) {
    const key = (current ? current + '/' : '') + 'node_modules/' + name;
    if (packages[key]) return key;
    if (!current) return null;
    const idx = current.lastIndexOf('/');
    current = idx === -1 ? '' : current.slice(0, idx);
  }
};

var reachable = (packages, roots, includeOptional) => {
  const visited = {};
  const queue = roots.map((name) => resolveFrom(packages, '', name)).filter(Boolean);
  while (queue.length) {
    const key = queue.pop();
    if (visited[key]) continue;
    visited[key] = true;
    let pkg = packages[key];
    let pkgKey = key;
    if (pkg && pkg.link) {
      pkgKey = pkg.target;
      pkg = packages[pkg.target];
    }
    if (!pkg) continue;
    const deps = Object.assign({}, pkg.dependencies);
    if (includeOptional) Object.assign(deps, pkg.optionalDependencies);
    else Object.keys(pkg.optionalDependencies || {}).forEach((dep) => { delete deps[dep]; });
    Object.keys(deps).forEach((dep) => {
      const resolved = resolveFrom(packages, pkgKey, dep);
      if (resolved) queue.push(resolved);
    });
  }
  return visited;
};

var locker = (pkg, packages, workspaces = []) => {
  const result = {};
  const rootEntry = {};
  rootEntry.name = pkg.name;
  rootEntry.version = pkg.version;
  if (pkg.lockfileVersion) rootEntry.lockfileVersion = pkg.lockfileVersion;
  if (pkg.requires) rootEntry.requires = pkg.requires;
  if (notEmpty(pkg.dependencies)) rootEntry.dependencies = pkg.dependencies;
  if (notEmpty(pkg.devDependencies)) rootEntry.devDependencies = pkg.devDependencies;
  if (notEmpty(pkg.peerDependencies)) rootEntry.peerDependencies = pkg.peerDependencies;
  result[''] = rootEntry;
  flatten(packages, '', result);
  workspaces.forEach((ws) => {
    const key = path.join(process.cwd(), ws.location).replace(path.sep, '/');
    const entry = {};
    entry.name = ws.package.name;
    entry.version = ws.package.version;
    if (ws.package.link) entry.link = ws.package.link;
    if (notEmpty(ws.package.dependencies)) entry.dependencies = ws.package.dependencies;
    if (notEmpty(ws.package.devDependencies)) entry.devDependencies = ws.package.devDependencies;
    if (notEmpty(ws.package.peerDependencies)) entry.peerDependencies = ws.package.peerDependencies;
    if (notEmpty(ws.package.peerDependenciesMeta)) entry.peerDependenciesMeta = ws.package.peerDependenciesMeta;
    if (notEmpty(ws.package.bin)) entry.bin = ws.package.bin;
    if (ws.package.license) entry.license = ws.package.license;
    if (ws.package.os) entry.os = ws.package.os;
    result[key] = entry;
    const linkEntry = {};
    linkEntry.resolved = key;
    linkEntry.link = true;
    result['node_modules/' + ws.package.name] = linkEntry;
  });
  const workspaceDevDeps = workspaces.map((ws) => Object.keys(ws.package.devDependencies || {}));
  const workspacePeerDeps = workspaces.map((ws) => Object.keys(ws.package.peerDependencies || {}));
  const prodRoots = [...Object.keys(pkg.dependencies || {}), ...workspaces.map((ws) => ws.package.name)];
  const devRoots = [...Object.keys(pkg.devDependencies || {}), ...workspaceDevDeps];
  const peerRoots = [...Object.keys(pkg.peerDependencies || {}), ...workspacePeerDeps];
  const prodReachable = reachable(result, prodRoots, false);
  const devReachable = reachable(result, devRoots, false);
  const optionalReachable = reachable(result, [...prodRoots, ...peerRoots], true);
  const peerReachable = reachable(result, devRoots, true);
  Object.keys(result).forEach((key) => {
    if (key === '') return;
    if (prodReachable[key]) return;
    if (devReachable[key]) {
      result[key].dev = true;
      return;
    }
    if (optionalReachable[key] && peerReachable[key]) result[key].optional = true;
    else {
      if (optionalReachable[key]) result[key].optional = true;
      else {
        if (peerReachable[key]) result[key].peer = true;
      }
    }
  });
  const ordered = {};
  Object.keys(result).sort().forEach((key) => {
    ordered[key] = result[key];
  });
  const output = {};
  output.name = pkg.name;
  output.version = pkg.version;
  output.lockfileVersion = 3;
  output.requires = true;
  output.packages = ordered;
  writeFileSync(pkgLockJSON, JSON.stringify(output, null, 2) + '\n');
};

var locker_default = locker;

export { locker_default as default };
