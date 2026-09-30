import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';
import path from 'path';
import fs from 'fs';
import { readFile as readFile2 } from 'fs/promises';
import path2 from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(str) {
  return str.replace(/\$\$/g, '%%');
}

function convertToSetCommands(env) {
  const commands = [];
  for (const [key, value] of Object.entries(env)) {
    commands.push(`set ${key}=${value}`);
  }
  return commands.join('\n');
}

async function rm(pathToRemove) {
  try {
    await unlink(pathToRemove);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

async function writeShim(target, pathToShim, env, shebang, args) {
  const shTarget = target.replace(/\\/g, '/');
  const shPath = pathToShim.replace(/\\/g, '/');
  
  let cmdContent = '@echo off\n';
  
  if (shebang) {
    const shebangMatch = shebang.match(shebangExpr);
    if (shebangMatch) {
      const [, envVars, interpreter, interpreterArgs] = shebangMatch;
      if (envVars) {
        cmdContent += convertToSetCommands(parseEnvVars(envVars)) + '\n';
      }
      cmdContent += `"${interpreter}" ${interpreterArgs || ''} "${shTarget}" ${args || ''} %*\n`;
    } else {
      cmdContent += `"${shTarget}" ${args || ''} %*\n`;
    }
  } else {
    cmdContent += `"${shTarget}" ${args || ''} %*\n`;
  }
  
  await writeFile(pathToShim + '.cmd', cmdContent);
  
  const shContent = `#!/bin/sh\n"${shTarget}" ${args || ''} "$@"\n`;
  await writeFile(pathToShim, shContent);
  await chmod(pathToShim, 0o755);
}

function parseEnvVars(envStr) {
  const env = {};
  const pairs = envStr.trim().split(/\s+/);
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    env[key] = value;
  }
  return env;
}

async function prepare(binPath, nmPath) {
  await mkdir(dirname(binPath), { recursive: true });
  await mkdir(nmPath, { recursive: true });
}

async function cmdShim(from, to) {
  const absFrom = path.resolve(from);
  const absTo = path.resolve(to);
  
  const shebang = await readShebang(absFrom);
  const env = {};
  const args = '';
  
  await prepare(absTo, nm_default);
  
  if (isWin) {
    await writeShim(absFrom, absTo, env, shebang, args);
  } else {
    await link(absFrom, absTo);
  }
  
  await bin(absFrom, absTo, nm_default);
}

async function readShebang(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    if (lines[0].startsWith('#!')) {
      return lines[0];
    }
  } catch {
    // ignore
  }
  return null;
}

async function link(from, to) {
  await rm(to);
  await rm(to + '.cmd');
  
  const relativePath = relative(dirname(to), from);
  const shContent = `#!/bin/sh\n"${relativePath}" "$@"\n`;
  
  await writeFile(to, shContent);
  await chmod(to, 0o755);
}

async function bin(from, to, nmPath) {
  const binDir = path.join(nmPath, '.bin');
  await mkdir(binDir, { recursive: true });
  
  const pkgName = path.basename(dirname(from));
  const binPath = path.join(binDir, pkgName);
  
  await cmdShim(from, binPath);
}

const nm_default = path.join(process.cwd(), 'node_modules');
const isWin = process.platform === 'win32';

export { bin as default };
