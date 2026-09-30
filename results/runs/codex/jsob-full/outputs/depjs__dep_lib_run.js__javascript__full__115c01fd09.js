import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function list(packageJson) {
  const scripts = packageJson.scripts;
  const output = Object.keys(scripts)
    .map(name => `dep run ${name}:\n  ${scripts[name]}`)
    .join('\n');

  process.stdout.write(`Available scripts via \`dep run\`\n\n${output}\n`);
}

function pathKey() {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find(key => /^PATH$/i.test(key)) || 'Path';
}

const pathKeyDefault = pathKey();

function runCmd(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });
}

function binEnv(cwd) {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let previousDirectory;

  do {
    binDirectories.push(path.join(directory, 'node_modules', '.bin'));
    previousDirectory = directory;
    directory = path.dirname(directory);
  } while (directory !== previousDirectory);

  env[pathKeyDefault] = [...binDirectories, process.env[pathKeyDefault]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
}

async function lifecycle(cwd, names) {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(cwd);
  let ranScript = false;

  for (const name of names) {
    const command = scripts[name];
    if (!command) continue;
    ranScript = true;
    await runCmd(command, [], {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }

  return ranScript;
}

async function runner(args, packageJson, cwd = process.cwd()) {
  const remainingArgs = args.slice(1);
  const scripts = packageJson.scripts;
  const scriptName = remainingArgs.shift();
  const lifecycleNames = Object.keys(scripts).filter(
    name => name === `pre${scriptName}` || name === scriptName || name === `post${scriptName}`,
  );
  const env = binEnv(cwd);

  for (const name of lifecycleNames) {
    await runCmd(scripts[name], remainingArgs, {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }
}

function run(argv) {
  argv._handled = true;
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json')),
  );

  if (!packageJson.scripts) return;
  if (argv._.length === 1) {
    list(packageJson);
    return;
  }

  runner(argv._, packageJson).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

const runDefault = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export { runDefault as default };
