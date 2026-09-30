import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/** Return the actual spelling of the PATH environment variable. */
function pathKey() {
  if (process.platform !== "win32") return "PATH";

  return (
    Object.keys(process.env).find((key) => /^PATH$/i.test(key)) || "Path"
  );
}

const pathKeyDefault = pathKey();

/**
 * Run a command and settle when its child process exits.
 */
function runCmd(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed with exit code ${code}: ${command}`));
    });
  });
}

/**
 * Construct an environment in which every node_modules/.bin directory from
 * cwd through its ancestors precedes the user's existing PATH.
 */
function binEnv(cwd) {
  const env = { ...process.env };
  const binDirectories = [];
  let directory = cwd;
  let previous;

  do {
    binDirectories.push(path.resolve(directory, "node_modules", ".bin"));
    previous = directory;
    directory = path.dirname(directory);
  } while (directory !== previous);

  env[pathKeyDefault] = [...binDirectories, process.env[pathKeyDefault]]
    .filter(Boolean)
    .join(path.delimiter);
  return env;
}

/** Run the requested lifecycle scripts from a package in order. */
async function lifecycle(directory, names) {
  let packageJson;
  try {
    packageJson = JSON.parse(
      fs.readFileSync(path.resolve(directory, "package.json")),
    );
  } catch {
    return false;
  }

  const scripts = packageJson.scripts || {};
  const env = binEnv(directory);
  let ranAny = false;

  for (const name of names) {
    const command = scripts[name];
    if (!command) continue;
    ranAny = true;
    await runCmd(command, [], {
      cwd: directory,
      shell: true,
      env,
      stdio: "inherit",
    });
  }

  return ranAny;
}

/** Display all scripts defined by a package.json object. */
function listScripts(packageJson) {
  const scripts = packageJson.scripts;
  process.stdout.write(
    `Available scripts:\n${Object.keys(scripts)
      .map((name) => `  ${name}\n    ${scripts[name]}`)
      .join("\n")}\n`,
  );
}

/** Resolve pre/main/post lifecycle names and run their command strings. */
async function runScripts(argv, packageJson, cwd = process.cwd()) {
  const args = argv.slice(1);
  const scripts = packageJson.scripts;
  const requestedName = args.shift().trim();
  const commands = Object.keys(scripts)
    .filter(
      (name) =>
        name === `pre${requestedName}` ||
        name === requestedName ||
        name === `post${requestedName}`,
    )
    .map((name) => scripts[name]);

  const env = binEnv(cwd);
  for (const command of commands) {
    await runCmd(command, args, {
      cwd,
      shell: true,
      env,
      stdio: "inherit",
    });
  }
}

function run(args) {
  args.handled = true;

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "package.json")),
  );
  if (!packageJson.scripts) return;

  if (args._.length === 1) {
    listScripts(packageJson);
  } else {
    runScripts(args._, packageJson).catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
  }
}

const runDefault = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"],
};

export { runDefault as default };
