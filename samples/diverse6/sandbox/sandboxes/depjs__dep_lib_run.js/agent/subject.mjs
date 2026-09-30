// ../work/depjs__dep/lib/run/list.js
var list_default = (pkg) => {
  const scripts = pkg.scripts;
  process.stdout.write(
    "Available scripts via `dep run`\n\n" + Object.keys(scripts).map((key) => {
      return "dep run " + key + ":\n  " + scripts[key];
    }).join("\n") + "\n"
  );
};

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

// ../work/depjs__dep/lib/run/runner.js
var runner_default = async (_, pkg, cwd) => {
  cwd = cwd || process.cwd();
  const args = _.slice(1);
  const scripts = pkg.scripts;
  const key = args.shift();
  const cmds = Object.keys(scripts).filter((script) => {
    return script === "pre" + key || script === key || script === "post" + key;
  }).map((script) => {
    return scripts[script];
  });
  const env = binEnv(cwd);
  for (const cmd of cmds) {
    await runCmd(cmd, args, { cwd, shell: true, env, stdio: "inherit" });
  }
};

// ../work/depjs__dep/lib/run.js
import path2 from "path";
import fs2 from "fs";
var run = (argv) => {
  argv._handled = true;
  const pkgJSON = JSON.parse(fs2.readFileSync(path2.join(process.cwd(), "package.json")));
  if (!pkgJSON.scripts) return;
  if (argv._.length === 1) {
    list_default(pkgJSON);
  } else {
    runner_default(argv._, pkgJSON).catch((e) => {
      process.stderr.write(e.message + "\n");
      process.exitCode = 1;
    });
  }
};
var run_default = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"]
};
export {
  run_default as default
};
