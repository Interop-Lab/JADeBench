import {
  chmod,
  mkdir,
  readFile,
  stat,
  symlink,
  unlink,
  writeFile,
} from 'fs/promises';
import path, { dirname, join, relative } from 'path';

const shebangPattern =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const binDirectory = path.join(process.cwd(), 'node_modules/.bin');
const isWindows = process.platform === 'win32';

async function removeIfPresent(file) {
  await unlink(file).catch(() => {});
}

function shellTarget(from, to) {
  return relative(dirname(to), from).replaceAll('\\', '/');
}

function windowsTarget(from, to) {
  return relative(dirname(to), from).replaceAll('/', '\\');
}

function quoteCmdEnvironment(environment) {
  if (!environment.trim()) return '';

  return environment
    .trim()
    .split(/\s+/)
    .map((assignment) => {
      const separator = assignment.indexOf('=');
      const name = assignment.slice(0, separator);
      const value = assignment.slice(separator + 1).replace(/\$\{?([^$@#?\- \t{}:]+)\}?/g, '%$1%');
      return `SET "${name}=${value}"\r\n`;
    })
    .join('');
}

async function writeWindowsShims(from, to, interpreter, interpreterArgs, environment) {
  const shPath = shellTarget(from, to);
  const cmdPath = windowsTarget(from, to);
  const executable = interpreter || 'node';
  const argumentsText = interpreterArgs.trim();
  const commandEnvironment = quoteCmdEnvironment(environment);
  const shellEnvironment = environment.trim();

  const sh = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

if [ -x "$basedir/${executable}" ]; then
  exec ${shellEnvironment} "$basedir/${executable}" ${argumentsText} "$basedir/${shPath}" "$@"
else
  exec ${shellEnvironment} ${executable} ${argumentsText} "$basedir/${shPath}" "$@"
fi
`;

  const cmd = `@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0
${commandEnvironment}
IF EXIST "%dp0%\\${executable}.exe" (
  SET "_prog=%dp0%\\${executable}.exe"
) ELSE (
  SET "_prog=${executable}"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" ${argumentsText} "%dp0%\\${cmdPath}" %*
`;

  const ps1 = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  $exe=".exe"
}

$ret=0
if (Test-Path "$basedir/${executable}$exe") {
  & "$basedir/${executable}$exe" ${argumentsText} "$basedir/${shPath}" $args
  $ret=$LASTEXITCODE
} else {
  & "${executable}$exe" ${argumentsText} "$basedir/${shPath}" $args
  $ret=$LASTEXITCODE
}
exit $ret
`;

  await Promise.all([
    writeFile(to, sh, 'utf8'),
    writeFile(`${to}.cmd`, cmd, 'utf8'),
    writeFile(`${to}.ps1`, ps1, 'utf8'),
  ]);
  await Promise.all([
    chmod(to, 0o755),
    chmod(`${to}.cmd`, 0o755),
    chmod(`${to}.ps1`, 0o755),
  ]);
}

async function createWindowsShim(from, to) {
  await mkdir(dirname(to), { recursive: true });

  try {
    const firstLine = (await readFile(from, 'utf8')).split(/\r?\n/, 1)[0];
    const shebang = firstLine.match(shebangPattern);
    if (shebang) {
      await writeWindowsShims(from, to, shebang[2], shebang[3] || '', shebang[1] || '');
      return;
    }
  } catch {
    // A missing or unreadable source still gets a standard Node shim.
  }

  await writeWindowsShims(from, to, undefined, '', '');
}

async function linkExecutable(from, to) {
  if (isWindows) {
    await stat(from);
    await Promise.all([
      removeIfPresent(to),
      removeIfPresent(`${to}.cmd`),
      removeIfPresent(`${to}.ps1`),
    ]);
    await createWindowsShim(from, to);
    return;
  }

  await removeIfPresent(to);
  await symlink(from, to);
  await chmod(from, 0o755);
}

function defaultBinName(packageName) {
  return packageName.startsWith('@') ? packageName.split('/')[1] : packageName;
}

async function bin(packageName, packageDirectory, bins) {
  if (bins === undefined) {
    const manifest = JSON.parse(await readFile(join(packageDirectory, 'package.json')));
    bins = manifest.bin;
  }

  if (!bins) return;

  await mkdir(join(binDirectory, '..'), { recursive: true });

  if (typeof bins === 'string') {
    await linkExecutable(
      join(packageDirectory, bins),
      join(binDirectory, defaultBinName(packageName)),
    );
    return;
  }

  if (typeof bins === 'object') {
    for (const name of Object.keys(bins)) {
      await linkExecutable(join(packageDirectory, bins[name]), join(binDirectory, name));
    }
  }
}

export default bin;
