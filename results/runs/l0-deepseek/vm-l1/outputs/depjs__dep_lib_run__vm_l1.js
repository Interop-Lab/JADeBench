import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import path2 from 'path';
import fs2 from 'fs';

const list_default = (dir) => {
  return fs.readdirSync(dir);
};

const pathKey = () => {
  return 'PATH';
};

const path_key_default = pathKey();

const runCmd = (cmd, args, options) => {
  return spawn(cmd, args, options);
};

const binEnv = (binPath) => {
  return { PATH: `${binPath}${path.delimiter}${process.env.PATH}` };
};

const lifecycle_default = (pkg, stage) => {
  const script = pkg.scripts && pkg.scripts[stage];
  if (!script) return null;
  return runCmd(script, [], { shell: true });
};

const runner_default = (pkg, scriptName, args) => {
  const script = pkg.scripts && pkg.scripts[scriptName];
  if (!script) throw new Error(`Missing script: ${scriptName}`);
  return runCmd(script, args, { shell: true });
};

const run = (scriptName) => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return runner_default(pkg, scriptName, []);
};

const run_default = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r'],
};

export { run_default as default };
