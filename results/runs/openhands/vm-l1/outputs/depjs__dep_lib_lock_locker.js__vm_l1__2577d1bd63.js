import { writeFileSync } from "fs";
import path from "path";

const packageLockPath = path.join(process.cwd(), "package-lock.json");

const toIntegrity = (packageInfo) => {
  if (packageInfo.integrity) {
    return packageInfo.integrity;
  }
  if (packageInfo.shasum) {
    return `sha1-${Buffer.from(packageInfo.shasum, "hex").toString("base64")}`;
  }
};

const notEmpty = (value) => value && Object.keys(value).length > 0;

const flatten = (dependencies, prefix, packages) => {
  Object.keys(dependencies).forEach((dependencyName) => {
    const dependency = dependencies[dependencyName];
    const packagePath = `${prefix}node_modules/${dependencyName}`;
    const packageInfo = {};

    if (dependency.name && dependency.name !== dependencyName) {
      packageInfo.name = dependency.name;
    }
    packageInfo.version = dependency.version;

    const resolved = dependency.tarball || dependency.url;
    if (resolved) {
      packageInfo.resolved = resolved;
    }

    const integrity = toIntegrity(dependency);
    if (integrity) {
      packageInfo.integrity = integrity;
    }
    if (dependency.hasInstallScript) {
      packageInfo.hasInstallScript = true;
    }

    for (const field of ["license", "engines", "os", "cpu", "libc", "bin"]) {
      if (dependency[field]) {
        packageInfo[field] = dependency[field];
      }
    }

    if (notEmpty(dependency.requires)) {
      packageInfo.dependencies = dependency.requires;
    }
    if (notEmpty(dependency.optionalDependencies)) {
      packageInfo.optionalDependencies = dependency.optionalDependencies;
    }
    if (notEmpty(dependency.peerDependencies)) {
      packageInfo.peerDependencies = dependency.peerDependencies;
    }
    if (dependency.funding) {
      packageInfo.funding = dependency.funding;
    }

    packages[packagePath] = packageInfo;

    if (dependency.dependencies) {
      flatten(dependency.dependencies, `${packagePath}/`, packages);
    }
  });

  return packages;
};

const resolveFrom = (packages, fromPath, dependencyName) => {
  let currentPath = fromPath;

  while (true) {
    const packagePath = `${currentPath ? `${currentPath}/` : ""}node_modules/${dependencyName}`;
    if (packages[packagePath]) {
      return packagePath;
    }
    if (!currentPath) {
      return null;
    }

    const parentIndex = currentPath.lastIndexOf("/node_modules/");
    currentPath = parentIndex === -1 ? "" : currentPath.slice(0, parentIndex);
  }
};

const reachable = (packages, dependencyNames, includeOptional) => {
  const visited = {};
  const pending = dependencyNames
    .map((dependencyName) => resolveFrom(packages, "", dependencyName))
    .filter(Boolean);

  while (pending.length) {
    const packagePath = pending.pop();
    if (visited[packagePath]) {
      continue;
    }
    visited[packagePath] = true;

    let packageInfo = packages[packagePath];
    if (packageInfo && packageInfo.link) {
      packageInfo = packages[packageInfo.resolved];
    }
    if (!packageInfo) {
      continue;
    }

    const dependencies = Object.assign({}, packageInfo.dependencies);
    if (includeOptional) {
      Object.assign(dependencies, packageInfo.optionalDependencies);
    } else {
      Object.keys(packageInfo.optionalDependencies || {}).forEach((dependencyName) => {
        delete dependencies[dependencyName];
      });
    }

    Object.keys(dependencies).forEach((dependencyName) => {
      const resolved = resolveFrom(packages, packagePath, dependencyName);
      if (resolved) {
        pending.push(resolved);
      }
    });
  }

  return visited;
};

const addWorkspace = (packages, workspace) => {
  const relativePath = path
    .relative(process.cwd(), workspace.dir)
    .split(path.sep)
    .join("/");
  const workspacePackage = workspace.pkg;
  const packageInfo = {
    name: workspacePackage.name,
    version: workspacePackage.version,
  };

  if (workspacePackage.license) {
    packageInfo.license = workspacePackage.license;
  }
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    if (notEmpty(workspacePackage[field])) {
      packageInfo[field] = workspacePackage[field];
    }
  }
  for (const field of ["bin", "engines"]) {
    if (workspacePackage[field]) {
      packageInfo[field] = workspacePackage[field];
    }
  }

  packages[relativePath] = packageInfo;
  packages[`node_modules/${workspacePackage.name}`] = {
    resolved: relativePath,
    link: true,
  };
};

const locker = (rootPackage, dependencies, workspaces) => {
  if (workspaces === undefined) {
    workspaces = [];
  }

  const packages = {};
  const rootPackageInfo = {
    name: rootPackage.name,
    version: rootPackage.version,
  };

  if (rootPackage.license) {
    rootPackageInfo.license = rootPackage.license;
  }
  if (rootPackage.workspaces) {
    rootPackageInfo.workspaces = rootPackage.workspaces;
  }
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    if (notEmpty(rootPackage[field])) {
      rootPackageInfo[field] = rootPackage[field];
    }
  }
  packages[""] = rootPackageInfo;

  flatten(dependencies, "", packages);
  workspaces.forEach((workspace) => addWorkspace(packages, workspace));

  const workspaceDevDependencies = workspaces.flatMap((workspace) =>
    Object.keys(workspace.pkg.devDependencies || {}),
  );
  const workspaceOptionalDependencies = workspaces.flatMap((workspace) =>
    Object.keys(workspace.pkg.optionalDependencies || {}),
  );

  const productionRoots = [
    ...Object.keys(rootPackage.dependencies || {}),
    ...workspaces.map((workspace) => workspace.name),
  ];
  const developmentRoots = [
    ...Object.keys(rootPackage.devDependencies || {}),
    ...workspaceDevDependencies,
  ];
  const optionalRoots = [
    ...Object.keys(rootPackage.optionalDependencies || {}),
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
    if (packagePath === "" || productionPackages[packagePath]) {
      return;
    }
    if (developmentPackages[packagePath]) {
      packages[packagePath].dev = true;
      return;
    }
    if (optionalPackages[packagePath] && developmentOptionalPackages[packagePath]) {
      packages[packagePath].devOptional = true;
    } else if (optionalPackages[packagePath]) {
      packages[packagePath].optional = true;
    } else if (developmentOptionalPackages[packagePath]) {
      packages[packagePath].devOptional = true;
    }
  });

  const sortedPackages = {};
  Object.keys(packages)
    .sort()
    .forEach((packagePath) => {
      sortedPackages[packagePath] = packages[packagePath];
    });

  const packageLock = {
    name: rootPackage.name,
    version: rootPackage.version,
    lockfileVersion: 3,
    requires: true,
    packages: sortedPackages,
  };

  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
};

export { locker as default };
