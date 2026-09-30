import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = (value) => {
  const variableExpr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = variableExpr.exec(value))) {
    result += `${value.substring(lastIndex, match.index)}%${match[1]}%`;
    lastIndex = variableExpr.lastIndex;
  }

  return result + value.slice(lastIndex);
};

const convertToSetCommands = (variables) => {
  let commands = '';

  for (const variable of variables.split(' ')) {
    const [key, value] = variable.trim().split('=');
    if (key && value) {
      commands += `@SET ${key}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return commands;
};

const rm = (path) => unlink(path).catch(() => {});

const writeShim = (from, to, prog, args = '', variables = '') => {
  args = args.trim();

  const shTarget = relative(dirname(to), from);
  const target = shTarget.split('\\').join('/');
  const targetWin = shTarget.split('/').join('\\');
  const escapedProg = prog && prog.replace(/\\/g, '\\\\');
  const quotedProg = prog && `"${escapedProg}"`;
  const cmdLocalProg = prog && `"%dp0%\\${escapedProg}.exe"`;
  const cmdTarget = `"%dp0%\\${targetWin}"`;
  const shTargetPath = `"$basedir/${target}"`;
  const shTargetWinPath = `"$basedir_win/${target}"`;

  const cmdCommand = prog
    ? `\r
IF EXIST ${cmdLocalProg} (\r
  SET "_prog=${cmdLocalProg.replace(/(^")|("$)/g, '')}"\r
) ELSE (\r
  SET "_prog=${quotedProg.replace(/(^")|("$)/g, '')}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"`
    : cmdTarget;

  const cmd = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${convertToSetCommands(variables)}${cmdCommand} ${args} ${prog ? cmdTarget : ''} %*\r
`;

  const shHeader = `#!/bin/sh
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

  const shProgram = prog
    ? `PROG_EXE="$basedir/${escapedProg}.exe"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE="$basedir/${escapedProg}"
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${escapedProg}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${escapedProg}.exe
    fi
  fi
fi

exec `
    : 'exec ';

  const sh = `${shHeader}${shProgram}${variables}${
    prog ? '"$PROG_EXE"' : shTargetPath
  } ${args} ${prog ? shTargetWinPath : ''} "$@"
`;

  const pwshHeader = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
`;

  const pwsh = prog
    ? `${pwshHeader}$ret=0
if (Test-Path "$basedir/${escapedProg}$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${escapedProg}$exe" ${args} "$basedir/${target}" $args
  } else {
    & "$basedir/${escapedProg}$exe" ${args} "$basedir/${target}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${escapedProg}$exe" ${args} "$basedir/${target}" $args
  } else {
    & "${escapedProg}$exe" ${args} "$basedir/${target}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`
    : `${pwshHeader}# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${target}" ${args}  $args
} else {
  & "$basedir/${target}" ${args}  $args
}
exit $LASTEXITCODE
`;

  return Promise.all([
    writeFile(to, sh, 'utf8'),
    writeFile(`${to}.cmd`, cmd, 'utf8'),
    writeFile(`${to}.ps1`, pwsh, 'utf8'),
  ]).then(() =>
    Promise.all([
      chmod(to, 0o755),
      chmod(`${to}.cmd`, 0o755),
      chmod(`${to}.ps1`, 0o755),
    ]),
  );
};

const prepare = (from, to) =>
  mkdir(dirname(to), { recursive: true }).then(() =>
    readFile(from, 'utf8').then((source) => {
      const firstLine = source.trim().split(/\r*\n/)[0];
      const shebang = firstLine.match(shebangExpr);

      if (!shebang) {
        return writeShim(from, to);
      }

      const [, variables, prog, args] = shebang;
      return writeShim(from, to, prog, args, variables);
    }),
  );

const cmdShim = (from, to) =>
  stat(from)
    .then(() => Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]))
    .then(() => prepare(from, to));

export default cmdShim;
