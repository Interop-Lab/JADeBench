import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/** Return the actual spelling of the PATH environment variable. */
const pathKey = () => {
  if (process.platform !== "win32") return "PATH";
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || "Path";
};

const pathKeyDefault = pathKey();

/** Spawn a command and resolve only when it exits successfully. */
const runCmd = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });

/**
 * Build an environment whose PATH includes every ancestor node_modules/.bin
 * directory, starting at cwd.
 */
const binEnv = (cwd) => {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let previous;

  do {
    binDirectories.push(path.join(directory, "node_modules", ".bin"));
    previous = directory;
    directory = path.dirname(directory);
  } while (directory !== previous);

  env[pathKeyDefault] = [...binDirectories, process.env[pathKeyDefault]]
    .filter(Boolean)
    .join(path.delimiter);

  return env;
};

/** Run selected package.json lifecycle scripts in the supplied directory. */
const lifecycle = async (cwd, lifecycleNames) => {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(cwd, "package.json")));
  } catch {
    return false;
  }

  const scripts = manifest.scripts || {};
  const env = binEnv(cwd);
  let ranScript = false;

  for (const name of lifecycleNames) {
    const command = scripts[name];
    if (!command) continue;

    ranScript = true;
    await runCmd(command, [], {
      cwd,
      shell: true,
      env,
      stdio: "inherit",
    });
  }

  return ranScript;
};

export { binEnv, lifecycle as default, runCmd };
