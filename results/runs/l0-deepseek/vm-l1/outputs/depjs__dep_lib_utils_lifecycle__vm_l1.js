import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  const env = process.env;
  const isWindows = process.platform === 'win32';
  const PATH = 'PATH';
  const delimiter = path.delimiter;
  const pathValue = env[PATH];
  const pathParts = pathValue ? pathValue.split(delimiter) : [];
  const pathKeyName = isWindows ? 'Path' : 'PATH';
  const pathKeyValue = pathParts.join(delimiter);
  return { env, pathKeyName, pathKeyValue };
};

const path_key_default = pathKey();

const runCmd = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    let stdout = '';
    let stderr = '';
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data;
      });
    }
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data;
      });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
};

const binEnv = (binPath) => {
  const env = { ...process.env };
  const pathKeyName = process.platform === 'win32' ? 'Path' : 'PATH';
  const existingPath = env[pathKeyName] || '';
  env[pathKeyName] = `${binPath}${path.delimiter}${existingPath}`;
  return env;
};

const lifecycle_default = (cmd, args) => {
  return runCmd(cmd, args, { stdio: 'inherit' });
};

export { binEnv, lifecycle_default as default, runCmd };
