const { pow, PI, sqrt } = Math;

function helper82(value) { return value; }
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return value => value < 0.5
    ? easeIn(value * 2) * 0.5
    : easeOut(value * 2 - 1) * 0.5 + 0.5;
}
function makeExpIn(exponent) { return value => pow(value, exponent); }
function makeExpOut(exponent) { return value => 1 - pow(1 - value, exponent); }
function makeExpInOut(exponent) {
  return value => value < 0.5
    ? pow(value * 2, exponent) * 0.5
    : (2 - pow(2 - value * 2, exponent)) * 0.5;
}

var easeInQuad=makeExpIn(-0xd4*-0x22+0x3*0x21+-0x1c89),easeOutQuad=makeExpOut(-0x109a+0x1fd5+-0xf39),easeInOutQuad=makeExpInOut(0xd*-0x28d+-0x25d+0x2388),easeInCubic=makeExpIn(-0xa14*-0x1+-0x5b3+0x45e*-0x1),easeOutCubic=makeExpOut(0x10a3*0x2+0x8d*0x22+-0x33fd),easeInOutCubic=makeExpInOut(0x647*-0x4+-0xf3c+0x1*0x285b),easeInQuart=makeExpIn(-0x2f8+-0x14f8+0x4*0x5fd),easeOutQuart=makeExpOut(0x6fb+0x10ff+-0xbfb*0x2),easeInOutQuart=makeExpInOut(0x11c*-0x4+-0x2586*0x1+0x29fa),easeInQuint=makeExpIn(0x4*0x4ea+0x2540+-0x38e3*0x1),easeOutQuint=makeExpOut(0x3e8+-0x9da+0x5f7),easeInOutQuint=makeExpInOut(0xc1b+-0x1*-0x1872+-0x2488),easeInSine=helper1=>-0x3b*0x83+0x252b+-0x6f9-Math["cos"](helper1*HALF_PI),easeOutSine=helper2=>Math["sin"](helper2*HALF_PI),easeInOutSine=helper3=>-(0x258f+-0x18d*0x3+-0x20e8+0.5)*(Math["cos"](PI*helper3)-(-0x11ca+0x70c*0x1+0xabf)),easeInExpo=helper4=>helper4===0x184f+0x1b7c+0x1*-0x33cb?-0x2*-0x359+-0x1fd7+0x9d*0x29:pow(-0x1*0x368+-0x18e0+0x22*0xd5,(-0x1e0d+-0x1823+0x363a)*(helper4-(-0x9a5+0x369*-0x3+0x13e1))),easeOutExpo=helper5=>helper5===0x5e6+-0x5a*-0x13+-0xc93?0x3e*0x4d+0x15d*0xf+-0x48*0x8b:-0x13dc+0x71c+0x1*0xcc1-pow(-0x10ee*0x1+-0x1117+-0x119*-0x1f,-(0x5d3+0x269c+-0x2c65)*helper5);
function helper6(helper7,helper8){return helper9(helper8-0x396,helper7);
}var easeInOutExpo=helper10=>helper10===0x1706+0x1179+-0x287f||helper10===-0x2*0xc44+-0x1e05*0x1+0x368e*0x1?helper10:helper10<-0x1155+-0x722*-0x2+0x311*0x1+0.5?pow(-0x1*0x147+-0x9aa+-0xaf3*-0x1,(0x63e+0x2677+-0x2cab)*(helper10*(-0x5*-0x179+0x1089+-0x8b*0x2c)-(0xd3*0x2f+0x1*0x22d1+-0x498d)))*(0x18ba+0xc04+0x125f*-0x2+0.5):(0x26a9+0x3*-0xae5+0x5f9*-0x1-pow(-0xf4d+0x2602+-0x16b3,-(-0x9db*0x1+-0x731+0xf3*0x12)*(helper10*(0x20f+-0x1575*-0x1+-0x3b*0x66)-(-0x207*0x6+-0x1*-0x1c1+-0xa6a*-0x1))))*(-0xe64*0x2+0x150+-0x18*-0x125+0.5)+(0x1*-0x2263+-0xb13+-0x2d76*-0x1+0.5),easeInCirc=helper11=>0xc79+0xc82+-0x18fa-sqrt(0x1d*-0x124+0xec5+-0x494*-0x4-helper11*helper11),easeOutCirc=helper12=>sqrt(0x4*-0x44d+0x1*0x12ff+-0x1ca-pow(helper12-(-0x1a10+0x6*0x61f+0xaa9*-0x1),-0xa61+0x3d*-0x39+-0x34*-0x76)),easeInOutCirc=makeInOut(easeInCirc,easeOutCirc),easeInElastic=helper13=>helper13===0x1*-0x25c7+-0x1d12+0x42d9||helper13===0x551*-0x4+-0x6*0x3b3+-0xe7d*-0x3?helper13:-0x365*0xb+0xfc2+0xacb*0x2-easeOutElastic(0x136*-0xa+-0x21b3*0x1+0x8*0x5ba-helper13),easeOutElastic=helper14=>helper14===-0x7*0x31f+0x2*0xbb6+-0x193||helper14===-0x688+0x1386+-0xcfd?helper14:Math["pow"](0xb*-0x1a1+0x8fe+0x8ef,-(-0x56*0x21+-0x99b*0x3+0x27f1)*helper14)*Math["sin"]((helper14-(0x13a+0xda*0x4+-0x251*0x2+0.075))*TWO_PI/(-0x2472+0x170b+-0x1*-0xd67+0.3))+(-0x115b+-0x2fc+0x1458),easeInOutElastic=makeInOut(easeInElastic,easeOutElastic),easeInBack=helper15=>helper15*helper15*((-0x9bb+0x705+0x2b8+0.7015799999999999)*helper15-(0x15ef*-0x1+-0x210b*-0x1+0x1*-0xb1b+0.7015800000000001)),easeOutBack=helper16=>(helper16-=0x18a*0x13+-0x2*0x115b+0x1d3*0x3)*helper16*((-0x36*0xf+0x3*-0x5c1+0x146f+0.7015799999999999)*helper16+(0x1271+-0xa11*0x3+0xbc3+0.7015800000000001))+(-0x24d0+0x1*-0x240d+0x48de),easeInOutBack=helper17=>{var helper18={helper19:0x4f,helper20:'%(fB',helper21:'8Auf',helper22:'aVls',helper23:0x148,helper24:0xf7,helper25:0x124,helper26:'%(fB',helper27:'v#]G',helper28:'[%nC',helper29:0x22e,helper30:0x10,helper31:'@YKp',helper32:0x1fb,helper33:'yLfI',helper34:0x30,helper35:0x1e7,helper36:0x87,helper37:'s7WE',helper38:'ItV!'};
function helper39(helper40,helper41){return helper6(helper40,helper41- -0x6dd);
}var helper42={};
helper42["fZQPS"]=function(helper43,helper44){return helper43*helper44;
},helper42["xYJOw"]=function(helper45,helper46){return helper45<helper46;
};
function helper47(helper48,helper49){return helper6(helper49,helper48- -0x4d7);
}helper42["uPYXt"]=function(helper50,helper51){return helper50-helper51;
},helper42["gsulE"]=function(helper52,helper53){return helper52*helper53;
},helper42["ZRchv"]=function(helper54,helper55){return helper54+helper55;
},helper42["TCeRs"]=function(helper56,helper57){return helper56*helper57;
},helper42["PZMBN"]=function(helper58,helper59){return helper58+helper59;
},helper42["xxYIU"]=function(helper60,helper61){return helper60+helper61;
};
var helper62=helper42;
const helper63=helper62["fZQPS"](-0x2381+0x1805+-0x1*-0xb7d+0.7015800000000001,0x879+0xa8e+-0x1306+0.5249999999999999);
return helper62["xYJOw"](helper17*=0x1eaf*0x1+-0x2013+0x2*0xb3,0xabe*-0x3+0x19*0xb5+-0x12*-0xcf)?helper62["fZQPS"](0x3*0x3df+0xa8a+-0x1627+0.5,helper62["fZQPS"](helper62["fZQPS"](helper17,helper17),helper62["uPYXt"](helper62["gsulE"](helper62["ZRchv"](helper63,0x1df7+-0x1249+-0xbad),helper17),helper63))):helper62["gsulE"](0x17*-0x161+-0x1d55+0x1*0x3d0c+0.5,helper62["ZRchv"](helper62["gsulE"](helper62["TCeRs"](helper17-=0x14c3+0x6f*0x47+0x6*-0x897,helper17),helper62["PZMBN"](helper62["gsulE"](helper62["xxYIU"](helper63,-0x2340+-0x1317+-0x25*-0x178),helper17),helper63)),-0x4d5*0x1+-0x245d+0x2934));
},easeInBounce=helper64=>-0x26ed+-0xd42+0x3430-easeOutBounce(-0x233a+0x1e83+0x4b8-helper64),easeOutBounce=helper65=>helper65<(0x255a+-0x26e*0xb+0x1*-0xa9f)/(-0x1df*0x3+0x6*-0x582+0x13*0x209+0.75)?(0x1c63+0x527+-0x2183+0.5625)*helper65*helper65:helper65<(0x2130+0x1*0x107b+0x1*-0x31a9)/(-0x11d*-0x20+-0x1*-0xa8b+-0x2e29+0.75)?(-0x216b+-0x14a2+0x3614+0.5625)*(helper65-=(0xb3d*0x2+0xeca*-0x1+0x7af*-0x1+0.5)/(-0x4fd*0x1+0x943+-0x444+0.75))*helper65+(0x2*0xd5+0x6e*-0x1a+0x982+0.75):helper65<(-0xd48+0xc4*0x32+-0x18fe+0.5)/(0xc74+0x2e*-0x8+-0x1*0xb02+0.75)?(-0x407+-0xb3e+-0x7a6*-0x2+0.5625)*(helper65-=(0x2c1*-0x2+0x2118+-0x5*0x584+0.25)/(-0x162*0x13+0x6b*0x11+-0x1*-0x132d+0.75))*helper65+(0x9*0x305+-0xd9+0x4*-0x695+0.9375):(0x13da+-0x87b+-0xb58+0.5625)*(helper65-=(-0x7*0x8b+-0x252a+0x11*0x269+0.625)/(0xb*0x139+0x253f+-0x32b0+0.75))*helper65+(0xaee*-0x2+0x1639+0x1f*-0x3+0.984375),easeInOutBounce=makeInOut(easeInBounce,easeOutBounce);
function rgbToNumber(helper370,helper371,helper372){var helper373={helper374:0x9,helper375:0xc8,helper376:'5J]W',helper377:'r)Qd',helper378:0xd5,helper379:'q!sI'},helper380={helper381:0x527};
function helper382(helper383,helper384){return helper6(helper384,helper383- -0x21c);
}var helper385={};
helper385[helper386(0x40,'zrOj')]=function(helper387,helper388){return helper387^helper388;
};
function helper386(helper389,helper390){return helper6(helper390,helper389- -helper380.helper381);
}helper385[helper386(-9,'fA2J')]=function(helper391,helper392){return helper391<<helper392;
},helper385[helper386(200,"5J]W")]=function(helper393,helper394){return helper393<<helper394;
};
var helper395=helper385;
return helper395[helper386(0xef,'1AP@')](helper395[helper386(0xc1,"r)Qd")](helper395[helper386(0x93,'wR5H')](helper370,-0x2*0x101c+0x55d*-0x4+0x35bc),helper395[helper386(213,"q!sI")](helper371,0x877+-0x10f1+-0x441*-0x2)),helper372);
}class AbstractTween {["gotoElapsedTime"](helper396){}["gotoEnd"](){}["isDoneAtElapsedT"+"ime"](helper397){}}

const linear2 =helper398=>helper398,maxSafeInteger=0x3*-0x69873a4955555+0x12c7d9a7ffffff+0x1018145c00000+-0x1fffffffffffff*-0x1

class Tween extends AbstractTween {constructor(helper399,helper400,helper401,helper402=0x9*0x372+0x1d1c+-0x3930,helper403=-0x9c2*0x3+0x367*0x9+-0x159,helper404=linear2,helper405=0x196c+0x29*0x94+-0x311f,helper406="forward",helper407="number"){var helper408={helper409:0x3be,helper410:0x355,helper411:0x299,helper412:'ybxf',helper413:'QDdG',helper414:0xc7,helper415:0x3d,helper416:'QvVq',helper417:0x3a6,helper418:'ZCnn',helper419:0x35e,helper420:0x100,helper421:'@YKp',helper422:0x372,helper423:0x382,helper424:'i9UO',helper425:0x2ea,helper426:0x131,helper427:'fsNC',helper428:0x37a,helper429:'%(fB',helper430:0x2c8,helper431:'i*CL',helper432:0x3cc,helper433:0xec,helper434:0x114,helper435:'QDdG',helper436:0x2ed,helper437:0x366,helper438:'BM$V',helper439:0x39b,helper440:0xba,helper441:'3vnS'},helper442={helper443:0x66a},helper444={helper445:0x251},helper446={};
helper446[helper447('s7WE',958)]=helper447('kCrd',853)+helper447('Bxk6',0x3da)+helper447('8Auf',665),helper446[helper448(-0xfc,'Bxk6')]=function(helper449,helper450){return helper449===helper450;
};
function helper447(helper451,helper452){return helper6(helper451,helper452- -helper444.helper445);
}function helper448(helper453,helper454){return helper6(helper454,helper453- -helper442.helper443);
}helper446[helper448(-0x13c,'v#]G')]=helper447(')#!i',0x2fb),helper446[helper447("ybxf",0x3bf)]=function(helper455,helper456){return helper455===helper456;
},helper446[helper448(-0x199,"QDdG")]=helper448(-199,')#!i'),helper446[helper448(-0x48,'8Auf')]=function(helper457,helper458){return helper457<helper458;
},helper446[helper448(-61,"QvVq")]=function(helper459,helper460){return helper459+helper460;
},helper446[helper448(-0x5c,'NdK!')]=function(helper461,helper462){return helper461*helper462;
};
var helper463=helper446,helper464=helper463[helper447('L!wy',934)][helper447('3qH2',0x2d3)]('|'),helper465=0x89+-0xaab*-0x3+0xa*-0x341;
while(!![]){switch(helper464[helper465++]){case'0':super();
continue;
case'1':this[helper447(']u(Y',0x356)]=helper463[helper447("ZCnn",862)](typeof helper404,helper463[helper448(-256,'[%nC')])?Easings_exports[helper404]||linear2:helper404;
continue;
case'2':this[helper448(-0xcf,"@YKp")]=helper403;
continue;
case'3':this[helper447('fA2J',882)+'ns']=helper405;
continue;
case'4':this[helper447('[e%5',898)]=helper399;
continue;
case'5':this[helper448(-0xcc,'!E8o')]=helper401;
continue;
case'6':this[helper447("i9UO",746)+helper448(-305,"fsNC")]=helper463[helper447('NdK!',890)](typeof helper407,helper463[helper447('NdK!',0x292)])?helper407:Interpolators_exports[helper407]||number;
continue;
case'7':this[helper447("%(fB",712)]=helper402;
continue;
case'8':this[helper448(-0x157,"i*CL")+'n']=helper406;
continue;
case'9':this[helper447('%(fB',972)+'e']=helper400;
continue;
case'10':this[helper448(-0x195,'3vnS')+helper448(-236,'Bxk6')]=helper463[helper448(-0x133,'VB^u')](this[helper448(-0xdd,'%f])')+'ns'],maxSafeInteger)?helper463[helper448(-276,"QDdG")](this[helper447("QDdG",749)],helper463[helper447('fsNC',870)](this[helper447("BM$V",923)],this[helper448(-186,"3vnS")+'ns'])):maxSafeInteger;
continue;
}break;
}}["gotoElapsedTime"](helper466){var helper467={helper468:'vX8p',helper469:'NdK!',helper470:0x536,helper471:0x613,helper472:'5gO7',helper473:0x583,helper474:'OpEg',helper475:0x5a3,helper476:0x492,helper477:0x4b0,helper478:0x5d7,helper479:0x5ee,helper480:'QDdG',helper481:0x56e,helper482:'!E8o',helper483:0x568,helper484:0x599,helper485:0x5b8,helper486:'ItV!',helper487:0x579,helper488:'ZCnn',helper489:0x409,helper490:'fsNC',helper491:0x52f,helper492:'1AP@',helper493:0x3bb,helper494:'ZCnn',helper495:0x3ec,helper496:0x40d,helper497:0x4f4,helper498:'@YKp',helper499:'rZGc',helper500:'5TOL',helper501:'ZCnn',helper502:0x4ac,helper503:'wR5H',helper504:'QvVq',helper505:'[e%5',helper506:'1[zY',helper507:0x5f6,helper508:0x4b5,helper509:'3vnS',helper510:0x410,helper511:0x447,helper512:')#!i',helper513:0x3ff,helper514:'s7WE',helper515:0x618,helper516:'%f])',helper517:'ybxf',helper518:0x50f,helper519:'3qH2',helper520:'BM$V',helper521:0x430,helper522:0x4b8,helper523:0x572,helper524:'3vnS',helper525:'i9UO',helper526:0x45c},helper527={helper528:0x660},helper529={helper530:0x756},helper531={};
helper531[helper532(0x3d2,"vX8p")]=function(helper533,helper534){return helper533*helper534;
},helper531[helper532(0x451,"NdK!")]=function(helper535,helper536){return helper535<helper536;
},helper531[helper537(1334,']u(Y')]=function(helper538,helper539){return helper538*helper539;
},helper531[helper537(0x5c8,'QDdG')]=function(helper540,helper541){return helper540-helper541;
},helper531[helper537(1555,"5gO7")]=function(helper542,helper543){return helper542+helper543;
},helper531[helper537(1411,"OpEg")]=function(helper544,helper545){return helper544>=helper545;
},helper531[helper537(0x5aa,'ItV!')]=function(helper546,helper547){return helper546!==helper547;
};
function helper537(helper548,helper549){return helper82(helper549,helper548-helper529.helper530);
}helper531[helper537(1443,'NdK!')]=helper532(1170,'8Auf'),helper531[helper537(1200,'fA2J')]=function(helper550,helper551){return helper550-helper551;
},helper531[helper537(0x5a7,')#!i')]=function(helper552,helper553){return helper552/helper553;
},helper531[helper537(1495,')#!i')]=function(helper554,helper555){return helper554%helper555;
},helper531[helper537(1518,'3qH2')]=function(helper556,helper557){return helper556===helper557;
},helper531[helper537(0x61f,'%(fB')]=function(helper558,helper559){return helper558===helper559;
},helper531[helper532(0x3af,"QDdG")]=helper537(1390,'jf7P'),helper531[helper537(0x4c0,"!E8o")]=helper537(1384,'fA2J')+'e',helper531[helper537(1433,'i9UO')]=function(helper560,helper561){return helper560===helper561;
};
function helper532(helper562,helper563){return helper82(helper563,helper562-helper527.helper528);
}helper531[helper532(0x4dd,']u(Y')]=function(helper564,helper565){return helper564-helper565;
};
var helper566=helper531;
let helper567=this[helper532(0x51e,'QvVq')],helper568=this[helper537(1464,"ItV!")];
if(helper566[helper532(0x3db,'1AP@')](helper466,helper568)){if(helper566[helper537(0x4ae,'%f])')](helper566[helper537(1401,"ZCnn")],helper566[helper532(1033,"fsNC")])){const helper569=fxuLjO[helper537(1327,"1AP@")](-0x1*0x1933+0x1af3*0x1+-0x1bf+0.7015800000000001,-0x1b96+-0xfa9+0x40*0xad+0.5249999999999999);
return fxuLjO[helper537(0x521,'a$EN')](helper570*=0x64*-0x56+0x1f3e+0x25c,0x2*-0xa7b+-0x8d*0x9+0x19ec)?fxuLjO[helper532(955,"ZCnn")](0x2*0xf9f+-0x174a+0x7f4*-0x1+0.5,fxuLjO[helper532(1004,'3qH2')](fxuLjO[helper532(1037,'8Auf')](helper571,helper572),fxuLjO[helper532(1268,"@YKp")](fxuLjO[helper532(0x3d5,'fsNC')](fxuLjO[helper537(0x598,"rZGc")](helper569,0x180b+0x209*-0x4+-0xfe6),helper573),helper569))):fxuLjO[helper537(0x5a5,"5TOL")](0x332+-0x15d+-0x1d5+0.5,fxuLjO[helper532(0x3d7,']u(Y')](fxuLjO[helper537(0x57f,"ZCnn")](fxuLjO[helper537(1196,"wR5H")](helper574-=-0x4*-0x101+0x12b*0x1f+-0x2837,helper575),fxuLjO[helper537(0x5b6,'1[zY')](fxuLjO[helper537(0x550,"QvVq")](fxuLjO[helper532(0x491,"[e%5")](helper569,-0x14*-0x119+0xeed*0x1+-0xa*0x3b0),helper576),helper569)),0xb9+-0x1fe5+0x1f2e));
}else{helper466=helper566[helper537(0x5e4,"1[zY")](Math[helper532(0x400,'i*CL')](helper466,this[helper537(1526,'sA8x')+helper537(1205,"3vnS")]),helper568);
let helper577=helper566[helper532(1040,'5TOL')](helper566[helper532(1095,'jf7P')](helper466,helper567),helper567);
if(helper566[helper537(0x4a4,")#!i")](helper577,-0x1cb9+0x1244+0xa75)&&helper566[helper537(0x58b,'i*CL')](helper466,-0x3*-0xa94+0x2208+-0x41c4))helper577=-0xd66+-0x3*0xb1f+-0x52*-0x92;
helper577=this[helper532(1023,'fsNC')](helper577),(helper566[helper537(0x5c5,"s7WE")](this[helper537(1560,"%f])")+'n'],helper566[helper532(0x4b0,'ItV!')])||helper566[helper532(0x521,"ybxf")](this[helper532(1295,'jf7P')+'n'],helper566[helper537(0x58d,'zrOj')])&&helper566[helper537(0x595,')#!i')](helper566[helper537(0x4c2,"3qH2")](Math[helper537(0x60c,"BM$V")](helper566[helper532(1072,'kCrd')](helper466,helper567)),0x24b*-0xf+0x18*-0x115+0xc13*0x5),-0x1af9+-0x2363+-0x133*-0x34))&&(helper577=helper566[helper532(1208,"s7WE")](0x1e1d+0x1*-0x209b+0x27f,helper577)),this[helper537(0x4d4,"@YKp")](this[helper537(1394,"3vnS")+helper537(0x590,"i9UO")](this[helper532(0x4fe,'[e%5')+'e'],this[helper532(1116,"3vnS")],helper577));
}}}["gotoEnd"](){var helper578={helper579:'L!wy',helper580:'gTrM',helper581:0x137,helper582:'5gO7'},helper583={helper584:0x18b};
function helper585(helper586,helper587){return helper6(helper587,helper586- -helper583.helper584);
}function helper588(helper589,helper590){return helper6(helper590,helper589- -0x5f4);
}this[helper585(0x348,"L!wy")+helper585(0x443,"gTrM")](this[helper585(0x408,'i*CL')+"psed"]);
}["isDoneAtElapsedT"+"ime"](helper591){var helper592={helper593:'zrOj',helper594:'kCrd',helper595:0x2ce,helper596:'3qH2'},helper597={helper598:0x5d8},helper599={helper600:0x425},helper601={};
function helper602(helper603,helper604){return helper82(helper603,helper604-helper599.helper600);
}helper601[helper605("zrOj",0x413)]=function(helper606,helper607){return helper606>helper607;
};
var helper608=helper601;
function helper605(helper609,helper610){return helper82(helper609,helper610-helper597.helper598);
}return helper608[helper605('gTrM',0x494)](helper591,this[helper602("kCrd",718)+helper605("3qH2",0x3ac)]);
}

}

module.exports = { default: Tween };
