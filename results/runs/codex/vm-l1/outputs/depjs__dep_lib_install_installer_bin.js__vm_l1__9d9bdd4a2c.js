import { chmod, readFile, unlink, writeFile } from 'fs/promises';
import { basename, dirname, join, relative } from 'path';
import { symlink } from 'fs/promises';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value =>
  value.replace(/\$(\w+|\{[^}]+\})/g, (_match, name) => `%${name.replace(/^\{|\}$/g, '')}%`);

const convertToSetCommands = variables => {
  if (!variables) return '';
  return variables
    .trim()
    .split(/\s+/)
    .filter(variable => variable.includes('='))
    .map(variable => `@SET ${replaceDollarWithPercentPair(variable)}\r\n`)
    .join('');
};

const rm = async path => {
  try {
    await unlink(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const shellBase = `#!/bin/sh
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

const commandBase = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
`;

const powershellBase = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
`;

const prepare = (_from, to) => Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]);

const writeShim = async (from, to, command, args, variables) => {
  const script = relative(dirname(to), from).replace(/\\/g, '/');
  const windowsScript = script.replace(/\//g, '\\');
  const program = basename(command);
  const commandArgs = args.trim();
  const shellVariables = variables.trim();
  const setCommands = convertToSetCommands(variables);

  let shell;
  let cmd;
  let powershell;
  if (command) {
    shell = `${shellBase}PROG_EXE="$basedir/${program}.exe"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE="$basedir/${program}"
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${program}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${program}.exe
    fi
  fi
fi

exec ${shellVariables ? `${shellVariables} ` : ''}"$PROG_EXE" ${commandArgs} "$basedir_win/${script}" "$@"
`;
    cmd = `${commandBase}${setCommands ? `${setCommands}\r\n` : '\r\n'}IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${commandArgs} "%dp0%\\${windowsScript}" %*\r
`;
    const invoke = executable => `  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${executable}" ${commandArgs} "$basedir/${script}" $args
  } else {
    & "${executable}" ${commandArgs} "$basedir/${script}" $args
  }`;
    powershell = `${powershellBase}$ret=0
if (Test-Path "$basedir/${program}$exe") {
${invoke(`$basedir/${program}$exe`)}
  $ret=$LASTEXITCODE
} else {
${invoke(`${program}$exe`)}
  $ret=$LASTEXITCODE
}
exit $ret
`;
  } else {
    shell = `${shellBase}exec "$basedir/${script}"   "$@"
`;
    cmd = `${commandBase}"%dp0%\\${windowsScript}"   %*\r
`;
    powershell = `${powershellBase}# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${script}"   $args
} else {
  & "$basedir/${script}"   $args
}
exit $LASTEXITCODE
`;
  }

  return Promise.all([
    writeFile(to, shell, { mode: 0o755 }),
    writeFile(`${to}.cmd`, cmd, { mode: 0o755 }),
    writeFile(`${to}.ps1`, powershell, { mode: 0o755 }),
  ]);
};

const cmdShim = async (from, to) => {
  await prepare(from, to);
  const source = await readFile(from, 'utf8');
  const match = source.split(/\r?\n/, 1)[0].match(shebangExpr);
  if (!match) return writeShim(from, to, '', '', '');
  return writeShim(from, to, match[2], match[3] || '', match[1] || '');
};

const nm_default = join(process.cwd(), 'node_modules');
const isWin = process.platform === 'win32';

const link = async (from, to) => {
  await rm(to);
  await symlink(from, to);
};

const bin = async (name, packageDirectory, executable) => {
  const from = join(packageDirectory, executable);
  const to = join(nm_default, '.bin', name);
  await chmod(from, 0o755);
  return isWin ? cmdShim(from, to) : link(from, to);
};

Object.assign(globalThis, {
  shebangExpr,
  replaceDollarWithPercentPair,
  convertToSetCommands,
  rm,
  writeShim,
  prepare,
  cmdShim,
  cmd_shim_default: cmdShim,
  nm_default,
  isWin,
  link,
  bin,
  bin_default: bin,
});

export { bin as default };
