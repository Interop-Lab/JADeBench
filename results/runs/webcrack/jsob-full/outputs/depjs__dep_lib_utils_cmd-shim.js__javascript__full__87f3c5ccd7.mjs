import { chmod, mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { dirname, relative } from "path";
var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
var replaceDollarWithPercentPair = _0x206782 => {
  const _0x2a899e = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let _0x878660 = "";
  let _0xb39bee = 0;
  let _0x563a3f;
  do {
    _0x563a3f = _0x2a899e.exec(_0x206782);
    if (_0x563a3f) {
      _0x878660 += (_0x206782.substring(_0xb39bee, _0x563a3f.index) || "") + "%" + _0x563a3f[1] + "%";
      _0xb39bee = _0x2a899e.lastIndex;
    }
  } while (_0x2a899e.lastIndex > 0);
  return _0x878660 + _0x206782.slice(_0xb39bee);
};
var convertToSetCommands = _0x24056b => {
  let _0x22d648 = "";
  for (const _0x75523c of _0x24056b.split(" ")) {
    const [_0x210c6f, _0x166238] = _0x75523c.split("=");
    const _0x5e77ff = (_0x210c6f || "").trim();
    const _0x344066 = (_0x166238 || "").trim();
    if (_0x5e77ff && _0x344066) {
      _0x22d648 += "@SET " + _0x5e77ff + "=" + replaceDollarWithPercentPair(_0x344066) + "\r\n";
    }
  }
  return _0x22d648;
};
var rm = _0x2d4428 => unlink(_0x2d4428).catch(() => {});
var writeShim = (_0x421731, _0x387cd4, _0x573153, _0x5e2619, _0x58c901) => {
  let _0xd46755 = relative(dirname(_0x387cd4), _0x421731).split("\\").join("/");
  let _0x39a30a = _0xd46755.split("/").join("\\");
  let _0x37e6a9 = _0xd46755;
  let _0x20b7a8;
  let _0x3cc498 = _0x573153 && _0x573153.split("\\").join("/");
  let _0x5ecd82;
  let _0x2c59b9 = _0x3cc498 && "\"" + _0x3cc498 + "$exe\"";
  let _0x5ed970;
  _0x5e2619 = _0x5e2619 || "";
  _0x58c901 = _0x58c901 || "";
  if (!_0x573153) {
    _0x573153 = "\"%dp0%\\" + _0x39a30a + "\"";
    _0x3cc498 = "\"$basedir/" + _0xd46755 + "\"";
    _0x2c59b9 = _0x3cc498;
    _0x5e2619 = "";
    _0x39a30a = "";
    _0xd46755 = "";
    _0x37e6a9 = "";
  } else {
    _0x20b7a8 = "\"%dp0%\\" + _0x573153 + ".exe\"";
    _0x5ecd82 = "\"$basedir/" + _0x573153 + "\"";
    _0x5ed970 = "\"$basedir/" + _0x573153 + "$exe\"";
    _0x39a30a = "\"%dp0%\\" + _0x39a30a + "\"";
    _0xd46755 = "\"$basedir_win/" + _0xd46755 + "\"";
    _0x37e6a9 = "\"$basedir/" + _0x37e6a9 + "\"";
  }
  const _0x47a5e8 = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";
  let _0x28d1c5;
  if (_0x20b7a8) {
    _0x5e2619 = _0x5e2619.trim();
    _0x28d1c5 = _0x47a5e8 + convertToSetCommands(_0x58c901) + ("\r\nIF EXIST " + _0x20b7a8 + " (\r\n  SET \"_prog=" + _0x20b7a8.replace(/(^")|("$)/g, "") + "\"\r\n) ELSE (\r\n  SET \"_prog=" + _0x573153.replace(/(^")|("$)/g, "") + "\"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & \"%_prog%\" " + _0x5e2619 + " " + _0x39a30a + " %*\r\n");
  } else {
    _0x28d1c5 = "" + _0x47a5e8 + _0x573153 + " " + _0x5e2619 + " " + _0x39a30a + " %*\r\n";
  }
  let _0x51bd60 = "#!/bin/sh\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\nbasedir_win=\"$basedir\"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w \"$basedir\"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win=\"$(wslpath -w \"$basedir\" 2> /dev/null)\"\n      if [ $? -ne 0 ] || [ -z \"$basedir_win\" ]; then\n        echo \"Error: wslpath failed to convert path. WSL environment may be misconfigured.\" >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n";
  if (_0x5ecd82) {
    _0x51bd60 = _0x51bd60 + ("PROG_EXE=" + _0x5ecd82.replace(/"$/, ".exe\"") + "\nif ! [ -x \"$PROG_EXE\" ]; then\n  PROG_EXE=" + _0x5ecd82 + "\n  if ! [ -x \"$PROG_EXE\" ]; then\n    PROG_EXE=" + _0x3cc498 + "\n    if ! [ -x \"$PROG_EXE\" ]; then\n      PROG_EXE=" + _0x3cc498 + ".exe\n    fi\n  fi\nfi\n\nexec " + _0x58c901 + "\"$PROG_EXE\" " + _0x5e2619 + " " + _0xd46755 + " \"$@\"\n");
  } else {
    _0x51bd60 = _0x51bd60 + ("exec " + _0x3cc498 + " " + _0x5e2619 + " " + _0xd46755 + " \"$@\"\n");
  }
  let _0x431bf5 = "#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=\"\"\nif ($PSVersionTable.PSVersion -lt \"6.0\" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=\".exe\"\n}\n";
  if (_0x5ed970) {
    _0x431bf5 = _0x431bf5 + ("$ret=0\nif (Test-Path " + _0x5ed970 + ") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x5ed970 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  } else {\n    & " + _0x5ed970 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  } else {\n    & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n");
  } else {
    _0x431bf5 = _0x431bf5 + ("# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n} else {\n  & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n}\nexit $LASTEXITCODE\n");
  }
  return Promise.all([writeFile(_0x387cd4 + ".ps1", _0x431bf5, "utf8"), writeFile(_0x387cd4 + ".cmd", _0x28d1c5, "utf8"), writeFile(_0x387cd4, _0x51bd60, "utf8")]).then(() => Promise.all([chmod(_0x387cd4, 493), chmod(_0x387cd4 + ".cmd", 493), chmod(_0x387cd4 + ".ps1", 493)]));
};
const _0x4cedff = {
  recursive: true
};
var prepare = (_0x3c3d23, _0x1aae8f) => mkdir(dirname(_0x1aae8f), _0x4cedff).then(() => readFile(_0x3c3d23, "utf8")).then(_0xaf836f => {
  const _0x5b9d76 = _0xaf836f.trim().split(/\r*\n/)[0];
  const _0x86c325 = _0x5b9d76.match(shebangExpr);
  if (!_0x86c325) {
    return writeShim(_0x3c3d23, _0x1aae8f);
  }
  return writeShim(_0x3c3d23, _0x1aae8f, _0x86c325[2], _0x86c325[3] || "", _0x86c325[1] || "");
}, () => writeShim(_0x3c3d23, _0x1aae8f));
var cmdShim = (_0x4e3401, _0x5ab56e) => stat(_0x4e3401).then(() => Promise.all([rm(_0x5ab56e), rm(_0x5ab56e + ".cmd"), rm(_0x5ab56e + ".ps1")])).then(() => prepare(_0x4e3401, _0x5ab56e));
var cmd_shim_default = cmdShim;
export { cmd_shim_default as default };