import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value => value.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, '%$1%');

const convertToSetCommands = variables => variables
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map(variable => `@SET ${replaceDollarWithPercentPair(variable)}\r\n`)
  .join('');

const rm = async path => {
  try {
    await unlink(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const shTemplate = (variables, program, args, target) => `#!/bin/sh
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

${program ? `PROG_EXE="$basedir/${program}.exe"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE="$basedir/${program}"
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${program}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${program}.exe
    fi
  fi
fi

exec ${variables}${variables ? ' ' : ''}"$PROG_EXE"${args || ' '} "$basedir_win/${target}" "$@"
` : `exec "$basedir/${target}" ${args}  "$@"
`}`;

const cmdTemplate = (variables, program, args, target) => `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${convertToSetCommands(variables)}${program ? `\r
IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"${args || ' '} "%dp0%\\${target.replaceAll('/', '\\')}" %*\r
` : `"%dp0%\\${target.replaceAll('/', '\\')}" ${args}  %*\r
`}`;

const ps1Template = (program, args, target) => `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
${program ? `$ret=0
if (Test-Path "$basedir/${program}$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${program}$exe"${args || ' '} "$basedir/${target}" $args
  } else {
    & "$basedir/${program}$exe"${args || ' '} "$basedir/${target}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${program}$exe"${args || ' '} "$basedir/${target}" $args
  } else {
    & "${program}$exe"${args || ' '} "$basedir/${target}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
` : `# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${target}" ${args}  $args
} else {
  & "$basedir/${target}" ${args}  $args
}
exit $LASTEXITCODE
`}`;

const writeShim = async (source, destination, variables, program, args) => {
  const destinationDirectory = dirname(destination);
  const target = relative(destinationDirectory, source).replaceAll('\\', '/');
  await mkdir(destinationDirectory, { recursive: true });
  await Promise.all([
    writeFile(destination, shTemplate(variables, program, args, target), 'utf8'),
    writeFile(`${destination}.cmd`, cmdTemplate(variables, program, args, target), 'utf8'),
    writeFile(`${destination}.ps1`, ps1Template(program, args, target), 'utf8'),
  ]);
  await Promise.all([
    chmod(destination, 0o755),
    chmod(`${destination}.cmd`, 0o755),
    chmod(`${destination}.ps1`, 0o755),
  ]);
};

const prepare = async (source, destination) => {
  const sourceStat = await stat(source);
  if (!sourceStat.isFile()) throw new Error(`${source} is not a file`);

  let variables = '';
  let program = '';
  let args = '';
  const firstLine = (await readFile(source, 'utf8')).split(/\r?\n/, 1)[0];
  const shebang = firstLine.match(shebangExpr);
  if (shebang) {
    variables = (shebang[1] || '').trim();
    program = shebang[2].replace(/^\/usr\/bin\//, '');
    args = shebang[3] || '';
  }

  await writeShim(source, destination, variables, program, args);
};

const cmdShim = async (source, destination) => {
  await Promise.all([rm(destination), rm(`${destination}.cmd`), rm(`${destination}.ps1`)]);
  await prepare(source, destination);
};

export default cmdShim;
