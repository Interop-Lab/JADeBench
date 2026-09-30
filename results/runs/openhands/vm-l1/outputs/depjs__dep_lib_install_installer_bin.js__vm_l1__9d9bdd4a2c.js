import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import fs from 'fs';
import path, { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = input => {
  const variable = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let output = '';
  let lastIndex = 0;
  let match;

  do {
    match = variable.exec(input);
    if (match) {
      output += (input.substring(lastIndex, match.index) || '') + '%' + match[1] + '%';
      lastIndex = variable.lastIndex;
    }
  } while (variable.lastIndex > 0);

  return output + input.slice(lastIndex);
};

const convertToSetCommands = variables => {
  let output = '';

  for (const variable of variables.split(' ')) {
    const [rawName, rawValue] = variable.split('=');
    const name = (rawName || '').trim();
    const value = (rawValue || '').trim();

    if (name && value) {
      output += '@SET ' + name + '=' + replaceDollarWithPercentPair(value) + '\r\n';
    }
  }

  return output;
};

const rm = target => unlink(target).catch(() => {});

const writeShim = (from, to, prog, args, variables) => {
  let shTarget = relative(dirname(to), from).split('\\').join('/');
  let cmdTarget = shTarget.split('/').join('\\');
  let pwshTarget = shTarget;

  let shProg = prog && prog.split('\\').join('/');
  let cmdProg;
  let shProgExe;
  let pwshProg = shProg && '"' + shProg + '$exe"';
  let pwshProgExe;

  args = args || '';
  variables = variables || '';

  if (!prog) {
    prog = '"%dp0%\\' + cmdTarget + '"';
    shProg = '"$basedir/' + shTarget + '"';
    pwshProg = shProg;
    args = '';
    cmdTarget = '';
    shTarget = '';
    pwshTarget = '';
  } else {
    cmdProg = '"%dp0%\\' + cmdTarget + '.exe"';
    shProgExe = '"$basedir/' + prog + '"';
    pwshProgExe = '"$basedir/' + prog + '$exe"';
    cmdTarget = '"%dp0%\\' + cmdTarget + '"';
    shTarget = '"$basedir_win/' + shTarget + '"';
    pwshTarget = '"$basedir/' + pwshTarget + '"';
  }

  const cmdHeader = '@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n';
  let cmd;

  if (cmdProg) {
    args = args.trim();
    cmd = cmdHeader + convertToSetCommands(variables) + '\r\nIF EXIST ' + cmdProg
      + ' (\r\n  SET "_prog=' + cmdProg.replace(/(^")|("$)/g, '')
      + '"\r\n) ELSE (\r\n  SET "_prog=' + prog.replace(/(^")|("$)/g, '')
      + '"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" '
      + args + ' ' + cmdTarget + ' %*\r\n';
  } else {
    cmd = '' + cmdHeader + prog + ' ' + args + ' ' + cmdTarget + ' %*\r\n';
  }

  const shHeader = '#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\nbasedir_win="$basedir"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w "$basedir"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"\n      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then\n        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n';
  let sh;

  if (shProgExe) {
    sh = shHeader + 'PROG_EXE=' + shProgExe.replace(/"$/, '.exe"')
      + '\nif ! [ -x "$PROG_EXE" ]; then\n  PROG_EXE=' + shProgExe
      + '\n  if ! [ -x "$PROG_EXE" ]; then\n    PROG_EXE=' + shProg
      + '\n    if ! [ -x "$PROG_EXE" ]; then\n      PROG_EXE=' + shProg
      + '.exe\n    fi\n  fi\nfi\n\nexec ' + variables + '"$PROG_EXE" '
      + args + ' ' + shTarget + ' "$@"\n';
  } else {
    sh = shHeader + 'exec ' + shProg + ' ' + args + ' ' + shTarget + ' "$@"\n';
  }

  const pwshHeader = '#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=".exe"\n}\n';
  let pwsh;

  if (pwshProgExe) {
    pwsh = pwshHeader + '$ret=0\nif (Test-Path ' + pwshProgExe
      + ') {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ' + pwshProgExe + ' ' + args + ' ' + pwshTarget
      + ' $args\n  } else {\n    & ' + pwshProgExe + ' ' + args + ' ' + pwshTarget
      + ' $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ' + pwshProg + ' ' + args + ' ' + pwshTarget
      + ' $args\n  } else {\n    & ' + pwshProg + ' ' + args + ' ' + pwshTarget
      + ' $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n';
  } else {
    pwsh = pwshHeader + '# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & '
      + pwshProg + ' ' + args + ' ' + pwshTarget + ' $args\n} else {\n  & '
      + pwshProg + ' ' + args + ' ' + pwshTarget + ' $args\n}\nexit $LASTEXITCODE\n';
  }

  return Promise.all([
    writeFile(to + '.ps1', pwsh, 'utf8'),
    writeFile(to + '.cmd', cmd, 'utf8'),
    writeFile(to, sh, 'utf8'),
  ]).then(() => Promise.all([
    chmod(to, 0o755),
    chmod(to + '.cmd', 0o755),
    chmod(to + '.ps1', 0o755),
  ]));
};

const prepare = (sourcePath, shimPath) => mkdir(dirname(shimPath), { recursive: true })
  .then(() => readFile(sourcePath, 'utf8'))
  .then(
    source => {
      const firstLine = source.trim().split(/\r*\n/)[0];
      const shebang = firstLine.match(shebangExpr);

      if (!shebang) {
        return writeShim(sourcePath, shimPath);
      }

      return writeShim(
        sourcePath,
        shimPath,
        shebang[2],
        shebang[3] || '',
        shebang[1] || '',
      );
    },
    () => writeShim(sourcePath, shimPath),
  );

const cmdShim = (sourcePath, shimPath) => stat(sourcePath)
  .then(() => Promise.all([
    rm(shimPath),
    rm(shimPath + '.cmd'),
    rm(shimPath + '.ps1'),
  ]))
  .then(() => prepare(sourcePath, shimPath));

const nodeModulesDirectory = path.join(process.cwd(), 'node_modules');
const isWindows = process.platform === 'win32';

const link = async (sourcePath, destinationPath) => {
  if (isWindows) {
    await cmdShim(sourcePath, destinationPath);
    return;
  }

  try {
    fs.unlinkSync(destinationPath);
  } catch {}

  fs.symlinkSync(sourcePath, destinationPath);
  fs.chmodSync(sourcePath, '0755');
};

const bin = async (packageName, packageDirectory, binEntries) => {
  if (binEntries === undefined) {
    const packageJson = JSON.parse(
      await readFile(path.join(packageDirectory, 'package.json')),
    );
    binEntries = packageJson.bin;
  }

  if (!binEntries) {
    return;
  }

  fs.mkdirSync(path.join(nodeModulesDirectory, '.bin'), { recursive: true });

  if (typeof binEntries === 'string') {
    const name = packageName.charAt(0) === '@' ? packageName.split('/')[1] : packageName;
    await link(
      path.join(packageDirectory, binEntries),
      path.join(nodeModulesDirectory, '.bin', name),
    );
  } else if (typeof binEntries === 'object') {
    for (const name of Object.keys(binEntries)) {
      await link(
        path.join(packageDirectory, binEntries[name]),
        path.join(nodeModulesDirectory, '.bin', name),
      );
    }
  }
};

export { bin as default };
