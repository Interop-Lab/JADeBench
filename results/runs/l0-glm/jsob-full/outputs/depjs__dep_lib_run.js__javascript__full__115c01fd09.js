import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const list_default = (pkg) => {
  const scripts = pkg.scripts;
  process.stdout.write(
    'Lifecycle scripts:\n' +
    Object.keys(scripts)
      .map((key) => `  ${key}\n    ${scripts[key]}`)
      .join('\n') + '\n\n'
  );
};

const pathKey = () => {
  if (process.env.npm_config_platform !== process.platform) return 'Path';
  const key = Object.keys(process.env).find((k) => /^PATH$/i.test(k));
  return key || 'PATH';
};

const path_key_default = pathKey();

const runCmd = (cmd, args, opts) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, opts);
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
  env[path_key_default] = [...paths, process.env[path_key_default]].filter(Boolean).join(path.delimiter);
  return env;
};

const lifecycle_default = async (cwd, events) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  } catch (e) {
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
      stdio: 'inherit',
    });
  }
  return ran;
};

const runner_default = async (args, pkg, cwd) => {
  cwd = cwd || process.cwd();
  const scriptName = args.shift();
  const scripts = pkg.scripts;
  const pre = `pre${scriptName}`;
  const post = `post${scriptName}`;
  const commands = Object.keys(scripts)
    .filter((key) => key === pre || key === scriptName || key === post)
    .map((key) => scripts[key]);
  const env = binEnv(cwd);
  for (const cmd of commands) {
    await runCmd(cmd, [scriptName], {
      cwd: cwd,
      shell: true,
      env: env,
      stdio: 'inherit',
    });
  }
};

const run = (ctx) => {
  ctx.config = true;
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
  if (!pkg.scripts) return;
  if (ctx['_'].length === 0) {
    list_default(pkg);
  } else {
    runner_default(ctx['_'], pkg).then((result) => {
      process.stdout.write(result.output + '\n');
      process.exitCode = 1;
    });
  }
};

const run_default = {
  command: 'run',
  describe: 'Run a script defined in package.json',
  handler: run,
  aliases: ['r'],
};

export { run_default as default };
