import fs from 'fs';
import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'fs/promises';
import path, { dirname, relative } from 'path';

const shebangExpression =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const commandHeader =
  [
    '@ECHO off',
    'GOTO start',
    ':find_dp0',
    'SET dp0=%~dp0',
    'EXIT /b',
    ':start',
    'SETLOCAL',
    'CALL :find_dp0',
  ].join('\r\n') + '\r\n';

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

function replaceDollarWithPercentPair(value) {
  const variableExpression = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let lastIndex = 0;
  let match;

  do {
    match = variableExpression.exec(value);
    if (match) {
      result += `${value.substring(lastIndex, match.index) || ''}%${match[1]}%`;
      lastIndex = variableExpression.lastIndex;
    }
  } while (variableExpression.lastIndex > 0);

  return result + value.slice(lastIndex);
}

function convertToSetCommands(assignments) {
  let result = '';

  for (const assignment of assignments.split(' ')) {
    const [rawName, rawValue] = assignment.split('=');
    const name = (rawName || '').trim();
    const value = (rawValue || '').trim();

    if (name && value) {
      result += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return result;
}

const remove = filePath => unlink(filePath).catch(() => {});

function createCommandShim(
  interpreter,
  interpreterArgs,
  environment,
  windowsScriptPath,
  localInterpreter,
) {
  const command = localInterpreter
    ? [
        commandHeader,
        convertToSetCommands(environment),
        `\r\nIF EXIST ${localInterpreter} (\r\n`,
        `  SET "_prog=${localInterpreter.replace(/(^")|("$)/g, '')}"\r\n`,
        ') ELSE (\r\n',
        `  SET "_prog=${interpreter.replace(/(^")|("$)/g, '')}"\r\n`,
        ')\r\n\r\n',
        'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & ',
        'set PATHEXT=%PATHEXT:;.JS;=;% & ',
        `"%_prog%" ${interpreterArgs} ${windowsScriptPath} %*\r\n`,
      ].join('')
    : `${commandHeader}${interpreter} ${interpreterArgs} ${windowsScriptPath} %*\r\n`;

  return command;
}

function createShellShim(
  command,
  interpreterArgs,
  environment,
  unixScriptPath,
  localInterpreter,
) {
  if (!localInterpreter) {
    return `${shellHeader}exec ${command} ${interpreterArgs} ${unixScriptPath} "$@"\n`;
  }

  const executableCommand = localInterpreter.replace(/"$/, '.exe"');
  return (
    shellHeader +
    `PROG_EXE=${executableCommand}\n` +
    'if ! [ -x "$PROG_EXE" ]; then\n' +
    `  PROG_EXE=${localInterpreter}\n` +
    '  if ! [ -x "$PROG_EXE" ]; then\n' +
    `    PROG_EXE=${command}\n` +
    '    if ! [ -x "$PROG_EXE" ]; then\n' +
    `      PROG_EXE=${command}.exe\n` +
    '    fi\n' +
    '  fi\n' +
    'fi\n\n' +
    `exec ${environment}"$PROG_EXE" ${interpreterArgs} ${unixScriptPath} "$@"\n`
  );
}

function createPowershellShim(
  command,
  interpreterArgs,
  powershellScriptPath,
  localInterpreter,
) {
  if (localInterpreter) {
    return (
      powershellHeader +
      '$ret=0\n' +
      `if (Test-Path ${localInterpreter}) {\n` +
      '  # Support pipeline input\n' +
      '  if ($MyInvocation.ExpectingInput) {\n' +
      `    $input | & ${localInterpreter} ${interpreterArgs} ${powershellScriptPath} $args\n` +
      '  } else {\n' +
      `    & ${localInterpreter} ${interpreterArgs} ${powershellScriptPath} $args\n` +
      '  }\n' +
      '  $ret=$LASTEXITCODE\n' +
      '} else {\n' +
      '  # Support pipeline input\n' +
      '  if ($MyInvocation.ExpectingInput) {\n' +
      `    $input | & ${command} ${interpreterArgs} ${powershellScriptPath} $args\n` +
      '  } else {\n' +
      `    & ${command} ${interpreterArgs} ${powershellScriptPath} $args\n` +
      '  }\n' +
      '  $ret=$LASTEXITCODE\n' +
      '}\n' +
      'exit $ret\n'
    );
  }

  return (
    powershellHeader +
    '# Support pipeline input\n' +
    'if ($MyInvocation.ExpectingInput) {\n' +
    `  $input | & ${command} ${interpreterArgs} ${powershellScriptPath} $args\n` +
    '} else {\n' +
    `  & ${command} ${interpreterArgs} ${powershellScriptPath} $args\n` +
    '}\n' +
    'exit $LASTEXITCODE\n'
  );
}

function writeShim(
  sourcePath,
  shimPath,
  interpreter,
  interpreterArgs = '',
  environment = '',
) {
  let relativeUnixPath = relative(dirname(shimPath), sourcePath)
    .split('\\')
    .join('/');
  let relativeWindowsPath = relativeUnixPath.split('/').join('\\');
  let powershellScriptPath = relativeUnixPath;
  let normalizedInterpreter = interpreter && interpreter.split('\\').join('/');
  let shellCommand = normalizedInterpreter && `"${normalizedInterpreter}$exe"`;
  let localCommandInterpreter;
  let localShellInterpreter;
  let localPowershellInterpreter;

  if (!interpreter) {
    interpreter = `"%dp0%\\${relativeWindowsPath}"`;
    normalizedInterpreter = `"$basedir/${relativeUnixPath}"`;
    shellCommand = normalizedInterpreter;
    interpreterArgs = '';
    relativeWindowsPath = '';
    powershellScriptPath = '';
    relativeUnixPath = '';
  } else {
    interpreterArgs = interpreterArgs.trim();
    localCommandInterpreter = `"%dp0%\\${interpreter}.exe"`;
    localShellInterpreter = `"$basedir/${interpreter}"`;
    localPowershellInterpreter = `"$basedir/${interpreter}$exe"`;
    relativeUnixPath = `"$basedir_win/${relativeUnixPath}"`;
    relativeWindowsPath = `"%dp0%\\${relativeWindowsPath}"`;
    powershellScriptPath = `"$basedir/${powershellScriptPath}"`;
  }

  const commandShim = createCommandShim(
    interpreter,
    interpreterArgs,
    environment,
    relativeWindowsPath,
    localCommandInterpreter,
  );
  const shellShim = createShellShim(
    normalizedInterpreter,
    interpreterArgs,
    environment,
    relativeUnixPath,
    localShellInterpreter,
  );
  const powershellShim = createPowershellShim(
    shellCommand,
    interpreterArgs,
    powershellScriptPath,
    localPowershellInterpreter,
  );

  return Promise.all([
    writeFile(`${shimPath}.ps1`, powershellShim, 'utf8'),
    writeFile(`${shimPath}.cmd`, commandShim, 'utf8'),
    writeFile(shimPath, shellShim, 'utf8'),
  ]).then(() =>
    Promise.all([
      chmod(shimPath, 0o755),
      chmod(`${shimPath}.cmd`, 0o755),
      chmod(`${shimPath}.ps1`, 0o755),
    ]),
  );
}

const mkdirOptions = { recursive: true };

const prepare = (sourcePath, shimPath) =>
  mkdir(dirname(shimPath), mkdirOptions)
    .then(() => readFile(sourcePath, 'utf8'))
    .then(
      source => {
        const firstLine = source.trim().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpression);

        if (!shebang) return writeShim(sourcePath, shimPath);
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

const cmdShim = (sourcePath, shimPath) =>
  stat(sourcePath)
    .then(() =>
      Promise.all([
        remove(shimPath),
        remove(`${shimPath}.cmd`),
        remove(`${shimPath}.ps1`),
      ]),
    )
    .then(() => prepare(sourcePath, shimPath));

const nodeModulesDirectory = path.join(process.cwd(), 'node_modules');
const isWindows = process.platform === 'win32';

async function link(sourcePath, destinationPath) {
  if (isWindows) {
    await cmdShim(sourcePath, destinationPath);
    return;
  }

  try {
    fs.unlinkSync(destinationPath);
  } catch {}

  fs.symlinkSync(sourcePath, destinationPath);
  fs.chmodSync(sourcePath, '0755');
}

async function bin(packageName, packageDirectory, binSpec) {
  if (binSpec === undefined) {
    const packageJson = JSON.parse(
      await readFile(path.join(packageDirectory, 'package.json')),
    );
    binSpec = packageJson.bin;
  }

  if (!binSpec) return;

  fs.mkdirSync(path.join(nodeModulesDirectory, '.bin'), { recursive: true });

  if (typeof binSpec === 'string') {
    const executableName = packageName.charAt(0) === '@'
      ? packageName.split('/')[1]
      : packageName;
    await link(
      path.join(packageDirectory, binSpec),
      path.join(nodeModulesDirectory, '.bin', executableName),
    );
  } else if (typeof binSpec === 'object') {
    for (const executableName of Object.keys(binSpec)) {
      await link(
        path.join(packageDirectory, binSpec[executableName]),
        path.join(nodeModulesDirectory, '.bin', executableName),
      );
    }
  }
}

export default bin;
