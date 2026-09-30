import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import fs from 'fs';
import path, { dirname, relative } from 'path';

const shebangExpression = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
const nodeModulesDirectory = path.join(process.cwd(), 'node_modules');
const isWindows = process.platform === 'win32';

const escapeCommandEnvironment = value => {
  const variableExpression = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let previousIndex = 0;
  let match;

  do {
    match = variableExpression.exec(value);
    if (match) {
      result += `${value.substring(previousIndex, match.index) || ''}%${match[1]}%`;
      previousIndex = variableExpression.lastIndex;
    }
  } while (variableExpression.lastIndex > 0);

  return result + value.slice(previousIndex);
};

const commandEnvironment = variables => {
  let result = '';
  for (const assignment of variables.split(' ')) {
    const [rawName, rawValue] = assignment.split('=');
    const name = (rawName || '').trim();
    const value = (rawValue || '').trim();
    if (name && value) result += `@SET ${name}=${escapeCommandEnvironment(value)}\r\n`;
  }
  return result;
};

const remove = file => unlink(file).catch(() => {});

const writeShim = (source, destination, program, programArguments, environment) => {
  let shTarget = relative(dirname(destination), source).split('\\').join('/');
  let cmdTarget = shTarget.split('/').join('\\');
  let powerShellTarget = shTarget;
  let shProgram;
  let cmdProgram;
  let powerShellProgram;

  let normalizedProgram = program && program.split('\\').join('/');
  let quotedProgram = normalizedProgram && `"${normalizedProgram}$exe"`;

  programArguments ||= '';
  environment ||= '';

  if (!program) {
    program = `"%dp0%\\${cmdTarget}"`;
    normalizedProgram = `"$basedir/${shTarget}"`;
    quotedProgram = normalizedProgram;
    shTarget = '';
    cmdTarget = '';
    powerShellTarget = '';
    programArguments = '';
  } else {
    cmdProgram = `"%dp0%\\${program}.exe"`;
    cmdTarget = `"%dp0%\\${cmdTarget}"`;
    shProgram = `"$basedir/${normalizedProgram}"`;
    shTarget = `"$basedir/${shTarget}"`;
    powerShellProgram = `"$basedir/${program}.exe"`;
    powerShellTarget = `"$basedir/${powerShellTarget}"`;
  }

  const cmdHeader = '@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n';
  let cmd;
  if (cmdProgram) {
    environment = environment.trim();
    cmd = `${cmdHeader}${commandEnvironment(environment)}\r\nIF EXIST ${cmdProgram} (\r\n  SET "_prog=${cmdProgram.replace(/(^")|("$)/g, '')}"\r\n) ELSE (\r\n  SET "_prog=${program.replace(/(^")|("$)/g, '')}"\r\n  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" ${programArguments} ${cmdTarget} %*\r\n`;
  } else {
    cmd = `${cmdHeader}${program} ${programArguments} ${cmdTarget} %*\r\n`;
  }

  let sh = '#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e \'s,\\,/,g\')")\n\ncase `uname` in\n    *CYGWIN*|*MINGW*|*MSYS*)\n        if command -v cygpath > /dev/null 2>&1; then\n            basedir=`cygpath -w "$basedir"`\n        fi\n    ;;\nesac\n\n';
  if (shProgram) {
    sh += `if [ -x "${shProgram.replace(/"$/, '')}" ]; then\n  ${environment}exec ${shProgram} ${programArguments} ${shTarget} "$@"\nelse \n  ${environment}exec ${normalizedProgram} ${programArguments} ${shTarget} "$@"\nfi\n`;
  } else {
    sh += `${environment}exec ${normalizedProgram} ${programArguments} ${shTarget} "$@"\n`;
  }

  let powerShell = '#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node are installed\n  $exe=".exe"\n}\n$ret=0\n';
  const powerShellInvocation = executable => `# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & ${executable} ${programArguments} ${powerShellTarget} $args\n} else {\n  & ${executable} ${programArguments} ${powerShellTarget} $args\n}\n$ret=$LASTEXITCODE\n`;

  if (powerShellProgram) {
    powerShell += `if (Test-Path ${powerShellProgram}) {\n${powerShellInvocation(powerShellProgram)}} else {\n${powerShellInvocation(quotedProgram)}}\nexit $ret\n`;
  } else {
    powerShell += `${powerShellInvocation(quotedProgram)}exit $ret\n`;
  }

  return Promise.all([
    writeFile(`${destination}.ps1`, powerShell, 'utf8'),
    writeFile(`${destination}.cmd`, cmd, 'utf8'),
    writeFile(destination, sh, 'utf8'),
  ]).then(() => Promise.all([
    chmod(destination, 0o755),
    chmod(`${destination}.cmd`, 0o755),
    chmod(`${destination}.ps1`, 0o755),
  ]));
};

const prepare = (source, destination) => mkdir(dirname(destination), { recursive: true })
  .then(() => readFile(source, 'utf8'))
  .then(content => {
    const firstLine = content.trim().split(/\r*\n/)[0];
    const shebang = firstLine.match(shebangExpression);
    if (!shebang) return writeShim(source, destination);
    return writeShim(source, destination, shebang[2], shebang[3] || '', shebang[1] || '');
  }, () => writeShim(source, destination));

const cmdShim = (source, destination) => stat(source)
  .then(() => Promise.all([
    remove(destination),
    remove(`${destination}.cmd`),
    remove(`${destination}.ps1`),
  ]))
  .then(() => prepare(source, destination));

const link = async (source, destination) => {
  if (isWindows) {
    await cmdShim(source, destination);
    return;
  }

  try {
    fs.unlinkSync(destination);
  } catch {}
  fs.symlinkSync(source, destination);
  fs.chmodSync(source, '0755');
};

const installBins = async (packageName, packageDirectory, bins) => {
  if (bins === undefined) {
    const packageJson = JSON.parse(await readFile(path.join(packageDirectory, 'package.json')));
    bins = packageJson.bin;
  }
  if (!bins) return;

  const binDirectory = path.join(nodeModulesDirectory, '.bin');
  fs.mkdirSync(binDirectory, { recursive: true });

  if (typeof bins === 'string') {
    const binName = packageName.charAt(0) === '@' ? packageName.split('/')[1] : packageName;
    await link(path.join(packageDirectory, bins), path.join(binDirectory, binName));
  } else if (typeof bins === 'object') {
    for (const binName of Object.keys(bins)) {
      await link(path.join(packageDirectory, bins[binName]), path.join(binDirectory, binName));
    }
  }
};

export default installBins;
