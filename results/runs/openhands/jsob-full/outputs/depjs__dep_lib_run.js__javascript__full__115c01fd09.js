import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

function listScripts(packageJson) {
  const scripts = packageJson.scripts;
  const entries = Object.keys(scripts)
    .map((name) => `dep run ${name}:\n  ${scripts[name]}`)
    .join('\n');

  process.stdout.write(`Available scripts via \`dep run\`\n\n${entries}\n`);
}

function getPathKey() {
  if (process.platform !== 'win32') return 'PATH';
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || 'Path';
}

const pathKey = getPathKey();

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed with exit code ${exitCode}: ${command}`));
    });
  });
}

function createBinEnvironment(cwd) {
  const env = { ...process.env };
  const binPaths = [];
  let currentDirectory = cwd;
  let previousDirectory;

  do {
    binPaths.push(path.join(currentDirectory, 'node_modules', '.bin'));
    previousDirectory = currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  } while (currentDirectory !== previousDirectory);

  env[pathKey] = [...binPaths, process.env[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
}

async function runScripts(args, packageJson, cwd = process.cwd()) {
  const remainingArgs = args.slice(1);
  const scripts = packageJson.scripts;
  const scriptName = remainingArgs.shift();
  const commands = Object.keys(scripts)
    .filter(
      (name) =>
        name === `pre${scriptName}` ||
        name === scriptName ||
        name === `post${scriptName}`,
    )
    .map((name) => scripts[name]);
  const env = createBinEnvironment(cwd);

  for (const command of commands) {
    await runCommand(command, remainingArgs, {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }
}

function run(args) {
  args._handled = true;
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json')),
  );
  if (!packageJson.scripts) return;

  if (args._.length === 1) {
    listScripts(packageJson);
    return;
  }

  runScripts(args._, packageJson).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

const runCommandDefinition = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export { runCommandDefinition as default };
