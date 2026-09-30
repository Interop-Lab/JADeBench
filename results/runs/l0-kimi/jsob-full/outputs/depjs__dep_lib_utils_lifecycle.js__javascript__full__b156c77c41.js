import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

var pathKey = () => {
    if (process.platform !== 'win32') return 'PATH';
    const _0x3b6ca9 = Object.keys(process.env).find(_0x317d00 => /^PATH$/i.test(_0x317d00));
    return _0x3b6ca9 || 'Path';
};

var path_key_default = pathKey();

var runCmd = (_0x21b64e, _0x1ef06c, _0x196568) => {
    return new Promise((_0xbc4bf3, _0x25bfa1) => {
        const _0x2fbcd6 = spawn(_0x21b64e, _0x1ef06c, _0x196568);
        _0x2fbcd6.on('error', _0x25bfa1);
        _0x2fbcd6.on('close', _0x279171 => {
            if (_0x279171 === 0) return _0xbc4bf3();
            _0x25bfa1(new Error('Command failed with exit code ' + _0x279171 + ': ' + _0x21b64e));
        });
    });
};

var binEnv = _0x107060 => {
    const _0x109765 = { ...process.env };
    const _0x488e0b = [];
    let _0x29b4da = _0x107060;
    let _0x1b28d5;
    do {
        _0x488e0b.push(path.join(_0x29b4da, 'node_modules', '.bin'));
        _0x1b28d5 = _0x29b4da;
        _0x29b4da = path.dirname(_0x29b4da);
    } while (_0x29b4da !== _0x1b28d5);
    _0x109765[path_key_default] = [..._0x488e0b, process.env[path_key_default]].filter(Boolean).join(path.delimiter);
    return _0x109765;
};

var lifecycle_default = async (_0x491180, _0x1851ac) => {
    let _0x3265d5;
    try {
        _0x3265d5 = JSON.parse(fs.readFileSync(path.join(_0x491180, 'package.json')));
    } catch (_0xc4f2dc) {
        return false;
    }
    const _0x3b0252 = _0x3265d5.scripts || {};
    const _0x50d386 = binEnv(_0x491180);
    let _0x33ea1d = false;
    for (const _0x424608 of _0x1851ac) {
        const _0x2860c8 = _0x3b0252[_0x424608];
        if (!_0x2860c8) continue;
        _0x33ea1d = true;
        await runCmd(_0x2860c8, [], { cwd: _0x491180, shell: true, env: _0x50d386, stdio: 'inherit' });
    }
    return _0x33ea1d;
};

export { binEnv, lifecycle_default as default, runCmd };
