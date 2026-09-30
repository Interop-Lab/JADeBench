import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const list = (pkg) => {
  const e87138 = pkg.scripts;
  process.stdout.write(
    'Available scripts:\n' +
    Object.keys(e87138)
      .map((key) => '  ' + key + ': ' + e87138[key])
      .join('\n') +
    '\n'
  );
};

const pathKey = () => {
  if (process.platform !== 'win32') return 'PATH';
  const keys = Object.keys(process.env).filter((key) => /^PATH$/i.test(key));
  return keys[keys.length - 1] || 'Path';
};

const path_key_default = pathKey();

const runCmd = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      reject(new Error('Command failed with exit code ' + code + ': ' + cmd));
    });
  });
};

const binEnv = (cwd) => {
  const env = { ...process.env };
  const paths = [];
  let current = cwd;
  let prev;
  do {
    paths.push(path.join(current, 'node_modules', '.bin'));
    prev = current;
    current = path.dirname(current);
  } while (current !== prev);
  env[path_key_default] = [...paths, process.env[path_key_default]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
};

const lifecycle = async (cwd, events) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch {
    return false;
  }
  const scripts = pkg.scripts || {};
  const env = binEnv(cwd);
  let ran = false;
  for (const event of events) {
    const script = scripts[event];
    if (!script) continue;
    ran = true;
    await runCmd(script, [], {
      cwd: cwd,
      shell: true,
      env: env,
      stdio: 'inherit'
    });
  }
  return ran;
};

const runner = async (args, pkg, cwd) => {
  cwd = cwd || process.cwd();
  const script = args[0];
  const scripts = pkg.scripts;
  const scriptName = script.toLowerCase();
  const candidates = Object.keys(scripts).filter((key) => {
    return (
      key === 'pre' + scriptName ||
      key === script ||
      key === 'post' + scriptName
    );
  });
  const env = binEnv(cwd);
  for (const candidate of candidates) {
    await runCmd(scripts[candidate], args, {
      cwd: cwd,
      shell: true,
      env: env,
      stdio: 'inherit'
    });
  }
};

const run = (argv) => {
  argv._ = argv._ || [];
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
  if (!pkg.scripts) return;
  if (argv._.length === 0) {
    list(pkg);
  } else {
    runner(argv._, pkg).then((output) => {
      process.stdout.write(output + '\n');
      process.exit(0);
    });
  }
};

const run_default = {
  description: 'Run npm scripts',
  help: [
    'Usage: npm-run <script> [args...]',
    '',
    'Run a script from package.json with lifecycle hooks.'
  ].join('\n'),
  run: run,
  args: ['r']
};

export { run_default as default };
