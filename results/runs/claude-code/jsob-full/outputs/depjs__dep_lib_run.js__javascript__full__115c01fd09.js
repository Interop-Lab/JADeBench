import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function listScripts(packageJson) {
  const scripts = packageJson.scripts;
  process.stdout.write(
    `Available scripts via \`dep run\`\n\n${Object.keys(scripts)
      .map((name) => `dep run ${name}:\n  ${scripts[name]}`)
      .join('\n')}\n`,
  );
}

function getPathKey() {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
}

const pathKey = getPathKey();

function createBinEnvironment(directory) {
  const environment = { ...process.env };
  const binDirectories = [];
  let currentDirectory = directory;
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
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode === 0) return resolve();
      reject(new Error(`Command failed with exit code ${exitCode}: ${command}`));
    });
  });
}

async function runRequestedScript(argv, packageJson, directory = process.cwd()) {
  const args = argv.slice(1);
  const scriptName = args.shift();
  const scripts = packageJson.scripts;
  const lifecycleCommands = Object.keys(scripts)
    .filter(
      (name) =>
        name === `pre${scriptName}` ||
        name === scriptName ||
        name === `post${scriptName}`,
    )
    .map((name) => scripts[name]);
  const environment = createBinEnvironment(directory);

  for (const lifecycleCommand of lifecycleCommands) {
    await runCommand(lifecycleCommand, args, {
      cwd: directory,
      shell: true,
      env: environment,
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
    listScripts(packageJson);
    return;
  }

  runRequestedScript(argv._, packageJson).catch((error) => {
    process.stdout.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

const runCommandDefinition = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export default runCommandDefinition;
