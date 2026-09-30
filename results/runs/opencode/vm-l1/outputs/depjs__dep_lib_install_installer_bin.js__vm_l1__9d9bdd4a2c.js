import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path, { dirname, relative } from "node:path";

const executableMode = 0o755;
const nodeModulesDirectory = path.join(process.cwd(), "node_modules");
const isWindows = process.platform === "win32";

const shebangPattern =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(value) {
  return value.replace(/\$([_A-Za-z][_A-Za-z0-9]*)/g, "%$1%");
}

function convertToSetCommands(assignments = "") {
  return assignments
    .trim()
    .split(/\s+/)
    .filter((assignment) => assignment.includes("="))
    .map((assignment) => `@SET ${replaceDollarWithPercentPair(assignment)}\r\n`)
    .join("");
}

async function removeIfPresent(file) {
  try {
    return await unlink(file);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function shellShim(source, program, programArguments, assignments) {
  const command = program
    ? `${assignments}"$PROG_EXE"${programArguments} "$basedir_win/${source}" "$@"`
    : `"$basedir/${source}"   "$@"`;

  return `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")
basedir_win="$basedir"

case \`uname -a\` in
  *CYGWIN*|*MINGW*|*MSYS*)
    if command -v cygpath > /dev/null 2>&1; then
      basedir_win=\`cygpath -w "$basedir"\`
    fi
  ;;
  *WSL2*)
    if command -v wslpath > /dev/null 2>&1; then
      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"
      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then
        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2
        exit 1
      fi
    fi
  ;;
esac

${program ? `PROG_EXE="$basedir/${program}.exe"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE="$basedir/${program}"
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${program}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${program}.exe
    fi
  fi
fi
` : ""}

exec ${command}
`;
}

function cmdShimText(source, program, programArguments, assignments) {
  const command = program
    ? `${convertToSetCommands(assignments)}\r
IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"${replaceDollarWithPercentPair(programArguments)} "%dp0%\\${source.replaceAll("/", "\\")}" %*`
    : `"%dp0%\\${source.replaceAll("/", "\\")}"   %*`;

  return `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
${command}\r
`;
}

function powershellShim(source, program, programArguments) {
  if (!program) {
    return `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/${source}"   $args
} else {
  & "$basedir/${source}"   $args
}
exit $LASTEXITCODE
`;
  }

  return `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/${program}$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/${program}$exe"${programArguments} "$basedir/${source}" $args
  } else {
    & "$basedir/${program}$exe"${programArguments} "$basedir/${source}" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "${program}$exe"${programArguments} "$basedir/${source}" $args
  } else {
    & "${program}$exe"${programArguments} "$basedir/${source}" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
}

async function writeShim(source, destination, program, programArguments = "", assignments = "") {
  const relativeSource = relative(dirname(destination), source).replaceAll("\\", "/");

  const writes = [
    writeFile(
      `${destination}.ps1`,
      powershellShim(relativeSource, program, programArguments, assignments),
      "utf8",
    ),
    writeFile(
      `${destination}.cmd`,
      cmdShimText(relativeSource, program, programArguments, assignments),
      "utf8",
    ),
    writeFile(
      destination,
      shellShim(relativeSource, program, programArguments, assignments),
      "utf8",
    ),
  ];

  await Promise.all(writes);
  return Promise.all([
    chmod(destination, executableMode),
    chmod(`${destination}.cmd`, executableMode),
    chmod(`${destination}.ps1`, executableMode),
  ]);
}

async function prepare(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  const contents = await readFile(source, "utf8");
  const firstLine = contents.split(/\r?\n/, 1)[0];
  const match = shebangPattern.exec(firstLine);

  if (!match) return writeShim(source, destination, "");

  const [, assignments = "", program, rawArguments = ""] = match;
  const programArguments = rawArguments ? `${rawArguments} ` : " ";
  return writeShim(source, destination, program, rawArguments || " ", assignments);
}

async function cmdShim(source, destination) {
  await Promise.all([
    removeIfPresent(destination),
    removeIfPresent(`${destination}.cmd`),
    removeIfPresent(`${destination}.ps1`),
  ]);
  return prepare(source, destination);
}

async function link(source, destination) {
  if (!isWindows) await chmod(source, executableMode);
  return cmdShim(source, destination);
}

async function readPackageBins(packageDirectory) {
  const packageJson = JSON.parse(
    await readFile(path.join(packageDirectory, "package.json"), "utf8"),
  );
  return packageJson.bin ?? {};
}

async function bin(destinationDirectory, packageDirectory, bins) {
  const packageBins = bins ?? (await readPackageBins(packageDirectory));
  if (!packageBins || typeof packageBins !== "object") return;

  await Promise.all(
    Object.entries(packageBins).map(([name, target]) =>
      link(
        path.resolve(packageDirectory, target),
        path.resolve(destinationDirectory, name),
      ),
    ),
  );
}

export default bin;
