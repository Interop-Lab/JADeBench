import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
};

const PATH_KEY = pathKey();

const runCmd = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });

const binEnv = (directory) => {
  const env = { ...process.env };
  const binDirectories = [];
  let currentDirectory = directory;
  let previousDirectory;

  do {
    binDirectories.push(path.resolve(currentDirectory, 'node_modules', '.bin'));
    previousDirectory = currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  } while (currentDirectory !== previousDirectory);

  env[PATH_KEY] = [...binDirectories, process.env[PATH_KEY]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
};

const lifecycle = async (directory, lifecycleEvents) => {
  let packageJson;
  try {
    packageJson = JSON.parse(
      fs.readFileSync(path.resolve(directory, 'package.json')),
    );
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(directory);
  let ranScript = false;

  for (const event of lifecycleEvents) {
    const command = scripts[event];
    if (!command) continue;
    ranScript = true;
    await runCmd(command, [], {
      cwd: directory,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }

  return ranScript;
};

export { binEnv, lifecycle as default, runCmd };
