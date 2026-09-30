import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function pathKey() {
    const platform = process.platform;
    if (platform === 'win32') {
        return 'Path';
    }
    return 'PATH';
}

const path_key_default = pathKey();

function runCmd(cmd, args, opts) {
    const env = opts?.env ?? process.env;
    const pathKey = path_key_default;
    const pathValue = env[pathKey];
    if (pathValue) {
        const newPath = pathValue.split(path.delimiter).map(p => {
            if (path.isAbsolute(p)) {
                return p;
            }
            return path.resolve(opts?.cwd ?? process.cwd(), p);
        }).join(path.delimiter);
        env[pathKey] = newPath;
    }
    return spawn(cmd, args, { ...opts, env });
}

function binEnv(env) {
    const pathKey = path_key_default;
    const pathValue = env[pathKey];
    if (pathValue) {
        const newPath = pathValue.split(path.delimiter).map(p => {
            if (path.isAbsolute(p)) {
                return p;
            }
            return path.resolve(process.cwd(), p);
        }).join(path.delimiter);
        env[pathKey] = newPath;
    }
    return env;
}

function lifecycle_default(pkg, opts) {
    const env = opts?.env ?? process.env;
    const pathKey = path_key_default;
    const pathValue = env[pathKey];
    if (pathValue) {
        const newPath = pathValue.split(path.delimiter).map(p => {
            if (path.isAbsolute(p)) {
                return p;
            }
            return path.resolve(opts?.cwd ?? process.cwd(), p);
        }).join(path.delimiter);
        env[pathKey] = newPath;
    }
    const script = pkg.scripts?.[opts?.event];
    if (!script) {
        return Promise.resolve();
    }
    const [cmd, ...args] = script.split(/\s+/);
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd: opts?.cwd,
            env,
            stdio: opts?.stdio ?? 'inherit',
            shell: opts?.shell ?? true
        });
        child.on('error', reject);
        child.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

export { binEnv, lifecycle_default as default, runCmd };
