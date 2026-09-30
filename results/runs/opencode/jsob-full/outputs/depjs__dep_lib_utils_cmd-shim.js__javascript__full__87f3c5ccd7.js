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

// Batch files expand %NAME%, while Unix shebang environment assignments use
// $NAME or ${NAME}. Escape every such reference with surrounding percent signs.
const replaceDollarWithPercentPair = (value) => {
  const variable = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = "";
  let lastIndex = 0;
  let match;

  do {
    match = variable.exec(value);
    if (match) {
      result += `${value.substring(lastIndex, match.index) || ""}%${match[1]}%`;
      lastIndex = variable.lastIndex;
    }
  } while (variable.lastIndex > 0);

  return result + value.substring(lastIndex);
};

const convertToSetCommands = (environment) => {
  let commands = "";

  for (const assignment of environment.split(" ")) {
    const [rawName, rawValue] = assignment.split("=");
    const name = (rawName || "").trim();
    const value = (rawValue || "").trim();

    if (name && value) {
      commands += `@SET ${name}=${replaceDollarWithPercentPair(value)}\r\n`;
    }
  }

  return commands;
};

const removeIgnoringErrors = (path) => unlink(path).catch(() => {});

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

const ps1Header = `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
`;

const writeShim = (from, to, program, args, environment) => {
  const relativeTarget = relative(dirname(to), from).replaceAll("\\", "/");
  const cmdTarget = relativeTarget.replaceAll("/", "\\");
  const plainTarget = relativeTarget;
  let target;
  let shProgram;
  const normalizedProgram = program && program.replaceAll("\\", "/");
  let cmdLocalProgram;
  const quotedProgram = normalizedProgram && `"${normalizedProgram}"`;
  let ps1LocalProgram;

  args ||= "";
  environment ||= "";

  if (!program) {
    target = "";
    shProgram = `"$basedir/${relativeTarget}"`;
    cmdLocalProgram = `"%dp0%\\${cmdTarget}"`;
    ps1LocalProgram = `"$basedir/${plainTarget}"`;
  } else {
    cmdLocalProgram = `"%dp0%\\${program}.exe"`;
    target = `"$basedir_win/${relativeTarget}"`;
    shProgram = `"$basedir/${program}"`;
    ps1LocalProgram = `"$basedir/${program}$exe"`;
  }

  let cmd;
  if (normalizedProgram) {
    args = args.trim();
    cmd =
      cmdHeader +
      convertToSetCommands(environment) +
      `\r
IF EXIST ${cmdLocalProgram} (
  SET "_prog=${cmdLocalProgram.replace(/(^")|("$)/g, "")}"
) ELSE (
  SET "_prog=${program.replace(/(^")|("$)/g, "")}"
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${args} ${cmdTarget} %*\r
`;
  } else {
    cmd = `${cmdHeader}${cmdLocalProgram} ${args}  %*\r\n`;
  }

  let sh = shHeader;
  if (normalizedProgram) {
    sh += `PROG_EXE="${shProgram.replace(/"$/, ".exe\"")}"
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE=${shProgram}
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${quotedProgram}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${quotedProgram.replace(/"$/, ".exe\"")}
    fi
  fi
fi

exec ${environment}"$PROG_EXE" ${args} ${target} "$@"
`;
  } else {
    sh += `exec ${shProgram} ${args}  "$@"
`;
  }

  let ps1 = ps1Header;
  if (normalizedProgram) {
    const globalProgram = `"${normalizedProgram}$exe"`;
    ps1 += `$ret=0
if (Test-Path ${ps1LocalProgram}) {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${ps1LocalProgram} ${args} ${plainTarget} $args
  } else {
    & ${ps1LocalProgram} ${args} ${plainTarget} $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${globalProgram} ${args} ${plainTarget} $args
  } else {
    & ${globalProgram} ${args} ${plainTarget} $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
  } else {
    ps1 += `# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & ${ps1LocalProgram} ${args}  $args
} else {
  & ${ps1LocalProgram} ${args}  $args
}
exit $LASTEXITCODE
`;
  }

  return Promise.all([
    writeFile(`${to}.ps1`, ps1, "utf8"),
    writeFile(`${to}.cmd`, cmd, "utf8"),
    writeFile(to, sh, "utf8"),
  ]).then(() =>
    Promise.all([
      chmod(to, 0o755),
      chmod(`${to}.cmd`, 0o755),
      chmod(`${to}.ps1`, 0o755),
    ]),
  );
};

const prepare = (from, to) =>
  mkdir(dirname(to), { recursive: true })
    .then(() => readFile(from, "utf8"))
    .then(
      (source) => {
        const firstLine = source.toString().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpr);

        if (!shebang) return writeShim(from, to);
        return writeShim(
          from,
          to,
          shebang[2],
          shebang[3] || "",
          shebang[1] || "",
        );
      },
      () => writeShim(from, to),
    );

const cmdShim = (from, to) =>
  stat(from)
    .then(() =>
      Promise.all([
        removeIgnoringErrors(to),
        removeIgnoringErrors(`${to}.cmd`),
        removeIgnoringErrors(`${to}.ps1`),
      ]),
    )
    .then(() => prepare(from, to));

export default cmdShim;
