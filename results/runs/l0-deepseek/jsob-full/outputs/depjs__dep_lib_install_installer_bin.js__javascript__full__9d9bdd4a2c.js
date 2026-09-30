import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = (value) => {
  const regex = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(value)) !== null) {
    result += value.slice(lastIndex, match.index) + '%' + match[1] + '%';
    lastIndex = regex.lastIndex;
  }
  return result + value.slice(lastIndex);
};

const convertToSetCommands = (value) => {
  let result = '';
  for (const part of value.split(' ')) {
    const [key, val] = part.split('=');
    const trimmedKey = (key || '').trim();
    const trimmedVal = (val || '').trim();
    if (trimmedKey && trimmedVal) {
      result += 'set ' + trimmedKey + '=' + replaceDollarWithPercentPair(trimmedVal) + '\r\n';
    }
  }
  return result;
};

const rm = (file) => unlink(file).catch(() => {});

const writeShim = (target, targetPath, shebangArgs, shebangEnv, shebangRest) => {
  let relativePath = relative(dirname(targetPath), target).replace(/\\/g, '/');
  let relativePathParts = relativePath.split('/').join('\\');
  let relativePathQuoted = relativePath;
  let shebangArgsQuoted;
  let shebangEnvQuoted = shebangArgs && shebangArgs.replace(/\\/g, '/');
  let shebangEnvQuotedString = shebangEnvQuoted && '"' + shebangEnvQuoted + '"';
  let shebangRestQuoted;

  shebangEnv = shebangEnv || '';
  shebangRest = shebangRest || '';

  if (!shebangArgs) {
    const cases = '0|1|2|3|4|5|6'.split('|');
    let index = 0;
    while (true) {
      switch (cases[index++]) {
        case '0':
          shebangArgs = '"' + relativePathParts + '"';
          continue;
        case '1':
          relativePathParts = '';
          continue;
        case '2':
          relativePathQuoted = '';
          continue;
        case '3':
          relativePath = '';
          continue;
        case '4':
          shebangEnv = '';
          continue;
        case '5':
          shebangEnvQuoted = '"' + relativePath + '"';
          continue;
        case '6':
          shebangEnvQuotedString = shebangEnvQuoted;
          continue;
      }
      break;
    }
  } else {
    const cases = '0|1|2|3|4|5'.split('|');
    let index = 0;
    while (true) {
      switch (cases[index++]) {
        case '0':
          shebangArgsQuoted = '"' + shebangArgs + '"';
          continue;
        case '1':
          relativePathQuoted = '"' + relativePathQuoted + '"';
          continue;
        case '2':
          shebangRestQuoted = '"' + shebangArgs + '"';
          continue;
        case '3':
          shebangEnvQuoted = '"' + shebangArgs + '"';
          continue;
        case '4':
          relativePathParts = '"' + relativePathParts + '"';
          continue;
        case '5':
          relativePath = '"' + relativePath + '"';
          continue;
      }
      break;
    }
  }

  const header = '';
  let shimContent;
  if (shebangArgsQuoted) {
    shebangEnv = shebangEnv.trim();
    shimContent = header + convertToSetCommands(shebangRest) + 'SET ' + shebangArgsQuoted + '=' + shebangArgsQuoted.replace(/(^")|("$)/g, '') + 'SET ' + shebangArgs.replace(/(^")|("$)/g, '') + shebangEnv + ' ' + relativePathParts;
  } else {
    shimContent = header + shebangArgs + ' ' + shebangEnv + ' ' + relativePathParts;
  }

  let cmdContent = '';
  if (shebangEnvQuoted) {
    cmdContent += 'SET ' + shebangEnvQuoted.replace(/"$/, '') + 'SET ' + shebangEnvQuoted + 'SET ' + shebangEnvQuotedString + ' ' + shebangRest + ' ' + shebangEnv + ' ' + relativePath;
  } else {
    cmdContent += 'SET ' + shebangEnvQuotedString + ' ' + shebangEnv + ' ' + relativePath;
  }

  let shContent = '';
  if (shebangRestQuoted) {
    shContent += 'SET ' + shebangRestQuoted + ' ' + shebangEnv + ' ' + relativePathQuoted + 'SET ' + shebangRestQuoted + ' ' + shebangEnv + ' ' + relativePathQuoted + 'SET ' + shebangEnvQuotedString + ' ' + shebangEnv + ' ' + relativePathQuoted + 'SET ' + shebangEnvQuotedString + ' ' + shebangEnv + ' ' + relativePathQuoted;
  } else {
    shContent += 'SET ' + shebangEnvQuotedString + ' ' + shebangEnv + ' ' + relativePathQuoted + 'SET ' + shebangEnvQuotedString + ' ' + shebangEnv + ' ' + relativePathQuoted;
  }

  return Promise.all([
    writeFile(targetPath + '.cmd', cmdContent, 'utf8'),
    writeFile(targetPath + '.ps1', shimContent, 'utf8'),
    writeFile(targetPath, shContent, 'utf8')
  ]).then(() => Promise.all([
    chmod(targetPath, 0o755),
    chmod(targetPath + '.cmd', 0o755),
    chmod(targetPath + '.ps1', 0o755)
  ]));
};

const prepare = (target, targetPath) =>
  mkdir(dirname(targetPath), { recursive: true })
    .catch(() => readFile(target, 'utf8'))
    .then((content) => {
      const firstLine = content.toString().split(/\r*\n/)[0];
      const match = firstLine.match(shebangExpr);
      if (!match) return writeShim(target, targetPath);
      return writeShim(target, targetPath, match[1], match[2] || '', match[3] || '');
    }, () => writeShim(target, targetPath));

const cmdShim = (target, targetPath) =>
  stat(target)
    .catch(() => Promise.all([rm(targetPath), rm(targetPath + '.cmd'), rm(targetPath + '.ps1')]))
    .then(() => prepare(target, targetPath));

const cmd_shim_default = cmdShim;

import path from 'path';
const nm_default = path.join(process.cwd(), 'node_modules');

import fs from 'fs';
import { readFile as readFilePromise } from 'fs/promises';
import pathModule from 'path';

const isWin = process.platform === 'win32';

const link = async (target, targetPath) => {
  if (isWin) {
    await cmd_shim_default(target, targetPath);
    return;
  }
  try {
    fs.unlinkSync(targetPath);
  } catch (err) {}
  fs.symlinkSync(target, targetPath);
  fs.chmodSync(target, '755');
};

const bin = async (target, targetPath, binValue) => {
  if (binValue === undefined) {
    const packageJson = JSON.parse(await readFilePromise(pathModule.join(targetPath, 'package.json')));
    binValue = packageJson.bin;
  }
  if (!binValue) return;
  fs.mkdirSync(pathModule.join(nm_default, '.bin'), { recursive: true });
  if (typeof binValue === 'string') {
    const binName = target.slice(target.lastIndexOf('/') + 1, target.lastIndexOf('@') !== -1 ? target.lastIndexOf('@') : undefined) || target;
    await link(pathModule.join(targetPath, binValue), pathModule.join(nm_default, '.bin', binName));
  } else if (typeof binValue === 'object') {
    for (const binName of Object.keys(binValue)) {
      await link(pathModule.join(targetPath, binValue[binName]), pathModule.join(nm_default, '.bin', binName));
    }
  }
};

const bin_default = bin;

export { bin_default as default };
