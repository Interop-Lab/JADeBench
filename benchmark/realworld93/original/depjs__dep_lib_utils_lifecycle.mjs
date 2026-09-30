// ../work/depjs__dep/lib/utils/path-key.js
var pathKey = () => {
  if (process.platform !== "win32") return "PATH";
  const found = Object.keys(process.env).find((key) => /^PATH$/i.test(key));
  return found || "Path";
};
var path_key_default = pathKey();

// ../work/depjs__dep/lib/utils/lifecycle.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
var runCmd = (cmd, args, opts) => {
  return new Promise((resolve, reject) => {
    const script = spawn(cmd, args, opts);
    script.on("error", reject);
    script.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${cmd}`));
    });
  });
};
var binEnv = (cwd) => {
  const env = { ...process.env };
  const bins = [];
  let dir = cwd;
  let prev;
  do {
    bins.push(path.join(dir, "node_modules", ".bin"));
    prev = dir;
    dir = path.dirname(dir);
  } while (dir !== prev);
  env[path_key_default] = [...bins, process.env[path_key_default]].filter(Boolean).join(path.delimiter);
  return env;
};
var lifecycle_default = async (cwd, names) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json")));
  } catch (e) {
    return false;
  }
  const scripts = pkg.scripts || {};
  const env = binEnv(cwd);
  let ran = false;
  for (const name of names) {
    const cmd = scripts[name];
    if (!cmd) continue;
    ran = true;
    await runCmd(cmd, [], { cwd, shell: true, env, stdio: "inherit" });
  }
  return ran;
};
export {
  binEnv,
  lifecycle_default as default,
  runCmd
};
