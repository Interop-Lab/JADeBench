import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

var pathKey = () => {
  if (process.platform === 'win32') return 'Path';
  const pathKey = Object.keys(process.env).find(key => /^PATH$/i.test(key));
  return pathKey || 'PATH';
};

var path_key_default = pathKey();

var runCmd = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${cmd}`));
    });
  });
};

var binEnv = binPath => {
  const env = { ...process.env };
  const paths = [];
  let current = binPath;
  let previous;
  do {
    paths.push(path.join(current, 'node_modules', '.bin'));
    previous = current;
    current = path.dirname(current);
  } while (current !== previous);
  env[path_key_default] = [...paths, process.env[path_key_default]].filter(Boolean).join(path.delimiter);
  return env;
};

var lifecycle_default = async (projectPath, lifecycleScripts) => {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json')));
  } catch (error) {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(projectPath);
  let ranAny = false;

  for (const scriptName of lifecycleScripts) {
    const script = scripts[scriptName];
    if (!script) continue;
    ranAny = true;
    await runCmd(script, [], {
      cwd: projectPath,
      shell: true,
      env: env,
      stdio: 'inherit'
    });
  }

  return ranAny;
};

export { binEnv, lifecycle_default as default, runCmd };
