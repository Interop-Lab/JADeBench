import fs from "fs";
import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import path, { dirname, relative } from "path";

const shebangExpr =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const binDirectory = path.join(process.cwd(), "node_modules", ".bin");
const isWindows = process.platform === "win32";

const remove = file => unlink(file).catch(() => {});

// cmd.exe expands percent-delimited names.  A literal '$name' in an
// interpreter argument is therefore represented as '%name%'.
const replaceDollarWithPercentPair = value => {
  const expression = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = "";
  let offset = 0;
  let match;

  while ((match = expression.exec(value))) {
    result += (value.slice(offset, match.index) || "") + "%" + match[1] + "%";
    offset = expression.lastIndex;
  }
  return result + value.slice(offset);
};

const convertToSetCommands = assignments => {
  let result = "";
  for (const assignment of assignments.split(" ")) {
    const [rawName, rawValue] = assignment.split("=");
    const name = rawName || "";
    const value = rawValue || "";
    if (name && value)
      result += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
  }
  return result;
};

/**
 * Write the three Windows launcher files used by npm-style binary links.
 * `interpreter`, `variables`, and `arguments` are obtained from a shebang.
 */
const writeShim = async (
  source,
  destination,
  interpreter,
  variables = "",
  arguments_ = "",
) => {
  let target = relative(dirname(destination), source).replace(/\\/g, "/");
  const shellTarget = target.replace(/\//g, "\\");

  let command;
  let shellCommand;
  let powershellCommand;

  if (!interpreter) {
    command = `"%~dp0\\${shellTarget}" %*`;
    shellCommand = `exec "$basedir/${target}" "$@"`;
    powershellCommand = `& "$basedir/${target}" $args`;
  } else {
    const normalizedInterpreter = interpreter.replace(/\\/g, "/");
    const quotedInterpreter = `"${normalizedInterpreter}"`;
    const commandVariables = convertToSetCommands(variables);
    const commandArguments = replaceDollarWithPercentPair(arguments_);

    command =
      commandVariables +
      `@IF EXIST "%~dp0\\${normalizedInterpreter}.exe" (\r\n` +
      `  SET "_prog=%~dp0\\${normalizedInterpreter}.exe"\r\n` +
      `) ELSE (\r\n` +
      `  SET "_prog=${normalizedInterpreter}"\r\n` +
      `  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n` +
      `)\r\n` +
      `\r\n` +
      `endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & ` +
      `"%_prog%" ${commandArguments} "%~dp0\\${shellTarget}" %*`;

    shellCommand =
      `if [ -x "$basedir/${normalizedInterpreter}" ]; then\n` +
      `  exec "$basedir/${normalizedInterpreter}" ${arguments_} "$basedir/${target}" "$@"\n` +
      `else\n` +
      `  exec ${quotedInterpreter} ${arguments_} "$basedir/${target}" "$@"\n` +
      `fi`;

    powershellCommand =
      `$exe = "${normalizedInterpreter}$exeext"\n` +
      `$ret = 0\n` +
      `if (Test-Path "$basedir/$exe") {\n` +
      `  if ($MyInvocation.ExpectingInput) {\n` +
      `    $input | & "$basedir/$exe" ${arguments_} "$basedir/${target}" $args\n` +
      `  } else {\n` +
      `    & "$basedir/$exe" ${arguments_} "$basedir/${target}" $args\n` +
      `  }\n` +
      `  $ret = $LASTEXITCODE\n` +
      `} else {\n` +
      `  if ($MyInvocation.ExpectingInput) {\n` +
      `    $input | & "$exe" ${arguments_} "$basedir/${target}" $args\n` +
      `  } else {\n` +
      `    & "$exe" ${arguments_} "$basedir/${target}" $args\n` +
      `  }\n` +
      `  $ret = $LASTEXITCODE\n` +
      `}\n` +
      `exit $ret`;
  }

  const sh =
    `#!/bin/sh\n` +
    `basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n\n` +
    `case \`uname\` in\n` +
    `    *CYGWIN*|*MINGW*|*MSYS*)\n` +
    `        if command -v cygpath > /dev/null 2>&1; then\n` +
    `            basedir=\`cygpath -w "$basedir"\`\n` +
    `        fi\n` +
    `    ;;\n` +
    `esac\n\n` +
    `${shellCommand}\n`;

  const cmd = `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n\r\n${command}\r\n`;

  const ps1 =
    `#!/usr/bin/env pwsh\n` +
    `$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n` +
    `$exeext=""\n` +
    `if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n` +
    `  $exeext=".exe"\n` +
    `}\n` +
    `${powershellCommand}\n`;

  await Promise.all([
    writeFile(destination, sh, "utf8"),
    writeFile(destination + ".cmd", cmd, "utf8"),
    writeFile(destination + ".ps1", ps1, "utf8"),
  ]);
  await Promise.all([
    chmod(destination, 0o755),
    chmod(destination + ".cmd", 0o755),
    chmod(destination + ".ps1", 0o755),
  ]);
};

const prepareWindowsShim = (source, destination) =>
  mkdir(dirname(destination), { recursive: true })
    .then(() => readFile(source, "utf8"))
    .then(
      contents => {
        const firstLine = contents.toString().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpr);
        if (!shebang) return writeShim(source, destination);
        return writeShim(
          source,
          destination,
          shebang[2],
          shebang[1] || "",
          shebang[3] || "",
        );
      },
      () => writeShim(source, destination),
    );

const createWindowsShim = (source, destination) =>
  stat(source)
    .then(() =>
      Promise.all([
        remove(destination),
        remove(destination + ".cmd"),
        remove(destination + ".ps1"),
      ]),
    )
    .then(() => prepareWindowsShim(source, destination));

const link = async (source, destination) => {
  if (isWindows) {
    await createWindowsShim(source, destination);
    return;
  }

  try {
    fs.unlinkSync(destination);
  } catch {}
  fs.symlinkSync(source, destination);
  fs.chmodSync(source, 0o755);
};

/**
 * Link a package's `bin` entries into `<cwd>/node_modules/.bin`.
 *
 * @param {string} packageName package name (used for a string-valued `bin`)
 * @param {string} packageDirectory directory containing package.json
 * @param {string|Record<string,string>} [binValue] optional package `bin` value
 */
async function bin(packageName, packageDirectory, binValue) {
  if (binValue === undefined) {
    const packageJson = JSON.parse(
      await readFile(path.join(packageDirectory, "package.json")),
    );
    binValue = packageJson.bin;
  }

  if (!binValue) return;
  fs.mkdirSync(binDirectory, { recursive: true });

  if (typeof binValue === "string") {
    const name = packageName.startsWith("@")
      ? packageName.split("/").pop()
      : packageName;
    await link(
      path.join(packageDirectory, binValue),
      path.join(binDirectory, name),
    );
  } else if (typeof binValue === "object") {
    for (const name of Object.keys(binValue)) {
      await link(
        path.join(packageDirectory, binValue[name]),
        path.join(binDirectory, name),
      );
    }
  }
}

export default bin;
