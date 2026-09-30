import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(str) {
  let result = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      result += char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
      result += char;
    } else if (char === '$' && !inQuotes) {
      result += '%%';
    } else {
      result += char;
    }
  }
  
  return result;
}

function convertToSetCommands(env) {
  if (!env) return '';
  
  const lines = [];
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === null) {
      lines.push(`set ${key}=`);
    } else {
      const escapedValue = replaceDollarWithPercentPair(String(value));
      lines.push(`set ${key}=${escapedValue}`);
    }
  }
  
  return lines.join('\n');
}

async function rm(path) {
  try {
    await unlink(path);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

async function writeShim(target, path, opts = {}) {
  const { args = [], env = {}, cmdShimOpts = {} } = opts;
  
  const targetDir = dirname(path);
  await mkdir(targetDir, { recursive: true });
  
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    const cmdPath = path + '.cmd';
    const ps1Path = path + '.ps1';
    
    const envCmd = convertToSetCommands(env);
    const argsStr = args.length > 0 ? ' ' + args.join(' ') : '';
    
    const cmdContent = `@echo off\r\n${envCmd ? envCmd + '\r\n' : ''}"${target}"${argsStr} %*\r\n`;
    const ps1Content = `#!/usr/bin/env pwsh\n${envCmd ? envCmd + '\n' : ''}& "${target}"${argsStr} @args\n`;
    
    await writeFile(cmdPath, cmdContent, { mode: 0o755 });
    await writeFile(ps1Path, ps1Content, { mode: 0o755 });
  } else {
    const envLines = [];
    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined && value !== null) {
        envLines.push(`export ${key}="${String(value).replace(/"/g, '\\"')}"`);
      }
    }
    
    const argsStr = args.length > 0 ? ' ' + args.join(' ') : '';
    const content = `#!/bin/sh\n${envLines.length > 0 ? envLines.join('\n') + '\n' : ''}exec "${target}"${argsStr} "$@"\n`;
    
    await writeFile(path, content, { mode: 0o755 });
  }
}

async function prepare(binPath, opts = {}) {
  const { env = {}, args = [] } = opts;
  
  try {
    const stats = await stat(binPath);
    if (!stats.isFile()) {
      throw new Error(`Path ${binPath} is not a file`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`File not found: ${binPath}`);
    }
    throw err;
  }
  
  let content = await readFile(binPath, 'utf8');
  
  const match = shebangExpr.exec(content);
  if (!match) {
    return { target: binPath, args, env };
  }
  
  const [, envPairs, command, commandArgs] = match;
  
  const parsedEnv = { ...env };
  if (envPairs) {
    const pairs = envPairs.trim().split(/\s+/);
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        parsedEnv[key] = value;
      }
    }
  }
  
  const parsedArgs = [...args];
  if (commandArgs) {
    parsedArgs.push(...commandArgs.trim().split(/\s+/).filter(Boolean));
  }
  
  return {
    target: command,
    args: parsedArgs,
    env: parsedEnv
  };
}

async function cmdShim(target, path, opts = {}) {
  const prepared = await prepare(target, opts);
  
  if (prepared.target !== target) {
    return await writeShim(prepared.target, path, {
      args: prepared.args,
      env: prepared.env,
      cmdShimOpts: opts
    });
  }
  
  return await writeShim(target, path, opts);
}

export { cmdShim, prepare, writeShim, rm, convertToSetCommands, replaceDollarWithPercentPair, shebangExpr };
export default cmdShim;
