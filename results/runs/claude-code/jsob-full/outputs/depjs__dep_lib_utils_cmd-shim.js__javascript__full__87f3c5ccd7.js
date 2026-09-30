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
const variableExpr = /\$\{?([^$@#?\- \t{}:]+)\}?/g;

function replaceDollarWithPercentPair(value) {
  let result = "";
  let previousIndex = 0;
  let match;

  while ((match = variableExpr.exec(value))) {
    result += `${value.substring(previousIndex, match.index) || ""}%${match[1]}%`;
    previousIndex = variableExpr.lastIndex;
  }

  return result + value.slice(previousIndex);
}

function convertToSetCommands(variables) {
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
}

function remove(path) {
  return unlink(path).catch(() => {});
}

const shHeader = `#!/bin/sh
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

`;

const cmdHeader = `@ECHO off\r
GOTO start\r
:find_dp0\r
SET dp0=%~dp0\r
EXIT /b\r
:start\r
SETLOCAL\r
CALL :find_dp0\r
`;

const powershellHeader = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
`;

function makePowerShellInvocation(command, args, target) {
  return `# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & ${command} ${args} ${target} $args
} else {
  & ${command} ${args} ${target} $args
}
exit $LASTEXITCODE
`;
}

async function writeShim(source, destination, program, args, variables) {
  let target = relative(dirname(destination), source)
    .split("\\")
    .join("/");
  let windowsTarget = target.split("/").join("\\");
  let powershellTarget = target;
  const normalizedProgram = program && program.split("\\").join("/");

  args = args || "";
  variables = variables || "";

  let shProgram;
  let shProgramWithoutExe;
  let powershellProgram;
  let powershellFallbackProgram;
  let cmdProgram;
  let cmdExeProgram;

  if (normalizedProgram) {
    shProgram = `"$basedir_win/${normalizedProgram}"`;
    shProgramWithoutExe = `"$basedir/${normalizedProgram}"`;
    powershellProgram = `"$basedir/${normalizedProgram}$exe"`;
    powershellFallbackProgram = `"$basedir/${normalizedProgram}"`;
    cmdProgram = `"%dp0%\\${normalizedProgram}"`;
    cmdExeProgram = `"%dp0%\\${normalizedProgram}.exe"`;
    target = `"$basedir_win/${target}"`;
    windowsTarget = `"%dp0%\\${windowsTarget}"`;
    powershellTarget = `"$basedir/${powershellTarget}"`;
  } else {
    shProgram = `"$basedir/${target}"`;
    powershellProgram = shProgram;
    cmdProgram = `"%dp0%\\${windowsTarget}"`;
    target = "";
    windowsTarget = "";
    powershellTarget = "";
    args = "";
  }

  let cmd;
  if (cmdExeProgram) {
    const trimmedArgs = args.trim();
    cmd =
      cmdHeader +
      convertToSetCommands(variables) +
      `\r
IF EXIST ${cmdExeProgram} (\r
  SET "_prog=${cmdExeProgram.replace(
        /(^")|("$)/g,
        "",
      )}"\r
) ELSE (\r
  SET "_prog=${normalizedProgram.replace(
        /(^")|("$)/g,
        "",
      )}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${trimmedArgs} ${windowsTarget} %*\r
`;
  } else {
    cmd = `${cmdHeader}${cmdProgram} ${args} ${windowsTarget} %*\r\n`;
  }

  let sh = shHeader;
  if (shProgramWithoutExe) {
    sh += `PROG_EXE=${shProgramWithoutExe.replace(/"$/, '.exe"')}
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE=${shProgramWithoutExe}
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${shProgram}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${shProgram}.exe
    fi
  fi
fi

exec ${variables}"$PROG_EXE" ${args} ${target} "$@"
`;
  } else {
    sh += `exec ${shProgram} ${args} ${target} "$@"\n`;
  }

  let powershell = powershellHeader;
  if (normalizedProgram) {
    powershell += `$ret=0
if (Test-Path ${powershellProgram}) {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${powershellProgram} ${args} ${powershellTarget} $args
  } else {
    & ${powershellProgram} ${args} ${powershellTarget} $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${powershellFallbackProgram} ${args} ${powershellTarget} $args
  } else {
    & ${powershellFallbackProgram} ${args} ${powershellTarget} $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
  } else {
    powershell += makePowerShellInvocation(
      powershellProgram,
      args,
      powershellTarget,
    );
  }

  await Promise.all([
    writeFile(`${destination}.ps1`, powershell, "utf8"),
    writeFile(`${destination}.cmd`, cmd, "utf8"),
    writeFile(destination, sh, "utf8"),
  ]);

  await Promise.all([
    chmod(destination, 0o755),
    chmod(`${destination}.cmd`, 0o755),
    chmod(`${destination}.ps1`, 0o755),
  ]);
}

async function prepare(source, destination) {
  await mkdir(dirname(destination), { recursive: true });

  let contents;
  try {
    contents = await readFile(source, "utf8");
  } catch {
    return writeShim(source, destination);
  }

  const firstLine = contents.toString().split(/\r*\n/)[0];
  const shebang = firstLine.match(shebangExpr);
  if (!shebang) {
    return writeShim(source, destination);
  }

  const [, variables = "", program, args = ""] = shebang;
  return writeShim(source, destination, program, args, variables);
}

async function cmdShim(source, destination) {
  await stat(source);
  await Promise.all([
    remove(destination),
    remove(`${destination}.cmd`),
    remove(`${destination}.ps1`),
  ]);
  return prepare(source, destination);
}

export default cmdShim;
