import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const listScripts = (packageJson) => {
  const scripts = packageJson.scripts;

  process.stdout.write(
    'Available scripts via `dep run`\n\n' +
      Object.keys(scripts)
        .map((name) => `dep run ${name}:\n  ${scripts[name]}`)
        .join('\n') +
      '\n',
  );
};

const getPathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
};

const pathKey = getPathKey();

const spawnCommand = (command, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        return resolve();
      }

      reject(
        new Error(`Command failed with exit code ${exitCode}: ${command}`),
      );
    });
  });
};

const createBinEnvironment = (cwd) => {
  const environment = { ...process.env };
  const binDirectories = [];
  let currentDirectory = cwd;
  let previousDirectory;

  do {
    binDirectories.push(path.join(currentDirectory, 'node_modules', '.bin'));
    previousDirectory = currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  } while (currentDirectory !== previousDirectory);

  environment[pathKey] = [...binDirectories, process.env[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);

  return environment;
};

const runLifecycleScripts = async (cwd, lifecycleNames) => {
  let packageJson;

  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const environment = createBinEnvironment(cwd);
  let ranScript = false;

  for (const name of lifecycleNames) {
    const command = scripts[name];
    if (!command) {
      continue;
    }

    ranScript = true;
    await spawnCommand(command, [], {
      cwd,
      shell: true,
      env: environment,
      stdio: 'inherit',
    });
  }

  return ranScript;
};

const runScript = async (argv, packageJson, cwd) => {
  cwd = cwd || process.cwd();

  const args = argv.slice(1);
  const scripts = packageJson.scripts;
  const requestedScript = args.shift();
  const commands = Object.keys(scripts)
    .filter(
      (name) =>
        name === `pre${requestedScript}` ||
        name === requestedScript ||
        name === `post${requestedScript}`,
    )
    .map((name) => scripts[name]);
  const environment = createBinEnvironment(cwd);

  for (const command of commands) {
    await spawnCommand(command, args, {
      cwd,
      shell: true,
      env: environment,
      stdio: 'inherit',
    });
  }
};

const run = (argv) => {
  argv._handled = true;

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json')),
  );

  if (!packageJson.scripts) {
    return;
  }

  if (argv._.length === 1) {
    listScripts(packageJson);
    return;
  }

  runScript(argv._, packageJson).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
};

const runCommandDefinition = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export default runCommandDefinition;
