import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform === 'win32') return 'Path';

  return Object.keys(process.env).find(key => /^PATH$/i.test(key)) || 'PATH';
};

const environmentPathKey = pathKey();

const runCmd = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, options);

  child.on('error', reject);
  child.on('close', code => {
    if (code === 0) return resolve();
    reject(new Error(`Command failed with exit code ${code}: ${command}`));
  });
});

const binEnv = directory => {
  const env = { ...process.env };
  const binDirectories = [];
  let currentDirectory = directory;
  let previousDirectory;

  do {
    binDirectories.push(path.join(currentDirectory, 'node_modules', '.bin'));
    previousDirectory = currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  } while (currentDirectory !== previousDirectory);

  env[environmentPathKey] = [
    ...binDirectories,
    process.env[environmentPathKey],
  ].filter(Boolean).join(path.delimiter);

  return env;
};

const lifecycle = async (directory, events) => {
  let packageJson;

  try {
    packageJson = JSON.parse(
      fs.readFileSync(path.join(directory, 'package.json')),
    );
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(directory);
  let ranScript = false;

  for (const event of events) {
    const script = scripts[event];
    if (!script) continue;

    ranScript = true;
    await runCmd(script, [], {
      cwd: directory,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }

  return ranScript;
};

export { binEnv, lifecycle as default, runCmd };
