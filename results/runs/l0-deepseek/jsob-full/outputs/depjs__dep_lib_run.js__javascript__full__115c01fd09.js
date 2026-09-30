const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const list_default = (config) => {
  const scripts = config.scripts;
  process.stdout.write(
    Object.keys(scripts)
      .map((name) => `${name}\t${scripts[name]}`)
      .join('\n') + '\n'
  );
};

const pathKey = () => {
  if (process.platform === 'win32') return 'Path';
  const pathKey = Object.keys(process.env).find((key) => /^PATH$/i.test(key));
  return pathKey || 'PATH';
};

const path_key_default = pathKey();

const runCmd = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${cmd}`));
    });
  });
};

const binEnv = (dir) => {
  const env = { ...process.env };
  const paths = [];
  let current = dir;
  let parent;
  do {
    paths.push(path.join(current, 'node_modules', '.bin'));
    parent = current;
    current = path.dirname(current);
  } while (current !== parent);
  env[path_key_default] = [...paths, process.env[path_key_default]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
};

const lifecycle_default = async (dir, scripts) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
  } catch (err) {
    return false;
  }
  const lifecycle = pkg.scripts || {};
  const env = binEnv(dir);
  let ran = false;
  for (const script of scripts) {
    const command = lifecycle[script];
    if (!command) continue;
    ran = true;
    await runCmd(command, [], {
      cwd: dir,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }
  return ran;
};

const runner_default = async (args, scripts, cwd) => {
  cwd = cwd || process.cwd();
  const rest = args.slice(1);
  const scriptMap = scripts;
  const scriptName = rest.shift();
  const selectedScripts = Object.keys(scriptMap).filter(
    (name) =>
      name === `${scriptName}:pre` ||
      name === scriptName ||
      name === `${scriptName}:post`
  );
  const env = binEnv(cwd);
  for (const script of selectedScripts) {
    await runCmd(scriptMap[script], rest, {
      cwd,
      shell: true,
      env,
      stdio: 'inherit',
    });
  }
};

const run = (argv) => {
  argv.scripts = true;
  const pkg = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'))
  );
  if (!pkg.scripts) return;
  if (argv._.length === 0) list_default(pkg);
  else
    runner_default(argv._, pkg.scripts).then((output) => {
      process.stdout.write(output + '\n');
      process.exitCode = 0;
    });
};

const run_default = {
  command: 'run <script> [args...]',
  describe: 'Run an arbitrary package script',
  builder: run,
  handler: run,
};

export { run_default as default };
