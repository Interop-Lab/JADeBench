import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(process.env).find(key => /^PATH$/i.test(key)) || 'Path';
};

const pathKeyDefault = pathKey();

const runCmd = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });

const binEnv = directory => {
  const env = { ...process.env };
  const binDirectories = [];

  let currentDirectory = directory;
  let previousDirectory;

  do {
    binDirectories.push(
      path.resolve(currentDirectory, 'node_modules', '.bin')
    );
    previousDirectory = currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  } while (currentDirectory !== previousDirectory);

  env[pathKeyDefault] = [
    ...binDirectories,
    process.env[pathKeyDefault]
  ]
    .filter(Boolean)
    .join(path.delimiter);

  return env;
};

const lifecycle = async (directory, lifecycleNames) => {
  let packageData;

  try {
    packageData = JSON.parse(
      fs.readFileSync(path.resolve(directory, 'package.json'))
    );
  } catch {
    return false;
  }

  const scripts = packageData.scripts || {};
  const env = binEnv(directory);
  let ranScript = false;

  for (const lifecycleName of lifecycleNames) {
    const command = scripts[lifecycleName];

    if (!command) {
      continue;
    }

    ranScript = true;

    await runCmd(command, [], {
      cwd: directory,
      shell: true,
      env,
      stdio: 'inherit'
    });
  }

  return ranScript;
};

export { binEnv, lifecycle as default, runCmd };
