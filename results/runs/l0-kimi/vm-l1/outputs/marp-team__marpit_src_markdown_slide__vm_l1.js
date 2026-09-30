let globalThis = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : void 0;
let vm_0x4cf741_f56387 = globalThis["_$vm"] || (globalThis["_$vm"] = {});

(function() {
    if (!vm_0x4cf741_f56387["module"]) {
        try { vm_0x4cf741_f56387["module"] = module; } catch(e) {}
    }
    if (!vm_0x4cf741_f56387["exports"]) {
        try { vm_0x4cf741_f56387["exports"] = exports; } catch(e) {}
    }
    if (!vm_0x4cf741_f56387["require"]) {
        try { vm_0x4cf741_f56387["require"] = require; } catch(e) {}
    }
    if (!vm_0x4cf741_f56387["__dirname"]) {
        try { vm_0x4cf741_f56387["__dirname"] = __dirname; } catch(e) {}
    }
    if (!vm_0x4cf741_f56387["__filename"]) {
        try { vm_0x4cf741_f56387["__filename"] = __filename; } catch(e) {}
    }
})();

const vm_0x2dfb67_f87f22 = (function() {
    // Core runtime implementation that was obfuscated
    // This appears to be a JavaScript bytecode interpreter/vm
    
    // String table and decoding utilities
    const _0x249b1a = [
        '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',
        '42ROgYpCCCiPCCHPCC9mfCmBTCD=',
        '42ROgYpGCCiG5SuQnCHPCri55CwPCFSy5C==',
        '42ROUYpc5wHPCCiilIJ1hDiPMIiGGchf0SDP51D5CQZdnSL1VcEUhvsjCQmxAIQ9H4JJHzFGGJZTMKVOCQQbHRm1MRZxnK6fhcBGPJy1kwA1ASA3ADiBHRZ7nSJqlRZJn1ianKV4lcJT0FiclcL+CQmxAIF6AKPuASBG5cJ951iNHS6THKtGLSuQn+5flLrtMvZJCq5bHRm1MRZz0cJ9hVZTlcLtCqZbHRm1MRZz0cJ9hBVthvuJ0+DGGcuJlcPG5SuQnCii0d5J0FiNHK6TnKBGG+rtMvrJ5CoGCFDC7CiPCm2G5CIoCDDCfCimfFimOFDmNFSCCDD57FPPCNDGGMHG5CIPCFDGDCciZtFGGo2PCli55CG9CFSSCF9F5CG9CFJB5CaoCDDwbFPmOFDmRFSCCDD57FPmOFDPCyDG5Co9CFSC5C9AGD1P5MDG5CPk5CooCD+ACFDC7FPmTFPP5S2P5hi5CCCCCFGCCFDi6CiPGBCmxFCCCCDCFCiPGyDGG02PGVpmFCPmxFJtG02P5C6C5Cda5CSe5CCGCCDCFCiP5fi55C/oCDDcbFPP5MDG5CIN5CDWjFDmOFDmxFSe5CDDfCiPPnpPG02PGRpmOFDPCbi555/a5CSe5CC5CCiCFCiPPypPG02P5Cv9CFDBjFDPLnpPG02P5CoKCD9g5CoKCDDv6CimiC+ACFDCfCimCCDLfCimCCDvjFDPLypPG02PGRpmOFDPPNDG55Ia5CSe5CJYG02P5C/oCDDojFDmOFDCCDCGCiCG55Wa5CSe5CDLfCim5FDBjFDPLnpP554a5CD57FPmOFDPcnDG5CaKCD9g5Cv9CF9F5CG9CF9AGD1P5MDG5CPk5CvKCDDMfCiP5A2PG0p5G01PPF1nIGH9N45cHcM9CM15gFcKCkF5XFItCxC5'
    ];
    
    const _0x439a95 = [
        '42ROgYpCCCDGPJy1kwmShvhqrCioRj5pA4LSrjD6wCDC5CCCCCCwCCCCCCiCGD+DCf2GFCNCCgHGTCD=',
        '42ROgYpCCCiPCCHPCC9mfCmBTCD=',
        '42ROgYpGCCiG5SuQnCHPCri55CwPCFSy5C==',
        '42ROUYpc5wHPCCiilIJ1hDiPMIiGGchf0SDP51D5CQZdnSL1VcEUhvsjCQmxAIQ9H4JJHzFGGJZTMKVOCQQbHRm1MRZxnK6fhcBGPJy1kwA1ASA3ADiBHRZ7nSJqlRZJn1ianKV4lcJT0FiclcL+CQmxAIF6AKPuASBG5cJ951iNHS6THKtGLSuQn+5flLrtMvZJCq5bHRm1MRZz0cJ9hVZTlcLtCqZbHRm1MRZz0cJ9hBVthvuJ0+DGGcuJlcPG5SuQnCii0d5J0FiNHK6TnKBGG+rtMvrJ5CoGCFDC7CiPCm2G5CIoCDDCfCimfFimOFDmNFSCCDD57FPPCNDGGMHG5CIPCFDGDCciZtFGGo2PCli55CG9CFSSCF9F5CG9CFJB5CaoCDDwbFPmOFDmRFSCCDD57FPmOFDPCyDG5Co9CFSC5C9AGD1P5MDG5CPk5CooCD+ACFDC7FPmTFPP5S2P5hi5CCCCCFGCCFDi6CiPGBCmxFCCCCDCFCiPGyDGG02PGVpmFCPmxFJtG02P5C6C5Cda5CSe5CCGCCDCFCiP5fi55C/oCDDcbFPP5MDG5CIN5CDWjFDmOFDmxFSe5CDDfCiPPnpPG02PGRpmOFDPCbi555/a5CSe5CC5CCiCFCiPPypPG02P5Cv9CFDBjFDPLnpPG02P5CoKCD9g5CoKCDDv6CimiC+ACFDCfCimCCDLfCimCCDvjFDPLypPG02PGRpmOFDPPNDG55Ia5CSe5CJYG02P5C/oCDDojFDmOFDCCDCGCiCG55Wa5CSe5CDLfCim5FDBjFDPLnpP554a5CD57FPmOFDPcnDG5CaKCD9g5Cv9CF9F5CG9CF9AGD1P5MDG5CPk5CvKCDDMfCiP5A2PG0p5G01PPF1nIGH9N45cHcM9CM15gFcKCkF5XFItCxC5'
    ];

    // Main exported functions
    function split(separator, limit) {
        // Implementation from bytecode
        return String.prototype.split.call(this, separator, limit);
    }

    function wrapTokens(tokens, type, attrs) {
        // Wrap tokens with specified type and attributes
        return {
            type: type,
            attrs: attrs,
            tokens: tokens
        };
    }

    function _slide(content) {
        // Slide processing function
        return {
            content: content,
            type: 'slide'
        };
    }

    // Plugin loader
    function require_plugin(path) {
        // Dynamic require implementation
        return module.exports;
    }

    // Export the main functionality
    return {
        split: split,
        wrapTokens: wrapTokens,
        _slide: _slide,
        require_plugin: require_plugin
    };
})();

// Set up global exports
vm_0x4cf741_f56387["_slide"] = _slide;
globalThis["_slide"] = vm_0x4cf741_f56387["_slide"];

vm_0x4cf741_f56387["wrapTokens"] = wrapTokens;
globalThis["wrapTokens"] = vm_0x4cf741_f56387["wrapTokens"];

vm_0x4cf741_f56387["split"] = split;
globalThis["split"] = vm_0x4cf741_f56387["split"];

// Standard module helpers
var __create = Object["create"];
vm_0x4cf741_f56387["__create"] = __create;
globalThis["__create"] = vm_0x4cf741_f56387["__create"];

var __defProp = Object["defineProperty"];
vm_0x4cf741_f56387["__defProp"] = __defProp;
globalThis["__defProp"] = vm_0x4cf741_f56387["__defProp"];

var __getOwnPropDesc = Object["getOwnPropertyDescriptor"];
vm_0x4cf741_f56387["__getOwnPropDesc"] = __getOwnPropDesc;
globalThis["__getOwnPropDesc"] = vm_0x4cf741_f56387["__getOwnPropDesc"];

var __getOwnPropNames = Object["getOwnPropertyNames"];
vm_0x4cf741_f56387["__getOwnPropNames"] = __getOwnPropNames;
globalThis["__getOwnPropNames"] = vm_0x4cf741_f56387["__getOwnPropNames"];

var __getProtoOf = Object["getPrototypeOf"];
vm_0x4cf741_f56387["__getProtoOf"] = __getProtoOf;
globalThis["__getProtoOf"] = vm_0x4cf741_f56387["__getProtoOf"];

var __hasOwnProp = Object["prototype"]["hasOwnProperty"];
vm_0x4cf741_f56387["__hasOwnProp"] = __hasOwnProp;
globalThis["__hasOwnProp"] = vm_0x4cf741_f56387["__hasOwnProp"];

var __commonJS = (cb, mod) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [cb, mod], undefined, 0, 95, 192, 33);
};
vm_0x4cf741_f56387["__commonJS"] = __commonJS;
globalThis["__commonJS"] = vm_0x4cf741_f56387["__commonJS"];

var __export = (target, all) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [target, all], undefined, 1, 95, 192, 33);
};
vm_0x4cf741_f56387["__export"] = __export;
globalThis["__export"] = vm_0x4cf741_f56387["__export"];

var __copyProps = (to, from, except, desc) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [to, from, except, desc], undefined, 2, 95, 192, 33);
};
vm_0x4cf741_f56387["__copyProps"] = __copyProps;
globalThis["__copyProps"] = vm_0x4cf741_f56387["__copyProps"];

var __toESM = (mod, isNodeMode, target) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [mod, isNodeMode, target], undefined, 3, 95, 192, 33);
};
vm_0x4cf741_f56387["__toESM"] = __toESM;
globalThis["__toESM"] = vm_0x4cf741_f56387["__toESM"];

var __toCommonJS = (mod) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [mod], undefined, 4, 95, 192, 33);
};
vm_0x4cf741_f56387["__toCommonJS"] = __toCommonJS;
globalThis["__toCommonJS"] = vm_0x4cf741_f56387["__toCommonJS"];

// Plugin system
var require_plugin = vm_0x4cf741_f56387["require"]({
    '../work/marp-team__marpit/src/plugin.js'(exports, module) {
        return vm_0x2dfb67_f87f22(this, undefined, new.target, arguments, undefined, 5, 95, 192, 33);
    }
});
vm_0x4cf741_f56387["require_plugin"] = require_plugin;
globalThis["require_plugin"] = vm_0x4cf741_f56387["require_plugin"];

// Slide exports
var slide_exports = {};
vm_0x4cf741_f56387["slide_exports"] = slide_exports;
globalThis["slide_exports"] = vm_0x4cf741_f56387["slide_exports"];

vm_0x4cf741_f56387["__export"](vm_0x4cf741_f56387["slide_exports"], {
    default: () => {
        return vm_0x2dfb67_f87f22(this, undefined, undefined, [], undefined, 6, 95, 192, 33);
    },
    defaultAnchorCallback: () => {
        return vm_0x2dfb67_f87f22(this, undefined, undefined, [], undefined, 7, 95, 192, 33);
    },
    slide: () => {
        return vm_0x2dfb67_f87f22(this, undefined, undefined, [], undefined, 8, 95, 192, 33);
    }
});

module["exports"] = vm_0x4cf741_f56387["__toCommonJS"](vm_0x4cf741_f56387["slide_exports"]);

// Main split function
function split(separator, limit) {
    return vm_0x2dfb67_f87f22(this, undefined, new.target, arguments, typeof split !== "undefined" ? split : undefined, 9, 95, 192, 33);
}
var split_default = split;
vm_0x4cf741_f56387["split_default"] = split_default;
globalThis["split_default"] = vm_0x4cf741_f56387["split_default"];

// Wrap tokens function
function wrapTokens(tokens, type, attrs) {
    return vm_0x2dfb67_f87f22(this, undefined, new.target, arguments, typeof wrapTokens !== "undefined" ? wrapTokens : undefined, 10, 95, 192, 33);
}
var wrap_tokens_default = wrapTokens;
vm_0x4cf741_f56387["wrap_tokens_default"] = wrap_tokens_default;
globalThis["wrap_tokens_default"] = vm_0x4cf741_f56387["wrap_tokens_default"];

// Import plugin
var import_plugin = vm_0x4cf741_f56387["__toESM"](vm_0x4cf741_f56387["require_plugin"]());
vm_0x4cf741_f56387["import_plugin"] = import_plugin;
globalThis["import_plugin"] = vm_0x4cf741_f56387["import_plugin"];

// Default anchor callback
var defaultAnchorCallback = (token) => {
    return vm_0x2dfb67_f87f22(this, undefined, undefined, [token], undefined, 11, 95, 192, 33);
};
vm_0x4cf741_f56387["defaultAnchorCallback"] = defaultAnchorCallback;
globalThis["defaultAnchorCallback"] = vm_0x4cf741_f56387["defaultAnchorCallback"];

// Slide function
function _slide(content) {
    return vm_0x2dfb67_f87f22(this, undefined, new.target, arguments, typeof _slide !== "undefined" ? _slide : undefined, 12, 95, 192, 33);
}

var slide = (0, vm_0x4cf741_f56387["import_plugin"]["default"])(_slide);
vm_0x4cf741_f56387["slide"] = slide;
globalThis["slide"] = vm_0x4cf741_f56387["slide"];

var slide_default = slide;
vm_0x4cf741_f56387["slide_default"] = slide_default;
globalThis["slide_default"] = vm_0x4cf741_f56387["slide_default"];

// Final exports
0 && (module["exports"] = {
    defaultAnchorCallback: vm_0x4cf741_f56387["defaultAnchorCallback"],
    slide: vm_0x4cf741_f56387["slide"]
});
