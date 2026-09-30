import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function listScripts(packageJson) {
  const scripts = packageJson.scripts;
  const descriptions = Object.keys(scripts).map(
    (name) => `dep run ${name}:\n  ${scripts[name]}`,
  );

  process.stdout.write(
    `Available scripts via \`dep run\`\n\n${descriptions.join("\n")}`,
  );
}

function findPathKey() {
  if (process.platform !== "win32") return "PATH";
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || "Path";
}

const pathKey = findPathKey();

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Command failed with exit code ${exitCode}: ${command}`,
        ),
      );
    });
  });
}

function environmentWithLocalBins(directory) {
  const binDirectories = [];
  let currentDirectory = directory;

  while (true) {
    binDirectories.push(path.join(currentDirectory, "node_modules", ".bin"));
    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) break;
    currentDirectory = parentDirectory;
  }

  const searchPath = [...binDirectories, process.env[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);

  return { ...process.env, [pathKey]: searchPath };
}

async function runScript(argv, packageJson, directory = process.cwd()) {
  const args = argv.slice(1);
  const scriptName = args.shift();
  const scripts = packageJson.scripts;

  const lifecycleNames = Object.keys(scripts).filter((name) =>
    [`pre${scriptName}`, scriptName, `post${scriptName}`].includes(name),
  );

  for (const lifecycleName of lifecycleNames) {
    const commandArgs = lifecycleName === scriptName ? args : [];
    await runCommand(scripts[lifecycleName], commandArgs, {
      cwd: directory,
      shell: true,
      env: environmentWithLocalBins(directory),
      stdio: "inherit",
    });
  }
}

function reportFailure(error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}

function run(argv) {
  argv._handled = true;
  const directory = process.cwd();
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json")),
  );

  if (!packageJson.scripts) return;
  if (argv._.length === 1) {
    listScripts(packageJson);
    return;
  }
  return runScript(argv._, packageJson, directory).catch(reportFailure);
}

const runCommandDefinition = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"],
};

export default runCommandDefinition;
