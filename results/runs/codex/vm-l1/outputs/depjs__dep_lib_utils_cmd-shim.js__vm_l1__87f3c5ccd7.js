import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
const dollarExpr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;

const replaceDollarWithPercentPair = value => {
  let result = '';
  let previousIndex = 0;
  let match;

  while ((match = dollarExpr.exec(value))) {
    result += `${value.substring(previousIndex, match.index)}%${match[1]}%`;
    previousIndex = dollarExpr.lastIndex;
  }

  return result + value.slice(previousIndex);
};

const convertToSetCommands = variables => {
  let result = '';

  for (const variable of variables.trim().split(' ')) {
    const [name, value] = variable.split('=');
    if (name && value) {
      result += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return result;
};

const rm = path => unlink(path).catch(() => {});

const writeShim = (from, to, prog, args, variables) => {
  const shTarget = relative(dirname(to), from).split('\\').join('/');
  const cmdTarget = shTarget.split('/').join('\\');
  const shProg = prog && prog.split('\\').join('/');
  const commandVariables = convertToSetCommands(variables || '');
  const shellVariables = variables || '';
  const programArgs = (args || '').trim();

  let cmd;
  let sh;
  let pwsh;

  if (prog) {
    const cmdLocalProg = `"%dp0%\\${prog}.exe"`;
    const shLocalProg = `"$basedir/${shProg}"`;
    const shLocalProgExe = `"$basedir/${shProg}.exe"`;
    const pwshLocalProg = `"$basedir/${shProg}$exe"`;
    const pwshSystemProg = `"${shProg}$exe"`;

    cmd = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${commandVariables}\r
IF EXIST ${cmdLocalProg} (\r
  SET "_prog=${cmdLocalProg.replace(/(^")|("$)/g, '')}"\r
) ELSE (\r
  SET "_prog=${prog}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${programArgs} "%dp0%\\${cmdTarget}" %*\r
`;

    sh = `#!/bin/sh
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

PROG_EXE=${shLocalProgExe}
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE=${shLocalProg}
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${shProg}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${shProg}.exe
    fi
  fi
fi

exec ${shellVariables}"$PROG_EXE" ${programArgs} "$basedir_win/${shTarget}" "$@"
`;

    pwsh = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path ${pwshLocalProg}) {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshLocalProg} ${programArgs} "$basedir/${shTarget}" $args
  } else {
    & ${pwshLocalProg} ${programArgs} "$basedir/${shTarget}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshSystemProg} ${programArgs} "$basedir/${shTarget}" $args
  } else {
    & ${pwshSystemProg} ${programArgs} "$basedir/${shTarget}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
  } else {
    const cmdProgram = `"%dp0%\\${cmdTarget}"`;
    const shProgram = `"$basedir/${shTarget}"`;

    cmd = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${cmdProgram} ${programArgs}  %*\r
`;

    sh = `#!/bin/sh
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

exec ${shProgram} ${programArgs}  "$@"
`;

    pwsh = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & ${shProgram} ${programArgs}  $args
} else {
  & ${shProgram} ${programArgs}  $args
}
exit $LASTEXITCODE
`;
  }

  return Promise.all([
    writeFile(to, sh, 'utf8'),
    writeFile(`${to}.cmd`, cmd, 'utf8'),
    writeFile(`${to}.ps1`, pwsh, 'utf8'),
  ]).then(() => Promise.all([
    chmod(to, 0o755),
    chmod(`${to}.cmd`, 0o755),
    chmod(`${to}.ps1`, 0o755),
  ]));
};

const prepare = (from, to) => mkdir(dirname(to), { recursive: true })
  .then(() => readFile(from, 'utf8'))
  .then(data => {
    const firstLine = data.trim().split(/\r?\n/)[0];
    const shebang = firstLine.match(shebangExpr);

    if (!shebang) return writeShim(from, to);
    return writeShim(from, to, shebang[2], shebang[3], shebang[1]);
  });

const cmdShim = (from, to) => stat(from)
  .then(() => Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]))
  .then(() => prepare(from, to));

export { cmdShim as default };
