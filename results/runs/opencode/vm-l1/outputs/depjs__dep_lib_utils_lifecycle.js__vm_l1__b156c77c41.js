import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/** Environment variable used to locate executable files. */
const pathKey = () => {
  if (process.platform !== "win32") return "PATH";

  return (
    Object.keys(process.env).find((key) => key.toUpperCase() === "PATH") ??
    "Path"
  );
};

const pathEnvironmentKey = pathKey();

/**
 * Run a child process and reject when it cannot start or exits unsuccessfully.
 */
const runCmd = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${exitCode}: ${command}`));
      }
    });
  });

/**
 * Copy the current environment and prepend every applicable node_modules/.bin
 * directory between `directory` and the filesystem root to PATH.
 */
const binEnv = (directory) => {
  const environment = { ...process.env };
  const binaryDirectories = [];
  let currentDirectory = directory;

  while (true) {
    binaryDirectories.push(path.join(currentDirectory, "node_modules", ".bin"));

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) break;
    currentDirectory = parentDirectory;
  }

  environment[pathEnvironmentKey] = [
    ...binaryDirectories,
    process.env[pathEnvironmentKey],
  ]
    .filter(Boolean)
    .join(path.delimiter);

  return environment;
};

/**
 * Run the requested scripts from a package.json in `directory`.
 * Missing packages and script names are ignored; the return value indicates
 * whether at least one script was run.
 */
const lifecycle = async (directory, scriptNames) => {
  let packageManifest;

  try {
    packageManifest = JSON.parse(
      fs.readFileSync(path.join(directory, "package.json")),
    );
  } catch {
    return false;
  }

  let ranScript = false;
  for (const scriptName of scriptNames) {
    const command = packageManifest.scripts?.[scriptName];
    if (!command) continue;

    await runCmd(command, [], {
      cwd: directory,
      shell: true,
      env: binEnv(directory),
      stdio: "inherit",
    });
    ranScript = true;
  }

  return ranScript;
};

// Preserve the globals installed by the generated input module.
globalThis.pathKey = pathKey;
globalThis.path_key_default = pathEnvironmentKey;
globalThis.runCmd = runCmd;
globalThis.binEnv = binEnv;
globalThis.lifecycle_default = lifecycle;

export { binEnv, lifecycle as default, runCmd };
