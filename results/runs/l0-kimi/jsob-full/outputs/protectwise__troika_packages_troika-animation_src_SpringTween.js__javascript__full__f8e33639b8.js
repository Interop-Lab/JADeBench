var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x1f1038, _0x3420a1) => {
    for (var _0x1ebf15 in _0x3420a1)
        __defProp(_0x1f1038, _0x1ebf15, { get: _0x3420a1[_0x1ebf15], enumerable: true });
};
var __copyProps = (_0x21c600, _0x25c754, _0x4de0c5, _0x4d320c) => {
    if (_0x25c754 && (typeof _0x25c754 === "object" || typeof _0x25c754 === "function")) {
        for (let _0x1e496d of __getOwnPropNames(_0x25c754))
            if (!__hasOwnProp.call(_0x21c600, _0x1e496d) && _0x1e496d !== _0x4de0c5)
                __defProp(_0x21c600, _0x1e496d, { get: () => _0x25c754[_0x1e496d], enumerable: !(_0x4d320c = __getOwnPropDesc(_0x25c754, _0x1e496d)) || _0x4d320c.enumerable });
    }
    return _0x21c600;
};
var __toCommonJS = _0x2986fe => __copyProps(__defProp({}, "__esModule", { value: true }), _0x2986fe);

var SpringTween_exports = {};
var _0x35b639 = {};
_0x35b639["default"] = () => SpringTween_default;
__export(SpringTween_exports, _0x35b639);
module.exports = __toCommonJS(SpringTween_exports);

var _0x3631e0 = {};
_0x3631e0["mass"] = 1;
_0x3631e0["tension"] = 170;
_0x3631e0["friction"] = 26;

var _0x4d3525 = {};
_0x4d3525["mass"] = 1;
_0x4d3525["tension"] = 120;
_0x4d3525["friction"] = 14;

var _0x23451c = {};
_0x23451c["mass"] = 1;
_0x23451c["tension"] = 180;
_0x23451c["friction"] = 12;

var _0x526f31 = {};
_0x526f31["mass"] = 1;
_0x526f31["tension"] = 210;
_0x526f31["friction"] = 20;

var _0x3bbef5 = {};
_0x3bbef5["mass"] = 1;
_0x3bbef5["tension"] = 280;
_0x3bbef5["friction"] = 60;

var _0x122ad1 = {};
_0x122ad1["mass"] = 1;
_0x122ad1["tension"] = 280;
_0x122ad1["friction"] = 120;

var _0x14fa7a = {};
_0x14fa7a["default"] = _0x3631e0;
_0x14fa7a["gentle"] = _0x4d3525;
_0x14fa7a["wobbly"] = _0x23451c;
_0x14fa7a["stiff"] = _0x526f31;
_0x14fa7a["slow"] = _0x3bbef5;
_0x14fa7a["molasses"] = _0x122ad1;

var SpringPresets_default = _0x14fa7a;

class AbstractTween {
    ["setConfig"](_0x7f4968) {}
    ["update"]() {}
    ["onComplete"](_0x2cf285) {}
}

var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets_default["default"];

class SpringTween extends AbstractTween {
    constructor(_0x47957a, _0x443d6a, _0x328ed3, _0x4278de, _0x44d888 = 0, _0x85d7f5 = 0) {
        super();
        this["_isActive"] = true;
        this["_toValue"] = _0x47957a;
        this["_currentValue"] = _0x443d6a;
        this["_onUpdate"] = _0x328ed3;
        this["_minAcceleration"] = _0x44d888;
        this["_maxIterations"] = _0x85d7f5;
        if (typeof _0x4278de === "string") {
            _0x4278de = SpringPresets_default[_0x4278de];
        }
        if (!_0x4278de) _0x4278de = DEFAULTS;
        const { mass: _0x2a618b, tension: _0x1d4212, friction: _0xd46111 } = _0x4278de;
        this["_mass"] = typeof _0x2a618b === "number" ? _0x2a618b : DEFAULTS["mass"];
        this["_tension"] = typeof _0x1d4212 === "number" ? _0x1d4212 * tensionFactor : DEFAULTS["tension"] * tensionFactor;
        this["_friction"] = typeof _0xd46111 === "number" ? _0xd46111 * frictionFactor : DEFAULTS["friction"] * frictionFactor;
        this["_lastTime"] = 1e-10;
        this["_startTime"] = _0x85d7f5;
        this["_velocity"] = Infinity;
    }

    ["advance"](_0x317ae8) {
        if (_0x317ae8 !== this["_lastTime"]) {
            let { toValue: _0x513135, mass: _0x43328c, tension: _0x32db1d, friction: _0x4fb2ea, minAcceleration: _0x22baf9 } = this;
            let _0x93f29e = this["_velocity"] || 0;
            let _0x392c8d = this["_currentValue"];
            for (let _0x49e1cd = this["_startTime"]; _0x49e1cd < _0x317ae8; _0x49e1cd++) {
                const _0x3e7033 = (_0x32db1d * (_0x513135 - _0x392c8d) - _0x4fb2ea * _0x93f29e) / _0x43328c;
                if (Math.abs(_0x3e7033) < _0x22baf9) {
                    _0x93f29e = 0;
                    _0x392c8d = _0x513135;
                    this["_startTime"] = _0x49e1cd;
                    break;
                } else {
                    _0x93f29e += _0x3e7033;
                    _0x392c8d += _0x93f29e;
                }
            }
            this["_velocity"] = _0x93f29e;
            this["_startTime"] = _0x317ae8;
            this["_onUpdate"](this["_currentValue"] = _0x392c8d);
        }
    }

    ["reset"]() {
        this["_velocity"] = 0;
        this["_startTime"] = this["_lastTime"];
        this["_onUpdate"](this["_currentValue"] = this["_toValue"]);
    }

    ["isComplete"](_0x4bc4b9) {
        return _0x4bc4b9 >= this["_startTime"];
    }
}

var SpringTween_default = SpringTween;
