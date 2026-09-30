import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => (process.platform === 'win32' ? 'Path' : 'PATH');

const binEnv = (env = process.env) => {
  const key = pathKey();
  const binPath = path.resolve(process.cwd(), 'node_modules', '.bin');
  const currentPath = env[key] || '';
  return {
    ...env,
    [key]: currentPath ? `${binPath}${path.delimiter}${currentPath}` : binPath
  };
};

const runCmd = (command, cwd = process.cwd(), env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env: binEnv(env),
      shell: true,
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        const error = new Error(
          signal ? `Command terminated by signal ${signal}` : `Command exited with code ${code}`
        );
        error.code = code;
        error.signal = signal;
        reject(error);
      }
    });
  });

const list = directory => fs.readdirSync(directory);

const lifecycle = async (command, cwd = process.cwd()) => {
  const packagePath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = packageJson.scripts || {};
  const script = scripts[command];

  if (typeof script !== 'string') {
    throw new Error(`Missing script: ${command}`);
  }

  await runCmd(script, cwd);
};

const runner = async (command, cwd = process.cwd(), env = process.env) =>
  runCmd(command, cwd, env);

const run = async args => {
  const command =
    typeof args === 'string'
      ? args
      : args && (args.command || args._?.[0]);

  if (!command) {
    throw new Error('A command is required');
  }

  return lifecycle(command);
};

const run_default = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r']
};

export default run_default;
