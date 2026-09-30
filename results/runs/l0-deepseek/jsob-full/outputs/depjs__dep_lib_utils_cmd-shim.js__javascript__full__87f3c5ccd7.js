import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

var replaceDollarWithPercentPair = (value) => {
  const expr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let index = 0;
  let match;
  do {
    match = expr.exec(value);
    if (match) {
      result += value.slice(index, match.index) + '%' + match[1] + '%';
      index = expr.lastIndex;
    }
  } while (expr.lastIndex > 0);
  return result + value.slice(index);
};

var convertToSetCommands = (value) => {
  let result = '';
  for (const part of value.split(' ')) {
    const [key, val] = part.split('=');
    const name = (key || '').trim();
    const command = (val || '').trim();
    if (name && command) {
      result += 'set ' + name + '=' + replaceDollarWithPercentPair(command) + '\r\n';
    }
  }
  return result;
};

var rm = (path) => unlink(path).catch(() => {});

var writeShim = (target, targetPath, shebang, env, args) => {
  let relativePath = relative(dirname(targetPath), target).replace(/\\/g, '/');
  let relativeDir = relativePath.split('/').slice(0, -1).join('/');
  let relativeBase = relativePath;
  let shebangPath;
  let shebangCmd = shebang && shebang.replace(/\\/g, '/');
  let shebangEnv;
  let shebangArgs = shebangCmd && '"' + shebangCmd + '"';

  env = env || '';
  args = args || '';

  if (!shebang) {
    shebangCmd = '"' + relativeDir + '/';
    relativeDir = '';
    env = '';
    shebangPath = '"' + relativeBase + '"';
    shebangArgs = shebangPath;
    relativePath = '';
    relativeBase = '';
  } else {
    shebangPath = '"' + relativeDir + '/';
    relativeDir = '"' + relativeDir + '"';
    relativeBase = '"' + relativeBase + '"';
    relativePath = '"' + relativePath + '"';
    shebangEnv = '"' + shebangCmd + '"';
  }

  const header = '#!/bin/sh';
  let script;

  if (shebangEnv) {
    env = env.trim();
    script = header + '\n' + convertToSetCommands(args) + '\n' + shebangEnv + ' ' + shebangCmd.replace(/(^")|("$)/g, '') + ' ' + shebangPath.replace(/(^")|("$)/g, '') + ' ' + env + ' ' + relativeDir + '\n';
  } else {
    script = header + '\n' + shebangCmd + ' ' + env + ' ' + relativeDir + '\n';
  }

  let shim = header + '\n';
  if (shebangPath) {
    shim += 'basedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\n';
    shim += 'case `uname` in\n';
    shim += '    *CYGWIN*|*MINGW*|*MSYS*) basedir=`cygpath -w "$basedir"`;;\n';
    shim += 'esac\n';
    shim += 'if [ -x "$basedir/node" ]; then\n';
    shim += '  exec "$basedir/node"  "' + shebangPath + '" "$@"\n';
    shim += 'else\n';
    shim += '  exec node  "' + shebangPath + '" "$@"\n';
    shim += 'fi\n';
  } else {
    shim += 'basedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\n';
    shim += 'case `uname` in\n';
    shim += '    *CYGWIN*|*MINGW*|*MSYS*) basedir=`cygpath -w "$basedir"`;;\n';
    shim += 'esac\n';
    shim += 'if [ -x "$basedir/node" ]; then\n';
    shim += '  exec "$basedir/node"  "' + shebangArgs + '" "$@"\n';
    shim += 'else\n';
    shim += '  exec node  "' + shebangArgs + '" "$@"\n';
    shim += 'fi\n';
  }

  return Promise.all([
    writeFile(targetPath, script, { encoding: 'utf8' }),
    writeFile(targetPath + '.cmd', shim, { encoding: 'utf8' }),
    writeFile(targetPath + '.ps1', shim, { encoding: 'utf8' })
  ]).then(() => Promise.all([
    chmod(targetPath, 0o755),
    chmod(targetPath + '.cmd', 0o755),
    chmod(targetPath + '.ps1', 0o755)
  ]));
};

var prepare = (target, targetPath) =>
  mkdir(dirname(targetPath), { recursive: true })
    .catch(() => readFile(target, 'utf8'))
    .then((content) => {
      const firstLine = content.toString().split(/\r*\n/)[0];
      const match = firstLine.match(shebangExpr);
      if (!match) return writeShim(target, targetPath);
      return writeShim(target, targetPath, match[1], match[2] || '', match[3] || '');
    }, () => writeShim(target, targetPath));

var cmdShim = (target, targetPath) =>
  stat(target)
    .catch(() => Promise.all([rm(targetPath), rm(targetPath + '.cmd'), rm(targetPath + '.ps1')]))
    .then(() => prepare(target, targetPath));

var cmd_shim_default = cmdShim;

export { cmd_shim_default as default };
