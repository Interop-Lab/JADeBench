import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value =>
  value.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, '%$1%');

const convertToSetCommands = variables => variables
  ? `${variables
    .trim()
    .split(/\s+/)
    .map(variable => `@SET ${replaceDollarWithPercentPair(variable)}`)
    .join('\r\n')}\r\n`
  : '';

const rm = path => unlink(path).catch(() => {});

const writeShim = async (from, to, prog, args = '', variables = '') => {
  const shTarget = relative(dirname(to), from);
  const target = shTarget.split('/').join('\\');
  const longProg = `"$basedir/${prog}"`;
  const shProg = prog && prog.startsWith('/') ? prog : longProg;

  const sh = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

if [ -x ${shProg} ]; then
  exec ${variables} ${shProg} ${args} "$basedir/${shTarget}" "$@"
else
  exec ${variables} ${prog} ${args} "$basedir/${shTarget}" "$@"
fi
`;

  const cmdVariables = convertToSetCommands(variables);
  const cmd = `@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0
${cmdVariables}IF EXIST "%dp0%\\${prog}.exe" (
  SET "_prog=%dp0%\\${prog}.exe"
) ELSE (
  SET "_prog=${prog}"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" ${args} "%dp0%\\${target}" %*
`;

  const pwsh = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node are installed
  # in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/${prog}$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${prog}$exe" ${args} "$basedir/${shTarget}" $args
  } else {
    & "$basedir/${prog}$exe" ${args} "$basedir/${shTarget}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${prog}$exe" ${args} "$basedir/${shTarget}" $args
  } else {
    & "${prog}$exe" ${args} "$basedir/${shTarget}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;

  await Promise.all([
    writeFile(to, sh, 'utf8'),
    writeFile(`${to}.cmd`, cmd, 'utf8'),
    writeFile(`${to}.ps1`, pwsh, 'utf8'),
  ]);
  await chmod(to, 0o755);
};

const prepare = async (from, to) => {
  const [source] = await Promise.all([
    readFile(from, 'utf8'),
    mkdir(dirname(to), { recursive: true }),
  ]);
  const firstLine = source.trim().split(/\r?\n/, 1)[0];
  const shebang = firstLine.match(shebangExpr);

  if (!shebang) {
    throw new Error(`No shebang found in ${from}`);
  }

  const variables = shebang[1] || '';
  const prog = shebang[2];
  const args = shebang[3] || '';
  await writeShim(from, to, prog, args, variables);
};

const cmdShim = async (from, to) => {
  await stat(from);
  await Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]);
  await prepare(from, to);
};

export default cmdShim;
