import { writeFileSync } from 'fs';
import path from 'path';

const pkgLockJSON = path.join(process.cwd(), 'package-lock.json');

const toIntegrity = value => {
  if (value == null) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.integrity ?? value.resolved ?? value.version;
  }
  return String(value);
};

const notEmpty = value => value !== undefined && value !== null && value !== '';

const flatten = (value, result = [], depth = Infinity) => {
  if (depth > 0 && Array.isArray(value)) {
    for (const item of value) flatten(item, result, depth - 1);
  } else {
    result.push(value);
  }
  return result;
};

const resolveFrom = (request, from, options = {}) => {
  if (typeof require === 'function' && typeof require.resolve === 'function') {
    return require.resolve(request, {
      ...options,
      paths: [from]
    });
  }
  return request;
};

const reachable = (root, graph, key = 'dependencies') => {
  const seen = new Set();
  const result = [];

  const visit = value => {
    if (value == null) return;

    const name = typeof value === 'string'
      ? value
      : value.name ?? value.id ?? value.package;

    if (name !== undefined) {
      if (seen.has(name)) return;
      seen.add(name);
      result.push(value);
    }

    if (typeof value !== 'object') return;

    const dependencies = value[key];
    if (Array.isArray(dependencies)) {
      for (const dependency of dependencies) visit(dependency);
    } else if (dependencies && typeof dependencies === 'object') {
      for (const [dependencyName, dependency] of Object.entries(dependencies)) {
        visit(typeof dependency === 'object' && dependency !== null
          ? { name: dependencyName, ...dependency }
          : dependencyName);
      }
    }
  };

  if (Array.isArray(root)) {
    for (const value of root) visit(value);
  } else {
    visit(root);
  }

  if (graph && typeof graph === 'object') {
    for (const value of result.slice()) {
      const name = typeof value === 'string'
        ? value
        : value.name ?? value.id ?? value.package;
      if (name !== undefined && graph[name] !== undefined) visit(graph[name]);
    }
  }

  return result;
};

globalThis.pkgLockJSON = pkgLockJSON;
globalThis.toIntegrity = toIntegrity;
globalThis.notEmpty = notEmpty;
globalThis.flatten = flatten;
globalThis.resolveFrom = resolveFrom;
globalThis.reachable = reachable;

const locker = (value, target = pkgLockJSON, options = {}) => {
  const output = typeof target === 'string' ? target : pkgLockJSON;
  const data = typeof target === 'string' ? value : target;
  const serialized = options.stringify === false
    ? data
    : JSON.stringify(data, null, options.space ?? 2);

  writeFileSync(output, serialized);
  return data;
};

globalThis.locker = locker;
const locker_default = locker;
globalThis.locker_default = locker_default;

export { locker_default as default };
