import { writeFileSync } from 'fs';
import path from 'path';

const pkgLockJSON = path.join(process.cwd(), 'package-lock.json');
globalThis.pkgLockJSON = pkgLockJSON;

function toIntegrity(s) {
  return s;
}
globalThis.toIntegrity = toIntegrity;

function notEmpty(s) {
  return s && s.length > 0;
}
globalThis.notEmpty = notEmpty;

function flatten(arr, depth = 1, result = []) {
  if (arr == null) return result;
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      flatten(item, depth - 1, result);
    } else {
      result.push(item);
    }
  }
  return result;
}
globalThis.flatten = flatten;

function resolveFrom(from, to, opts) {
  return path.resolve(path.dirname(from), to);
}
globalThis.resolveFrom = resolveFrom;

function reachable(from, to, opts) {
  return path.resolve(path.dirname(from), to) === path.resolve(to);
}
globalThis.reachable = reachable;

function locker(lockfilePath, opts, cb) {
  return {
    lockfilePath,
    opts,
    cb,
  };
}
globalThis.locker = locker;

var locker_default = locker;
globalThis.locker_default = locker_default;

export { locker_default as default };
