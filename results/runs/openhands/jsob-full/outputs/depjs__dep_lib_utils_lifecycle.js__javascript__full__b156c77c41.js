import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const getPathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
};

const pathKey = getPathKey();

var runCmd = (command, args, options) => {
  return new Promise((resolve, reject) => {
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
};

var binEnv = (cwd) => {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let previousDirectory;

  do {
    binDirectories.push(path.join(directory, 'node_modules', '.bin'));
    previousDirectory = directory;
    directory = path.dirname(directory);
  } while (directory !== previousDirectory);

  env[pathKey] = [...binDirectories, process.env[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);

  return env;
};

var lifecycle_default = async (cwd, scriptNames) => {
  let packageJson;

  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(cwd);
  let ranScript = false;

  for (const scriptName of scriptNames) {
    const command = scripts[scriptName];
    if (!command) {
      continue;
    }

    ranScript = true;
    await runCmd(command, [], {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }

  return ranScript;
};

export { binEnv, lifecycle_default as default, runCmd };
