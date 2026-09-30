import path from 'path';
import fs from 'fs';
import { chmod, mkdir, readFile, rm, stat, writeFile } from 'fs/promises';

const shebangPattern = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
const shellQuote = value => value.replace(/([\\"`$])/g, '\\$1');
const percentPair = value => value.replace(/%/g, '%%');

function parseShebang(firstLine) {
  const match = firstLine.match(shebangPattern);
  if (!match) return null;
  const environment = (match[1] || '').trim();
  return {
    command: match[2],
    args: match[3] || '',
    environment
  };
}

function windowsShim(source, target, shebang) {
  const command = shebang ? shebang.command : process.execPath;
  const args = shebang ? shebang.args : '';
  const env = shebang?.environment ? `${shebang.environment} ` : '';
  const commandLine = `${env}"${command}"${args}`.trim();
  const escapedSource = source.replace(/%/g, '%%');
  const escapedTarget = target.replace(/%/g, '%%');
  const batch = `@IF EXIST "%~dp0\\node.exe" (\r\n  "%~dp0\\node.exe" "${escapedSource}" %*\r\n) ELSE (\r\n  node "${escapedSource}" %*\r\n)\r\n`;
  const powershell = `$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n& ${shellQuote(commandLine)} ${shellQuote(escapedSource)} $args\nexit $LASTEXITCODE\n`;
  return {
    cmd: batch,
    ps1: powershell,
    unix: `#!/bin/sh\nexec ${commandLine} "${escapedTarget}" "$@"\n`
  };
}

async function writeShim(source, target, shebang) {
  const content = await readFile(source, 'utf8');
  const firstLine = content.trim().split(/\r*\n/, 1)[0];
  const parsed = shebang || parseShebang(firstLine);
  const launcher = windowsShim(source, target, parsed);
  const mode = 0o755;
  await Promise.all([
    writeFile(target, launcher.unix, { mode }),
    writeFile(`${target}.cmd`, launcher.cmd, { mode }),
    writeFile(`${target}.ps1`, launcher.ps1, { mode })
  ]);
  await Promise.all([
    chmod(target, mode),
    chmod(`${target}.cmd`, mode),
    chmod(`${target}.ps1`, mode)
  ]);
}

async function prepare(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const content = await readFile(source, 'utf8');
    const firstLine = content.trim().split(/\r*\n/, 1)[0];
    const shebang = parseShebang(firstLine);
    await writeShim(source, target, shebang);
  } catch {
    await writeShim(source, target);
  }
}

async function link(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  await rm(target, { force: true });
  if (process.platform === 'win32') return cmdShim(source, target);
  await fs.promises.symlink(source, target);
}

async function bin(packageName, packagePath, command) {
  const packageRoot = packagePath || process.cwd();
  if (command === undefined) {
    const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
    command = manifest.bin;
  }
  if (!command) return;
  const binDirectory = path.resolve(process.cwd(), 'node_modules', '.bin');
  if (typeof command === 'string') {
    const name = packageName.includes('@') ? packageName.split('/').pop() : packageName;
    return link(path.resolve(packageRoot, command), path.join(binDirectory, name));
  }
  await Promise.all(Object.entries(command).map(([name, entry]) =>
    link(path.resolve(packageRoot, entry), path.join(binDirectory, name))
  ));
}

async function cmdShim(source, target) {
  try {
    await stat(source);
  } catch {
    return prepare(source, target);
  }
  await Promise.all([
    rm(target, { force: true }),
    rm(`${target}.cmd`, { force: true }),
    rm(`${target}.ps1`, { force: true })
  ]);
  return prepare(source, target);
}

export { bin as default };
