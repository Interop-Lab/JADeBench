import { writeFileSync } from "fs";
import path from "path";

const packageLockPath = path.join(process.cwd(), "package-lock.json");

function toIntegrity(packageMetadata) {
  if (packageMetadata.integrity) return packageMetadata.integrity;
  if (packageMetadata.shasum) {
    return `sha1-${Buffer.from(packageMetadata.shasum, "hex").toString("base64")}`;
  }
  return undefined;
}

function isNonEmpty(value) {
  return value && Object.keys(value).length > 0;
}

function copyDependencyMetadata(packageName, metadata) {
  const result = {};

  if (metadata.name && metadata.name !== packageName) result.name = metadata.name;
  result.version = metadata.version;

  const resolved = metadata.tarball || metadata.url;
  if (resolved) result.resolved = resolved;

  const integrity = toIntegrity(metadata);
  if (integrity) result.integrity = integrity;
  if (metadata.hasInstallScript) result.hasInstallScript = true;
  if (metadata.license) result.license = metadata.license;
  if (metadata.engines) result.engines = metadata.engines;
  if (metadata.os) result.os = metadata.os;
  if (metadata.cpu) result.cpu = metadata.cpu;
  if (metadata.libc) result.libc = metadata.libc;
  if (metadata.bin) result.bin = metadata.bin;
  if (isNonEmpty(metadata.requires)) result.dependencies = metadata.requires;
  if (isNonEmpty(metadata.optionalDependencies)) {
    result.optionalDependencies = metadata.optionalDependencies;
  }
  if (isNonEmpty(metadata.peerDependencies)) {
    result.peerDependencies = metadata.peerDependencies;
  }
  if (metadata.funding) result.funding = metadata.funding;

  return result;
}

function flattenDependencies(dependencies, parentPath, packages) {
  for (const packageName of Object.keys(dependencies)) {
    const metadata = dependencies[packageName];
    const packagePath = `${parentPath}node_modules/${packageName}`;

    packages[packagePath] = copyDependencyMetadata(packageName, metadata);

    if (metadata.dependencies) {
      flattenDependencies(metadata.dependencies, `${packagePath}/`, packages);
    }
  }

  return packages;
}

function resolveDependency(packages, requiringPath, packageName) {
  let currentPath = requiringPath;

  while (true) {
    const candidate = `${currentPath ? `${currentPath}/` : ""}node_modules/${packageName}`;
    if (packages[candidate]) return candidate;
    if (!currentPath) return null;

    const parentIndex = currentPath.lastIndexOf("/node_modules/");
    currentPath = parentIndex === -1 ? "" : currentPath.slice(0, parentIndex);
  }
}

function findReachablePackages(packages, rootDependencies, includeOptional) {
  const reachable = {};
  const pending = rootDependencies
    .map((packageName) => resolveDependency(packages, "", packageName))
    .filter(Boolean);

  while (pending.length) {
    const packagePath = pending.pop();
    if (reachable[packagePath]) continue;
    reachable[packagePath] = true;

    let metadata = packages[packagePath];
    let resolutionPath = packagePath;
    if (metadata?.link) {
      resolutionPath = metadata.resolved;
      metadata = packages[metadata.resolved];
    }
    if (!metadata) continue;

    const dependencies = Object.assign({}, metadata.dependencies);
    if (includeOptional) {
      Object.assign(dependencies, metadata.optionalDependencies);
    } else {
      for (const packageName of Object.keys(metadata.optionalDependencies || {})) {
        delete dependencies[packageName];
      }
    }

    for (const packageName of Object.keys(dependencies)) {
      const resolved = resolveDependency(packages, resolutionPath, packageName);
      if (resolved) pending.push(resolved);
    }
  }

  return reachable;
}

function copyRootPackage(packageJson) {
  const root = {
    name: packageJson.name,
    version: packageJson.version,
  };

  if (packageJson.license) root.license = packageJson.license;
  if (packageJson.workspaces) root.workspaces = packageJson.workspaces;
  if (isNonEmpty(packageJson.dependencies)) root.dependencies = packageJson.dependencies;
  if (isNonEmpty(packageJson.devDependencies)) {
    root.devDependencies = packageJson.devDependencies;
  }
  if (isNonEmpty(packageJson.optionalDependencies)) {
    root.optionalDependencies = packageJson.optionalDependencies;
  }

  return root;
}

function copyWorkspacePackage(workspace) {
  const packageJson = workspace.pkg;
  const result = {
    name: packageJson.name,
    version: packageJson.version,
  };

  if (packageJson.license) result.license = packageJson.license;
  if (isNonEmpty(packageJson.dependencies)) result.dependencies = packageJson.dependencies;
  if (isNonEmpty(packageJson.devDependencies)) {
    result.devDependencies = packageJson.devDependencies;
  }
  if (isNonEmpty(packageJson.optionalDependencies)) {
    result.optionalDependencies = packageJson.optionalDependencies;
  }
  if (isNonEmpty(packageJson.peerDependencies)) {
    result.peerDependencies = packageJson.peerDependencies;
  }
  if (packageJson.bin) result.bin = packageJson.bin;
  if (packageJson.engines) result.engines = packageJson.engines;

  return result;
}

function locker(packageJson, dependencies, workspaces = []) {
  const packages = {
    "": copyRootPackage(packageJson),
  };

  flattenDependencies(dependencies, "", packages);

  for (const workspace of workspaces) {
    const workspacePath = path
      .relative(process.cwd(), workspace.dir)
      .split(path.sep)
      .join("/");

    packages[workspacePath] = copyWorkspacePackage(workspace);
    packages[`node_modules/${workspace.name}`] = {
      resolved: workspacePath,
      link: true,
    };
  }

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

  const production = findReachablePackages(packages, productionRoots, false);
  const development = findReachablePackages(packages, developmentRoots, false);
  const optional = findReachablePackages(
    packages,
    [...productionRoots, ...optionalRoots],
    true,
  );
  const developmentOptional = findReachablePackages(
    packages,
    developmentRoots,
    true,
  );

  for (const packagePath of Object.keys(packages)) {
    if (packagePath === "" || production[packagePath]) continue;

    if (development[packagePath]) {
      packages[packagePath].dev = true;
      continue;
    }

    if (optional[packagePath] && developmentOptional[packagePath]) {
      packages[packagePath].devOptional = true;
    } else if (optional[packagePath]) {
      packages[packagePath].optional = true;
    } else if (developmentOptional[packagePath]) {
      packages[packagePath].devOptional = true;
    }
  }

  const sortedPackages = {};
  for (const packagePath of Object.keys(packages).sort()) {
    sortedPackages[packagePath] = packages[packagePath];
  }

  const packageLock = {
    name: packageJson.name,
    version: packageJson.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
}

export default locker;
