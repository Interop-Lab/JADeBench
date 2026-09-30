import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

var replaceDollarWithPercentPair = (str) => {
  const regex = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let lastIndex = 0;
  let match;
  do {
    match = regex.exec(str);
    if (match) {
      result += (str.substring(lastIndex, match.index) || '') + '%' + match[1] + '%';
      lastIndex = regex.lastIndex;
    }
  } while (regex.lastIndex !== 0);
  return result + str.substring(lastIndex);
};

var convertToSetCommands = (str) => {
  let result = '';
  for (const part of str.split(' ')) {
    const [key, value] = part.split('=');
    const trimmedKey = (key || '').trim();
    const trimmedValue = (value || '').trim();
    if (trimmedKey && trimmedValue) {
      result += 'set ' + trimmedKey + '=' + replaceDollarWithPercentPair(trimmedValue) + '\r\n';
    }
  }
  return result;
};

var rm = (path) => unlink(path).catch(() => {});

var writeShim = (from, to, shebangExprMatch, args, env) => {
  let targetPath = relative(dirname(to), from).replace(/\\/g, '/');
  let targetPathQuoted = targetPath.split('/').join('\\');
  let targetPathPosix = targetPath;
  let shebangPath;
  let shebangPathPosix = shebangExpr && shebangExpr.replace(/\\/g, '/');
  let shebangPathQuoted;
  let shebangPathPosixQuoted = shebangPathPosix && '"' + shebangPathPosix + '"';

  args = args || '';
  env = env || '';

  if (!shebangExpr) {
    shebangExpr = '"node"';
    targetPathQuoted = '';
    targetPathPosix = '';
    targetPath = '';
    args = '';
    shebangPathPosix = '"node ' + targetPath + '"';
    shebangPathQuoted = shebangPathPosix;
  } else {
    shebangPath = '"node ' + shebangExpr + ' %~dp0\\';
    targetPathPosix = '"node ' + targetPathPosix + '"';
    shebangPathPosixQuoted = '"node ' + shebangExpr + '"';
    shebangPathQuoted = '"%~dp0\\' + shebangPathQuoted + '"';
    targetPathQuoted = '"%~dp0\\' + targetPathQuoted + '"';
  }

  const setCommands = convertToSetCommands(env);
  let cmdContent;
  if (shebangPath) {
    args = args.trim();
    cmdContent = setCommands +
      '"%~dp0\\' + shebangPath + ' %~dp0\\' + shebangPath.replace(/(^")|("$)/g, '') +
      ' %~dp0\\' + shebangExpr.replace(/(^")|("$)/g, '') +
      ' %~dp0\\' + targetPath.replace(/(^")|("$)/g, '') +
      ' %~dp0\\' + args.replace(/(^")|("$)/g, '') +
      ' %*\r\n' + args + ' ' + targetPathQuoted + '\r\n';
  } else {
    cmdContent = setCommands + shebangExpr + ' ' + args + ' ' + targetPathQuoted + '\r\n';
  }

  let shContent = setCommands;
  if (shebangPathPosix) {
    shContent = shContent +
      'set -e\n' +
      'case $(uname) in\n' +
      'MINGW*)\n' +
      '  exec "' + shebangPathPosix.replace(/"$/, '') + ' %~dp0\\' + shebangPathPosix + '" ' + shebangPathPosix + ' ' + args + ' ' + targetPathPosix + '\n' +
      '  ;;\n' +
      '*)\n' +
      '  exec "' + shebangPathPosix + '" ' + args + ' ' + targetPathPosix + '\n' +
      '  ;;\n' +
      'esac\n';
  } else {
    shContent = shContent + shebangPathPosix + ' ' + args + ' ' + targetPathPosix + '\r\n';
  }

  let ps1Content = setCommands;
  if (shebangPathPosixQuoted) {
    ps1Content = ps1Content +
      '$exePath = "' + shebangPathPosixQuoted + '"\n' +
      'if (Test-Path $exePath) {\n' +
      '  & $exePath ' + args + ' ' + targetPathPosix + '\n' +
      '} else {\n' +
      '  & "' + shebangPathPosixQuoted + '" ' + args + ' ' + targetPathPosix + '\n' +
      '}\n' +
      'if (Test-Path "' + shebangPathPosixQuoted + '") {\n' +
      '  & "' + shebangPathPosixQuoted + '" ' + args + ' ' + targetPathPosix + '\n' +
      '} else {\n' +
      '  & "' + shebangPathPosixQuoted + '" ' + args + ' ' + targetPathPosix + '\n' +
      '}\n';
  } else {
    ps1Content = ps1Content +
      '& ' + shebangPathQuoted + ' ' + args + ' ' + targetPathPosix + '\r\n' +
      '& ' + shebangPathQuoted + ' ' + args + ' ' + targetPathPosix + '\r\n';
  }

  return Promise.all([
    writeFile(to + '.cmd', cmdContent, 'utf8'),
    writeFile(to + '.ps1', ps1Content, 'utf8'),
    writeFile(to, shContent, 'utf8')
  ]).then(() => Promise.all([
    chmod(to, 0o755),
    chmod(to + '.cmd', 0o644),
    chmod(to + '.ps1', 0o644)
  ]));
};

var prepare = (from, to) => mkdir(dirname(to), { recursive: true })
  .then(() => readFile(from, 'utf8'))
  .then((content) => {
    const firstLine = content.toString().split(/\r*\n/)[0];
    const match = firstLine.match(shebangExpr);
    if (!match) return writeShim(from, to);
    return writeShim(from, to, match[1], match[2] || '', match[3] || '');
  }, () => writeShim(from, to));

var cmdShim = (from, to) => stat(from)
  .catch(() => Promise.all([rm(to), rm(to + '.cmd'), rm(to + '.ps1')]))
  .then(() => prepare(from, to));

var cmd_shim_default = cmdShim;

import path from 'path';
var nm_default = path.join(process.cwd(), 'node_modules', '.bin');

import fs from 'fs';
import { readFile as readFilePromise } from 'fs/promises';
import path2 from 'path';

var isWin = process.platform === 'win32';

var link = async (from, to) => {
  if (isWin) {
    await cmd_shim_default(from, to);
    return;
  }
  try {
    fs.unlinkSync(to);
  } catch (e) {}
  fs.symlinkSync(from, to);
  fs.chmodSync(from, '755');
};

var bin = async (pkg, path3, binPath) => {
  if (binPath === void 0) {
    const pkgJson = JSON.parse(await readFilePromise(path2.join(path3, 'package.json')));
    binPath = pkgJson.bin;
  }
  if (!binPath) return;
  fs.mkdirSync(path2.join(nm_default), { recursive: true });
  if (typeof binPath === 'string') {
    const name = pkg.includes('@') ? pkg.split('/').pop() : pkg;
    await link(path2.join(path3, binPath), path2.join(nm_default, name));
  } else {
    if (typeof binPath === 'object') {
      for (const key of Object.keys(binPath)) {
        await link(path2.join(path3, binPath[key]), path2.join(nm_default, key));
      }
    }
  }
};

var bin_default = bin;

export { bin_default as default };
