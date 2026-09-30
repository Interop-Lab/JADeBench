import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function listScripts(packageJson) {
  console.log("Available scripts via `dep run`\n");

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    console.log(`dep run ${name}:\n  ${command}`);
  }
}

function pathKey() {
  return process.platform === "win32" ? "Path" : "PATH";
}

const pathEnvironmentKey = pathKey();

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}${signal ? ` (${signal})` : ""}`));
    });
  });
}

function binEnvironment(directory) {
  const env = { ...process.env };
  const binDirectories = [];
  let current = path.resolve(directory);

  while (true) {
    binDirectories.push(path.join(current, "node_modules", ".bin"));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  env[pathEnvironmentKey] = [
    ...binDirectories,
    process.env[pathEnvironmentKey],
  ].filter(Boolean).join(path.delimiter);
  return env;
}

async function runLifecycleScript(command, cwd) {
  if (!command) return false;
  await runCommand(command, [], {
    cwd,
    shell: true,
    env: binEnvironment(cwd),
    stdio: "inherit",
  });
  return true;
}

async function runPackageScript(argv, packageJson, cwd) {
  const args = argv.slice(1);
  const scriptName = argv.slice().shift();
  const scripts = packageJson.scripts;

  if (!scriptName) {
    listScripts(packageJson);
    return;
  }

  if (!scripts?.[scriptName]) {
    throw new Error(`Missing script: ${scriptName}`);
  }

  await runLifecycleScript(scripts[`pre${scriptName}`], cwd);

  const command = args.length
    ? `${scripts[scriptName]} ${args.join(" ")}`
    : scripts[scriptName];
  await runLifecycleScript(command, cwd);

  await runLifecycleScript(scripts[`post${scriptName}`], cwd);
}

async function run(argv) {
  const args = Array.isArray(argv) ? argv : argv?._;
  if (!args?.length) return;

  const cwd = process.cwd();
  const packagePath = path.join(cwd, "package.json");
  const packageJson = JSON.parse(await fs.promises.readFile(packagePath, "utf8"));
  await runPackageScript(args, packageJson, cwd);
}

const runCommandDefinition = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"],
};

export default runCommandDefinition;
