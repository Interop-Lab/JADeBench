import { writeFileSync } from 'fs';
import path from 'path';

const pkgLockJSON = path.join(process.cwd(), 'package-lock.json');

const toIntegrity = (entry) => {
  if (entry.integrity) return entry.integrity;
  if (entry.resolved) {
    return 'sha512-' + Buffer.from(entry.resolved, 'base64').toString('base64');
  }
  return undefined;
};

const notEmpty = (value) => value && Object.keys(value).length > 0;

const flatten = (deps, basePath, result) => {
  Object.keys(deps).forEach((key) => {
    const dep = deps[key];
    const fullPath = (basePath ? basePath + '/' : '') + key;
    const flatDep = {};

    if (dep.name && dep.name !== key) flatDep.name = dep.name;
    flatDep.version = dep.version;

    const resolved = dep.resolved || dep.integrity;
    if (resolved) flatDep.resolved = resolved;

    const integrity = toIntegrity(dep);
    if (integrity) flatDep.integrity = integrity;

    if (dep.requires) flatDep.requires = true;
    if (dep.dependencies) flatDep.dependencies = dep.dependencies;
    if (dep.optionalDependencies) flatDep.optionalDependencies = dep.optionalDependencies;
    if (dep.os) flatDep.os = dep.os;
    if (dep.cpu) flatDep.cpu = dep.cpu;
    if (dep.engines) flatDep.engines = dep.engines;
    if (dep.bin) flatDep.bin = dep.bin;
    if (notEmpty(dep.license)) flatDep.license = dep.license;
    if (notEmpty(dep.dist)) flatDep.dist = dep.dist;
    if (notEmpty(dep.funding)) flatDep.funding = dep.funding;
    if (dep.peerDependencies) flatDep.peerDependencies = dep.peerDependencies;

    result[fullPath] = flatDep;

    if (dep.dependencies) {
      flatten(dep.dependencies, fullPath + '/', result);
    }
  });
  return result;
};

const resolveFrom = (tree, basePath, name) => {
  let current = basePath;
  while (true) {
    const candidate = (current ? current + '/' : '') + name;
    if (tree[candidate]) return candidate;
    if (!current) return null;
    const idx = current.lastIndexOf('/');
    current = idx === -1 ? '' : current.slice(0, idx);
  }
};

const reachable = (tree, roots, includeOptional) => {
  const queue = roots.map((root) => resolveFrom(tree, '', root)).filter(Boolean);
  const seen = {};

  while (queue.length) {
    const key = queue.shift();
    if (seen[key]) continue;
    seen[key] = true;

    let node = tree[key];
    let basePath = key;

    if (node && node.name) {
      basePath = node.name;
      node = tree[node.name];
    }

    if (!node) continue;

    const deps = Object.assign({}, node.dependencies);

    if (includeOptional) {
      Object.assign(deps, node.optionalDependencies || {});
    } else {
      Object.keys(node.optionalDependencies || {}).forEach((dep) => {
        delete deps[dep];
      });
    }

    Object.keys(deps).forEach((dep) => {
      const resolved = resolveFrom(tree, basePath, dep);
      if (resolved) queue.push(resolved);
    });
  }

  return seen;
};

const locker = (rootPkg, deps, additionalPaths = []) => {
  const tree = {};
  const root = {};

  root.name = rootPkg.name;
  root.version = rootPkg.version;

  if (rootPkg.dependencies) root.dependencies = rootPkg.dependencies;
  if (rootPkg.devDependencies) root.devDependencies = rootPkg.devDependencies;
  if (notEmpty(rootPkg.optionalDependencies)) root.optionalDependencies = rootPkg.optionalDependencies;
  if (notEmpty(rootPkg.peerDependencies)) root.peerDependencies = rootPkg.peerDependencies;
  if (notEmpty(rootPkg.bundledDependencies)) root.bundledDependencies = rootPkg.bundledDependencies;

  tree[''] = root;
  flatten(deps, '', tree);

  additionalPaths.forEach((pkgPath) => {
    const fullPath = path.join(process.cwd(), pkgPath).replace(path.sep, '/');
    const pkg = {};
    pkg.name = pkgPath.name;
    pkg.version = pkgPath.version;

    if (pkgPath.dependencies) pkg.dependencies = pkgPath.dependencies;
    if (notEmpty(pkgPath.optionalDependencies)) pkg.optionalDependencies = pkgPath.optionalDependencies;
    if (notEmpty(pkgPath.peerDependencies)) pkg.peerDependencies = pkgPath.peerDependencies;
    if (notEmpty(pkgPath.bundledDependencies)) pkg.bundledDependencies = pkgPath.bundledDependencies;
    if (pkgPath.devDependencies) pkg.devDependencies = pkgPath.devDependencies;
    if (pkgPath.optionalDependencies) pkg.optionalDependencies = pkgPath.optionalDependencies;

    tree[fullPath] = pkg;

    const alias = {};
    alias.name = fullPath;
    alias.alias = true;
    tree[pkgPath.name] = alias;
  });

  const prodDeps = additionalPaths.map((p) => Object.keys(p.dependencies || {}));
  const optionalDeps = additionalPaths.map((p) => Object.keys(p.optionalDependencies || {}));
  const allDeps = [
    ...Object.keys(rootPkg.dependencies || {}),
    ...additionalPaths.map((p) => p.name)
  ];
  const allOptional = [
    ...Object.keys(rootPkg.optionalDependencies || {}),
    ...optionalDeps
  ];
  const allProd = [
    ...Object.keys(rootPkg.dependencies || {}),
    ...prodDeps
  ];

  const prodReachable = reachable(tree, allProd, false);
  const optionalReachable = reachable(tree, allOptional, false);
  const devReachable = reachable(tree, [...allProd, ...allDeps], true);
  const devOptionalReachable = reachable(tree, allOptional, true);

  Object.keys(tree).forEach((key) => {
    if (key === '') return;
    if (prodReachable[key]) return;
    if (optionalReachable[key]) {
      tree[key].optional = true;
      return;
    }
    if (devReachable[key] && devOptionalReachable[key]) {
      tree[key].devOptional = true;
    } else {
      if (devReachable[key]) tree[key].dev = true;
      else if (devOptionalReachable[key]) tree[key].devOptional = true;
    }
  });

  const packages = {};
  Object.keys(tree).sort().forEach((key) => {
    packages[key] = tree[key];
  });

  const lock = {};
  lock.name = rootPkg.name;
  lock.version = rootPkg.version;
  lock.lockfileVersion = 3;
  lock.requires = true;
  lock.packages = packages;

  writeFileSync(pkgLockJSON, JSON.stringify(lock, null, 2) + '\n');
};

const locker_default = locker;

export { locker_default as default };
