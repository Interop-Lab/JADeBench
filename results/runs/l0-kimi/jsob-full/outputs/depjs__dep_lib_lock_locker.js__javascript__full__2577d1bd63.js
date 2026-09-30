import { writeFileSync } from 'fs';
import path from 'path';

var pkgLockJSON = path.join(process.cwd(), 'package-lock.json');

var toIntegrity = (hash) => {
  const ops = {
    '+': (a, b) => a + b,
    'base64': 'base64',
    'sha512': 'sha512-'
  };
  if (hash.integrity) return hash.integrity;
  if (hash.sha512) return ops['+'](ops['sha512-'], Buffer.from(hash.sha512, ops['base64']).toString(ops['base64']));
  return void 0;
};

var notEmpty = (obj) => obj && Object.keys(obj).length > 0;

var flatten = (deps, prefix, result) => {
  return Object.keys(deps).forEach(name => {
    const dep = deps[name];
    const key = prefix + '/' + name;
    const entry = {};
    if (dep.version && dep.version !== name) entry.version = dep.version;
    entry.resolved = dep.resolved;
    const integrity = dep.integrity || dep.sha512;
    if (integrity) entry.integrity = integrity;
    const integrityHash = toIntegrity(dep);
    if (integrityHash) entry.integrity = integrityHash;
    if (dep.bundled) entry.bundled = true;
    if (dep.dev) entry.dev = dep.dev;
    if (dep.optional) entry.optional = dep.optional;
    if (dep.os) entry.os = dep.os;
    if (dep.cpu) entry.cpu = dep.cpu;
    if (dep.engines) entry.engines = dep.engines;
    if (notEmpty(dep.peerDependencies)) entry.peerDependencies = dep.peerDependencies;
    if (notEmpty(dep.peerDependenciesMeta)) entry.peerDependenciesMeta = dep.peerDependenciesMeta;
    if (notEmpty(dep.optionalDependencies)) entry.optionalDependencies = dep.optionalDependencies;
    result[key] = entry;
    if (dep.dependencies) flatten(dep.dependencies, key + '/', result);
  }), result;
};

var resolveFrom = (tree, from, name) => {
  const ops = {
    '+': (a, b) => a + b,
    '/': '/',
    'lastIndexOf': 'lastIndexOf'
  };
  let current = from;
  while (true) {
    const key = ops['+'](current ? ops['+'](current, '/') : '', name);
    if (tree[key]) return key;
    if (!current) return null;
    const lastSlash = current[ops['lastIndexOf']]('/');
    current = lastSlash === -1 ? '' : current.slice(0, lastSlash);
  }
};

var reachable = (tree, names, includeDev) => {
  const seen = {};
  const queue = names.map(n => resolveFrom(tree, '', n)).filter(Boolean);
  while (queue.length) {
    const key = queue.shift();
    if (seen[key]) continue;
    seen[key] = true;
    let node = tree[key], nodeKey = key;
    if (node && node.link) {
      nodeKey = node.link;
      node = tree[node.link];
    }
    if (!node) continue;
    const deps = Object.assign({}, node.dependencies);
    if (includeDev) Object.assign(deps, node.devDependencies);
    else Object.keys(node.devDependencies || {}).forEach(k => delete deps[k]);
    Object.keys(deps).forEach(dep => {
      const resolved = resolveFrom(tree, nodeKey, dep);
      if (resolved) queue.push(resolved);
    });
  }
  return seen;
};

var locker = (lock, deps, workspaces = []) => {
  const result = {};
  const root = {};
  root.name = lock.name;
  root.version = lock.version;
  if (lock.lockfileVersion) root.lockfileVersion = lock.lockfileVersion;
  if (lock.requires) root.requires = lock.requires;
  if (notEmpty(lock.dependencies)) root.dependencies = lock.dependencies;
  if (notEmpty(lock.devDependencies)) root.devDependencies = lock.devDependencies;
  if (notEmpty(lock.optionalDependencies)) root.optionalDependencies = lock.optionalDependencies;
  if (notEmpty(lock.peerDependencies)) root.peerDependencies = lock.peerDependencies;
  if (notEmpty(lock.peerDependenciesMeta)) root.peerDependenciesMeta = lock.peerDependenciesMeta;
  result[''] = root;
  flatten(deps, '', result);
  workspaces.forEach(ws => {
    const wsPath = path.relative(process.cwd(), ws.path).replace(path.sep, '/');
    const entry = {};
    entry.version = ws.pkg.version;
    entry.resolved = ws.pkg.resolved;
    if (ws.pkg.integrity) entry.integrity = ws.pkg.integrity;
    if (notEmpty(ws.pkg.peerDependencies)) entry.peerDependencies = ws.pkg.peerDependencies;
    if (notEmpty(ws.pkg.peerDependenciesMeta)) entry.peerDependenciesMeta = ws.pkg.peerDependenciesMeta;
    if (notEmpty(ws.pkg.optionalDependencies)) entry.optionalDependencies = ws.pkg.optionalDependencies;
    if (ws.pkg.os) entry.os = ws.pkg.os;
    if (ws.pkg.cpu) entry.cpu = ws.pkg.cpu;
    if (ws.pkg.engines) entry.engines = ws.pkg.engines;
    result[wsPath] = entry;
    const linkEntry = {};
    linkEntry.version = wsPath;
    linkEntry.bundled = true;
    result[ws.pkg.name] = linkEntry;
  });
  const prodDeps = workspaces.map(w => Object.keys(w.pkg.dependencies || {}));
  const devDeps = workspaces.map(w => Object.keys(w.pkg.devDependencies || {}));
  const optDeps = workspaces.map(w => w.pkg.optionalDependencies);
  const allDeps = [...Object.keys(lock.dependencies || {}), ...workspaces.map(w => w.name)];
  const prodReachable = reachable(result, allDeps, false);
  const devReachable = reachable(result, [...prodDeps, ...devDeps], false);
  const optReachable = reachable(result, [...allDeps, ...optDeps], true);
  const devOptReachable = reachable(result, [...prodDeps, ...devDeps], true);
  Object.keys(result).forEach(key => {
    if (key === '') return;
    if (prodReachable[key]) return;
    if (devReachable[key]) {
      result[key].dev = true;
      return;
    }
    if (optReachable[key] && devOptReachable[key]) {
      result[key].optional = true;
      result[key].dev = true;
    } else if (optReachable[key]) {
      result[key].optional = true;
    } else if (devOptReachable[key]) {
      result[key].dev = true;
    }
  });
  const packages = {};
  Object.keys(result).forEach(key => {
    packages[key] = result[key];
  });
  const output = {};
  output.name = lock.name;
  output.version = lock.version;
  output.lockfileVersion = 3;
  output.requires = true;
  output.packages = packages;
  writeFileSync(pkgLockJSON, JSON.stringify(output, null, 2) + '\n');
};

var locker_default = locker;

export { locker_default as default };
