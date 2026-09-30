import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const pathKey = () => {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(process.env).find(key => /^PATH$/i.test(key)) || 'Path';
};

const PATH_KEY = pathKey();

const createBinEnvironment = cwd => {
  const env = { ...process.env };
  const binPaths = [];

  let directory = cwd;
  let previousDirectory;

  do {
    binPaths.push(path.join(directory, 'node_modules', '.bin'));
    previousDirectory = directory;
    directory = path.dirname(directory);
  } while (directory !== previousDirectory);

  env[PATH_KEY] = [...binPaths, process.env[PATH_KEY]]
    .filter(Boolean)
    .join(path.delimiter);

  return env;
};

const runCommand = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });

const listScripts = packageJson => {
  const scripts = packageJson.scripts;

  process.stdout.write(
    `Available scripts:\n${Object.keys(scripts)
      .map(name => `  ${name}: ${scripts[name]}`)
      .join('\n')}\n`,
  );
};

const runScripts = async (argv, packageJson, cwd = process.cwd()) => {
  const args = argv.slice(1);
  const scripts = packageJson.scripts;
  const scriptName = args.shift();

  const commands = Object.keys(scripts)
    .filter(
      name =>
        name === `pre${scriptName}` ||
        name === scriptName ||
        name === `post${scriptName}`,
    )
    .map(name => scripts[name]);

  const env = createBinEnvironment(cwd);

  for (const command of commands) {
    await runCommand(command, args, {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }
};

const run = argv => {
  argv.handled = true;

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json')),
  );

  if (!packageJson.scripts) {
    return;
  }

  if (argv._.length === 1) {
    listScripts(packageJson);
    return;
  }

  runScripts(argv._, packageJson).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
};

const run_default = {
  command: 'run [script] [args..]',
  describe: 'Run a package script, including its pre and post lifecycle scripts',
  handler: run,
  aliases: ['r'],
};

export { run_default as default };
