// ../work/depjs__dep/lib/utils/cmd-shim.js
import { chmod, mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { dirname, relative } from "path";
var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
var replaceDollarWithPercentPair = (value) => {
  const dollarExpressions = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = "";
  let startIndex = 0;
  let match;
  do {
    match = dollarExpressions.exec(value);
    if (match) {
      result += (value.substring(startIndex, match.index) || "") + "%" + match[1] + "%";
      startIndex = dollarExpressions.lastIndex;
    }
  } while (dollarExpressions.lastIndex > 0);
  return result + value.slice(startIndex);
};
var convertToSetCommands = (variableString) => {
  let batch = "";
  for (const declaration of variableString.split(" ")) {
    const [key, value] = declaration.split("=");
    const k = (key || "").trim();
    const v = (value || "").trim();
    if (k && v) batch += "@SET " + k + "=" + replaceDollarWithPercentPair(v) + "\r\n";
  }
  return batch;
};
var rm = (path) => unlink(path).catch(() => {
});
var writeShim = (from, to, prog, args, variables) => {
  let shTarget = relative(dirname(to), from).split("\\").join("/");
  let target = shTarget.split("/").join("\\");
  let pwshTarget = shTarget;
  let longProg;
  let shProg = prog && prog.split("\\").join("/");
  let shLongProg;
  let pwshProg = shProg && `"${shProg}$exe"`;
  let pwshLongProg;
  args = args || "";
  variables = variables || "";
  if (!prog) {
    prog = `"%dp0%\\${target}"`;
    shProg = `"$basedir/${shTarget}"`;
    pwshProg = shProg;
    args = "";
    target = "";
    shTarget = "";
    pwshTarget = "";
  } else {
    longProg = `"%dp0%\\${prog}.exe"`;
    shLongProg = `"$basedir/${prog}"`;
    pwshLongProg = `"$basedir/${prog}$exe"`;
    target = `"%dp0%\\${target}"`;
    shTarget = `"$basedir_win/${shTarget}"`;
    pwshTarget = `"$basedir/${pwshTarget}"`;
  }
  const head = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";
  let cmd;
  if (longProg) {
    args = args.trim();
    cmd = head + convertToSetCommands(variables) + `\r
IF EXIST ${longProg} (\r
  SET "_prog=${longProg.replace(/(^")|("$)/g, "")}"\r
) ELSE (\r
  SET "_prog=${prog.replace(/(^")|("$)/g, "")}"\r
)\r
\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${args} ${target} %*\r
`;
  } else {
    cmd = `${head}${prog} ${args} ${target} %*\r
`;
  }
  let sh = '#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\nbasedir_win="$basedir"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w "$basedir"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"\n      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then\n        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n';
  if (shLongProg) {
    sh = sh + `PROG_EXE=${shLongProg.replace(/"$/, '.exe"')}
if ! [ -x "$PROG_EXE" ]; then
  PROG_EXE=${shLongProg}
  if ! [ -x "$PROG_EXE" ]; then
    PROG_EXE=${shProg}
    if ! [ -x "$PROG_EXE" ]; then
      PROG_EXE=${shProg}.exe
    fi
  fi
fi

exec ${variables}"$PROG_EXE" ${args} ${shTarget} "$@"
`;
  } else {
    sh = sh + `exec ${shProg} ${args} ${shTarget} "$@"
`;
  }
  let pwsh = '#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=".exe"\n}\n';
  if (pwshLongProg) {
    pwsh = pwsh + `$ret=0
if (Test-Path ${pwshLongProg}) {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshLongProg} ${args} ${pwshTarget} $args
  } else {
    & ${pwshLongProg} ${args} ${pwshTarget} $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshProg} ${args} ${pwshTarget} $args
  } else {
    & ${pwshProg} ${args} ${pwshTarget} $args
  }
  $ret=$LASTEXITCODE
}
exit $ret
`;
  } else {
    pwsh = pwsh + `# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & ${pwshProg} ${args} ${pwshTarget} $args
} else {
  & ${pwshProg} ${args} ${pwshTarget} $args
}
exit $LASTEXITCODE
`;
  }
  return Promise.all([
    writeFile(to + ".ps1", pwsh, "utf8"),
    writeFile(to + ".cmd", cmd, "utf8"),
    writeFile(to, sh, "utf8")
  ]).then(() => Promise.all([
    chmod(to, 493),
    chmod(to + ".cmd", 493),
    chmod(to + ".ps1", 493)
  ]));
};
var prepare = (from, to) => mkdir(dirname(to), { recursive: true }).then(() => readFile(from, "utf8")).then((data) => {
  const firstLine = data.trim().split(/\r*\n/)[0];
  const shebang = firstLine.match(shebangExpr);
  if (!shebang) return writeShim(from, to);
  return writeShim(from, to, shebang[2], shebang[3] || "", shebang[1] || "");
}, () => writeShim(from, to));
var cmdShim = (from, to) => stat(from).then(() => Promise.all([
  rm(to),
  rm(to + ".cmd"),
  rm(to + ".ps1")
])).then(() => prepare(from, to));
var cmd_shim_default = cmdShim;
export {
  cmd_shim_default as default
};
