var list_default = _0x4e6f74 => {
  const _0xe87138 = _0x4e6f74.scripts;
  process.stdout.write("Available scripts via `dep run`\n\n" + Object.keys(_0xe87138).map(_0xc318f0 => {
    return "dep run " + _0xc318f0 + ":\n  " + _0xe87138[_0xc318f0];
  }).join("\n") + "\n");
};
var pathKey = () => {
  if (process.platform !== "win32") {
    return "PATH";
  }
  const _0x8dd477 = Object.keys(process.env).find(_0x47c325 => /^PATH$/i.test(_0x47c325));
  return _0x8dd477 || "Path";
};
var path_key_default = pathKey();
import { spawn } from "child_process";
import _0x3a1ebd from "path";
import _0x87d81d from "fs";
var runCmd = (_0x9d0804, _0x4ce099, _0x2874ea) => {
  return new Promise((_0x174720, _0x45cc6f) => {
    const _0x2c28f3 = spawn(_0x9d0804, _0x4ce099, _0x2874ea);
    _0x2c28f3.on("error", _0x45cc6f);
    _0x2c28f3.on("close", _0x5ce2a3 => {
      if (_0x5ce2a3 === 0) {
        return _0x174720();
      }
      _0x45cc6f(new Error("Command failed with exit code " + _0x5ce2a3 + ": " + _0x9d0804));
    });
  });
};
var binEnv = _0xde7039 => {
  const _0x394284 = {
    ...process.env
  };
  const _0x3b8a99 = [];
  let _0x4dd2f2 = _0xde7039;
  let _0x140723;
  do {
    _0x3b8a99.push(_0x3a1ebd.join(_0x4dd2f2, "node_modules", ".bin"));
    _0x140723 = _0x4dd2f2;
    _0x4dd2f2 = _0x3a1ebd.dirname(_0x4dd2f2);
  } while (_0x4dd2f2 !== _0x140723);
  _0x394284[path_key_default] = [..._0x3b8a99, process.env[path_key_default]].filter(Boolean).join(_0x3a1ebd.delimiter);
  return _0x394284;
};
var lifecycle_default = async (_0x11fdb3, _0x4cbfdd) => {
  let _0x55f1df;
  try {
    _0x55f1df = JSON.parse(_0x87d81d.readFileSync(_0x3a1ebd.join(_0x11fdb3, "package.json")));
  } catch (_0x521063) {
    return false;
  }
  const _0x4317b6 = _0x55f1df.scripts || {};
  const _0x5a6cf4 = binEnv(_0x11fdb3);
  let _0x39b352 = false;
  for (const _0x4551df of _0x4cbfdd) {
    const _0x266353 = _0x4317b6[_0x4551df];
    if (!_0x266353) {
      continue;
    }
    _0x39b352 = true;
    await runCmd(_0x266353, [], {
      cwd: _0x11fdb3,
      shell: true,
      env: _0x5a6cf4,
      stdio: "inherit"
    });
  }
  return _0x39b352;
};
var runner_default = async (_0x384856, _0x4027bf, _0x9ccfb3) => {
  _0x9ccfb3 = _0x9ccfb3 || process.cwd();
  const _0x29298b = _0x384856.slice(1);
  const _0x211db8 = _0x4027bf.scripts;
  const _0x2479d0 = _0x29298b.shift();
  const _0x2b0958 = Object.keys(_0x211db8).filter(_0x2e44aa => {
    return _0x2e44aa === "pre" + _0x2479d0 || _0x2e44aa === _0x2479d0 || _0x2e44aa === "post" + _0x2479d0;
  }).map(_0x528856 => {
    return _0x211db8[_0x528856];
  });
  const _0xfe36eb = binEnv(_0x9ccfb3);
  for (const _0x4bc56b of _0x2b0958) {
    await runCmd(_0x4bc56b, _0x29298b, {
      cwd: _0x9ccfb3,
      shell: true,
      env: _0xfe36eb,
      stdio: "inherit"
    });
  }
};
import _0x4d36a4 from "path";
import _0x22149d from "fs";
var run = _0x3587b1 => {
  _0x3587b1._handled = true;
  const _0x484209 = JSON.parse(_0x22149d.readFileSync(_0x4d36a4.join(process.cwd(), "package.json")));
  if (!_0x484209.scripts) {
    return;
  }
  if (_0x3587b1._.length === 1) {
    list_default(_0x484209);
  } else {
    runner_default(_0x3587b1._, _0x484209).catch(_0x2f738c => {
      process.stderr.write(_0x2f738c.message + "\n");
      process.exitCode = 1;
    });
  }
};
const _0x4f5c75 = {
  command: "run",
  describe: "Run an arbitrary command from scripts in package.json",
  handler: run,
  aliases: ["r"]
};
var run_default = _0x4f5c75;
export { run_default as default };