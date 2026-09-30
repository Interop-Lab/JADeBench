import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value =>
  value.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, '%$1%');

const convertToSetCommands = environment =>
  environment
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(variable => `set ${variable}`)
    .join('\r\n');

const rm = async path => {
  try {
    await unlink(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const writeShim = async (path, content, mode = 0o755, encoding = 'utf8', createDirectory = true) => {
  if (createDirectory) await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, { encoding, mode });
  await chmod(path, mode);
};

const prepare = async (from, to) => {
  const source = await readFile(from, 'utf8');
  const match = source.match(shebangExpr);
  const environment = match?.[1]?.trim() ?? '';
  const command = match?.[2] ?? 'node';
  const argumentsText = match?.[3]?.trim() ?? '';
  const target = relative(dirname(to), from).replace(/\\/g, '/');
  const targetFromDirectory = target.startsWith('.') ? target : `./${target}`;
  const commandArguments = argumentsText ? ` ${argumentsText}` : '';
  const isNode = /(?:^|[\\/])node(?:\.exe)?$/.test(command) || command === 'nodejs';
  const unixCommand = isNode ? 'node' : command;
  const windowsCommand = isNode ? 'node.exe' : command;
  const envUnix = environment
    .split(/\s+/)
    .filter(Boolean)
    .map(value => `export ${value}`)
    .join('\n');
  const envWindows = convertToSetCommands(environment);

  const unix = `#!/bin/sh
${envUnix ? `${envUnix}\n` : ''}basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")
case "$(uname)" in
  *CYGWIN*|*MINGW*|*MSYS*) basedir=$(cygpath -w "$basedir") ;;
esac
if [ -x "$basedir/${unixCommand}" ]; then
  exec "$basedir/${unixCommand}" "$basedir/${targetFromDirectory}"${commandArguments} "$@"
else
  exec ${unixCommand} "$basedir/${targetFromDirectory}"${commandArguments} "$@"
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
${envWindows ? `${envWindows}\r\n` : ''}IF EXIST "%dp0%\\${windowsCommand}" (\r
  "%dp0%\\${windowsCommand}" "%dp0%\\${target.replace(/\//g, '\\\\')}"${commandArguments} %*\r
) ELSE (\r
  ${windowsCommand} "%dp0%\\${target.replace(/\//g, '\\\\')}"${commandArguments} %*\r
)
ENDLOCAL
`;

  const powershell = `$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
${environment
    .split(/\s+/)
    .filter(Boolean)
    .map(value => `$env:${value.replace(/=.*/, '')} = '${value.replace(/^[^=]*=/, '').replace(/'/g, "''")}'`)
    .join('\n')}
& "$basedir\\${windowsCommand}" "$basedir\\${target.replace(/\//g, '\\\\')}"${commandArguments} $args
exit $LASTEXITCODE
`;

  await Promise.all([
    writeShim(to, unix),
    writeShim(`${to}.cmd`, cmd),
    writeShim(`${to}.ps1`, powershell),
  ]);
};

const cmdShim = async (from, to) => {
  await stat(from);
  await prepare(from, to);
};

export { cmdShim as default };
