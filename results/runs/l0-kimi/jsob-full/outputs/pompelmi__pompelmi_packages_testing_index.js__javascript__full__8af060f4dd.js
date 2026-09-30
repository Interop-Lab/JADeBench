'use strict';
var {Verdict}=require('pompelmo');

function createMockScanner(verdict){
    if(verdict!==Verdict.CLEAN&&verdict!==Verdict.INFECTED&&verdict!==Verdict.ERROR)throw new TypeError('Invalid verdict');
    return{
        Verdict:Verdict,
        scan:()=>Promise.resolve(verdict),
        scanBuffer:()=>Promise.resolve(verdict),
        scanStream:()=>Promise.resolve(verdict),
        scanS3:()=>Promise.resolve(verdict),
        _verdict:verdict
    };
}

function mockClean(){
    return createMockScanner(Verdict.CLEAN);
}

function mockInfected(message){
    const scanner=createMockScanner(Verdict.INFECTED);
    scanner.message=message||'Infected';
    return scanner;
}

function mockScanError(){
    return createMockScanner(Verdict.ERROR);
}

function withMockedPompelmo(verdict,fn){
    const scanner=createMockScanner(verdict);
    try{
        return Promise.resolve(fn(scanner));
    }catch(err){
        return Promise.reject(err);
    }
}

const _0x42c2bc={};
_0x42c2bc.createMockScanner=createMockScanner;
_0x42c2bc.mockClean=mockClean;
_0x42c2bc.mockInfected=mockInfected;
_0x42c2bc.mockScanError=mockScanError;
_0x42c2bc.withMockedPompelmo=withMockedPompelmo;
_0x42c2bc.Verdict=Verdict;
module.exports=_0x42c2bc;
