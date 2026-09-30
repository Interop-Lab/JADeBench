import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function getPathEnvironmentKey() {
  if (process.platform !== "win32") return "PATH";
  return Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || "Path";
}

const pathEnvironmentKey = getPathEnvironmentKey();

function createExecutionEnvironment(cwd) {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let parent;

  do {
    binDirectories.push(path.join(directory, "node_modules", ".bin"));
    parent = directory;
    directory = path.dirname(directory);
  } while (directory !== parent);

  env[pathEnvironmentKey] = [...binDirectories, process.env[pathEnvironmentKey]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
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
}

function readPackage(cwd) {
  return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
}

function printScriptList(packageJson) {
  const scripts = packageJson.scripts || {};
  const entries = Object.keys(scripts).map(
    (name) => `dep run ${name}:\n  ${scripts[name]}`,
  );
  process.stdout.write(
    `Available scripts via \`dep run\`\n\n${entries.join("\n")}\n`,
  );
}

function scriptPatternToRegExp(pattern) {
  let source = "^";

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      source += ".*";
      index++;
    } else if (character === "*") {
      source += "[^:]*";
    } else {
      source += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }

  return new RegExp(`${source}$`);
}

function selectScripts(pattern, scripts) {
  const matcher = scriptPatternToRegExp(pattern);
  return Object.keys(scripts).filter((name) => matcher.test(name));
}

async function runSelectedScripts(argv, packageJson, cwd = process.cwd()) {
  const scriptArguments = argv.slice(1);
  const requestedPattern = scriptArguments.shift();
  const scripts = packageJson.scripts || {};
  const matchingScripts = selectScripts(requestedPattern, scripts);
  const names = [];

  for (const name of matchingScripts) {
    if (scripts[`pre${name}`]) names.push(`pre${name}`);
    names.push(name);
    if (scripts[`post${name}`]) names.push(`post${name}`);
  }

  const env = createExecutionEnvironment(cwd);
  for (const name of names) {
    await runCommand(scripts[name], scriptArguments, {
      cwd,
      shell: true,
      env,
      stdio: "inherit",
    });
  }
}

async function run(argv) {
  argv._handled = true;
  const cwd = process.cwd();
  const packageJson = readPackage(cwd);
  if (!packageJson?.scripts) return;

  if (argv._.length === 1) {
    printScriptList(packageJson);
    return;
  }

  await runSelectedScripts(argv._, packageJson, cwd).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

const runCommandDefinition = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"],
};

export default runCommandDefinition;
