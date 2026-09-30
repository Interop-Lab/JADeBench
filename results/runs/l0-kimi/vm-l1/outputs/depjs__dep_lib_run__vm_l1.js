import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import path2 from 'path';
import fs2 from 'fs';

const globalThisRef = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : void 0;
const vmContext = globalThisRef['vm_0x269c66_2acd9e'] || (globalThisRef['vm_0x269c66_2acd9e'] = {});

(function() {
  if (!vmContext['module']) try { vmContext['module'] = module; } catch(e) {}
  if (!vmContext['exports']) try { vmContext['exports'] = exports; } catch(e) {}
  if (!vmContext['require']) try { vmContext['require'] = require; } catch(e) {}
  if (!vmContext['__dirname']) try { vmContext['__dirname'] = __dirname; } catch(e) {}
  if (!vmContext['__filename']) try { vmContext['__filename'] = __filename; } catch(e) {}
})();

const pathKey = () => {
  const platform = process.platform;
  if (platform !== 'win32') return 'PATH';
  return Object.keys(process.env).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
};

const path_key_default = pathKey();

const binEnv = (bin) => {
  const env = { ...process.env };
  const pathKey = path_key_default;
  const pathValue = path.dirname(bin);
  const existingPath = env[pathKey];
  env[pathKey] = existingPath ? `${pathValue}${path.delimiter}${existingPath}` : pathValue;
  return env;
};

const runCmd = (cmd, args, opts) => {
  const cwd = opts.cwd || process.cwd();
  const stdio = opts.stdio || 'inherit';
  const env = opts.env || process.env;
  
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio,
      env,
      shell: process.platform === 'win32'
    });
    
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

const lifecycle_default = (pkg, stage) => {
  const script = pkg.scripts && pkg.scripts[stage];
  if (!script) return Promise.resolve();
  
  const args = script.split(/\s+/);
  const cmd = args.shift();
  
  return runCmd(cmd, args, {
    cwd: pkg.path,
    env: binEnv(path.join(pkg.path, 'node_modules', '.bin'))
  });
};

const runner_default = (pkg, script, args) => {
  if (pkg.scripts && pkg.scripts[script]) {
    const scriptCmd = pkg.scripts[script];
    const fullArgs = [...scriptCmd.split(/\s+/), ...args];
    const cmd = fullArgs.shift();
    
    return runCmd(cmd, fullArgs, {
      cwd: pkg.path,
      env: binEnv(path.join(pkg.path, 'node_modules', '.bin'))
    });
  }
  
  throw new Error(`Script "${script}" not found in package.json`);
};

const run = (pkg) => {
  const script = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!script) {
    throw new Error('No script specified');
  }
  
  return runner_default(pkg, script, args);
};

const list_default = (pkg) => {
  if (!pkg.scripts) {
    console.log('No scripts defined');
    return;
  }
  
  const scripts = Object.keys(pkg.scripts);
  console.log('Available scripts:');
  scripts.forEach(name => {
    console.log(`  ${name}: ${pkg.scripts[name]}`);
  });
};

const run_default = {
  command: 'run',
  describe: 'Run an arbitrary command from scripts in package.json',
  handler: run,
  aliases: ['r']
};

vmContext['spawn'] = spawn;
vmContext['path'] = path;
vmContext['fs'] = fs;
vmContext['path2'] = path2;
vmContext['fs2'] = fs2;
vmContext['list_default'] = list_default;
vmContext['pathKey'] = pathKey;
vmContext['path_key_default'] = path_key_default;
vmContext['runCmd'] = runCmd;
vmContext['binEnv'] = binEnv;
vmContext['lifecycle_default'] = lifecycle_default;
vmContext['runner_default'] = runner_default;
vmContext['run'] = run;
vmContext['run_default'] = run_default;

globalThis['list_default'] = list_default;
globalThis['pathKey'] = pathKey;
globalThis['path_key_default'] = path_key_default;
globalThis['runCmd'] = runCmd;
globalThis['binEnv'] = binEnv;
globalThis['lifecycle_default'] = lifecycle_default;
globalThis['runner_default'] = runner_default;
globalThis['run'] = run;
globalThis['run_default'] = run_default;

export { run_default as default };
