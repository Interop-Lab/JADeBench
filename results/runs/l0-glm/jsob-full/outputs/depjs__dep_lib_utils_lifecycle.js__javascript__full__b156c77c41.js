import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

var pathKey = () => {
  if (process.platform === 'win32') return 'Path';
  const key = Object.keys(process.env).find(k => /^PATH$/i.test(k));
  return key || 'PATH';
};

var path_key_default = pathKey();

var runCmd = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error('Command failed with exit code ' + code + ': ' + cmd));
    });
  });
};

var binEnv = cwd => {
  const env = { ...process.env };
  const paths = [];
  let current = cwd, prev;
  do {
    paths.push(path.join(current, 'node_modules', '.bin'));
    prev = current;
    current = path.dirname(current);
  } while (current !== prev);
  env[path_key_default] = [...paths, process.env[path_key_default]].filter(Boolean).join(path.delimiter);
  return env;
};

var lifecycle_default = async (cwd, scripts) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch (e) {
    return false;
  }
  const lifecycleScripts = pkg.scripts || {};
  const env = binEnv(cwd);
  let ran = false;
  for (const script of scripts) {
    const cmd = lifecycleScripts[script];
    if (!cmd) continue;
    ran = true;
    await runCmd(cmd, [], { cwd, shell: true, env, stdio: 'inherit' });
  }
  return ran;
};

export { binEnv, lifecycle_default as default, runCmd };
