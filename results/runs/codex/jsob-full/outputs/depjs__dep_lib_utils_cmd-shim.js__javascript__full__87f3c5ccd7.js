import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const mkdirOptions = { recursive: true };
const shebangExpression = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(value) {
  return value.replace(/\$\{?([^$@#?\- \t{}:]+)\}?/g, (_, name) => `%${name}%`);
}

function convertToSetCommands(environment) {
  let result = '';
  for (const assignment of environment.split(' ')) {
    const [name, value] = assignment.split('=');
    const key = (name || '').trim();
    const val = (value || '').trim();
    if (key && val) result += `@SET ${key}=${replaceDollarWithPercentPair(val)}\r\n`;
  }
  return result;
}

const remove = path => unlink(path).catch(() => {});

function writeShim(source, target, program = '', args = '', environment = '') {
  const targetDirectory = dirname(target);
  const scriptPath = relative(targetDirectory, source);
  const windowsPath = scriptPath.replace(/\\/g, '\\\\');
  const shellPath = scriptPath.replace(/\\/g, '/');
  const env = convertToSetCommands(environment);

  const powershell = program ? `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/${program}$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${program}$exe"${args} "$basedir/${shellPath}" $args
  } else {
    & "$basedir/${program}$exe"${args} "$basedir/${shellPath}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${program}$exe"${args} "$basedir/${shellPath}" $args
  } else {
    & "${program}$exe"${args} "$basedir/${shellPath}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
` : `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${shellPath}"   $args
} else {
  & "$basedir/${shellPath}"   $args
}
exit $LASTEXITCODE
`;
  const commandFile = program ? `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${env}\r
IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"${args} "%dp0%\\${windowsPath}" %*\r
` : `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
"%dp0%\\${windowsPath}"   %*\r
`;
  const shellPrelude = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")
basedir_win="$basedir"

case \`uname -a\` in
  *CYGWIN*|*MINGW*|*MSYS*)
    if command -v cygpath > /dev/null 2>&1; then
      basedir_win=\`cygpath -w "$basedir"\`
    fi
  ;;
  *WSL2*)
    if command -v wslpath > /dev/null 2>&1; then
      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"
      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then
        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2
        exit 1
      fi
    fi
  ;;
esac
`;
  const shell = program ? `${shellPrelude}
PROG_EXE="$basedir/${program}.exe"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE="$basedir/${program}"
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${program}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${program}.exe
    fi
  fi
fi

exec ${environment}"$PROG_EXE"${args} "$basedir_win/${shellPath}" "$@"
` : `${shellPrelude}
exec "$basedir/${shellPath}"   "$@"
`;
  return Promise.all([
    writeFile(`${target}.ps1`, powershell, 'utf8'),
    writeFile(`${target}.cmd`, commandFile, 'utf8'),
    writeFile(target, shell, 'utf8')
  ]).then(() => Promise.all([
    chmod(target, 0o755), chmod(`${target}.cmd`, 0o666), chmod(`${target}.ps1`, 0o666)
  ]));
}

const prepare = (source, target) => mkdir(dirname(target), mkdirOptions)
  .then(() => readFile(source, 'utf8'))
  .then(contents => {
    const firstLine = contents.trim().split(/\r*\n/)[0];
    const match = firstLine.match(shebangExpression);
    if (!match) return writeShim(source, target);
    return writeShim(source, target, match[2], match[3] || '', match[1] || '');
  }, () => writeShim(source, target));

const cmdShim = (source, target) => stat(source)
  .then(() => Promise.all([remove(target), remove(`${target}.cmd`), remove(`${target}.ps1`)]))
  .then(() => prepare(source, target));

export { cmdShim as default };
