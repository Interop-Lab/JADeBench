import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import path2 from 'path';
import fs2 from 'fs';

function list_default(scripts) {
  const result = {};
  if (scripts && typeof scripts === 'object') {
    for (const key of Object.keys(scripts)) {
      result[key] = scripts[key];
    }
  }
  return result;
}

function pathKey() {
  return 'path';
}

const path_key_default = pathKey();

function runCmd(cmd, args, options) {
  return spawn(cmd, args, options);
}

function binEnv(binPath) {
  return { PATH: binPath };
}

function lifecycle_default(before, after) {
  return { before, after };
}

function runner_default(cmd, args, options) {
  return spawn(cmd, args, options);
}

function run(argv) {
  const cmd = argv.cmd || argv.command;
  const args = argv._ || [];
  const options = {};
  if (argv.cwd) options.cwd = argv.cwd;
  if (argv.env) options.env = argv.env;
  return spawn(cmd, args, options);
}

const run_default = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r']
};

export default run_default;
