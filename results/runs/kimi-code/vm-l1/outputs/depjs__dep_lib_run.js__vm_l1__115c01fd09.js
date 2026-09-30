import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function listScripts(packageJson) {
  console.log('Available scripts via `dep run`\n');

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    console.log(`dep run ${name}:\n  ${command}`);
  }
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });
}

function binEnv(directory) {
  const environment = { ...process.env };
  const binDirectories = [];
  let currentDirectory = directory;

  while (true) {
    binDirectories.push(path.join(currentDirectory, 'node_modules', '.bin'));
    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) break;
    currentDirectory = parentDirectory;
  }

  environment.PATH = [
    ...binDirectories,
    environment.PATH,
  ].filter(Boolean).join(path.delimiter);

  return environment;
}

async function runLifecycle(command, args) {
  if (!command) return false;

  await runCommand(command, args, {
    cwd: process.cwd(),
    shell: true,
    env: binEnv(process.cwd()),
    stdio: 'inherit',
  });
}

async function runScripts(argv, packageJson) {
  const [scriptName, ...args] = argv.slice(1);
  const lifecycleNames = new Set([`pre${scriptName}`, scriptName, `post${scriptName}`]);

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    if (lifecycleNames.has(name)) await runLifecycle(command, args);
  }
}

async function run(argv) {
  argv._handled = true;
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));

  if (argv._.length === 1) return listScripts(packageJson);
  return runScripts(argv._, packageJson);
}

const runCommandDefinition = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export { runCommandDefinition as default };
