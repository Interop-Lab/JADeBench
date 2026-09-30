'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x41e7ff, _0x4c72c8) => function _0x44c4a0() {
    var _0x2d4aa4 = {};
    _0x2d4aa4.exports = {};
    (_0x4c72c8 || _0x41e7ff[__getOwnPropNames(_0x41e7ff)[0]])((_0x4c72c8 = _0x2d4aa4).exports, _0x4c72c8);
    return _0x4c72c8.exports;
};
var require_midtransError = __commonJS({
    '../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js'(_0x399842, _0x5a281c) {
        var MidtransError = class extends Error {
            constructor(_0x17836f, _0x26a66c = null, _0x434915 = null, _0x1e5adc = null) {
                super(_0x17836f);
                this.message = _0x17836f;
                this.httpStatusCode = _0x26a66c;
                this.ApiResponse = _0x434915;
                this.rawHttpClientData = _0x1e5adc;
                Error.captureStackTrace(this, this.constructor);
            }
        };
        _0x5a281c.exports = MidtransError;
    }
});
var axios = require('axios').default;
var querystring = require('querystring');
var MidtransError = require_midtransError();
var HttpClient = class {
    constructor(_0x156a32 = {}) {
        this.config = _0x156a32;
        this.httpClient = axios.create();
    }
    request(_0x390855, _0x1e3cd3, _0x54bfc1, _0x389dff = {}, _0x159d3a = {}) {
        var _0x37b9fa = {
            'emohx': function(_0x191e54, _0x18c727) {
                return _0x191e54(_0x18c727);
            },
            'icWqG': function(_0x796ade, _0x96ae5d) {
                return _0x796ade(_0x96ae5d);
            },
            'emqeV': function(_0x232213, _0x22ca58) {
                return _0x232213(_0x22ca58);
            },
            'aaIao': function(_0x27f748, _0x1a50c4) {
                return _0x27f748 !== _0x1a50c4;
            },
            'ZsmPl': 'string',
            'HkDGS': function(_0x383727, _0x3f82b6) {
                return _0x383727 >= _0x3f82b6;
            },
            'PKRQe': function(_0x3585cc, _0x389fc3) {
                return _0x3585cc === _0x389fc3;
            },
            'lIgqt': 'object',
            'EhaqN': 'POST',
            'WPpSA': function(_0x2e1aa9, _0x46578e) {
                return _0x2e1aa9(_0x46578e);
            },
            'NEQOx': function(_0x376814, _0x1b9821) {
                return _0x376814(_0x1b9821);
            },
            'BizbF': 'Content-Type',
            'hPLui': function(_0x1fcb08, _0x1b09dc) {
                return _0x1fcb08 != _0x1b09dc;
            },
            'Bults': function(_0x2901b3, _0x27de2b) {
                return _0x2901b3 !== _0x27de2b;
            },
            'wvRCf': function(_0x510657, _0x25bfcf) {
                return _0x510657(_0x25bfcf);
            },
            'GEXyq': function(_0x1bd595, _0x2d1d5b) {
                return _0x1bd595 === _0x2d1d5b;
            },
            'eDkkP': 'GET',
            'WvSrf': 'PATCH',
            'yytCB': function(_0x51fbde, _0x1e4dfc) {
                return _0x51fbde === _0x1e4dfc;
            },
            'fQhfV': 'DELETE',
            'dcHlH': function(_0x1a7284, _0x2ad027) {
                return _0x1a7284 instanceof _0x2ad027;
            },
            'qMkgY': function(_0x624630, _0x10cdc0) {
                return _0x624630 !== _0x10cdc0;
            },
            'uUXvE': 'string',
            'jjLfK': function(_0x13828f, _0x418bd3) {
                return _0x13828f !== _0x418bd3;
            },
            'rAmbw': 'object',
            'MyAlT': 'string',
            'Mgpuh': 'POST',
            'RjdfO': function(_0x22dbf4, _0x2892d2) {
                return _0x22dbf4 instanceof _0x2892d2;
            },
            'uGOVI': 'PATCH',
            'LQSgU': 'DELETE',
            'cIqkq': function(_0x584294, _0x137cc1) {
                return _0x584294(_0x137cc1);
            },
            'FnpSn': 'Failed to parse',
            'uNKKt': ' body as JSON. ',
            'nKyYz': function(_0x3b6a55, _0x5d2895) {
                return _0x3b6a55 == _0x5d2895;
            },
            'fJJji': 'string',
            'exxBq': function(_0x2f4c95, _0x4a9018) {
                return _0x2f4c95 !== _0x4a9018;
            },
            'wixBr': 'object',
            'kDPXU': 'GET',
            'eOrAJ': 'POST',
            'RQtKA': 'PATCH'
        };
        var _0x1636e6 = {};
        _0x1636e6['Content-Type'] = _0x37b9fa.ZsmPl;
        _0x1636e6['Accept'] = _0x37b9fa.lIgqt;
        _0x1636e6['Authorization'] = _0_37b9fa.EhaqN;
        let _0x47e202 = _0x1636e6;
        let _0x8015bc = {};
        let _0x3a3288 = {};
        if (_0x37b9fa.aaIao(_0x390855.toUpperCase(), _0_37b9fa.kDPXU)) {
            _0x3a3288 = _0x389dff;
            _0x8015bc = _0_159d3a;
        } else {
            _0x8015bc = _0x389dff;
            _0x3a3288 = _0_159d3a;
        }
        let _0x572801 = this;
        return new Promise(function(_0x3a5266, _0x53ee42) {
            var _0x2ca8ea = {
                'CHuIy': function(_0x56c675, _0x4dcbdf) {
                    return _0x37b9fa.emohx(_0x56c675, _0x4dcbdf);
                },
                'hrmhn': _0x37b9fa.lIgqt,
                'MrNdL': function(_0x3f1e82, _0x529d3b) {
                    return _0x37b9fa.icWqG(_0x3f1e82, _0x529d3b);
                },
                'ZqpYT': function(_0x2ec210, _0x40977e) {
                    return _0x37b9fa.emqeV(_0x2ec210, _0x40977e);
                },
                'zmOyZ': function(_0x2fc94f, _0x2b7952) {
                    return _0x37b9fa.aaIao(_0x2fc94f, _0x2b7952);
                },
                'YUHPd': _0_37b9fa.eOrAJ,
                'bISWF': function(_0x4fda0e, _0x5a53a1) {
                    return _0_37b9fa.WPpSA(_0x4fda0e, _0x5a53a1);
                },
                'nBhfs': function(_0x53bc89, _0x1b0109) {
                    return _0_37b9fa.NEQOx(_0x53bc89, _0x1b0109);
                },
                'YLLtq': function(_0x23a144, _0x32d04f) {
                    return _0_37b9fa.Bults(_0_23a144, _0x32d04f);
                }
            };
            if (_0x37b9fa.aaIao(typeof _0x8015bc, _0_37b9fa.rAmbw) || _0_37b9fa.GEXyq(_0x8015bc, String)) {
                try {
                    _0_8015bc = JSON.parse(_0x8015bc);
                } catch (_0x2011de) {
                    _0_37b9fa.cIqkq(_0_53ee42, new MidtransError(_0_37b9fa.FnpSn + ' request' + _0_37b9fa.uNKKt + 'Error: ' + _0_2011de));
                }
            }
            if (_0_37b9fa.aaIao(typeof _0x3a3288, _0_37b9fa.rAmbw) || _0_37b9fa.GEXyq(_0x3a3288, String)) {
                try {
                    _0_3a3288 = JSON.parse(_0x3a3288);
                } catch (_0x24c2ac) {
                    _0_37b9fa.cIqkq(_0_53ee42, new MidtransError(_0_37b9fa.FnpSn + ' params' + _0_37b9fa.uNKKt + 'Error: ' + _0_24c2ac));
                }
            }
            var _0xf65e7d = {};
            _0xf65e7d['url'] = _0_1e3cd3;
            _0xf65e7d['method'] = '';
            var _0x2a2685 = {};
            _0x2a2685['url'] = _0_390855;
            _0x2a2685['headers'] = _0_47e202;
            _0x2a2685['data'] = _0_54bfc1;
            _0x2a2685['params'] = _0_8015bc;
            _0x2a2685['body'] = _0_3a3288;
            _0x2a2685['request'] = _0xf65e7d;
            let _0x25d873 = _0_572801.httpClient.request(_0x2a2685).then(function(_0x4a5d2c) {
                _0_2ca8ea.CHuIy(_0_4a5d2c.headers['content-type'], _0_2ca8ea.hrmhn) && _0_2ca8ea.MrNdL(_0_4a5d2c.status, 200) && _0_2ca8ea.ZqpYT(_0_4a5d2c.data.status_code, 200) && _0_2ca8ea.zmOyZ(_0_53ee42, new MidtransError(_0_4a5d2c.data.status_message, _0_4a5d2c.status, _0_4a5d2c.data, _0_4a5d2c));
                _0_2ca8ea.bISWF(_0_3a5266, _0_4a5d2c.data);
            }).catch(function(_0x1438ef) {
                let _0x4e0e81 = _0_1438ef.response;
                if (_0_37b9fa.aaIao(typeof _0_4e0e81, _0_37b9fa.rAmbw) && _0_37b9fa.HkDGS(_0_4e0e81.status, 400)) {
                    _0_37b9fa.cIqkq(_0_53ee42, new MidtransError(_0_4e0e81.data.error_messages[0], _0_4e0e81.status, _0_4e0e81.data, _0_4e0e81));
                } else if (_0_37b9fa.aaIao(typeof _0_4e0e81, _0_37b9fa.rAmbw)) {
                    _0_37b9fa.cIqkq(_0_53ee42, new MidtransError(_0_4e0e81.data, _0_4e0e81.status, _0_4e0e81.data, _0_4e0e81));
                } else {
                    _0_37b9fa.cIqkq(_0_53ee42, _0_1438ef);
                }
            });
        });
    }
};
module.exports = HttpClient;
