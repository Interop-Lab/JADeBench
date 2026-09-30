import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpression = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const cmdHeader = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
`;

const shellHeader = `#!/bin/sh
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

const powershellHeader = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
`;

function replaceVariablesForCmd(value) {
  const variableExpression = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let previousEnd = 0;
  let match;

  do {
    match = variableExpression.exec(value);
    if (match) {
      result += `${value.substring(previousEnd, match.index) || ''}%${match[1]}%`;
      previousEnd = variableExpression.lastIndex;
    }
  } while (variableExpression.lastIndex > 0);

  return result + value.slice(previousEnd);
}

function environmentToCmd(environment) {
  let commands = '';
  for (const declaration of environment.split(' ')) {
    const [rawName, rawValue] = declaration.split('=');
    const name = (rawName || '').trim();
    const value = (rawValue || '').trim();
    if (name && value) commands += `@SET ${name}=${replaceVariablesForCmd(value)}\r\n`;
  }
  return commands;
}

function ignoreMissing(path) {
  return unlink(path).catch(() => {});
}

function writeShim(source, destination, program, programArgs, environment) {
  let target = relative(dirname(destination), source).split('\\').join('/');
  let targetForCmd = target.split('/').join('\\');
  let targetForPowerShell = target;
  let shellProgram;
  let shellProgramWithExe;
  let shellTarget = program && program.split('\\').join('/');
  let powershellProgram;
  let powershellTarget = shellTarget && `"${shellTarget}$exe"`;
  let cmdProgram;

  programArgs = programArgs || '';
  environment = environment || '';
  const invocationArgs = programArgs || ' ';

  if (!program) {
    program = `"%dp0%\\${targetForCmd}"`;
    shellTarget = `"$basedir/${target}"`;
    powershellTarget = shellTarget;
    programArgs = '';
    targetForCmd = '';
    target = '';
    targetForPowerShell = '';
  } else {
    cmdProgram = `"%dp0%\\${program}.exe"`;
    program = `"%dp0%\\${targetForCmd}"`;
    targetForCmd = `"%dp0%\\${targetForCmd}"`;
    targetForPowerShell = `"$basedir/${targetForPowerShell}"`;
    target = `"$basedir_win/${target}"`;
    powershellTarget = `"${shellTarget}$exe"`;
    shellProgram = `"$basedir/${shellTarget}"`;
    shellProgramWithExe = `"$basedir/${shellTarget}$exe"`;
  }

  let cmd = cmdHeader + environmentToCmd(environment);
  if (cmdProgram) {
    cmd += `\r\nIF EXIST ${cmdProgram} (\r\n  SET "_prog=${cmdProgram.replace(/(^")|("$)/g, '')}"\r\n) ELSE (\r\n  SET "_prog=${shellTarget.replace(/(^")|("$)/g, '')}"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"${invocationArgs} ${targetForCmd} %*\r\n`;
  } else {
    cmd += `${program} ${programArgs} ${targetForCmd} %*\r\n`;
  }

  let shell = shellHeader;
  if (shellProgram) {
    shell += `PROG_EXE=${shellProgram.replace(/"$/, '.exe"')}\nif ! [ -x "$PROG_EXE" ]; then\n  PROG_EXE=${shellProgram}\n  if ! [ -x "$PROG_EXE" ]; then\n    PROG_EXE=${shellTarget}\n    if ! [ -x "$PROG_EXE" ]; then\n      PROG_EXE=${shellTarget}.exe\n    fi\n  fi\nfi\n\nexec ${environment}"$PROG_EXE"${invocationArgs} ${target} "$@"\n`;
  } else {
    shell += `exec ${shellTarget} ${programArgs} ${target} "$@"\n`;
  }

  let powershell = powershellHeader;
  if (shellProgramWithExe) {
    powershell += `$ret=0\nif (Test-Path ${shellProgramWithExe}) {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ${shellProgramWithExe}${invocationArgs} ${targetForPowerShell} $args\n  } else {\n    & ${shellProgramWithExe}${invocationArgs} ${targetForPowerShell} $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ${powershellTarget}${invocationArgs} ${targetForPowerShell} $args\n  } else {\n    & ${powershellTarget}${invocationArgs} ${targetForPowerShell} $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n`;
  } else {
    powershell += `# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & ${powershellTarget}${programArgs} ${targetForPowerShell}  $args\n} else {\n  & ${powershellTarget}${programArgs} ${targetForPowerShell}  $args\n}\nexit $LASTEXITCODE\n`;
  }

  return Promise.all([
    writeFile(`${destination}.ps1`, powershell, 'utf8'),
    writeFile(`${destination}.cmd`, cmd, 'utf8'),
    writeFile(destination, shell, 'utf8'),
  ]).then(() => Promise.all([
    chmod(destination, 0o755),
    chmod(`${destination}.cmd`, 0o755),
    chmod(`${destination}.ps1`, 0o755),
  ]));
}

function prepare(source, destination) {
  return mkdir(dirname(destination), { recursive: true })
    .then(() => readFile(source, 'utf8'))
    .then(content => {
      const firstLine = content.trim().split(/\r*\n/)[0];
      const shebang = firstLine.match(shebangExpression);
      if (!shebang) return writeShim(source, destination);
      return writeShim(source, destination, shebang[2], shebang[3] || '', shebang[1] || '');
    }, () => writeShim(source, destination));
}

function cmdShim(source, destination) {
  return stat(source)
    .then(() => Promise.all([
      ignoreMissing(destination),
      ignoreMissing(`${destination}.cmd`),
      ignoreMissing(`${destination}.ps1`),
    ]))
    .then(() => prepare(source, destination));
}

export default cmdShim;
