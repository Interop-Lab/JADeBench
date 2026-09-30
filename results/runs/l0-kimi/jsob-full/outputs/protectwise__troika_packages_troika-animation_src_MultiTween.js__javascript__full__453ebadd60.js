var {pow,PI,sqrt}=Math,HALF_PI=PI/2,TWO_PI=PI*2;
function makeInOut(_0x53f4c3,_0x50ab49){
return _0x361d18=>_0x361d18<0.5?_0x53f4c3(_0x361d18*2)*0.5:_0x50ab49(_0x361d18*2-1)*0.5+0.5;
}
function makeExpIn(_0x6eb245){
return _0x41aa0c=>pow(_0x41aa0c,_0x6eb245);
}
function makeExpOut(_0x6e956e){
return _0xd724b8=>1-pow(1-_0xd724b8,_0x6e956e);
}
function makeExpInOut(_0x595f0b){
return _0x20e71e=>_0x20e71e<0.5?pow(_0x20e71e*2,_0x595f0b)*0.5:(1-pow(2-_0x20e71e*2,_0x595f0b))*0.5+0.5;
}
var linear=_0x21d3e6=>_0x21d3e6,easeInQuad=makeExpIn(2),easeOutQuad=makeExpOut(2),easeInOutQuad=makeExpInOut(2),easeInCubic=makeExpIn(3),easeOutCubic=makeExpOut(3),easeInOutCubic=makeExpInOut(3),easeInQuart=makeExpIn(4),easeOutQuart=makeExpOut(4),easeInOutQuart=makeExpInOut(4),easeInQuint=makeExpIn(5),easeOutQuint=makeExpOut(5),easeInOutQuint=makeExpInOut(5),easeInSine=_0x26117b=>1-Math.cos(_0x26117b*HALF_PI),easeOutSine=_0x13d3fa=>Math.sin(_0x13d3fa*HALF_PI),easeInOutSine=_0xa5b8aa=>-0.5*(Math.cos(PI*_0xa5b8aa)-1),easeInExpo=_0x45f8fb=>_0x45f8fb===0?0:pow(2,10*(_0x45f8fb-1)),easeOutExpo=_0x561a5f=>_0x561a5f===1?1:1-pow(2,-10*_0x561a5f),easeInOutExpo=_0x1cdb8b=>_0x1cdb8b===0||_0x1cdb8b===1?_0x1cdb8b:_0x1cdb8b<0.5?pow(2,20*_0x1cdb8b-10)*0.5:(2-pow(2,-20*_0x1cdb8b+10))*0.5,easeInCirc=_0x8f58a0=>1-sqrt(1-_0x8f58a0*_0x8f58a0),easeOutCirc=_0xacf67d=>sqrt(1-pow(_0xacf67d-1,2)),easeInOutCirc=makeInOut(easeInCirc,easeOutCirc),easeInElastic=_0x7b231c=>_0x7b231c===0||_0x7b231c===1?_0x7b231c:1-easeOutElastic(1-_0x7b231c),easeOutElastic=_0xc42b00=>_0xc42b00===0||_0xc42b00===1?_0xc42b00:Math.pow(2,-10*_0xc42b00)*Math.sin((_0xc42b00-0.075)*TWO_PI/0.3)+1,easeInOutElastic=makeInOut(easeInElastic,easeOutElastic),easeInBack=_0x3a02e4=>_0x3a02e4*_0x3a02e4*(2.70158*_0x3a02e4-1.70158),easeOutBack=_0x3bb999=>(_0x3bb999-=1)*_0x3bb999*(2.70158*_0x3bb999+1.70158)+1,easeInOutBack=_0xbb9f5b=>{
const _0xfeede9=2.70158*1.525;
return _0xbb9f5b*=2,_0xbb9f5b<1?0.5*_0xbb9f5b*_0xbb9f5b*(_0xfeede9*_0xbb9f5b-_0xfeede9+2):0.5*(_0xbb9f5b-2)*(_0xbb9f5b-2)*(_0xfeede9*(_0xbb9f5b-2)+_0xfeede9+2)+2;
},easeInBounce=_0x12e3ba=>1-easeOutBounce(1-_0x12e3ba),easeOutBounce=_0x17d9bd=>_0x17d9bd<1/2.75?7.5625*_0x17d9bd*_0x17d9bd:_0x17d9bd<2/2.75?7.5625*(_0x17d9bd-=1.5/2.75)*_0x17d9bd+0.75:_0x17d9bd<2.5/2.75?7.5625*(_0x17d9bd-=2.25/2.75)*_0x17d9bd+0.9375:7.5625*(_0x17d9bd-=2.625/2.75)*_0x17d9bd+0.984375,easeInOutBounce=makeInOut(easeInBounce,easeOutBounce);
var __defProp=Object.defineProperty,__getOwnPropDesc=Object.getOwnPropertyDescriptor,__getOwnPropNames=Object.getOwnPropertyNames,__hasOwnProp=Object.prototype.hasOwnProperty;
var __export=(_0x3f0d31,_0x33f78b)=>{
for(var _0x45d99a in _0x33f78b)__defProp(_0x3f0d31,_0x45d99a,{'get':_0x33f78b[_0x45d99a],'enumerable':!![]});
},__copyProps=(_0xae1cdd,_0x61e8f8,_0x4b960a,_0x3d4c14)=>{
if(_0x61e8f8&&(typeof _0x61e8f8==='object'||typeof _0x61e8f8==='function')){
for(let _0x5b1020 of __getOwnPropNames(_0x61e8f8))if(!__hasOwnProp.call(_0xae1cdd,_0x5b1020)&&_0x5b1020!==_0x4b960a)__defProp(_0xae1cdd,_0x5b1020,{'get':()=>_0x61e8f8[_0x5b1020],'enumerable':!(_0x3d4c14=__getOwnPropDesc(_0x61e8f8,_0x5b1020))||_0x3d4c14.enumerable});
}
return _0xae1cdd;
},_0x2f54af={};
_0x2f54af.value=!![];
var __toCommonJS=_0x5a17ca=>__copyProps(__defProp({},'__esModule',_0x2f54af),_0x5a17ca),MultiTween_exports={},_0x595b22={};
_0x595b22.default=()=>MultiTween_default,__export(MultiTween_exports,_0x595b22),module.exports=__toCommonJS(MultiTween_exports);
var Easings_exports={},_0x2a6c06={};
_0x2a6c06.easeInBack=()=>easeInBack,_0x2a6c06.easeInBounce=()=>easeInBounce,_0x2a6c06.easeInCirc=()=>easeInCirc,_0x2a6c06.easeInCubic=()=>easeInCubic,_0x2a6c06.easeInElastic=()=>easeInElastic,_0x2a6c06.easeInExpo=()=>easeInExpo,_0x2a6c06.easeInOutBack=()=>easeInOutBack,_0x2a6c06.easeInOutBounce=()=>easeInOutBounce,_0x2a6c06.easeInOutCirc=()=>easeInOutCirc,_0x2a6c06.easeInOutCubic=()=>easeInOutCubic,_0x2a6c06.easeInOutElastic=()=>easeInOutElastic,_0x2a6c06.easeInOutExpo=()=>easeInOutExpo,_0x2a6c06.easeInOutQuad=()=>easeInOutQuad,_0x2a6c06.easeInOutQuart=()=>easeInOutQuart,_0x2a6c06.easeInOutQuint=()=>easeInOutQuint,_0x2a6c06.easeInOutSine=()=>easeInOutSine,_0x2a6c06.easeInQuad=()=>easeInQuad,_0x2a6c06.easeInQuart=()=>easeInQuart,_0x2a6c06.easeInQuint=()=>easeInQuint,_0x2a6c06.easeInSine=()=>easeInSine,_0x2a6c06.easeOutBack=()=>easeOutBack,_0x2a6c06.easeOutBounce=()=>easeOutBounce,_0x2a6c06.easeOutCirc=()=>easeOutCirc,_0x2a6c06.easeOutCubic=()=>easeOutCubic,_0x2a6c06.easeOutElastic=()=>easeOutElastic,_0x2a6c06.easeOutExpo=()=>easeOutExpo,_0x2a6c06.easeOutQuad=()=>easeOutQuad,_0x2a6c06.easeOutQuart=()=>easeOutQuart,_0x2a6c06.easeOutQuint=()=>easeOutQuint,_0x2a6c06.easeOutSine=()=>easeOutSine,_0x2a6c06.linear=()=>linear,__export(Easings_exports,_0x2a6c06);
function number(_0x587a62,_0x38ca12,_0x826d71){
return _0x587a62+(_0x38ca12-_0x587a62)*_0x826d71;
}
function color(_0x373fc9,_0x1664a3,_0x2087e6){
_0x373fc9=colorValueToNumber(_0x373fc9);
_0x1664a3=colorValueToNumber(_0x1664a3);
return rgbToNumber(number((_0x373fc9>>16)&255,(_0x1664a3>>16)&255,_0x2087e6),number((_0x373fc9>>8)&255,(_0x1664a3>>8)&255,_0x2087e6),number(_0x373fc9&255,_0x1664a3&255,_0x2087e6));
}
var colorValueToNumber=(function(){
let _0x5dca20,_0x28339e;
let _0x3bfbf=Object.create(null),_0x5c3158=0;
const _0x51c373=1000;
return function(_0x26a618){
if(typeof _0x26a618==='number')return _0x26a618;
else if(typeof _0x26a618==='string'){
if(_0x26a618 in _0x3bfbf)return _0x3bfbf[_0x26a618];
!_0x5dca20&&(_0x5dca20=document.createElement('canvas'),_0x28339e=_0x5dca20.getContext('2d'));
_0x5dca20.width=_0x5dca20.height=1,_0x28339e.fillStyle=_0x26a618,_0x28339e.fillRect(0,0,1,1);
const _0x5e1c6e=_0x28339e.getImageData(0,0,1,1).data,_0x301834=rgbToNumber(_0x5e1c6e[0],_0x5e1c6e[1],_0x5e1c6e[2]);
if(_0x5c3158>=_0x51c373)_0x3bfbf=Object.create(null),_0x5c3158=0;
return _0x3bfbf[_0x26a618]=_0x301834,_0x5c3158++,_0x301834;
}
else return _0x26a618&&_0x26a618.r?_0x26a618.rgb():0;
};
}());
function rgbToNumber(_0x5e3535,_0x4ea748,_0x303756){
return (_0x5e3535<<16)^(_0x4ea748<<8)^_0x303756;
}
var Interpolators_exports={},_0x5965f6={};
_0x5965f6.color=()=>color,_0x5965f6.number=()=>number,__export(Interpolators_exports,_0x5965f6);
var AbstractTween=class{
onUpdate(_0x5f1863){}
update(){}
isDone(_0x8f4305){}
},linear2=_0x13edbc=>_0x13edbc,maxSafeInteger=9007199254740991,Tween=class extends AbstractTween{
constructor(_0x27ec49,_0x15be4d,_0x4a319e,_0xc4cbd2=0,_0x6a8029=0,_0x1e575c=linear2,_0x452b28=0,_0x497c9e='number',_0x48ab70='number'){
super();
this.target=_0x27ec49;
this.toValue=_0x15be4d;
this.fromValue=_0x4a319e;
this.startTime=_0xc4cbd2;
this.duration=_0x6a8029;
this.easing=typeof _0x1e575c==='string'?Easings_exports[_0x1e575c]||linear2:_0x1e575c;
this.iterations=_0x452b28;
this.interpolation=typeof _0x48ab70==='string'?_0x48ab70:Interpolators_exports[_0x48ab70]||number;
this.direction=_0x497c9e;
this.endTime=this.startTime+this.duration;
this.endTime=this.iterations!==0?this.startTime+this.duration*this.iterations:maxSafeInteger;
}
updateTo(_0x37e708){
let _0x5e6472=this.startTime,_0x1c8c85=this.endTime;
if(_0x37e708>=_0x1c8c85){
_0x37e708=Math.min(_0x37e708,this.endTime+this.duration),_0x37e708=_0x37e708-_0x5e6472;
let _0x2bbe18=_0x37e708/_0x5e6472;
if(_0x2bbe18<0&&_0x37e708>0)_0x2bbe18=0;
_0x2bbe18=this.easing(_0x2bbe18);
(this.direction==='alternate'||this.direction==='alternate-reverse'&&Math.floor(_0x37e708/_0x5e6472)%2===0)&&(_0x2bbe18=1-_0x2bbe18),this.onUpdate(this.interpolation(this.fromValue,this.toValue,_0x2bbe18));
}
}
update(){
this.updateTo(this.endTime);
}
isDone(_0x35443d){
return _0x35443d>this.endTime;
}
},Tween_default=Tween,MultiTween=class extends Tween_default{
constructor(_0x390d62,_0x3b1949,_0x393dff,_0x9f62a9,_0x166dea,_0x1c225d){
if(typeof _0x3b1949!=='number')_0x3b1949=_0x390d62.reduce((_0x550ef5,_0x40d56f)=>Math.max(_0x550ef5,_0x40d56f.endTime),0);
if(_0x3b1949===Infinity)_0x3b1949=Number.MAX_SAFE_INTEGER;
super(null,0,_0x3b1949,_0x3b1949,_0x393dff,_0x9f62a9,_0x166dea,_0x1c225d);
if(_0x390d62.length>0)this.target=_0x390d62[0].target,this.toValue=_0x390d62[0].toValue;
else _0x390d62.sort(endTimeComparator),this.target=this.toValue;
this.tweens=_0x390d62;
}
updateTo(_0x5a8044){
for(let _0x15416d=0,_0x29b19d=this.tweens.length;_0x15416d<_0x29b19d;_0x15416d++){
this.tweens[_0x15416d].updateTo(_0x5a8044);
}
}
};
function endTimeComparator(_0x2522de,_0x5ae6a7){
return _0x2522de.endTime-_0x5ae6a7.endTime;
}
var MultiTween_default=MultiTween;
