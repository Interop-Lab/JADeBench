import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
};

const pathEnvironmentKey = pathKey();

const runCmd = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${exitCode}: ${command}`));
    });
  });

const binEnv = (cwd) => {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let previousDirectory;

  do {
    binDirectories.push(path.join(directory, 'node_modules', '.bin'));
    previousDirectory = directory;
    directory = path.dirname(directory);
  } while (directory !== previousDirectory);

  env[pathEnvironmentKey] = [...binDirectories, process.env[pathEnvironmentKey]]
    .filter(Boolean)
    .join(path.delimiter);

  return env;
};

async function runLifecycle(cwd, lifecycleNames) {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(cwd);
  let ranLifecycle = false;

  for (const lifecycleName of lifecycleNames) {
    const command = scripts[lifecycleName];
    if (!command) {
      continue;
    }

    ranLifecycle = true;
    await runCmd(command, [], {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }

  return ranLifecycle;
}

export { binEnv, runLifecycle as default, runCmd };
