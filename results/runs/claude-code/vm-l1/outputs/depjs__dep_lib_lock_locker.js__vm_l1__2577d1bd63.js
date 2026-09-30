import { writeFileSync } from "node:fs";
import path from "node:path";

const packageLockPath = path.join(process.cwd(), "package-lock.json");

function toIntegrity(packageInfo) {
  if (!packageInfo) return undefined;
  if (packageInfo.integrity) return packageInfo.integrity;
  if (packageInfo.shasum) {
    return `sha1-${Buffer.from(packageInfo.shasum, "hex").toString("base64")}`;
  }
  return undefined;
}

function notEmpty(value) {
  return value && Object.keys(value).length > 0;
}

function flatten(dependencies, parentPath, packages) {
  Object.keys(dependencies || {}).forEach((name) => {
    const dependency = dependencies[name];
    const packagePath = `${parentPath}node_modules/${name}`;
    const {
      dependencies: children,
      integrity: existingIntegrity,
      resolved: _resolved,
      shasum: _shasum,
      optional: _optional,
      ...metadata
    } = dependency;

    const integrity = existingIntegrity || toIntegrity(dependency);
    packages[packagePath] = {
      ...metadata,
      ...(integrity ? { integrity } : {}),
    };

    if (notEmpty(children)) {
      flatten(children, `${packagePath}/`, packages);
    }
  });

  return packages;
}

function resolveFrom(packages, packagePath, dependencyName) {
  let directory = packagePath;

  while (true) {
    const candidate = directory
      ? `${directory}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (packages[candidate]) return candidate;

    const parentMarker = directory.lastIndexOf("/node_modules/");
    if (parentMarker < 0) break;
    directory = directory.slice(0, parentMarker);
  }

  const rootCandidate = `node_modules/${dependencyName}`;
  return packages[rootCandidate] ? rootCandidate : null;
}

function reachable(packages, rootDependencies, initialLocations = []) {
  const pending = rootDependencies.map((name) =>
    typeof name === "string" ? `node_modules/${name}` : name,
  );
  const seen = new Set(initialLocations);

  while (pending.length) {
    const packagePath = pending.pop();
    if (!packagePath || seen.has(packagePath) || !packages[packagePath]) continue;

    seen.add(packagePath);
    const packageInfo = packages[packagePath];
    const dependencies = {
      ...packageInfo.dependencies,
      ...packageInfo.optionalDependencies,
    };

    Object.keys(dependencies).forEach((name) => {
      const resolved = resolveFrom(packages, packagePath, name);
      if (resolved && !seen.has(resolved)) pending.push(resolved);
    });
  }

  return Object.fromEntries([...seen].map((packagePath) => [packagePath, true]));
}

function rootPackageMetadata(manifest) {
  const metadata = {};
  for (const field of [
    "name",
    "version",
    "license",
    "workspaces",
    "dependencies",
    "devDependencies",
    "optionalDependencies",
  ]) {
    if (notEmpty(manifest[field])) metadata[field] = manifest[field];
  }
  return metadata;
}

function locker(manifest, dependencyTree, workspaces) {
  const packages = { "": rootPackageMetadata(manifest) };
  flatten(dependencyTree, "", packages);

  workspaces.forEach((workspace) => {
    const workspacePath = workspace.path || workspace.location || workspace.name;
    if (!workspacePath) return;

    packages[workspacePath] = rootPackageMetadata(workspace);
    if (notEmpty(workspace.dependencies)) {
      flatten(workspace.dependencies, `${workspacePath}/`, packages);
    }
  });

  const rootDependencyNames = [
    ...Object.keys(manifest.dependencies || {}),
    ...Object.keys(manifest.optionalDependencies || {}),
    ...Object.keys(manifest.devDependencies || {}),
  ];
  const workspacePaths = workspaces
    .map((workspace) => workspace.path || workspace.location || workspace.name)
    .filter(Boolean);
  const included = new Set(
    Object.keys(reachable(packages, rootDependencyNames, workspacePaths)),
  );
  included.add("");
  workspacePaths.forEach((workspacePath) => included.add(workspacePath));

  const sortedPackages = {};
  [...included]
    .filter((packagePath) => packages[packagePath])
    .sort()
    .forEach((packagePath) => {
      sortedPackages[packagePath] = packages[packagePath];
    });

  const packageLock = {
    name: manifest.name,
    version: manifest.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
}

export default locker;
