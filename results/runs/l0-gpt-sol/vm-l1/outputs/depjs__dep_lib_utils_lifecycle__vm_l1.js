import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return (
    Object.keys(process.env)
      .reverse()
      .find((key) => key.toUpperCase() === 'PATH') || 'Path'
  );
};

const path_key_default = pathKey();

export const runCmd = (command, cwd, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env,
      shell: true,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const error = new Error(
        signal
          ? `Command failed with signal ${signal}: ${command}`
          : `Command failed with exit code ${code}: ${command}`,
      );
      error.code = code;
      error.signal = signal;
      error.command = command;
      reject(error);
    });
  });

export const binEnv = (cwd) => {
  const env = { ...process.env };
  const currentPath = env[path_key_default];
  const binPath = path.resolve(cwd, 'node_modules', '.bin');

  env[path_key_default] = currentPath
    ? `${binPath}${path.delimiter}${currentPath}`
    : binPath;

  return env;
};

const lifecycle = async (cwd, event) => {
  const packagePath = path.resolve(cwd, 'package.json');
  const pkg = JSON.parse(await fs.promises.readFile(packagePath, 'utf8'));
  const scripts = pkg.scripts || {};
  const events = [`pre${event}`, event, `post${event}`];
  const env = binEnv(cwd);

  env.npm_package_json = packagePath;
  env.npm_package_name = pkg.name || '';
  env.npm_package_version = pkg.version || '';

  for (const lifecycleEvent of events) {
    const command = scripts[lifecycleEvent];
    if (!command) {
      continue;
    }

    env.npm_lifecycle_event = lifecycleEvent;
    env.npm_lifecycle_script = command;
    await runCmd(command, cwd, env);
  }
};

export default lifecycle;
