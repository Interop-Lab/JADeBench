import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import { dirname, relative } from "path";

const shebangExpr =
  /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = (value) => value.replace(/\$/g, "%%");

const convertToSetCommands = (variables) =>
  variables
    ? variables
        .trim()
        .split(/\s+/)
        .map((variable) => `SET ${replaceDollarWithPercentPair(variable)}`)
        .join("\r\n") + "\r\n"
    : "";

const rm = (path) => unlink(path).catch(() => {});

const writeShim = async (from, to, program, args, variables) => {
  const target = relative(dirname(to), from).replace(/\\/g, "/");
  const shellVariables = variables ? `${variables.trim()} ` : "";
  const cmdVariables = convertToSetCommands(variables);
  const executable = program || "node";
  const programArgs = args || "";

  const shell = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

if [ -x "$basedir/${executable}" ]; then
  exec ${shellVariables}"$basedir/${executable}"${programArgs} "$basedir/${target}" "$@"
else
  exec ${shellVariables}${executable}${programArgs} "$basedir/${target}" "$@"
fi
`;

  const cmd = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
\r
${cmdVariables}IF EXIST "%dp0%\\${executable}.exe" (\r
  SET "_prog=%dp0%\\${executable}.exe"\r
) ELSE (\r
  SET "_prog=${executable}"\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"${replaceDollarWithPercentPair(programArgs)} "%dp0%\\${target.replace(/\//g, "\\")}" %*\r
`;

  const powershell = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe="${executable}"
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  $exe="${executable}.exe"
}
$ret=0
if (Test-Path "$basedir/$exe") {
  & "$basedir/$exe"${programArgs} "$basedir/${target}" $args
  $ret=$LASTEXITCODE
} else {
  & "$exe"${programArgs} "$basedir/${target}" $args
  $ret=$LASTEXITCODE
}
exit $ret
`;

  await Promise.all([
    writeFile(to, shell, "utf8"),
    writeFile(`${to}.cmd`, cmd, "utf8"),
    writeFile(`${to}.ps1`, powershell, "utf8"),
  ]);
  await chmod(to, 0o755);
};

const prepare = async (from, to) => {
  const source = await readFile(from, "utf8");
  const firstLine = source.trimStart().split(/\r?\n/, 1)[0];
  const shebang = firstLine.match(shebangExpr);

  if (!shebang) {
    return writeShim(from, to);
  }

  const [, variables, program, args] = shebang;
  return writeShim(from, to, program, args, variables);
};

const cmdShim = async (from, to) => {
  await Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]);
  await mkdir(dirname(to), { recursive: true });
  return prepare(from, to);
};

const nodeModules = `${process.cwd()}/node_modules`;
const isWindows = process.platform === "win32";

const link = async (from, to) => {
  if (!isWindows) {
    const sourceStat = await stat(from);
    if (!sourceStat.isFile()) {
      throw new Error(`cannot link non-file executable: ${from}`);
    }
  }
  return cmdShim(from, to);
};

const bin = async (from, to, options = {}) => {
  const destination = to || `${nodeModules}/.bin/${from.split(/[\\/]/).pop()}`;

  if (!options.force) {
    try {
      await stat(destination);
      return;
    } catch {
      // A missing destination is the normal case.
    }
  }

  return link(from, destination);
};

export default bin;
