import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
const nm = path.join(process.cwd(), 'node_modules');
const isWin = process.platform === 'win32';

const replaceDollarWithPercentPair = value =>
  value.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, '%$1%');

const convertToSetCommands = environment =>
  Object.entries(environment || {})
    .map(([key, value]) => `set ${key}=${value}`)
    .join('\r\n');

const rm = async file => {
  try {
    await unlink(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const writeShim = async (from, to, shell, cmd, powershell) => {
  await mkdir(path.dirname(to), { recursive: true });
  await Promise.all([
    writeFile(to, shell),
    writeFile(`${to}.cmd`, cmd),
    writeFile(`${to}.ps1`, powershell),
    chmod(to, 0o755),
    chmod(`${to}.cmd`, 0o755),
    chmod(`${to}.ps1`, 0o755)
  ]);
};

const prepare = async (from, to) => {
  const source = await readFile(from, 'utf8');
  const match = source.match(shebangExpr);
  const env = match?.[1] || '';
  const command = match?.[2] || 'node';
  const args = match?.[3] || '';

  const shell = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")
${convertToSetCommands(
  Object.fromEntries(
    env
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(pair => {
        const index = pair.indexOf('=');
        return index < 0 ? [pair, ''] : [pair.slice(0, index), pair.slice(index + 1)];
      })
  )
)}
exec "$basedir/${relative(dirname(to), from)}" "$@"
`;

  const commandLine = command === 'node'
    ? `"${process.execPath}" "${from}" %*`
    : `"${command}" "${from}" %*`;

  const cmd = `@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0
${replaceDollarWithPercentPair(commandLine)}
ENDLOCAL
`;

  const powershell = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent
& "${command}" "${from}" ${args} $args
exit $LASTEXITCODE
`;

  await writeShim(from, to, shell, cmd, powershell);
};

const cmdShim = async (from, to) => {
  await prepare(from, to);
};

const link = async (from, to) => {
  await mkdir(path.dirname(to), { recursive: true });
  try {
    await rm(to);
    await fs.promises.symlink(relative(path.dirname(to), from), to);
  } catch (error) {
    if (error.code === 'EEXIST') return;
    throw error;
  }
};

const relative = (from, to) => path.relative(from, to);

const bin = async (from, to, options) => {
  if (from && typeof from === 'object' && !Array.isArray(from)) {
    const config = from;
    const packagePath = config.path || config.from;
    const packageJson = config.pkg || {};
    const target = config.to || packagePath;
    const bins = packageJson.bin || {};

    const entries = typeof bins === 'string'
      ? { [packageJson.name || path.basename(packagePath)]: bins }
      : bins;

    await Promise.all(
      Object.entries(entries).map(([name, source]) => {
        const sourcePath = path.resolve(packagePath, source);
        const targetPath = path.resolve(target, name);
        return isWin ? cmdShim(sourcePath, targetPath) : link(sourcePath, targetPath);
      })
    );
    return;
  }

  if (isWin) return cmdShim(from, to);
  return link(from, to);
};

export { bin as default };
