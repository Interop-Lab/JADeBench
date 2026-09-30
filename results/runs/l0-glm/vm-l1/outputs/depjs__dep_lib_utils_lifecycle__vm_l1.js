import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function pathKey() {
  return path.join(process.cwd(), '.bin');
}

function runCmd(command, args, options) {
  const child = spawn(command, args || [], {
    stdio: 'pipe',
    shell: false,
    ...options
  });
  return child;
}

function binEnv(env) {
  const binPath = pathKey();
  const envVars = { ...process.env, ...env };
  envVars.PATH = binPath + path.delimiter + (envVars.PATH || '');
  return envVars;
}

function lifecycle_default(onStart, onStop) {
  let started = false;
  let stopped = false;
  return {
    start() {
      if (started) return;
      started = true;
      if (typeof onStart === 'function') onStart();
    },
    stop() {
      if (stopped) return;
      stopped = true;
      if (typeof onStop === 'function') onStop();
    }
  };
}

export { binEnv, lifecycle_default as default, runCmd };
