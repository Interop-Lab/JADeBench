import {spawn} from 'child_process';
import path from 'path';
import fs from 'fs';

function listScripts(packageJson) {
  console.log('Available scripts via `dep run`\n');
  for (const [name, command] of Object.entries(packageJson.scripts)) {
    console.log(`dep run ${name}:\n  ${command}`);
  }
}

function pathKey() {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find(key => key.toUpperCase() === 'PATH') || 'Path';
}

const pathKeyDefault = pathKey();

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });
}

function binEnvironment(cwd) {
  const environment = {...process.env};
  const key = pathKeyDefault;
  const directories = [];
  let directory = path.resolve(cwd);

  while (true) {
    directories.push(path.join(directory, 'node_modules', '.bin'));
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  directories.push(environment[key] || '');
  environment[key] = directories.join(path.delimiter);
  return environment;
}

async function runLifecycle(cwd, names) {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return false;
  }
  let found = false;

  for (const name of names) {
    const command = packageJson.scripts?.[name];
    if (!command) continue;
    found = true;
    await runCommand(command, [], {
      cwd,
      env: binEnvironment(cwd),
      shell: true,
      stdio: 'inherit',
    });
  }

  return found;
}

async function runScript(argv, packageJson, cwd) {
  const options = {
    cwd,
    env: binEnvironment(cwd),
    shell: true,
    stdio: 'inherit',
  };
  const args = argv.slice(1);
  const name = args.shift();

  if (!name) return;

  if (!Object.keys(packageJson.scripts).includes(name)) return;
  const names = [`pre${name}`, name, `post${name}`];
  for (const scriptName of names) {
    const command = packageJson.scripts[scriptName];
    if (command) await runCommand(command, [], options);
  }
}

function run(argv) {
  argv._handled = true;
  const cwd = process.cwd();
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return;
  }
  if (!packageJson.scripts) return;
  if (argv._.length === 1) {
    listScripts(packageJson);
    return;
  }
  runScript(argv._, packageJson, cwd);
}

const runDefault = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

Object.assign(globalThis, {
  list_default: listScripts,
  pathKey,
  path_key_default: pathKeyDefault,
  runCmd: runCommand,
  binEnv: binEnvironment,
  lifecycle_default: runLifecycle,
  runner_default: runScript,
  run,
  run_default: runDefault,
});

export {runDefault as default};
