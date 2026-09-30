import { chmod, mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { dirname, relative } from "path";

const SHIM_MODE = 0o755;

async function removeOldShim(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function parseShebang(source) {
  const firstLine = source.match(/^#![^\r\n]*/)?.[0];
  if (!firstLine) return { program: "", args: "" };

  let command = firstLine.slice(2).trim();
  if (command.startsWith("/usr/bin/env ")) {
    command = command.slice("/usr/bin/env ".length).trimStart();
    if (command.startsWith("-S ")) command = command.slice(3).trimStart();
  }

  const separator = command.search(/\s/);
  if (separator === -1) return { program: command, args: "" };
  return {
    program: command.slice(0, separator),
    args: command.slice(separator).trim(),
  };
}

function shellShim(script, program, args) {
  const invocationArgs = args ? ` ${args}` : " ";
  const header = `#!/bin/sh
basedir=\$(dirname "\$(echo "\$0" | sed -e 's,\\\\,/,g')")
basedir_win="\$basedir"

case \`uname -a\` in
  *CYGWIN*|*MINGW*|*MSYS*)
    if command -v cygpath > /dev/null 2>&1; then
      basedir_win=\`cygpath -w "\$basedir"\`
    fi
  ;;
  *WSL2*)
    if command -v wslpath > /dev/null 2>&1; then
      basedir_win="\$(wslpath -w "\$basedir" 2> /dev/null)"
      if [ \$? -ne 0 ] || [ -z "\$basedir_win" ]; then
        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2
        exit 1
      fi
    fi
  ;;
esac

`;

  if (!program) return header + `exec "\$basedir/${script}"   "\$@"\n`;

  return header + `PROG_EXE="\$basedir/${program}.exe"
if ! [ -x "\$PROG_EXE" ]; then
  PROG_EXE="\$basedir/${program}"
  if ! [ -x "\$PROG_EXE" ]; then
    PROG_EXE=${program}
    if ! [ -x "\$PROG_EXE" ]; then
      PROG_EXE=${program}.exe
    fi
  fi
fi

exec "\$PROG_EXE"${invocationArgs} "\$basedir_win/${script}" "\$@"
`;
}

function batchShim(script, program, args) {
  const windowsScript = script.replaceAll("/", "\\");
  const invocationArgs = args ? ` ${args}` : " ";
  const header = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
`;

  if (!program) return header + `"%dp0%\\${windowsScript}"  ${invocationArgs}%*\r
`;

  return header + `\r
IF EXIST "%dp0%\\${program}.exe" (\r
  SET "_prog=%dp0%\\${program}.exe"\r
) ELSE (\r
  SET "_prog=${program}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"${invocationArgs} "%dp0%\\${windowsScript}" %*\r
`;
}

function powershellShim(script, program, args) {
  const invocationArgs = args ? ` ${args}` : " ";
  const header = `#!/usr/bin/env pwsh
\$basedir=Split-Path \$MyInvocation.MyCommand.Definition -Parent

\$exe=""
if (\$PSVersionTable.PSVersion -lt "6.0" -or \$IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  \$exe=".exe"
}
`;

  if (!program) return header + `# Support pipeline input
if (\$MyInvocation.ExpectingInput) {
  \$input | & "\$basedir/${script}"  ${invocationArgs}\$args
} else {
  & "\$basedir/${script}"  ${invocationArgs}\$args
}
exit \$LASTEXITCODE
`;

  return header + `\$ret=0
if (Test-Path "\$basedir/${program}\$exe") {
  # Support pipeline input
  if (\$MyInvocation.ExpectingInput) {
    \$input | & "\$basedir/${program}\$exe"${invocationArgs} "\$basedir/${script}" \$args
  } else {
    & "\$basedir/${program}\$exe"${invocationArgs} "\$basedir/${script}" \$args
  }
  \$ret=\$LASTEXITCODE
} else {
  # Support pipeline input
  if (\$MyInvocation.ExpectingInput) {
    \$input | & "${program}\$exe"${invocationArgs} "\$basedir/${script}" \$args
  } else {
    & "${program}\$exe"${invocationArgs} "\$basedir/${script}" \$args
  }
  \$ret=\$LASTEXITCODE
}
exit \$ret
`;
}

async function cmdShim(source, target) {
  await stat(source);
  await Promise.all([
    removeOldShim(target),
    removeOldShim(`${target}.cmd`),
    removeOldShim(`${target}.ps1`),
  ]);
  await mkdir(dirname(target), { recursive: true });

  const contents = await readFile(source, "utf8");
  const { program, args } = parseShebang(contents);
  const script = relative(dirname(target), source).replaceAll("\\", "/");

  await Promise.all([
    writeFile(`${target}.ps1`, powershellShim(script, program, args), "utf8"),
    writeFile(`${target}.cmd`, batchShim(script, program, args), "utf8"),
    writeFile(target, shellShim(script, program, args), "utf8"),
  ]);
  return Promise.all([
    chmod(target, SHIM_MODE),
    chmod(`${target}.cmd`, SHIM_MODE),
    chmod(`${target}.ps1`, SHIM_MODE),
  ]);
}

globalThis.cmdShim = cmdShim;
globalThis.cmd_shim_default = cmdShim;

export { cmdShim as default };
