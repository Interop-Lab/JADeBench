import { spawn } from "child_process";
import path from "path";
import fs from "fs";

function pathKey() {
  if (process.platform !== "win32") {
    return "PATH";
  }

  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || "Path";
}

const pathEnvironmentKey = pathKey();

function runCmd(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${exitCode}: ${command}`));
    });
  });
}

function binEnv(directory) {
  const binDirectories = [];
  let currentDirectory = directory;

  while (true) {
    binDirectories.push(path.join(currentDirectory, "node_modules", ".bin"));

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      break;
    }
    currentDirectory = parentDirectory;
  }

  return [
    ...binDirectories,
    process.env[pathEnvironmentKey],
  ].filter(Boolean).join(path.delimiter);
}

async function lifecycle(scriptName, cwd) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, "package.json")),
  );
  const command = packageJson.scripts?.[scriptName];

  if (!command) {
    return false;
  }

  await runCmd(command, [], {
    cwd,
    shell: true,
    env: {
      ...process.env,
      [pathEnvironmentKey]: binEnv(cwd),
    },
    stdio: "inherit",
  });

  return true;
}

export { binEnv, lifecycle as default, runCmd };
