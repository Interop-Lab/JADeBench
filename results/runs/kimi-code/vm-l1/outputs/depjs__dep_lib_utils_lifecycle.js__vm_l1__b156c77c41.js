import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function pathKey() {
  if (process.platform === 'win32') return 'Path';
  return Object.keys(process.env).find(key => /^PATH$/i.test(key)) || 'Path';
}

function binEnv(cwd) {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;

  while (true) {
    binDirectories.push(path.join(directory, 'node_modules', '.bin'));
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  const key = pathKey();
  env[key] = binDirectories.filter(Boolean).concat(env[key]).join(path.delimiter);
  return env;
}

function runCmd(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command}`));
      }
    });
  });
}

async function lifecycle(cwd, events) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  let ranScript = false;
  for (const event of events) {
    const command = manifest.scripts?.[event];
    if (!command) continue;

    await runCmd(command, [], {
      cwd,
      env: binEnv(cwd),
      shell: true,
      stdio: 'inherit',
    });
    ranScript = true;
  }

  return ranScript;
}

export { binEnv, lifecycle as default, runCmd };
