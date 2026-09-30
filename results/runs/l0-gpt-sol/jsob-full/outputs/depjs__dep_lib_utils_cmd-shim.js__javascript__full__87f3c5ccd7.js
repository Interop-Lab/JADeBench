import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value =>
  value.replace(/\$\{?([^$@#?\- \t{}:]+)\}?/g, '%$1%');

const convertToSetCommands = variables => {
  let result = '';

  for (const assignment of variables.split(' ')) {
    const [rawKey, rawValue] = assignment.split('=');
    const key = (rawKey || '').trim();
    const value = (rawValue || '').trim();

    if (key && value) {
      result += `@SET ${key}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return result;
};

const convertToPowerShellCommands = variables => {
  let result = '';

  for (const assignment of variables.split(' ')) {
    const separator = assignment.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = assignment.slice(0, separator).trim();
    const value = assignment.slice(separator + 1).trim();

    if (key && value) {
      const escaped = value.replace(/'/g, "''");
      result += `$env:${key}='${escaped}'\n`;
    }
  }

  return result;
};

const rm = path => unlink(path).catch(() => {});

const writeShim = (from, to, program, args, variables) => {
  const relativeTarget = relative(dirname(to), from).split('\\').join('/');
  const windowsTarget = relativeTarget.split('/').join('\\');
  const shellProgram = program && program.split('\\').join('/');

  args = args || '';
  variables = variables || '';

  let commandShim;
  let shellShim;
  let powershellShim;

  if (!program) {
    commandShim = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%dp0%\\${windowsTarget}" %*\r
`;

    shellShim = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

exec "$basedir/${relativeTarget}" "$@"
`;

    powershellShim = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$ret=0
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${relativeTarget}" $args
} else {
  & "$basedir/${relativeTarget}" $args
}
$ret=$LASTEXITCODE
exit $ret
`;
  } else {
    const commandVariables = convertToSetCommands(variables);
    const shellVariables = variables ? `${variables} ` : '';
    const powershellVariables = convertToPowerShellCommands(variables);

    commandShim = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${commandVariables}IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\r
)\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"${args} "%dp0%\\${windowsTarget}" %*\r
`;

    shellShim = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

if [ -x "$basedir/${shellProgram}" ]; then
  exec ${shellVariables}"$basedir/${shellProgram}"${args} "$basedir/${relativeTarget}" "$@"
else
  exec ${shellVariables}${shellProgram}${args} "$basedir/${relativeTarget}" "$@"
fi
`;

    powershellShim = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  $exe=".exe"
}
${powershellVariables}$ret=0
if (Test-Path "$basedir/${shellProgram}$exe") {
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${shellProgram}$exe"${args} "$basedir/${relativeTarget}" $args
  } else {
    & "$basedir/${shellProgram}$exe"${args} "$basedir/${relativeTarget}" $args
  }
  $ret=$LASTEXITCODE
} else {
  if ($MyInvocation.ExpectingInput) {
    $input | & "${shellProgram}$exe"${args} "$basedir/${relativeTarget}" $args
  } else {
    & "${shellProgram}$exe"${args} "$basedir/${relativeTarget}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
  }

  return Promise.all([
    writeFile(`${to}.ps1`, powershellShim, 'utf8'),
    writeFile(`${to}.cmd`, commandShim, 'utf8'),
    writeFile(to, shellShim, 'utf8'),
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
      source => {
        const firstLine = source.toString().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpr);

        if (!shebang) {
          return writeShim(from, to);
        }

        return writeShim(
          from,
          to,
          shebang[2],
          shebang[3] || '',
          shebang[1] || '',
        );
      },
      () => writeShim(from, to),
    );

const cmdShim = (from, to) =>
  stat(from)
    .then(() =>
      Promise.all([
        rm(to),
        rm(`${to}.cmd`),
        rm(`${to}.ps1`),
      ]),
    )
    .then(() => prepare(from, to));

export default cmdShim;
