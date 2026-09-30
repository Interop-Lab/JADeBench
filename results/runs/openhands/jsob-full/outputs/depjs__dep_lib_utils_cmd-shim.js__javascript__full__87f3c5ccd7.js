import {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import { dirname, relative } from "path";

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const CMD_HEADER = [
  "@ECHO off",
  "GOTO start",
  ":find_dp0",
  "SET dp0=%~dp0",
  "EXIT /b",
  ":start",
  "SETLOCAL",
  "CALL :find_dp0",
  "",
].join("\r\n");

const SH_HEADER = [
  "#!/bin/sh",
  "basedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")",
  'basedir_win="$basedir"',
  "",
  "case `uname -a` in",
  "  *CYGWIN*|*MINGW*|*MSYS*)",
  "    if command -v cygpath > /dev/null 2>&1; then",
  '      basedir_win=`cygpath -w "$basedir"`',
  "    fi",
  "  ;;",
  "  *WSL2*)",
  "    if command -v wslpath > /dev/null 2>&1; then",
  '      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"',
  '      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then',
  '        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2',
  "        exit 1",
  "      fi",
  "    fi",
  "  ;;",
  "esac",
  "",
  "",
].join("\n");

const POWERSHELL_HEADER = [
  "#!/usr/bin/env pwsh",
  "$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent",
  "",
  '$exe=""',
  'if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {',
  "  # Fix case when both the Windows and Linux builds of Node",
  "  # are installed in the same directory",
  '  $exe=".exe"',
  "}",
  "",
].join("\n");

const quote = (value) => `"${value}"`;
const stripOuterQuotes = (value) => value.replace(/(^")|("$)/g, "");

const replaceDollarWithPercentPair = (value) => {
  const variableExpr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = "";
  let start = 0;
  let match;

  while ((match = variableExpr.exec(value))) {
    result += `${value.substring(start, match.index) || ""}%${match[1]}%`;
    start = variableExpr.lastIndex;
  }

  return result + value.slice(start);
};

const convertToSetCommands = (variables) => {
  let commands = "";

  for (const assignment of variables.split(" ")) {
    const [rawName, rawValue] = assignment.split("=");
    const name = (rawName || "").trim();
    const value = (rawValue || "").trim();

    if (name && value) {
      commands += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return commands;
};

const remove = (path) => unlink(path).catch(() => {});

const writeShim = (source, destination, interpreter, args, variables) => {
  const relativeTarget = relative(dirname(destination), source)
    .split("\\")
    .join("/");
  const windowsRelativeTarget = relativeTarget.split("/").join("\\");

  args = args || "";
  variables = variables || "";

  let cmdProgram;
  let cmdProgramExe;
  let cmdTarget = windowsRelativeTarget;
  let shellProgram;
  let shellFallback;
  let shellTarget = relativeTarget;
  let powershellProgram;
  let powershellFallback;
  let powershellTarget = relativeTarget;

  if (interpreter) {
    const normalizedInterpreter = interpreter.split("\\").join("/");
    cmdProgram = quote(normalizedInterpreter);
    cmdProgramExe = quote(`%dp0%\\${normalizedInterpreter}.exe`);
    cmdTarget = quote(`%dp0%\\${windowsRelativeTarget}`);
    shellProgram = quote(`$basedir/${normalizedInterpreter}`);
    shellFallback = normalizedInterpreter;
    shellTarget = quote(`$basedir_win/${relativeTarget}`);
    powershellProgram = quote(`$basedir/${normalizedInterpreter}$exe`);
    powershellFallback = quote(`${normalizedInterpreter}$exe`);
    powershellTarget = quote(`$basedir/${relativeTarget}`);
    args = args.trim();
  } else {
    cmdProgram = quote(`%dp0%\\${windowsRelativeTarget}`);
    cmdTarget = "";
    shellProgram = quote(`$basedir/${relativeTarget}`);
    shellTarget = "";
    powershellFallback = shellProgram;
    powershellTarget = "";
    args = "";
  }

  let cmd = CMD_HEADER;
  if (cmdProgramExe) {
    cmd +=
      convertToSetCommands(variables) +
      "\r\nIF EXIST " +
      cmdProgramExe +
      ' (\r\n  SET "_prog=' +
      stripOuterQuotes(cmdProgramExe) +
      '"\r\n) ELSE (\r\n  SET "_prog=' +
      stripOuterQuotes(cmdProgram) +
      '"\r\n)\r\n\r\n' +
      'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ' +
      args +
      " " +
      cmdTarget +
      " %*\r\n";
  } else {
    cmd += `${cmdProgram} ${args} ${cmdTarget} %*\r\n`;
  }

  let sh = SH_HEADER;
  if (interpreter) {
    sh +=
      "PROG_EXE=" +
      shellProgram.replace(/"$/, '.exe"') +
      '\nif ! [ -x "$PROG_EXE" ]; then\n  PROG_EXE=' +
      shellProgram +
      '\n  if ! [ -x "$PROG_EXE" ]; then\n    PROG_EXE=' +
      shellFallback +
      '\n    if ! [ -x "$PROG_EXE" ]; then\n      PROG_EXE=' +
      shellFallback +
      ".exe\n    fi\n  fi\nfi\n\nexec " +
      variables +
      '"$PROG_EXE" ' +
      args +
      " " +
      shellTarget +
      ' "$@"\n';
  } else {
    sh += `exec ${shellProgram} ${args} ${shellTarget} "$@"\n`;
  }

  let powershell = POWERSHELL_HEADER;
  if (powershellProgram) {
    powershell +=
      "$ret=0\nif (Test-Path " +
      powershellProgram +
      ") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " +
      powershellProgram +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n  } else {\n    & " +
      powershellProgram +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " +
      powershellFallback +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n  } else {\n    & " +
      powershellFallback +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n";
  } else {
    powershell +=
      "# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & " +
      powershellFallback +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n} else {\n  & " +
      powershellFallback +
      " " +
      args +
      " " +
      powershellTarget +
      " $args\n}\nexit $LASTEXITCODE\n";
  }

  return Promise.all([
    writeFile(`${destination}.ps1`, powershell, "utf8"),
    writeFile(`${destination}.cmd`, cmd, "utf8"),
    writeFile(destination, sh, "utf8"),
  ]).then(() =>
    Promise.all([
      chmod(destination, 0o755),
      chmod(`${destination}.cmd`, 0o755),
      chmod(`${destination}.ps1`, 0o755),
    ]),
  );
};

const prepare = (source, destination) =>
  mkdir(dirname(destination), { recursive: true })
    .then(() => readFile(source, "utf8"))
    .then(
      (content) => {
        const firstLine = content.trim().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpr);

        if (!shebang) return writeShim(source, destination);
        return writeShim(
          source,
          destination,
          shebang[2],
          shebang[3] || "",
          shebang[1] || "",
        );
      },
      () => writeShim(source, destination),
    );

const cmdShim = (source, destination) =>
  stat(source)
    .then(() =>
      Promise.all([
        remove(destination),
        remove(`${destination}.cmd`),
        remove(`${destination}.ps1`),
      ]),
    )
    .then(() => prepare(source, destination));

export default cmdShim;
