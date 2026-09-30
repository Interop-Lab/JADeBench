import { chmod, mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { dirname, relative } from "path";
var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
var replaceDollarWithPercentPair = _0x5ce640 => {
  const _0x387029 = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let _0x44f7ab = "";
  let _0x5b1c06 = 0;
  let _0x3e3e8a;
  do {
    _0x3e3e8a = _0x387029.exec(_0x5ce640);
    if (_0x3e3e8a) {
      _0x44f7ab += (_0x5ce640.substring(_0x5b1c06, _0x3e3e8a.index) || "") + "%" + _0x3e3e8a[1] + "%";
      _0x5b1c06 = _0x387029.lastIndex;
    }
  } while (_0x387029.lastIndex > 0);
  return _0x44f7ab + _0x5ce640.slice(_0x5b1c06);
};
var convertToSetCommands = _0x4d0bf8 => {
  let _0x8129d9 = "";
  for (const _0x25ab54 of _0x4d0bf8.split(" ")) {
    const [_0x3b0005, _0x2aa863] = _0x25ab54.split("=");
    const _0x14b0f5 = (_0x3b0005 || "").trim();
    const _0x2d32b4 = (_0x2aa863 || "").trim();
    if (_0x14b0f5 && _0x2d32b4) {
      _0x8129d9 += "@SET " + _0x14b0f5 + "=" + replaceDollarWithPercentPair(_0x2d32b4) + "\r\n";
    }
  }
  return _0x8129d9;
};
var rm = _0x127a49 => unlink(_0x127a49).catch(() => {});
var writeShim = (_0x4cdd45, _0x411a35, _0xb22d17, _0x588619, _0xd14a1c) => {
  let _0x3f3c39 = relative(dirname(_0x411a35), _0x4cdd45).split("\\").join("/");
  let _0xdfefdf = _0x3f3c39.split("/").join("\\");
  let _0x31793c = _0x3f3c39;
  let _0x235439;
  let _0x1f10bf = _0xb22d17 && _0xb22d17.split("\\").join("/");
  let _0x29853d;
  let _0x4c0103 = _0x1f10bf && "\"" + _0x1f10bf + "$exe\"";
  let _0x86a77;
  _0x588619 = _0x588619 || "";
  _0xd14a1c = _0xd14a1c || "";
  if (!_0xb22d17) {
    _0xb22d17 = "\"%dp0%\\" + _0xdfefdf + "\"";
    _0x1f10bf = "\"$basedir/" + _0x3f3c39 + "\"";
    _0x4c0103 = _0x1f10bf;
    _0x588619 = "";
    _0xdfefdf = "";
    _0x3f3c39 = "";
    _0x31793c = "";
  } else {
    _0x235439 = "\"%dp0%\\" + _0xb22d17 + ".exe\"";
    _0x29853d = "\"$basedir/" + _0xb22d17 + "\"";
    _0x86a77 = "\"$basedir/" + _0xb22d17 + "$exe\"";
    _0xdfefdf = "\"%dp0%\\" + _0xdfefdf + "\"";
    _0x3f3c39 = "\"$basedir_win/" + _0x3f3c39 + "\"";
    _0x31793c = "\"$basedir/" + _0x31793c + "\"";
  }
  const _0x4b1118 = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";
  let _0x459d1a;
  if (_0x235439) {
    _0x588619 = _0x588619.trim();
    _0x459d1a = _0x4b1118 + convertToSetCommands(_0xd14a1c) + ("\r\nIF EXIST " + _0x235439 + " (\r\n  SET \"_prog=" + _0x235439.replace(/(^")|("$)/g, "") + "\"\r\n) ELSE (\r\n  SET \"_prog=" + _0xb22d17.replace(/(^")|("$)/g, "") + "\"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & \"%_prog%\" " + _0x588619 + " " + _0xdfefdf + " %*\r\n");
  } else {
    _0x459d1a = "" + _0x4b1118 + _0xb22d17 + " " + _0x588619 + " " + _0xdfefdf + " %*\r\n";
  }
  let _0x2f55c9 = "#!/bin/sh\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\nbasedir_win=\"$basedir\"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w \"$basedir\"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win=\"$(wslpath -w \"$basedir\" 2> /dev/null)\"\n      if [ $? -ne 0 ] || [ -z \"$basedir_win\" ]; then\n        echo \"Error: wslpath failed to convert path. WSL environment may be misconfigured.\" >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n";
  if (_0x29853d) {
    _0x2f55c9 = _0x2f55c9 + ("PROG_EXE=" + _0x29853d.replace(/"$/, ".exe\"") + "\nif ! [ -x \"$PROG_EXE\" ]; then\n  PROG_EXE=" + _0x29853d + "\n  if ! [ -x \"$PROG_EXE\" ]; then\n    PROG_EXE=" + _0x1f10bf + "\n    if ! [ -x \"$PROG_EXE\" ]; then\n      PROG_EXE=" + _0x1f10bf + ".exe\n    fi\n  fi\nfi\n\nexec " + _0xd14a1c + "\"$PROG_EXE\" " + _0x588619 + " " + _0x3f3c39 + " \"$@\"\n");
  } else {
    _0x2f55c9 = _0x2f55c9 + ("exec " + _0x1f10bf + " " + _0x588619 + " " + _0x3f3c39 + " \"$@\"\n");
  }
  let _0x221eb9 = "#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=\"\"\nif ($PSVersionTable.PSVersion -lt \"6.0\" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=\".exe\"\n}\n";
  if (_0x86a77) {
    _0x221eb9 = _0x221eb9 + ("$ret=0\nif (Test-Path " + _0x86a77 + ") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x86a77 + " " + _0x588619 + " " + _0x31793c + " $args\n  } else {\n    & " + _0x86a77 + " " + _0x588619 + " " + _0x31793c + " $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n  } else {\n    & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n");
  } else {
    _0x221eb9 = _0x221eb9 + ("# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n} else {\n  & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n}\nexit $LASTEXITCODE\n");
  }
  return Promise.all([writeFile(_0x411a35 + ".ps1", _0x221eb9, "utf8"), writeFile(_0x411a35 + ".cmd", _0x459d1a, "utf8"), writeFile(_0x411a35, _0x2f55c9, "utf8")]).then(() => Promise.all([chmod(_0x411a35, 493), chmod(_0x411a35 + ".cmd", 493), chmod(_0x411a35 + ".ps1", 493)]));
};
const _0x58edf1 = {
  recursive: true
};
var prepare = (_0x209d03, _0x3d0af4) => mkdir(dirname(_0x3d0af4), _0x58edf1).then(() => readFile(_0x209d03, "utf8")).then(_0x532107 => {
  const _0xb5302e = _0x532107.trim().split(/\r*\n/)[0];
  const _0x12dd14 = _0xb5302e.match(shebangExpr);
  if (!_0x12dd14) {
    return writeShim(_0x209d03, _0x3d0af4);
  }
  return writeShim(_0x209d03, _0x3d0af4, _0x12dd14[2], _0x12dd14[3] || "", _0x12dd14[1] || "");
}, () => writeShim(_0x209d03, _0x3d0af4));
var cmdShim = (_0x56e216, _0x456520) => stat(_0x56e216).then(() => Promise.all([rm(_0x456520), rm(_0x456520 + ".cmd"), rm(_0x456520 + ".ps1")])).then(() => prepare(_0x56e216, _0x456520));
var cmd_shim_default = cmdShim;
import _0x1bcb53 from "path";
var nm_default = _0x1bcb53.join(process.cwd(), "node_modules");
import _0x20b696 from "fs";
import { readFile as _0x35fc9e } from "fs/promises";
import _0x381643 from "path";
var isWin = process.platform === "win32";
var link = async (_0x3593c9, _0x304720) => {
  if (isWin) {
    await cmd_shim_default(_0x3593c9, _0x304720);
    return;
  }
  try {
    _0x20b696.unlinkSync(_0x304720);
  } catch (_0x284e87) {}
  _0x20b696.symlinkSync(_0x3593c9, _0x304720);
  _0x20b696.chmodSync(_0x3593c9, "0755");
};
var bin = async (_0x7af843, _0x15929d, _0x2e2c84) => {
  if (_0x2e2c84 === undefined) {
    const _0x147cd3 = JSON.parse(await _0x35fc9e(_0x381643.join(_0x15929d, "package.json")));
    _0x2e2c84 = _0x147cd3.bin;
  }
  if (!_0x2e2c84) {
    return;
  }
  _0x20b696.mkdirSync(_0x381643.join(nm_default, ".bin"), {
    recursive: true
  });
  if (typeof _0x2e2c84 === "string") {
    const _0x477184 = _0x7af843.charAt(0) === "@" ? _0x7af843.split("/")[1] : _0x7af843;
    await link(_0x381643.join(_0x15929d, _0x2e2c84), _0x381643.join(nm_default, ".bin", _0x477184));
  } else if (typeof _0x2e2c84 === "object") {
    for (const _0x4a8997 of Object.keys(_0x2e2c84)) {
      await link(_0x381643.join(_0x15929d, _0x2e2c84[_0x4a8997]), _0x381643.join(nm_default, ".bin", _0x4a8997));
    }
  }
};
var bin_default = bin;
export { bin_default as default };