import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform === 'win32') return 'Path';
  const key = Object.keys(process.env).find(name => /^PATH$/i.test(name));
  return key || 'PATH';
};

const pathKeyDefault = pathKey();

const runCmd = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, options);
  child.on('error', reject);
  child.on('close', code => {
    if (code === 0) resolve();
    else reject(new Error(`Command failed with exit code ${code}: ${command}`));
  });
});

const binEnv = binPath => {
  const environment = { ...process.env };
  const binDirectories = [];
  let current = binPath;
  let parent;

  do {
    binDirectories.push(path.join(current, 'node_modules', '.bin'));
    parent = current;
    current = path.dirname(current);
  } while (current !== parent);

  environment[pathKeyDefault] = [
    ...binDirectories,
    process.env[pathKeyDefault]
  ].filter(Boolean).join(path.delimiter);
  return environment;
};

const lifecycle = async (directory, lifecycleNames) => {
  let packageData;
  try {
    packageData = JSON.parse(fs.readFileSync(path.join(directory, 'package.json')));
  } catch {
    return false;
  }

  const scripts = packageData.scripts || {};
  const environment = binEnv(directory);
  let ranScript = false;
  for (const name of lifecycleNames) {
    const command = scripts[name];
    if (!command) continue;
    ranScript = true;
    await runCmd(command, [], {
      cwd: directory,
      shell: true,
      env: environment,
      stdio: 'inherit'
    });
  }
  return ranScript;
};

export { binEnv, lifecycle as default, runCmd };
