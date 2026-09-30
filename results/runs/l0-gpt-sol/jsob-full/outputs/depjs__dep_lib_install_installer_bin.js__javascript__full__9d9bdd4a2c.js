import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'fs/promises';
import fs from 'fs';
import path, { dirname, relative } from 'path';

const shebangExpr =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value => {
  const variableExpr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let previousIndex = 0;
  let match;

  do {
    match = variableExpr.exec(value);
    if (match) {
      result +=
        (value.substring(previousIndex, match.index) || '') +
        '%' +
        match[1] +
        '%';
      previousIndex = variableExpr.lastIndex;
    }
  } while (variableExpr.lastIndex > 0);

  return result + value.substring(previousIndex);
};

const convertToSetCommands = variables => {
  let result = '';

  for (const assignment of variables.split(' ')) {
    const [rawName, rawValue] = assignment.split('=');
    const name = (rawName || '').trim();
    const value = (rawValue || '').trim();

    if (name && value) {
      result += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return result;
};

const convertToPowerShellCommands = variables => {
  let result = '';

  for (const assignment of variables.split(' ')) {
    const separator = assignment.indexOf('=');
    if (separator === -1) continue;

    const name = assignment.slice(0, separator).trim();
    const value = assignment.slice(separator + 1).trim();
    if (!name || !value) continue;

    result += `$env:${name}=${JSON.stringify(value)}\n`;
  }

  return result;
};

const rm = file => unlink(file).catch(() => {});

const shellQuote = value => `"${value.replace(/(["\\$`])/g, '\\$1')}"`;

const writeShim = (from, to, interpreter, args, variables) => {
  let shellTarget = relative(dirname(to), from).split('\\').join('/');
  let cmdTarget = shellTarget.split('/').join('\\');
  let powerShellTarget = shellTarget;

  args = args || '';
  variables = variables || '';

  let shellCommand;
  let cmdCommand;
  let powerShellCommand;

  if (!interpreter) {
    shellCommand = `exec "$basedir/${shellTarget}" "$@"`;
    cmdCommand = `"%dp0%${cmdTarget}" %*`;
    powerShellCommand = `& "$basedir/${powerShellTarget}" $args`;
  } else {
    const normalizedInterpreter = interpreter.split('\\').join('/');
    const program = normalizedInterpreter.slice(
      normalizedInterpreter.lastIndexOf('/') + 1,
    );
    const shellArgs = args;
    const cmdArgs = replaceDollarWithPercentPair(args);
    const powerShellArgs = args.trim();

    shellCommand =
      `if [ -x "$basedir/${program}" ]; then\n` +
      `  exec ${variables}"$basedir/${program}"${shellArgs} ${shellQuote(
        `$basedir/${shellTarget}`,
      )} "$@"\n` +
      `else\n` +
      `  exec ${variables}${interpreter}${shellArgs} ${shellQuote(
        `$basedir/${shellTarget}`,
      )} "$@"\n` +
      `fi`;

    cmdCommand =
      convertToSetCommands(variables) +
      `@SETLOCAL\r\n` +
      `@SET "_prog=${interpreter}"\r\n` +
      `@IF EXIST "%dp0%${program}.exe" SET "_prog=%dp0%${program}.exe"\r\n` +
      `@"%_prog%"${cmdArgs} "%dp0%${cmdTarget}" %*\r\n`;

    const invocationArgs = powerShellArgs ? ` ${powerShellArgs}` : '';
    powerShellCommand =
      convertToPowerShellCommands(variables) +
      `$exe=""\n` +
      `if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) { $exe=".exe" }\n` +
      `if (Test-Path "$basedir/${program}$exe") {\n` +
      `  & "$basedir/${program}$exe"${invocationArgs} "$basedir/${powerShellTarget}" $args\n` +
      `} else {\n` +
      `  & ${JSON.stringify(interpreter)}${invocationArgs} "$basedir/${powerShellTarget}" $args\n` +
      `}\n`;
  }

  const shellScript =
    `#!/bin/sh\n` +
    `basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n\n` +
    shellCommand +
    `\n`;

  const cmdScript =
    interpreter
      ? `@ECHO off\r\n${cmdCommand}`
      : `@ECHO off\r\n${cmdCommand}\r\n`;

  const powerShellScript =
    `#!/usr/bin/env pwsh\n` +
    `$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n` +
    powerShellCommand +
    `\n$ret=$LASTEXITCODE\nexit $ret\n`;

  return Promise.all([
    writeFile(`${to}.ps1`, powerShellScript, 'utf8'),
    writeFile(`${to}.cmd`, cmdScript, 'utf8'),
    writeFile(to, shellScript, 'utf8'),
  ]).then(() =>
    Promise.all([
      chmod(to, 0o755),
      chmod(`${to}.cmd`, 0o755),
      chmod(`${to}.ps1`, 0o755),
    ]),
  );
};

const prepare = (from, to) =>
  mkdir(dirname(to), { recursive: true })
    .then(() => readFile(from, 'utf8'))
    .then(
      contents => {
        const firstLine = contents.toString().split(/\r*\n/)[0];
        const match = firstLine.match(shebangExpr);

        if (!match) {
          return writeShim(from, to);
        }

        return writeShim(from, to, match[2], match[3] || '', match[1] || '');
      },
      () => writeShim(from, to),
    );

const cmdShim = (from, to) =>
  stat(from)
    .then(() =>
      Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]),
    )
    .then(() => prepare(from, to));

const nodeModulesDirectory = path.resolve(process.cwd(), 'node_modules');
const isWin = process.platform === 'win32';

const link = async (from, to) => {
  if (isWin) {
    await cmdShim(from, to);
    return;
  }

  try {
    fs.unlinkSync(to);
  } catch {}

  fs.symlinkSync(from, to, 'file');
  fs.chmodSync(from, 0o755);
};

const bin = async (packageName, packageDirectory, binEntries) => {
  if (binEntries === undefined) {
    const packageJson = JSON.parse(
      await readFile(path.resolve(packageDirectory, 'package.json')),
    );
    binEntries = packageJson.bin;
  }

  if (!binEntries) return;

  const binDirectory = path.resolve(nodeModulesDirectory, '.bin');
  fs.mkdirSync(binDirectory, { recursive: true });

  if (typeof binEntries === 'string') {
    const commandName = packageName.startsWith('@')
      ? packageName.split('/')[1]
      : packageName;

    await link(
      path.resolve(packageDirectory, binEntries),
      path.resolve(binDirectory, commandName),
    );
    return;
  }

  if (typeof binEntries === 'object') {
    for (const commandName of Object.keys(binEntries)) {
      await link(
        path.resolve(packageDirectory, binEntries[commandName]),
        path.resolve(binDirectory, commandName),
      );
    }
  }
};

export { bin as default };
