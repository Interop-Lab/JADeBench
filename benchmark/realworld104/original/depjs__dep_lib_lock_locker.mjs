// ../work/depjs__dep/lib/lock/locker.js
import { writeFileSync } from "fs";
import path from "path";
var pkgLockJSON = path.join(process.cwd(), "package-lock.json");
var toIntegrity = (node) => {
  if (node.integrity) return node.integrity;
  if (node.shasum) return "sha1-" + Buffer.from(node.shasum, "hex").toString("base64");
  return void 0;
};
var notEmpty = (obj) => obj && Object.keys(obj).length > 0;
var flatten = (tree, prefix, packages) => {
  Object.keys(tree).forEach((name) => {
    const node = tree[name];
    const location = prefix + "node_modules/" + name;
    const entry = {};
    if (node.name && node.name !== name) entry.name = node.name;
    entry.version = node.version;
    const resolved = node.tarball || node.url;
    if (resolved) entry.resolved = resolved;
    const integrity = toIntegrity(node);
    if (integrity) entry.integrity = integrity;
    if (node.hasInstallScript) entry.hasInstallScript = true;
    if (node.license) entry.license = node.license;
    if (node.engines) entry.engines = node.engines;
    if (node.os) entry.os = node.os;
    if (node.cpu) entry.cpu = node.cpu;
    if (node.libc) entry.libc = node.libc;
    if (node.bin) entry.bin = node.bin;
    if (notEmpty(node.requires)) entry.dependencies = node.requires;
    if (notEmpty(node.optionalDependencies)) entry.optionalDependencies = node.optionalDependencies;
    if (notEmpty(node.peerDependencies)) entry.peerDependencies = node.peerDependencies;
    if (node.funding) entry.funding = node.funding;
    packages[location] = entry;
    if (node.dependencies) flatten(node.dependencies, location + "/", packages);
  });
  return packages;
};
var resolveFrom = (packages, fromPath, name) => {
  let base = fromPath;
  while (true) {
    const candidate = (base ? base + "/" : "") + "node_modules/" + name;
    if (packages[candidate]) return candidate;
    if (!base) return null;
    const idx = base.lastIndexOf("/node_modules/");
    base = idx === -1 ? "" : base.slice(0, idx);
  }
};
var reachable = (packages, roots, withOptional) => {
  const seen = {};
  const stack = roots.map((name) => resolveFrom(packages, "", name)).filter(Boolean);
  while (stack.length) {
    const location = stack.pop();
    if (seen[location]) continue;
    seen[location] = true;
    let entry = packages[location];
    let base = location;
    if (entry && entry.link) {
      base = entry.resolved;
      entry = packages[entry.resolved];
    }
    if (!entry) continue;
    const edges = Object.assign({}, entry.dependencies);
    if (withOptional) Object.assign(edges, entry.optionalDependencies);
    else Object.keys(entry.optionalDependencies || {}).forEach((name) => {
      delete edges[name];
    });
    Object.keys(edges).forEach((name) => {
      const child = resolveFrom(packages, base, name);
      if (child) stack.push(child);
    });
  }
  return seen;
};
var locker = (pkgJSON, tree, workspaces = []) => {
  const packages = {};
  const root = { name: pkgJSON.name, version: pkgJSON.version };
  if (pkgJSON.license) root.license = pkgJSON.license;
  if (pkgJSON.workspaces) root.workspaces = pkgJSON.workspaces;
  if (notEmpty(pkgJSON.dependencies)) root.dependencies = pkgJSON.dependencies;
  if (notEmpty(pkgJSON.devDependencies)) root.devDependencies = pkgJSON.devDependencies;
  if (notEmpty(pkgJSON.optionalDependencies)) root.optionalDependencies = pkgJSON.optionalDependencies;
  packages[""] = root;
  flatten(tree, "", packages);
  workspaces.forEach((ws) => {
    const location = path.relative(process.cwd(), ws.dir).split(path.sep).join("/");
    const src = { name: ws.pkg.name, version: ws.pkg.version };
    if (ws.pkg.license) src.license = ws.pkg.license;
    if (notEmpty(ws.pkg.dependencies)) src.dependencies = ws.pkg.dependencies;
    if (notEmpty(ws.pkg.devDependencies)) src.devDependencies = ws.pkg.devDependencies;
    if (notEmpty(ws.pkg.optionalDependencies)) src.optionalDependencies = ws.pkg.optionalDependencies;
    if (notEmpty(ws.pkg.peerDependencies)) src.peerDependencies = ws.pkg.peerDependencies;
    if (ws.pkg.bin) src.bin = ws.pkg.bin;
    if (ws.pkg.engines) src.engines = ws.pkg.engines;
    packages[location] = src;
    packages["node_modules/" + ws.name] = { resolved: location, link: true };
  });
  const wsDevNames = workspaces.flatMap((ws) => Object.keys(ws.pkg.devDependencies || {}));
  const wsOptNames = workspaces.flatMap((ws) => Object.keys(ws.pkg.optionalDependencies || {}));
  const prodRoots = [...Object.keys(pkgJSON.dependencies || {}), ...workspaces.map((ws) => ws.name)];
  const devRoots = [...Object.keys(pkgJSON.devDependencies || {}), ...wsDevNames];
  const optRoots = [...Object.keys(pkgJSON.optionalDependencies || {}), ...wsOptNames];
  const inProd = reachable(packages, prodRoots, false);
  const inDev = reachable(packages, devRoots, false);
  const prodOptional = reachable(packages, [...prodRoots, ...optRoots], true);
  const devOptional = reachable(packages, devRoots, true);
  Object.keys(packages).forEach((location) => {
    if (location === "") return;
    if (inProd[location]) return;
    if (inDev[location]) {
      packages[location].dev = true;
      return;
    }
    if (prodOptional[location] && devOptional[location]) packages[location].devOptional = true;
    else if (prodOptional[location]) packages[location].optional = true;
    else if (devOptional[location]) packages[location].devOptional = true;
  });
  const sorted = {};
  Object.keys(packages).sort().forEach((location) => {
    sorted[location] = packages[location];
  });
  const lock = {
    name: pkgJSON.name,
    version: pkgJSON.version,
    lockfileVersion: 3,
    requires: true,
    packages: sorted
  };
  writeFileSync(pkgLockJSON, JSON.stringify(lock, null, 2) + "\n");
};
var locker_default = locker;
export {
  locker_default as default
};
