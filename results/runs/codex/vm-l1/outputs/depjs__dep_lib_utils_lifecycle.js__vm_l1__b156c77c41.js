import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function pathKey() {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find(key => key.toUpperCase() === 'PATH') || 'Path';
}

const pathEnvironmentKey = pathKey();

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

function binEnv(cwd) {
  const env = { ...process.env };
  const binPaths = [];
  let directory = cwd;

  while (true) {
    binPaths.push(path.join(directory, 'node_modules', '.bin'));
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  if (env[pathEnvironmentKey]) binPaths.push(env[pathEnvironmentKey]);
  env[pathEnvironmentKey] = binPaths.join(path.delimiter);
  return env;
}

async function lifecycle(cwd, events) {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  let executed = false;
  for (const event of events) {
    const command = packageJson.scripts?.[event];
    if (!command) continue;

    await runCmd(command, [], {
      cwd,
      shell: true,
      env: binEnv(cwd),
      stdio: 'inherit',
    });
    executed = true;
  }
  return executed;
}

export { binEnv, lifecycle as default, runCmd };
