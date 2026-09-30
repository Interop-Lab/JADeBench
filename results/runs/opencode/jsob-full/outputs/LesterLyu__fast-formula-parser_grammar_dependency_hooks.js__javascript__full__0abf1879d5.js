const __commonJS = (modules, cached) => function loadModule() {
  if (!cached) {
    cached = { exports: {} };
    modules[Object.getOwnPropertyNames(modules)[0]](cached.exports, cached);
  }
  return cached.exports;
};

const require_collection = __commonJS({
  "grammar/type/collection.js"(exports, module) {
    class Collection {
      constructor(data, references) {
        if (data == null && references == null) {
          this._data = [];
          this._refs = [];
        } else {
          if (data.length !== references.length) {
            throw Error("Collection: data length should match references length.");
          }
          this._data = data;
          this._refs = references;
        }
      }

      get data() { return this._data; }
      get refs() { return this._refs; }
      get length() { return this._data.length; }

      add(value, reference) {
        this._data.push(value);
        this._refs.push(reference);
      }
    }

    module.exports = Collection;
  }
});

var require_helpers=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(internal92, internal93)  {
    var internal94=  {
      internal95:0x887, internal96:0x8a7, internal97:'nFVG', internal98:0xadd, internal99:'0yn(', internal100:0x22c, internal101:0x4ea, internal102:0xd29, internal103:0xc7b, internal104:'qNt2', internal105:'$B0@', internal106:0xa1b, internal107:0x9f5, internal108:'AKA6', internal109:'doOP', internal110:'!eN1', internal111:0xf45, internal112:0x8bf, internal113:'qZZf', internal114:0xa58, internal115:0x9c7, internal116:'H)ax', internal117:0x9a9, internal118:0x32b, internal119:'tgcf', internal120:'ms7r', internal121:'KdGw', internal122:0xcb9, internal123:0x54b, internal124:'*q![', internal125:0x99d, internal126:'!@ro', internal127:0xdcf, internal128:'V8zc', internal129:'P[cU', internal130:'mg$O', internal131:0x882, internal132:']&Q[', internal133:0xfcb, internal134:0x855, internal135:'sMXv', internal136:0x3f6, internal137:'1i)F', internal138:'ZjT(', internal139:'T9j^', internal140:0x7f9, internal141:0xf53, internal142:0xd89, internal143:'sMXv', internal144:0x43f, internal145:0x809, internal146:'ZjT(', internal147:0x6b5, internal148:0x96e, internal149:'Lp77', internal150:'!)nD', internal151:0x6d8, internal152:0x494, internal153:'doOP', internal154:0x7aa, internal155:0x20c, internal156:'][r2', internal157:0x782, internal158:0xeb9, internal159:0x62f, internal160:0xf6e, internal161:0xe0c, internal162:'r*kS', internal163:0xab7, internal164:'45yh', internal165:0x738, internal166:0x568, internal167:'H)ax', internal168:'mg$O', internal169:0xbfb, internal170:'PyOy', internal171:'QDh3', internal172:0xa0d, internal173:'T9j^', internal174:0x7dc, internal175:'r*kS', internal176:0x674, internal177:0xe3c, internal178:'KdGw', internal179:0x61a, internal180:0x530, internal181:0x955, internal182:0xa1a, internal183:'Lp77', internal184:0x8e6, internal185:'iBSK', internal186:0xafb, internal187:0xc6d, internal188:0xf02, internal189:'Zy0r', internal190:0xb72, internal191:'xhiS', internal192:0x683, internal193:0x78c, internal194:0x245, internal195:0x577, internal196:0x94e, internal197:0x8d5, internal198:'V^6D', internal199:'tgcf', internal200:'H)ax', internal201:0x102e, internal202:'nFVG', internal203:0x99a, internal204:0x4dc, internal205:'H)ax', internal206:0x6ae, internal207:0x93b, internal208:0x7fc, internal209:0xbbc, internal210:'R!qN', internal211:0x8ea, internal212:0x276, internal213:'Lp77', internal214:'V8zc', internal215:0x10bf, internal216:'Lp77', internal217:0x3a5, internal218:0x443, internal219:'qNt2', internal220:'0!*N', internal221:0xe33, internal222:'*q![', internal223:0xd60, internal224:0x317, internal225:0xc4e, internal226:'tgcf', internal227:'Lp77', internal228:'PrC4', internal229:0x9ef, internal230:'!)nD', internal231:0x10ed, internal232:'gFo2', internal233:0x102a, internal234:0xf36, internal235:0x647, internal236:0x5cf, internal237:0xe1a, internal238:0xae8, internal239:'$B0@', internal240:0xba1, internal241:'H1kv', internal242:'QDh3', internal243:0xadb, internal244:0x438, internal245:0x800, internal246:'[U[P', internal247:0x4db, internal248:0x413, internal249:0x466, internal250:'tgcf', internal251:'r*kS', internal252:'V^6D', internal253:'*q![', internal254:0xf69, internal255:0x555, internal256:'!eN1', internal257:0x9f2, internal258:0x107c, internal259:'QDh3', internal260:'R!qN', internal261:0x6b7, internal262:0x4e3, internal263:'hcmw', internal264:'tgcf', internal265:0x5c9, internal266:0x945, internal267:0x3ab, internal268:0xbaf, internal269:0x529, internal270:0x4c0, internal271:'qZZf', internal272:0x1123, internal273:0x479, internal274:'$B0@', internal275:0xa45, internal276:0xbc4
    }, internal277=  {
      internal278:0x373, internal279:']&Q[', internal280:0xb6c, internal281:'R!qN', internal282:'65r8', internal283:0xef0, internal284:'45yh', internal285:0x990, internal286:'sMXv', internal287:'tgcf', internal288:0x817, internal289:0xa88, internal290:'P[cU', internal291:0x6fd, internal292:'hcmw', internal293:0x8d7, internal294:0x2b1, internal295:'nFVG', internal296:0x464, internal297:'d9It', internal298:0x7b1, internal299:0xbdc, internal300:'!@ro', internal301:0x1012, internal302:'ZjT(', internal303:'nUhS', internal304:0x8ba, internal305:'hcmw', internal306:0xbb7, internal307:'zKc8', internal308:0x6bf, internal309:'KdGw', internal310:0xf3a, internal311:'mg$O', internal312:'H)ax', internal313:']&Q[', internal314:0x967, internal315:'1i)F', internal316:0x73f, internal317:0x9c6, internal318:'lf4T', internal319:0x783, internal320:0x1045, internal321:'H)ax', internal322:0x390, internal323:0xbff, internal324:'AKA6', internal325:0xbf1, internal326:'iBSK', internal327:0x661, internal328:'Zy0r', internal329:'QDh3', internal330:0xb53, internal331:0x7d3, internal332:0xcdb, internal333:'$B0@', internal334:0xbb9, internal335:'T9j^', internal336:0x68a, internal337:'xhiS', internal338:0x7fc, internal339:0xcdb, internal340:'d9It', internal341:0x793, internal342:'R!qN', internal343:0xdcc, internal344:'V8zc', internal345:'sMXv', internal346:0x729, internal347:'qZZf', internal348:0x756, internal349:'xhiS', internal350:'gFo2', internal351:0x6ca, internal352:'[U[P', internal353:0x72a, internal354:0x927
    }, internal355=  {
      internal356:0x1ae
    }, internal357=  {
      internal358:0x7cd, internal359:0xb0a, internal360:0x660, internal361:'qZZf', internal362:'tgcf', internal363:0x317, internal364:'gFo2', internal365:0x5d1, internal366:'nUhS', internal367:0x57, internal368:0x1df, internal369:0x4e, internal370:0x57c, internal371:'sMXv', internal372:0xa61, internal373:0x147, internal374:'PrC4', internal375:0xaab, internal376:0x922, internal377:'jPiF', internal378:0x4d0, internal379:'r*kS', internal380:0xafb
    }, internal381=  {
      internal382:0x9c8, internal383:'H)ax', internal384:'q*o1', internal385:0x46b, internal386:0x4c, internal387:'iBSK', internal388:0x77e, internal389:'doOP', internal390:0x196, internal391:0x780, internal392:'V8zc', internal393:'ZjT(', internal394:0x3a2, internal395:'1i)F', internal396:0xf8, internal397:0x75, internal398:0x72d, internal399:'CLc4', internal400:0x2c8, internal401:0x7c8, internal402:0x96
    }, internal403=  {
      internal404:0x22f
    }, internal405=  {
      internal406:0xc09, internal407:'xhiS', internal408:0x6a3, internal409:'0!*N', internal410:0x485, internal411:'KdGw', internal412:0x94e, internal413:0x35, internal414:'][r2', internal415:0xc7d, internal416:0x8f7, internal417:'zKc8', internal418:0x8fa, internal419:0x430, internal420:'d9It', internal421:0x858, internal422:'V8zc', internal423:0x39d, internal424:'r*kS', internal425:'H)ax', internal426:0xb90, internal427:'V8zc', internal428:0x79b, internal429:'AKA6', internal430:0x175, internal431:']&Q[', internal432:0xb1c, internal433:0xb45, internal434:0x217, internal435:'mg$O', internal436:0xcf4, internal437:0x5e5, internal438:0xc13, internal439:'mg$O', internal440:0x807, internal441:0x708, internal442:'nUhS', internal443:'tgcf', internal444:'0!*N', internal445:0x8d7, internal446:0x89a, internal447:'jPiF', internal448:0xf3b, internal449:'d9It', internal450:0x4b2, internal451:'sMXv', internal452:'$B0@', internal453:'0yn(', internal454:0xb6a, internal455:0x59b, internal456:'ZjT(', internal457:0xbef, internal458:'H)ax', internal459:0x4de, internal460:0x6b4, internal461:'CLc4', internal462:0x972, internal463:0xbb7, internal464:'Zy0r', internal465:'doOP', internal466:0x451, internal467:'H1kv', internal468:0xbac, internal469:'CLc4', internal470:0x58d, internal471:0x591, internal472:'lf4T', internal473:'mg$O', internal474:0x247, internal475:0x663, internal476:'T9j^', internal477:0x1c7, internal478:'q*o1', internal479:0xa88, internal480:0x7c4, internal481:'qNt2', internal482:0x108e, internal483:'r*kS', internal484:'qZZf', internal485:'gFo2', internal486:0xc16, internal487:0x658, internal488:'!eN1', internal489:0xa4a, internal490:0xc51, internal491:0x47, internal492:0xa1d, internal493:'R!qN', internal494:0x672, internal495:0xc46, internal496:0x7b5, internal497:'r*kS', internal498:0x729, internal499:'!@ro', internal500:'!@ro', internal501:0x2d5, internal502:'*q![', internal503:0x4d7, internal504:'P[cU', internal505:0x221, internal506:0x356, internal507:0x5a6, internal508:0xd96, internal509:'&mdT', internal510:'6YK0', internal511:0x7df, internal512:']&Q[', internal513:0x7ac, internal514:0x398, internal515:0x23, internal516:0xdc9
    }, internal517=  {
      internal518:0x234
    }, internal519=  {
      internal520:'!eN1', internal521:0x10a7, internal522:0xcec, internal523:'zKc8', internal524:0x9be, internal525:']&Q[', internal526:0x677, internal527:0xf4d
    }, internal528=  {
      internal529:0x5d6, internal530:'AKA6', internal531:'QDh3', internal532:'iBSK', internal533:0xa92, internal534:'P[cU', internal535:'gFo2', internal536:0x799
    }, internal537=  {
      internal538:0x492
    }, internal539=  {
      internal540:0xe1a, internal541:0xc73, internal542:'ms7r', internal543:0x4be, internal544:0x2a5, internal545:'*q![', internal546:'tgcf', internal547:0x8d4, internal548:0x74a, internal549:'r*kS', internal550:'PrC4', internal551:'[U[P', internal552:0x323, internal553:'0!*N', internal554:0x648, internal555:'45yh', internal556:'*q![', internal557:'nUhS', internal558:'1i)F', internal559:0x79a, internal560:0xb90, internal561:0x9cd, internal562:0xb9f, internal563:'!eN1', internal564:0x313, internal565:'H1kv', internal566:0xecd, internal567:0x54e, internal568:'][r2', internal569:0x445, internal570:0x3b0, internal571:'sMXv', internal572:'T9j^', internal573:'T9j^', internal574:0xdb8, internal575:0xbc2, internal576:'d9It', internal577:0x78d, internal578:0x4dc, internal579:'&mdT', internal580:'P[cU', internal581:0x742, internal582:'iBSK', internal583:0xb64, internal584:0xc7c, internal585:'AKA6', internal586:0xb26, internal587:'H)ax', internal588:0x404, internal589:0xe67, internal590:'mg$O', internal591:0x654, internal592:'6YK0', internal593:0x9e4, internal594:0xb80, internal595:'0!*N', internal596:0x21a, internal597:0x4b6, internal598:0x303, internal599:'KdGw', internal600:0x6d8, internal601:'T9j^', internal602:0x752, internal603:0x264, internal604:'Lp77', internal605:0xc0f, internal606:0x532, internal607:0x6dd, internal608:0xccb, internal609:'gFo2', internal610:0x80a, internal611:0x963, internal612:'V8zc', internal613:0x875, internal614:'AKA6', internal615:0x403, internal616:'qZZf', internal617:0x4a9, internal618:0x760, internal619:0x4e6, internal620:'gFo2', internal621:0xb56, internal622:0x495, internal623:0x43e, internal624:'!@ro', internal625:0xdc9, internal626:0xc77, internal627:0xa03, internal628:0x5fc, internal629:0x86e, internal630:0x52c, internal631:0x7c7, internal632:0xad7, internal633:'ZjT(', internal634:0x4ad, internal635:'T9j^', internal636:0x3f3, internal637:'Zy0r', internal638:'ms7r', internal639:0x7f3
    }, internal640=  {
      internal641:'PrC4', internal642:'zKc8', internal643:0x18a, internal644:'lf4T', internal645:0x33a, internal646:0xab1, internal647:'Lp77', internal648:'PrC4', internal649:0x9c7, internal650:0x95c, internal651:0x711, internal652:'!eN1', internal653:0x7, internal654:0x584, internal655:'ms7r', internal656:'QDh3', internal657:'r*kS', internal658:0x492, internal659:0x74f
    }, internal660=  {
      internal661:0x4aa
    }, internal662=  {
      internal663:0x87
    }, internal664=  {
      internal665:'KdGw', internal666:0xdaa
    }, internal667=  {
      internal668:'hcmw', internal669:0x713, internal670:'*q![', internal671:'gFo2', internal672:0x668, internal673:0x36b, internal674:'0yn(', internal675:'65r8', internal676:0x3ad, internal677:0x40a, internal678:'PrC4', internal679:0x543, internal680:'ZjT(', internal681:'!)nD', internal682:0x6f3, internal683:'jPiF', internal684:0x6ea, internal685:'tgcf', internal686:'qNt2', internal687:0x79c, internal688:'d9It', internal689:0xa72, internal690:'V8zc', internal691:0x692, internal692:0x285, internal693:'r*kS', internal694:'!eN1', internal695:0xab7, internal696:'1i)F', internal697:0x1bc, internal698:'KdGw', internal699:0xae1, internal700:'Zy0r', internal701:0x982, internal702:'zKc8', internal703:0x6ce, internal704:'AKA6', internal705:0x7da, internal706:'PyOy', internal707:0x7ba, internal708:'T9j^', internal709:0xfa6, internal710:'ms7r', internal711:0x428, internal712:'PyOy', internal713:0x30a, internal714:0x9bd, internal715:0x87, internal716:0xf86
    }, internal717=  {
      internal718:0x119, internal719:'0yn('
    }, internal720=  {
      internal721:0xca, internal722:'d9It', internal723:0x463, internal724:'lf4T', internal725:0x97, internal726:'zKc8', internal727:0x898, internal728:0x2e6, internal729:'PrC4', internal730:0xb8a, internal731:'$B0@', internal732:0x741, internal733:0xa38, internal734:'][r2', internal735:0xa60, internal736:0x1f2, internal737:'0yn(', internal738:0xa3e, internal739:'Zy0r', internal740:0x2dc, internal741:'Lp77', internal742:0xad7, internal743:'H)ax', internal744:0x6, internal745:0x710, internal746:'r*kS', internal747:'0!*N', internal748:0x642, internal749:'doOP', internal750:'nFVG', internal751:0x8d6, internal752:'QDh3', internal753:0x272, internal754:'&mdT', internal755:'6YK0', internal756:'!eN1', internal757:0x671, internal758:'sMXv', internal759:0x63f, internal760:'QDh3', internal761:0x341, internal762:'ms7r', internal763:0x964, internal764:0xa0c, internal765:0x2bd, internal766:'P[cU', internal767:0x788, internal768:'jPiF', internal769:'qZZf', internal770:0x367, internal771:'hcmw', internal772:0x8e, internal773:'nUhS', internal774:0x88c, internal775:'zKc8', internal776:0x54f, internal777:0x39d, internal778:'nUhS', internal779:']&Q[', internal780:0x72e, internal781:'PyOy', internal782:'Zy0r', internal783:0x8ed, internal784:0x176, internal785:0x131, internal786:0x55e, internal787:0x5a6, internal788:'nUhS', internal789:0x69e, internal790:'&mdT', internal791:0x5b, internal792:0x62c, internal793:'iBSK', internal794:0x959, internal795:0x26, internal796:'CLc4', internal797:0xb5e, internal798:'0yn(', internal799:0x2c7, internal800:0x586, internal801:'!)nD', internal802:0x16d, internal803:0x202, internal804:'65r8', internal805:0x10d, internal806:0xb2
    }, internal807=  {
      internal808:'[U[P'
    }, internal809=  {
      internal810:'QDh3', internal811:'0!*N', internal812:'jPiF', internal813:0x347, internal814:0xd10, internal815:'r*kS', internal816:0x3a1, internal817:0x211, internal818:0x2df, internal819:'Zy0r', internal820:0x167, internal821:'gFo2', internal822:0x352, internal823:0xa7b, internal824:0x190, internal825:0xb77, internal826:0x72b, internal827:'V^6D', internal828:'Lp77', internal829:0xc78, internal830:'nUhS', internal831:'$B0@', internal832:0x147
    }, internal833=  {
      internal834:'PrC4', internal835:'Lp77', internal836:0xa9, internal837:'1i)F', internal838:0x480, internal839:'[U[P', internal840:0xe1e, internal841:'QDh3', internal842:0x931, internal843:0xc54, internal844:0x489, internal845:'Zy0r', internal846:0xf68, internal847:0x9e6, internal848:'iBSK', internal849:0x69f, internal850:0x6d9, internal851:'lf4T', internal852:0x964, internal853:'T9j^', internal854:0xd7, internal855:'doOP', internal856:0x97a, internal857:'P[cU', internal858:0x732, internal859:'65r8', internal860:0x284, internal861:0x38d, internal862:0x825, internal863:'ms7r', internal864:'CLc4', internal865:0x94f, internal866:0x303, internal867:0x167, internal868:'1i)F', internal869:0x7e0, internal870:'0yn(', internal871:0xc1e, internal872:0x942, internal873:'AKA6', internal874:0x41a, internal875:0xee6, internal876:0x623, internal877:0x2dd, internal878:'jPiF', internal879:0x354, internal880:'$B0@', internal881:0x226, internal882:0x714, internal883:0xf5d, internal884:0x463, internal885:0x971, internal886:0x641, internal887:'r*kS', internal888:'jPiF', internal889:0xb0e, internal890:0xc38, internal891:0x480, internal892:0x3c, internal893:0xc2a, internal894:'QDh3'
    }, internal895=  {
      internal896:'0yn(', internal897:0x584
    }, internal898=  {
      internal899:'V^6D'
    }, internal900=  {
      internal901:'P[cU', internal902:0x23
    }, internal903=  {
      internal904:0x611, internal905:'qZZf'
    }, internal906=  {
      internal907:'][r2'
    }, internal908=  {
      internal909:'nUhS'
    }, internal910=  {
      internal911:0x839, internal912:0xd19, internal913:'45yh', internal914:'ZjT(', internal915:0xbca, internal916:'[U[P', internal917:']&Q[', internal918:0x9c0, internal919:'H1kv', internal920:'CLc4', internal921:0x8e, internal922:'PyOy', internal923:0x52, internal924:'d9It', internal925:0x286, internal926:'zKc8', internal927:0x213, internal928:0x44b, internal929:'iBSK', internal930:0x787, internal931:0x3c3, internal932:'qNt2', internal933:'T9j^', internal934:'iBSK', internal935:'qZZf', internal936:'zKc8', internal937:0x458, internal938:'0yn(', internal939:'d9It', internal940:0x36a, internal941:'65r8', internal942:0x8b8, internal943:'0!*N', internal944:0x8eb, internal945:'PrC4', internal946:'AKA6', internal947:0x1a4, internal948:'sMXv', internal949:0x26f, internal950:0x1fe, internal951:0x4e3, internal952:0x78f, internal953:'T9j^', internal954:'R!qN', internal955:'45yh', internal956:0x3f5, internal957:'0!*N', internal958:'doOP', internal959:0x707, internal960:'q*o1', internal961:0xdb4, internal962:'qZZf', internal963:'jPiF', internal964:0x4f5, internal965:'ZjT(', internal966:0x4d5, internal967:'V^6D', internal968:0x9d9, internal969:0x1e8, internal970:'$B0@', internal971:0x18c, internal972:0xb5c, internal973:0x45, internal974:0x853, internal975:'6YK0', internal976:0x701, internal977:'xhiS', internal978:0xc14, internal979:'&mdT', internal980:'1i)F', internal981:0x34a, internal982:0x7f2, internal983:0xba0, internal984:0x2a0, internal985:0x92b, internal986:0x977, internal987:0x171, internal988:'0yn(', internal989:0x3af, internal990:0x314, internal991:'V8zc', internal992:'ZjT(', internal993:0x6f1, internal994:0x6be, internal995:0x295, internal996:0xd57, internal997:'gFo2'
    }, internal998=  {
      internal999:0x476
    }, internal1000=  {
      internal1001:'[U[P', internal1002:'ms7r', internal1003:0x354, internal1004:0xec2, internal1005:'!eN1', internal1006:0xb6c, internal1007:'P[cU', internal1008:0x9e5, internal1009:0x564, internal1010:'[U[P', internal1011:'][r2'
    }, internal1012=  {
      internal1013:0xaf
    }, internal1014=  {
      internal1015:0xa1f, internal1016:'[U[P', internal1017:0x99, internal1018:0x520, internal1019:'][r2', internal1020:'PyOy', internal1021:0x8ba, internal1022:'6YK0', internal1023:0x69d, internal1024:'q*o1', internal1025:0x989, internal1026:0x603, internal1027:'sMXv', internal1028:0xaf4, internal1029:'mg$O', internal1030:0x10a, internal1031:0xa7a, internal1032:'zKc8', internal1033:'nFVG', internal1034:0x143, internal1035:'zKc8', internal1036:'d9It', internal1037:'qNt2', internal1038:0x1e2, internal1039:'!@ro', internal1040:0x528
    }, internal1041=  {
      internal1042:'T9j^', internal1043:'Lp77', internal1044:'QDh3', internal1045:0x791, internal1046:0x49f, internal1047:'CLc4', internal1048:'lf4T', internal1049:0x8ff, internal1050:0x210, internal1051:'PrC4', internal1052:0xbf4, internal1053:'ms7r', internal1054:0xbaa, internal1055:'][r2', internal1056:0xa91, internal1057:0x61e, internal1058:'PyOy', internal1059:'QDh3', internal1060:0x7cb, internal1061:0xf7d
    }, internal1062=  {
      internal1063:0x417
    }, internal1064=  {
      'BKIqt':function(internal1065, internal1066)  {
        return internal1065===internal1066;
      }, 'DSepU':"ffmcD", 'PIZGl':"oUXvK", 'oxMzG':"wdgcl", 'ktDXa':"UrvrZ", 'fuhXW':"number", 'YUbUf':function(internal1067, internal1068)  {
        return internal1067!==internal1068;
      }, 'tBFzj':"ECvDh", 'AmRUf':"uIDBJ", 'aZqVV':function(internal1069, internal1070)  {
        return internal1069(internal1070);
      }, 'xkHMA':function(internal1071, internal1072)  {
        return internal1071!==internal1072;
      }, 'rgMQB':"PkEbF", 'bvqCc':"ZabVa", 'ycEpz':function(internal1073, internal1074)  {
        return internal1073>internal1074;
      }, 'CxCyn':function(internal1075, internal1076)  {
        return internal1075+internal1076;
      }, 'CLoZm':"HdyCD", 'KlccQ':function(internal1077, internal1078, internal1079)  {
        return internal1077(internal1078, internal1079);
      }, 'xZpot':function(internal1080, internal1081)  {
        return internal1080/internal1081;
      }, 'EWRDv':function(internal1082, internal1083)  {
        return internal1082 instanceof internal1083;
      }, 'IZYFn':function(internal1084, internal1085)  {
        return internal1084!==internal1085;
      }, 'zTwAe':"AQVby", 'BrDlp':function(internal1086, internal1087)  {
        return internal1086 instanceof internal1087;
      }, 'eSpzE':function(internal1088, internal1089)  {
        return internal1088===internal1089;
      }, 'RvEGV':function(internal1090, internal1091)  {
        return internal1090===internal1091;
      }, 'HQhCN':"boolean", 'OKlQv':function(internal1092, internal1093)  {
        return internal1092(internal1093);
      }, 'UtYxe':"uTISq", 'xRsfs':"qiCnF", 'UdoGV':"string", 'FAMRl':function(internal1094, internal1095)  {
        return internal1094!==internal1095;
      }, 'BSINs':"Rtaxh", 'OvMEi':function(internal1096, internal1097)  {
        return internal1096===internal1097;
      }, 'FyeYx':"JeeLP", 'jeJAM':"xQUnZ", 'TufKL':function(internal1098, internal1099)  {
        return internal1098(internal1099);
      }, 'ZghiV':function(internal1100, internal1101)  {
        return internal1100!==internal1101;
      }, 'xOdXN':function(internal1102, internal1103)  {
        return internal1102!==internal1103;
      }, 'msmmQ':"KdTdO", 'MyTiZ':"JEBXT", 'mwlOi':"SUmLQ", 'VjOWT':"OlArp", 'Torov':"lIXOX", 'RSCyL':function(internal1104, internal1105)  {
        return internal1104===internal1105;
      }, 'nOXlR':"UNngO", 'EklFS':"fPahI", 'kybjg':function(internal1106, internal1107)  {
        return internal1106!==internal1107;
      }, 'lxWWd':"VfXaq", 'IYuHp':"euUUJ", 'aJtEp':"npMNC", 'FibSL':function(internal1108, internal1109)  {
        return internal1108(internal1109);
      }, 'tssjd':"Unknown type in FormulaHelpers.acceptNumber", 'AUZND':function(internal1110, internal1111)  {
        return internal1110 instanceof internal1111;
      }, 'QfVnD':"TRUE", 'bUwqZ':function(internal1112, internal1113)  {
        return internal1112==internal1113;
      }, 'JINWM':function(internal1114, internal1115)  {
        return internal1114<internal1115;
      }, 'SUoRX':function(internal1116, internal1117)  {
        return internal1116!==internal1117;
      }, 'oGfRq':function(internal1118, internal1119, internal1120)  {
        return internal1118(internal1119, internal1120);
      }, 'YqfAK':"DzVWD", 'awxSV':"dJVaY", 'VWYso':function(internal1121, internal1122)  {
        return internal1121&&internal1122;
      }, 'nEnYR':"zOkhv", 'dnErU':function(internal1123, internal1124, internal1125)  {
        return internal1123(internal1124, internal1125);
      }, 'UKNmX':"IOSYC", 'apSze':function(internal1126, internal1127)  {
        return internal1126||internal1127;
      }, 'XlQzS':"dKWiX", 'EiLJT':"FyQAz", 'RrIKh':function(internal1128, internal1129)  {
        return internal1128==internal1129;
      }, 'IAWTc':function(internal1130, internal1131)  {
        return internal1130!==internal1131;
      }, 'PYEcn':"qXEir", 'iOpaE':"Jiqho", 'WHQZp':function(internal1132, internal1133)  {
        return internal1132===internal1133;
      }, 'WSUHh':function(internal1134, internal1135)  {
        return internal1134==internal1135;
      }, 'YCbAQ':function(internal1136, internal1137)  {
        return internal1136(internal1137);
      }, 'ZhwDJ':"\\$&", 'hgzVw':"$1.", 'CyPUD':"$1.*", 'AnmPX':function(internal1138, internal1139)  {
        return internal1138===internal1139;
      }, 'qCzAS':"gKeVB", 'zeXRz':"IAHqO", 'srzQG':function(internal1140, internal1141)  {
        return internal1140==internal1141;
      }, 'EmMDG':function(internal1142, internal1143)  {
        return internal1142!==internal1143;
      }, 'bLxhB':"object", 'eRVwF':function(internal1144, internal1145)  {
        return internal1144!=internal1145;
      }, 'NeKeg':function(internal1146, internal1147)  {
        return internal1146==internal1147;
      }, 'JJuvv':function(internal1148, internal1149)  {
        return internal1148!==internal1149;
      }, 'NyvjR':"gtRey", 'hvCsm':function(internal1150, internal1151)  {
        return internal1150 instanceof internal1151;
      }, 'gLaEq':"xJslc", 'bJdgU':"VfpFu", 'uthPm':function(internal1152, internal1153)  {
        return internal1152===internal1153;
      }, 'PemPt':"ntquZ", 'inFFQ':"ghsic", 'uOBMU':function(internal1154, internal1155)  {
        return internal1154===internal1155;
      }, 'CmAyC':function(internal1156, internal1157)  {
        return internal1156===internal1157;
      }, 'zhMkn':"OxEpO", 'pdtZm':function(internal1158, internal1159)  {
        return internal1158===internal1159;
      }, 'bIJuJ':"cgJBf", 'ioiND':function(internal1160, internal1161)  {
        return internal1160===internal1161;
      }, 'iMGJW':"FALSE", 'xOqNZ':function(internal1162, internal1163)  {
        return internal1162===internal1163;
      }, 'hbmIG':"fVnce", 'eFppf':"BMPZn", 'hiQct':"vgTqH", 'jFghy':function(internal1164, internal1165)  {
        return internal1164==internal1165;
      }, 'Ltgry':function(internal1166, internal1167)  {
        return internal1166(internal1167);
      }, 'XZbNu':"Collection: data length should match references length.", 'DpKXa':"OJqJi", 'QkCak':"vyaDM", 'GhcQK':function(internal1168, internal1169)  {
        return internal1168!==internal1169;
      }, 'tEVgE':"PJPNG", 'aHhgf':"qfpYT", 'ZjjOb':"iVueW", 'qoZFp':function(internal1170, internal1171)  {
        return internal1170!==internal1171;
      }, 'JKwtX':"LcduE", 'tRqxU':function(internal1172, internal1173)  {
        return internal1172!==internal1173;
      }, 'rQxys':"FVHGs", 'LIzSo':"thtuF", 'AMUdt':function(internal1174, internal1175)  {
        return internal1174+internal1175;
      }, 'iPlgu':function(internal1176, internal1177)  {
        return internal1176-internal1177;
      }, 'RUTHP':function(internal1178, internal1179)  {
        return internal1178+internal1179;
      }, 'VpAyG':function(internal1180, internal1181)  {
        return internal1180(internal1181);
      }, 'LLyzX':function(internal1182, internal1183)  {
        return internal1182+internal1183;
      }, 'NHDyV':function(internal1184, internal1185)  {
        return internal1184+internal1185;
      }, 'JRBGR':"chevrotain", 'EUnLz':function(internal1186)  {
        return internal1186();
      }, 'ElJsp':"WhiteSpace", 'iaCBV':"String", 'sxfRP':function(internal1187, internal1188)  {
        return internal1187(internal1188);
      }, 'DKmih':"SingleQuotedString", 'GktsZ':"SheetQuoted", 'MfIWr':"Function", 'fZNBm':"FormulaErrorT", 'sWwWG':"RefError", 'grYKC':"Name", 'lmYOJ':function(internal1189, internal1190)  {
        return internal1189(internal1190);
      }, 'xIZRb':"Sheet", 'XJYRD':"Cell", 'KXxhV':function(internal1191, internal1192)  {
        return internal1191(internal1192);
      }, 'wGPiI':"Number", 'xuHNI':function(internal1193, internal1194)  {
        return internal1193(internal1194);
      }, 'uVrZi':"Boolean", 'mAOSk':function(internal1195, internal1196)  {
        return internal1195(internal1196);
      }, 'LzhiV':"Column", 'GyyWp':function(internal1197, internal1198)  {
        return internal1197(internal1198);
      }, 'ZLkZZ':"Comma", 'ChTlX':function(internal1199, internal1200)  {
        return internal1199(internal1200);
      }, 'DMycz':"Colon", 'GqxqQ':"Semicolon", 'pGpnY':function(internal1201, internal1202)  {
        return internal1201(internal1202);
      }, 'hQldy':"OpenParen", 'ycrYM':"CloseParen", 'mgldt':function(internal1203, internal1204)  {
        return internal1203(internal1204);
      }, 'hjtIr':"OpenSquareParen", 'lqjQB':"CloseSquareParen", 'OEheu':"exclamationMark", 'dnyrW':"OpenCurlyParen", 'zpLbD':function(internal1205, internal1206)  {
        return internal1205(internal1206);
      }, 'IYQVj':"CloseCurlyParen", 'mUFmU':function(internal1207, internal1208)  {
        return internal1207(internal1208);
      }, 'YTkSd':"QuoteS", 'ogqDh':"MulOp", 'cfLOo':"PlusOp", 'UsIgD':function(internal1209, internal1210)  {
        return internal1209(internal1210);
      }, 'suMkz':"DivOp", 'tsjQz':"MinOp", 'mZFdh':"ConcatOp", 'aqAnE':function(internal1211, internal1212)  {
        return internal1211(internal1212);
      }, 'ojmho':"ExOp", 'YLblk':function(internal1213, internal1214)  {
        return internal1213(internal1214);
      }, 'cDYQm':"PercentOp", 'WzYqf':"GtOp", 'GdyRh':function(internal1215, internal1216)  {
        return internal1215(internal1216);
      }, 'FjqdP':"EqOp", 'qeUNa':function(internal1217, internal1218)  {
        return internal1217(internal1218);
      }, 'WEbUK':"LtOp", 'SSoTP':"NeqOp", 'JJwxP':function(internal1219, internal1220)  {
        return internal1219(internal1220);
      }, 'iTDhu':"GteOp", 'ecFiM':function(internal1221, internal1222)  {
        return internal1221(internal1222);
      }, 'fNvGJ':"LteOp", 'TXvlx':"pyAAq", 'qHFGc':"GtGtj", 'OmZYq':function(internal1223, internal1224)  {
        return internal1223===internal1224;
      }, 'UVKTC':"GNycc", 'kdUvc':function(internal1225, internal1226)  {
        return internal1225===internal1226;
      }, 'DRASe':function(internal1227, internal1228)  {
        return internal1227<=internal1228;
      }, 'hBkyE':function(internal1229, internal1230)  {
        return internal1229>=internal1230;
      }, 'DhuqI':function(internal1231, internal1232)  {
        return internal1231<=internal1232;
      }, 'LNckK':function(internal1233, internal1234)  {
        return internal1233>=internal1234;
      }, 'Myoec':function(internal1235, internal1236)  {
        return internal1235===internal1236;
      }, 'xIrFr':function(internal1237, internal1238)  {
        return internal1237===internal1238;
      }, 'CAsKl':function(internal1239, internal1240)  {
        return internal1239===internal1240;
      }, 'IbmMj':"3|2|1|4|0", 'gSmOq':"Row number must be integer.", 'DBmAk':function(internal1241, internal1242)  {
        return internal1241!==internal1242;
      }, 'HVetS':"JYgwC", 'EhcSU':"unMmA", 'HJNQx':function(internal1243, internal1244)  {
        return internal1243===internal1244;
      }, 'BsptE':function(internal1245, internal1246)  {
        return internal1245!==internal1246;
      }, 'hAptu':"aXyUS", 'uavFi':"HfxzR", 'NfJGE':function(internal1247, internal1248)  {
        return internal1247===internal1248;
      }, 'Qfshi':function(internal1249, internal1250)  {
        return internal1249===internal1250;
      }, 'sZWvK':function(internal1251, internal1252)  {
        return internal1251(internal1252);
      }, 'NhyjB':function(internal1253, internal1254)  {
        return internal1253!==internal1254;
      }, 'yutKG':"HDnuL", 'MrYWA':function(internal1255, internal1256)  {
        return internal1255===internal1256;
      }, 'VAKVF':function(internal1257, internal1258)  {
        return internal1257!==internal1258;
      }, 'gCvQR':"FrOpp", 'iPVaG':function(internal1259, internal1260)  {
        return internal1259===internal1260;
      }, 'Wgiaq':function(internal1261, internal1262)  {
        return internal1261===internal1262;
      }, 'OyNBd':"gZToc", 'IqtYa':function(internal1263, internal1264)  {
        return internal1263!==internal1264;
      }, 'qSBaQ':"sADpw", 'attLG':function(internal1265, internal1266)  {
        return internal1265===internal1266;
      }, 'Qynhx':function(internal1267, internal1268)  {
        return internal1267===internal1268;
      }, 'gnEDk':"emyiC", 'bhYhL':"DOQlW", 'abNnD':function(internal1269, internal1270)  {
        return internal1269!==internal1270;
      }, 'XfcuP':"SuOKn", 'XGhTQ':"fVqes", 'COqfm':function(internal1271, internal1272)  {
        return internal1271%internal1272;
      }, 'XzCze':function(internal1273, internal1274)  {
        return internal1273-internal1274;
      }, 'DzrYY':function(internal1275, internal1276)  {
        return internal1275+internal1276;
      }, 'IqfgG':function(internal1277, internal1278)  {
        return internal1277+internal1278;
      }, 'tyPaM':function(internal1279, internal1280)  {
        return internal1279/internal1280;
      }, 'qKypD':function(internal1281, internal1282)  {
        return internal1281===internal1282;
      }, 'nDdsv':"keOqz", 'qeTuE':"khjmS", 'EuKNL':function(internal1283, internal1284)  {
        return internal1283!==internal1284;
      }, 'kOHzq':"WGpby", 'JfPCy':function(internal1285, internal1286)  {
        return internal1285(internal1286);
      }, 'pqehD':function(internal1287, internal1288)  {
        return internal1287*internal1288;
      }, 'QSsBU':function(internal1289, internal1290)  {
        return internal1289-internal1290;
      }, 'BEeyc':function(internal1291, internal1292)  {
        return internal1291**internal1292;
      }, 'FrOKP':function(internal1293, internal1294)  {
        return internal1293-internal1294;
      }, 'rnpWE':function(internal1295, internal1296)  {
        return internal1295-internal1296;
      }, 'UeURd':function(internal1297, internal1298, internal1299)  {
        return internal1297(internal1298, internal1299);
      }, 'okVOh':function(internal1300, internal1301)  {
        return internal1300===internal1301;
      }, 'oEHdz':"Cannot intersect the whole row or column.", 'UAgBJ':"LYwec", 'Pxjva':"xQGaO", 'PZulD':function(internal1302, internal1303)  {
        return internal1302==internal1303;
      }, 'zMoJd':"bJWPe", 'vvvEZ':"hnnYf", 'puCkJ':function(internal1304, internal1305)  {
        return internal1304===internal1305;
      }, 'SlsHu':"kbBIv", 'lQWwr':function(internal1306, internal1307)  {
        return internal1306===internal1307;
      }, 'JiAiV':"TeiCp", 'TWRXz':function(internal1308, internal1309)  {
        return internal1308-internal1309;
      }, 'vMlCa':function(internal1310, internal1311)  {
        return internal1310-internal1311;
      }, 'WXumV':function(internal1312, internal1313)  {
        return internal1312(internal1313);
      }, 'bynBM':"Address.extend should not reach here.", 'xGQjT':function(internal1314, internal1315)  {
        return internal1314===internal1315;
      }, 'okilK':"oHfbS", 'IzcwV':"TWDuY", 'bEVnk':function(internal1316, internal1317)  {
        return internal1316>internal1317;
      }, 'jFkce':"lZgvY", 'LZswJ':function(internal1318, internal1319)  {
        return internal1318+internal1319;
      }, 'joiNh':function(internal1320, internal1321)  {
        return internal1320+internal1321;
      }, 'fnRXN':function(internal1322)  {
        return internal1322();
      }, 'rREAQ':function(internal1323)  {
        return internal1323();
      }
    }, internal1324=internal1064.fnRXN(require_error), internal1325=internal1064.rREAQ(require_collection), internal1326=  {
    };
    internal1326.NUMBER=0x0, internal1326.ARRAY=0x1, internal1326.BOOLEAN=0x2;
    internal1326.STRING=0x3, internal1326.RANGE_REF=0x4, internal1326.CELL_REF=0x5, internal1326.COLLECTIONS=0x6, internal1326.NUMBER_NO_BOOLEAN=0xa;
    var internal1327=internal1326, internal1328=[1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 0x1b02b9306890000, 0x21c3677c82b40000, 0x2c5077d36b8c40000, 0x3ceea4c2b3e0d80000, 0x57970cd7e2933800000, 0x83629343d3dcd0000000, 0xcd4a0619fb09080000000, 0x14d9849ea37eeb000000000, 0x232f0fcbb3e62c0000000000, 0x3d925ba47ad2ce00000000000, 0x6f99461a1e9e14000000000000, 0xd13f6370f968680000000000000, 0x1956ad0aae33a4000000000000000, 0x32ad5a155c67480000000000000000, 0x688589cc0e950400000000000000000, 0xde1bc4d19efcb0000000000000000000, 0x1e5dcbe8a8bc8c00000000000000000000, 0x44530acb7ba83c000000000000000000000, 0x9e0008f68df5080000000000000000000000, 0x1774015499125f000000000000000000000000, 0x392ac33e351cc80000000000000000000000000, 0x8eeae81b84c7f000000000000000000000000000, 0x16e39f2c6844060000000000000000000000000000, 0x3c1581d491b29000000000000000000000000000000, 0xa179cceb478fe0000000000000000000000000000000, 0x1bc0ef38704cbb00000000000000000000000000000000, 0x4e0ea0cebbd7cc000000000000000000000000000000000, 0xe06a0e525c0c700000000000000000000000000000000000, 0x293378a11ee648000000000000000000000000000000000000, 0x7b9a69e35cb2d80000000000000000000000000000000000000, 0x17a88e4484be3b000000000000000000000000000000000000000, 0x49eebc961ed2780000000000000000000000000000000000000000, 0xeba8f91e823ee000000000000000000000000000000000000000000, 0x2fde529a3274c60000000000000000000000000000000000000000000, 0x9e90719ec722d000000000000000000000000000000000000000000000, 0x217277f77e01580000000000000000000000000000000000000000000000, 0x72f97c62c124a000000000000000000000000000000000000000000000000, 0x192693359a40030000000000000000000000000000000000000000000000000, 0x59996c6ef5840800000000000000000000000000000000000000000000000000, 0x144cc291239fea0000000000000000000000000000000000000000000000000000, 0x4adb0d77335db000000000000000000000000000000000000000000000000000000, 0x118b5727f009f50000000000000000000000000000000000000000000000000000000, 0x42e33c484325f800000000000000000000000000000000000000000000000000000000, 0x103308998043320000000000000000000000000000000000000000000000000000000000, 0x3fc8f1dc69089400000000000000000000000000000000000000000000000000000000000, 0xff23c771a42250000000000000000000000000000000000000000000000000000000000000, 0x40c815a3daacb800000000000000000000000000000000000000000000000000000000000000, 0x10b395943e60870000000000000000000000000000000000000000000000000000000000000000, 0x45f0025cc5343400000000000000000000000000000000000000000000000000000000000000000, 0x1293c0a0a461de0000000000000000000000000000000000000000000000000000000000000000000, 0x501d2eb4c4e60c00000000000000000000000000000000000000000000000000000000000000000000, 0x15e7fac56dd6e80000000000000000000000000000000000000000000000000000000000000000000000, 0x613568cc1769a400000000000000000000000000000000000000000000000000000000000000000000000, 0x1b5705796695b60000000000000000000000000000000000000000000000000000000000000000000000000, 0x7cbd08f9e40b1000000000000000000000000000000000000000000000000000000000000000000000000000, 0x240ea4983beb320000000000000000000000000000000000000000000000000000000000000000000000000000, 0xa904a38998de8000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x322d608cd9620e0000000000000000000000000000000000000000000000000000000000000000000000000000000, 0xf17a60a5d627e000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x499349728740240000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x16b473aa57bccc000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x71864253b6affc0000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x23eb7afc7ccdae000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0xb816d64dff9e200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x3baf677b49e044000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x13958df4743d9600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x680a8222a9872c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x22f387b7a4f36a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0xbe0c31f690eb90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x4154312cc1d0f800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x16b645188f61a60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x7fc144aa26854800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x2d69b3687bb1600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x1051fc798c73bf000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x5edc8b828060c40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x22d4fb39eb2388000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0xced093a7e422f80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x4d8e375ef58d1c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x1d62e2fafb0a7800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0xb3fdae4141a020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x459b1a633c60ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 0x1b30964ec395dc0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000], internal1329=  {
    };
    Object.keys(internal1327).forEach(internal1330=>  {
      internal1329[internal1327[internal1330]]=internal1330;
    });
    var internal1331=class  {
      constructor()  {
         {
          this.Types=internal1327;
          var internal1332=  {
          };
          internal1332.number=internal1327.NUMBER, internal1332.boolean=internal1327.BOOLEAN, internal1332.string=internal1327.STRING, internal1332.object=-1, this.type2Number=internal1332;
        }
      }
      ["checkFunctionResult"](internal1333)  {
         {
          const internal1334=typeof internal1333;
          if(((internal1334) === ("number")))  {
             {
              if(internal1064.aZqVV(isNaN, internal1333))  {
                return internal1324.VALUE;
              }
              else  {
                if(!internal1064.aZqVV(isFinite, internal1333))return internal1324.NUM;
              }
            }
          }
          if(((internal1333) === (void(0)))||((internal1333) === (null)))return internal1324.NULL;
          return internal1333;
        }
      }
      ["flattenDeep"](internal1335)  {
        return internal1335.reduce((internal1336, internal1337)=>Array.isArray(internal1337)?internal1336.concat(this.flattenDeep(internal1337)):internal1336.concat(internal1337), []);
      }
      ["acceptNumber"](internal1338, internal1339=!![], internal1340=!![])  {
         {
          if(((internal1338) instanceof (internal1324)))return internal1338;
          let internal1341;
          if(((typeof internal1338) === ("number")))internal1341=internal1338;
          else  {
            if(((typeof internal1338) === ("boolean")))  {
              if(internal1340)internal1341=internal1064.OKlQv(Number, internal1338);
              else  {
                throw internal1324.VALUE;
              }
            }
            else  {
              if(((typeof internal1338) === ("string")))  {
                 {
                  if(((internal1338.length) === (0)))  {
                    throw internal1324.VALUE;
                  }
                  internal1341=internal1064.TufKL(Number, internal1338);
                  if(((internal1341) !== (internal1341)))  {
                    throw internal1324.VALUE;
                  }
                }
              }
              else  {
                if(Array.isArray(internal1338))  {
                   {
                    if(!internal1339)  {
                       {
                        if(((internal1338[0].length) === (1)))  {
                          internal1341=this.acceptNumber(internal1338[0][0]);
                        }
                        else throw internal1324.VALUE;
                      }
                    }
                    else  {
                      internal1341=this.acceptNumber(internal1338[0][0]);
                    }
                  }
                }
                else  {
                  throw internal1064.FibSL(Error, "Unknown type in FormulaHelpers.acceptNumber");
                }
              }
            }
          }
          return internal1341;
        }
      }
      ["flattenParams"](internal1342, internal1343, internal1344, internal1345, internal1346=null, internal1347=1)  {
        var internal1348=  {
          'ysvPd':function(internal1349, internal1350)  {
            return ((internal1349) === (internal1350));
          }, 'yXivo':"TRUE", 'QRtal':function(internal1351, internal1352)  {
            return ((internal1351) == (internal1352));
          }, 'bJSQn':function(internal1353, internal1354)  {
            return ((internal1353) > (internal1354));
          }, 'ibsdV':function(internal1355, internal1356)  {
            return ((internal1355) < (internal1356));
          }, 'qgVXC':function(internal1357, internal1358)  {
            return ((internal1357) !== (internal1358));
          }, 'SmGIl':function(internal1359, internal1360, internal1361)  {
            return internal1064.KlccQ(internal1359, internal1360, internal1361);
          }, 'axHJU':function(internal1362, internal1363, internal1364)  {
            return internal1064.oGfRq(internal1362, internal1363, internal1364);
          }, 'rYfXx':"DzVWD", 'WORFM':"dJVaY", 'nIcsd':function(internal1365, internal1366)  {
            return ((internal1365) instanceof (internal1366));
          }, 'tEMSP':function(internal1367, internal1368)  {
            return ((internal1367) && (internal1368));
          }, 'jjipL':"zOkhv", 'jkUKv':function(internal1369, internal1370, internal1371)  {
            return internal1064.dnErU(internal1369, internal1370, internal1371);
          }, 'dQFPv':"IOSYC", 'GenCQ':function(internal1372, internal1373)  {
            return ((internal1372) || (internal1373));
          }, 'KjodS':"dKWiX"
        };
         {
          if(((internal1342.length) < (internal1347)))throw internal1324.ARG_MISSING([internal1343]);
          if(((internal1346) == (null)))  {
            internal1346=((internal1343) === (internal1327.NUMBER))?0:((internal1343) == (null))?null:'';
          }
          internal1342.forEach(internal1374=>  {
            var internal1375=  {
              'uzQjl':function(internal1376, internal1377)  {
                return ((internal1376) > (internal1377));
              }, 'niRsS':function(internal1378, internal1379)  {
                return ((internal1378) < (internal1379));
              }, 'pmygY':function(internal1380, internal1381)  {
                return ((internal1380) !== (internal1381));
              }, 'icYfV':function(internal1382, internal1383, internal1384)  {
                return internal1348.SmGIl(internal1382, internal1383, internal1384);
              }, 'TvIWH':function(internal1385, internal1386, internal1387)  {
                return internal1348.axHJU(internal1385, internal1386, internal1387);
              }
            };
             {
              const  {
                isCellRef:internal1388, isRangeRef:internal1389, isArray:internal1390
              }
              =internal1374, internal1391=((internal1374.value) instanceof (internal1325)), internal1392=((!internal1388) && (!internal1389))&&!internal1390&&!internal1391;
              var internal1393=  {
              };
              internal1393.isLiteral=internal1392, internal1393.isCellRef=internal1388, internal1393.isRangeRef=internal1389, internal1393.isArray=internal1390, internal1393.isUnion=internal1391;
              const internal1394=internal1393;
              if(internal1392)  {
                 {
                  if(internal1374.omitted)internal1374=internal1346;
                  else internal1374=this.accept(internal1374, internal1343, internal1346);
                  internal1348.jkUKv(internal1345, internal1374, internal1394);
                }
              }
              else  {
                if(internal1388)internal1348.jkUKv(internal1345, internal1374.value, internal1394);
                else  {
                  if(internal1391)  {
                     {
                      if(!internal1344)throw internal1324.VALUE;
                      internal1374=internal1374.value.data, internal1374=this.flattenDeep(internal1374), internal1374.forEach(internal1395=>  {
                        internal1375.icYfV(internal1345, internal1395, internal1394);
                      });
                    }
                  }
                  else ((internal1389) || (internal1390))&&(internal1374=this.flattenDeep(internal1374.value), internal1374.forEach(internal1396=>  {
                    internal1375.TvIWH(internal1345, internal1396, internal1394);
                  }));
                }
              }
            }
          });
        }
      }
      ["accept"](internal1397, internal1398=null, internal1399, internal1400=!![], internal1401=![])  {
         {
          if(Array.isArray(internal1398))internal1398=internal1398[0];
          if(((internal1397) == (null))&&((internal1399) === (void(0))))throw internal1324.ARG_MISSING([internal1398]);
          else  {
            if(((internal1397) == (null)))return internal1399;
          }
          if(((typeof internal1397) !== ("object"))||Array.isArray(internal1397))return internal1397;
          const internal1402=internal1397.isArray;
          if(((internal1397.value) != (null)))internal1397=internal1397.value;
          if(((internal1398) == (null)))return internal1397;
          if(((internal1397) instanceof (internal1324)))throw internal1397;
          if(((internal1398) === (internal1327.ARRAY)))  {
            if(Array.isArray(internal1397))return internal1400?this.flattenDeep(internal1397):internal1397;
            else  {
              if(((internal1397) instanceof (internal1325)))  {
                throw internal1324.VALUE;
              }
              else  {
                if(internal1401)  {
                  return internal1400?[internal1397]:[[internal1397]];
                }
              }
            }
            throw internal1324.VALUE;
          }
          else  {
            if(((internal1398) === (internal1327.COLLECTIONS)))  {
              return internal1397;
            }
          }
          internal1402&&(internal1397=internal1397[0][0]);
          const internal1403=this.type(internal1397);
          if(((internal1398) === (internal1327.STRING)))  {
             {
              if(((internal1403) === (internal1327.BOOLEAN)))internal1397=internal1397?"TRUE":"FALSE";
              else internal1397=''+internal1397;
            }
          }
          else  {
            if(((internal1398) === (internal1327.BOOLEAN)))  {
               {
                if(((internal1403) === (internal1327.STRING)))throw internal1324.VALUE;
                if(((internal1403) === (internal1327.NUMBER)))internal1397=internal1064.FibSL(Boolean, internal1397);
              }
            }
            else  {
              if(((internal1398) === (internal1327.NUMBER)))  {
                internal1397=this.acceptNumber(internal1397, ![]);
              }
              else  {
                if(((internal1398) === (internal1327.NUMBER_NO_BOOLEAN)))internal1397=this.acceptNumber(internal1397, ![], ![]);
                else throw internal1324.VALUE;
              }
            }
          }
          return internal1397;
        }
      }
      ["type"](internal1404)  {
         {
          let internal1405=this.type2Number[typeof internal1404];
          if(((internal1405) === (-1)))  {
             {
              if(Array.isArray(internal1404))internal1405=internal1327.ARRAY;
              else  {
                if(internal1404.ref)  {
                  internal1404.ref.from?internal1405=internal1327.RANGE_REF:internal1405=internal1327.CELL_REF;
                }
                else  {
                  if(((internal1404) instanceof (internal1325)))internal1405=internal1327.COLLECTIONS;
                }
              }
            }
          }
          return internal1405;
        }
      }
      ["isRangeRef"](internal1406)  {
        return internal1406.ref&&internal1406.ref.from;
      }
      ["isCellRef"](internal1407)  {
        return internal1407.ref&&!internal1407.ref.from;
      }
      ["retrieveRanges"](internal1408, internal1409, internal1410)  {
        internal1410=internal1411.extend(internal1409, internal1410), internal1409=this.retrieveArg(internal1408, internal1409), internal1409=internal1412.accept(internal1409, internal1327.ARRAY, void(0), ![], !![]);
        if(((internal1410) !== (internal1409)))  {
          internal1410=this.retrieveArg(internal1408, internal1410), internal1410=internal1412.accept(internal1410, internal1327.ARRAY, void(0), ![], !![]);
        }
        else internal1410=internal1409;
        return[internal1409, internal1410];
      }
      ["retrieveArg"](internal1413, internal1414)  {
         {
          var internal1415=  {
          };
          internal1415.value=0x0, internal1415.isArray=![], internal1415.omitted=!![];
          if(((internal1414) === (null)))return internal1415;
          const internal1416=internal1413.utils.extractRefValue(internal1414);
          var internal1417=  {
          };
          return internal1417.value=internal1416.val, internal1417.isArray=internal1416.isArray, internal1417.ref=internal1414.ref, internal1417;
        }
      }
    };
    var internal1412=new internal1331(), internal1418=  {
      'isWildCard':internal1419=>  {
         {
          if(((typeof internal1419) === ("string")))return/[*?]/.test(internal1419);
          return![];
        }
      }, 'toRegex':(internal1420, internal1421)=>  {
        return internal1064.oGfRq(RegExp, internal1420.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/([^~]??)[?]/g, "$1.").replace(/([^~]??)[*]/g, "$1.*").replace(/~([?*])/g, '$1'), internal1421);
      }
    }, internal1422=  {
      'parse':internal1423=>  {
         {
          const internal1424=typeof internal1423;
          if(((internal1424) === ("string")))  {
             {
              const internal1425=internal1423.toUpperCase();
              if(((internal1425) === ("TRUE"))||((internal1425) === ("FALSE")))return  {
                'op':'=', 'value':((internal1425) === ("TRUE"))
              };
              const internal1426=internal1423.match(/(<>|>=|<=|>|<|=)(.*)/);
              if(internal1426)  {
                let internal1427=internal1426[1], internal1428;
                if(internal1064.sZWvK(isNaN, internal1426[2]))  {
                   {
                    const internal1429=internal1426[2].toUpperCase();
                    if(((internal1429) === ("TRUE"))||((internal1429) === ("FALSE")))  {
                      internal1428=((internal1429) === ("TRUE"));
                    }
                    else  {
                      if(/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(internal1426[2]))  {
                        internal1428=new internal1324(internal1426[2]);
                      }
                      else  {
                        internal1428=internal1426[2];
                        if(internal1418.isWildCard(internal1428))return  {
                          'op':'wc', 'value':internal1418.toRegex(internal1428), 'match':((internal1427) === ('='))
                        };
                      }
                    }
                  }
                }
                else internal1428=internal1064.qeUNa(Number, internal1426[2]);
                var internal1430=  {
                };
                return internal1430.op=internal1427, internal1430.value=internal1428, internal1430;
              }
              else  {
                if(internal1418.isWildCard(internal1423))return  {
                  'op':'wc', 'value':internal1418.toRegex(internal1423), 'match':!![]
                };
                else  {
                  var internal1431=  {
                  };
                  return internal1431.op='=', internal1431.value=internal1423, internal1431;
                }
              }
            }
          }
          else  {
            if(((internal1424) === ("boolean"))||((internal1424) === ("number"))||(Array.isArray(internal1423)||((internal1423) instanceof (internal1324))))  {
              var internal1432=  {
              };
              return internal1432.op='=', internal1432.value=internal1423, internal1432;
            }
            else  {
              throw internal1064.ChTlX(Error, "Criteria.parse: type "+typeof internal1423+(" not support"));
            }
          }
        }
      }
    }, internal1411=  {
      'columnNumberToName':internal1433=>  {
        let internal1434=internal1433, internal1435='', internal1436=0;
        while(((internal1434) > (0)))  {
          internal1436=((((internal1434) - (1))) % (26)), internal1435=((String.fromCharCode((('A'.charCodeAt(0)) + (internal1436)))) + (internal1435)), internal1434=Math.floor(((((internal1434) - (internal1436))) / (26)));
        }
        return internal1435;
      }, 'columnNameToNumber':internal1437=>  {
         {
          internal1437=internal1437.toUpperCase();
          const internal1438=internal1437.length;
          let internal1439=0;
          for(let internal1440=0;
          ((internal1440) < (internal1438));
          internal1440++)  {
             {
              const internal1441=internal1437.charCodeAt(internal1440);
              !internal1064.JfPCy(isNaN, internal1441)&&(internal1439+=((((internal1441) - (64))) * (((26) ** (((((internal1438) - (internal1440))) - (1)))))));
            }
          }
          return internal1439;
        }
      }, 'extend':(internal1442, internal1443)=>  {
         {
          if(((internal1443) == (null)))  {
            return internal1442;
          }
          let internal1444, internal1445;
          if(internal1412.isCellRef(internal1442))  {
            internal1444=0, internal1445=0;
          }
          else  {
            if(internal1412.isRangeRef(internal1442))  {
              internal1444=((internal1442.ref.to.row) - (internal1442.ref.from.row)), internal1445=((internal1442.ref.to.col) - (internal1442.ref.from.col));
            }
            else throw internal1064.WXumV(Error, "Address.extend should not reach here.");
          }
          if(internal1412.isCellRef(internal1443))  {
             {
              if(((internal1444) > (0))||((internal1445) > (0)))internal1443=  {
                'ref':  {
                  'from':  {
                    'col':internal1443.ref.col, 'row':internal1443.ref.row
                  }, 'to':  {
                    'row':((internal1443.ref.row) + (internal1444)), 'col':((internal1443.ref.col) + (internal1445))
                  }
                }
              };
            }
          }
          else  {
            internal1443.ref.to.row=((internal1443.ref.from.row) + (internal1444)), internal1443.ref.to.col=((internal1443.ref.from.col) + (internal1445));
          }
          return internal1443;
        }
      }
    }, internal1446=  {
    };
    internal1446.FormulaHelpers=internal1412, internal1446.Types=internal1327, internal1446.ReversedTypes=internal1329, internal1446.Factorials=internal1328, internal1446.WildCard=internal1418, internal1446.Criteria=internal1422, internal1446.Address=internal1411, internal93.exports=internal1446;
  }
}), require_error=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/formulas/error.js'(internal1447, internal1448)  {
    var internal1449=  {
      'DinUY':function(internal1450, internal1451)  {
        return internal1450==internal1451;
      }, 'ejYDf':function(internal1452, internal1453)  {
        return internal1452!==internal1453;
      }, 'UzNSK':"BcgVC", 'djKXj':"DdFSi", 'UJGWb':function(internal1454, internal1455)  {
        return internal1454===internal1455;
      }, 'yXiJR':"snnKW", 'IbsIg':"OxGDf", 'faKua':"#ERROR!", 'qzrfG':"qfIMr", 'wFEie':"zttqF", 'bfJJY':function(internal1456, internal1457)  {
        return internal1456 instanceof internal1457;
      }, 'XRJCc':function(internal1458, internal1459)  {
        return internal1458!==internal1459;
      }, 'JEgnS':"REtlK", 'qVeZb':"xBFzU", 'pzyon':"#NAME?", 'cVyaT':function(internal1460, internal1461)  {
        return internal1460===internal1461;
      }, 'YvnEq':"mWVrr", 'vHdyg':"IeUww", 'tpdCB':"#N/A", 'dVwze':function(internal1462, internal1463)  {
        return internal1462!==internal1463;
      }, 'fvpYE':"xcMGR", 'WcbTM':"EKvsR", 'CZoVR':function(internal1464)  {
        return internal1464();
      }, 'mAzim':function(internal1465, internal1466)  {
        return internal1465===internal1466;
      }, 'oMtBN':"TRUE", 'hcntk':"GVpaP", 'qJrzN':"#DIV/0!", 'eQnmq':"#NULL!", 'tVqzJ':"#NUM!", 'FCxBU':"#REF!", 'YNkpm':"#VALUE!"
    }, internal1467=class internal1468 extends Error  {
      constructor(internal1469, internal1470, internal1471)  {
        super(internal1470);
        if(((internal1470) == (null))&&((internal1471) == (null))&&internal1468.errorMap.has(internal1469))return internal1468.errorMap.get(internal1469);
        else  {
          if(((internal1470) == (null))&&((internal1471) == (null)))  {
            this._error=internal1469, internal1468.errorMap.set(internal1469, this);
          }
          else  {
            this._error=internal1469;
          }
        }
        this.details=internal1471;
      }
      get["error"]()  {
        return this._error;
      }
      get["name"]()  {
        return this._error;
      }
      ["equals"](internal1472)  {
        return ((internal1472) instanceof (internal1468))&&((internal1472._error) === (this._error));
      }
      ["toString"]()  {
        return this._error;
      }
    };
    internal1467.errorMap=new Map(), internal1467.DIV0=new internal1467("#DIV/0!"), internal1467.NA=new internal1467("#N/A"), internal1467.NAME=new internal1467("#NAME?"), internal1467.NULL=new internal1467("#NULL!"), internal1467.NUM=new internal1467("#NUM!"), internal1467.REF=new internal1467("#REF!"), internal1467.VALUE=new internal1467("#VALUE!"), internal1467.NOT_IMPLEMENTED=internal1473=>  {
      return new internal1467("#NAME?", "Function "+internal1473+(" is not implemented."));
    }, internal1467.TOO_MANY_ARGS=internal1474=>  {
      return new internal1467("#N/A", "Function "+internal1474+(" has too many arguments."));
    }, internal1467.ARG_MISSING=internal1475=>  {
       {
        const  {
          Types:internal1476
        }
        =internal1449.CZoVR(require_helpers);
        return new internal1467("#N/A", "Argument type "+internal1475.map(internal1477=>internal1476[internal1477]).join(',\x20')+(" is missing."));
      }
    }, internal1467.ERROR=(internal1478, internal1479)=>  {
      return new internal1467("#ERROR!", internal1478, internal1479);
    };
    internal1448.exports=internal1467;
  }
}), require_lexing=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/grammar/lexing.js'(internal1480, internal1481)  {
    var internal1651=  {
      'HlxUL':function(internal1652, internal1653)  {
        return internal1652!==internal1653;
      }, 'mPjnz':"ZpvJl", 'reRit':"XLWGT", 'CSsTJ':function(internal1654, internal1655)  {
        return internal1654>internal1655;
      }, 'trOrw':function(internal1656, internal1657)  {
        return internal1656+internal1657;
      }, 'dEmLG':function(internal1658, internal1659)  {
        return internal1658-internal1659;
      }, 'IzWCE':function(internal1660, internal1661)  {
        return internal1660+internal1661;
      }, 'kIvxO':function(internal1662, internal1663)  {
        return internal1662(internal1663);
      }, 'CrWMI':function(internal1664, internal1665)  {
        return internal1664+internal1665;
      }, 'AfACI':"chevrotain", 'RNudu':function(internal1666)  {
        return internal1666();
      }, 'pQnla':"WhiteSpace", 'SvQtO':function(internal1667, internal1668)  {
        return internal1667(internal1668);
      }, 'gdoLr':"String", 'HFhTq':"SingleQuotedString", 'sybVz':function(internal1669, internal1670)  {
        return internal1669(internal1670);
      }, 'RVEiL':"SheetQuoted", 'jtjlz':function(internal1671, internal1672)  {
        return internal1671(internal1672);
      }, 'kuoEV':"Function", 'bgPtq':"FormulaErrorT", 'woIAt':"RefError", 'vpPVG':function(internal1673, internal1674)  {
        return internal1673(internal1674);
      }, 'xbULH':"Name", 'sQbQd':function(internal1675, internal1676)  {
        return internal1675(internal1676);
      }, 'dMuPG':"Sheet", 'rOnzf':function(internal1677, internal1678)  {
        return internal1677(internal1678);
      }, 'EqFkC':"Cell", 'TvEsY':function(internal1679, internal1680)  {
        return internal1679(internal1680);
      }, 'mjCHa':"Number", 'FutXJ':"Boolean", 'FzFEv':"Column", 'beUNy':function(internal1681, internal1682)  {
        return internal1681(internal1682);
      }, 'MXwNK':"Comma", 'jsbYO':"Colon", 'NEDEC':"Semicolon", 'rcZuM':"OpenParen", 'nxujV':"CloseParen", 'znOSy':"OpenSquareParen", 'obPSf':function(internal1683, internal1684)  {
        return internal1683(internal1684);
      }, 'QTpNo':"CloseSquareParen", 'JOLOz':"exclamationMark", 'lNpdO':function(internal1685, internal1686)  {
        return internal1685(internal1686);
      }, 'PqwYc':"OpenCurlyParen", 'sdrtk':function(internal1687, internal1688)  {
        return internal1687(internal1688);
      }, 'LztGg':"CloseCurlyParen", 'Rphkh':function(internal1689, internal1690)  {
        return internal1689(internal1690);
      }, 'QVthz':"QuoteS", 'XboEI':function(internal1691, internal1692)  {
        return internal1691(internal1692);
      }, 'oMxGO':"MulOp", 'HOtGO':function(internal1693, internal1694)  {
        return internal1693(internal1694);
      }, 'cMrhJ':"PlusOp", 'jlpCv':function(internal1695, internal1696)  {
        return internal1695(internal1696);
      }, 'KFAFB':"DivOp", 'UzZYm':function(internal1697, internal1698)  {
        return internal1697(internal1698);
      }, 'taYOX':"MinOp", 'Zwmmr':function(internal1699, internal1700)  {
        return internal1699(internal1700);
      }, 'pkEUZ':"ConcatOp", 'YFPLf':"ExOp", 'whHyd':"PercentOp", 'eunLA':"GtOp", 'OWHAb':"EqOp", 'lmDlI':"LtOp", 'VVjFw':"NeqOp", 'QdniP':"GteOp", 'pjXni':function(internal1701, internal1702)  {
        return internal1701(internal1702);
      }, 'exeWS':"LteOp"
    }, {
      createToken:internal1703, Lexer:internal1704
    }
    =internal1651.kIvxO(require, "chevrotain"), internal1705=internal1651.RNudu(require_error), internal1706=  {
    }, internal1707=internal1651.kIvxO(internal1703,  {
      'name':"WhiteSpace", 'pattern':/\s+/, 'group':internal1704.SKIPPED
    }), internal1708=internal1651.SvQtO(internal1703,  {
      'name':"String", 'pattern':/"(""|[^"])*"/
    }), internal1709=internal1651.SvQtO(internal1703,  {
      'name':"SingleQuotedString", 'pattern':/'(''|[^'])*'/
    }), internal1710=internal1651.sybVz(internal1703,  {
      'name':"SheetQuoted", 'pattern':/'((?![\\\/\[\]*?:]).)+?'!/
    }), internal1711=internal1651.jtjlz(internal1703,  {
      'name':"Function", 'pattern':/[A-Za-z_]+[A-Za-z_0-9.]*\(/
    }), internal1712=internal1651.sybVz(internal1703,  {
      'name':"FormulaErrorT", 'pattern':/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/
    }), internal1713=internal1651.jtjlz(internal1703,  {
      'name':"RefError", 'pattern':/#REF!/
    }), internal1714=internal1651.vpPVG(internal1703,  {
      'name':"Name", 'pattern':/[a-zA-Z_][a-zA-Z0-9_.?]*/
    }), internal1715=internal1651.sQbQd(internal1703,  {
      'name':"Sheet", 'pattern':/[A-Za-z_.\d\u007F-\uFFFF]+!/
    }), internal1716=internal1651.rOnzf(internal1703,  {
      'name':"Cell", 'pattern':/[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/, 'longer_alt':internal1714
    }), internal1717=internal1651.TvEsY(internal1703,  {
      'name':"Number", 'pattern':/[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/
    }), internal1718=internal1651.jtjlz(internal1703,  {
      'name':"Boolean", 'pattern':/TRUE|FALSE/i
    }), internal1719=internal1651.kIvxO(internal1703,  {
      'name':"Column", 'pattern':/[$]?[A-Za-z]{1,3}/, 'longer_alt':internal1714
    }), internal1720=  {
    };
    internal1720.name='At', internal1720.pattern=/@/;
    var internal1721=internal1651.beUNy(internal1703, internal1720);
    var internal1722=internal1651.beUNy(internal1703,  {
      'name':"Comma", 'pattern':/,/
    }), internal1723=internal1651.sQbQd(internal1703,  {
      'name':"Colon", 'pattern':/:/
    }), internal1724=internal1651.rOnzf(internal1703,  {
      'name':"Semicolon", 'pattern':/;/
    }), internal1725=internal1651.SvQtO(internal1703,  {
      'name':"OpenParen", 'pattern':/\(/
    });
    var internal1726=internal1651.TvEsY(internal1703,  {
      'name':"CloseParen", 'pattern':/\)/
    }), internal1727=internal1651.sybVz(internal1703,  {
      'name':"OpenSquareParen", 'pattern':/\[/
    }), internal1728=internal1651.obPSf(internal1703,  {
      'name':"CloseSquareParen", 'pattern':/]/
    }), internal1729=internal1651.SvQtO(internal1703,  {
      'name':"exclamationMark", 'pattern':/!/
    }), internal1730=internal1651.lNpdO(internal1703,  {
      'name':"OpenCurlyParen", 'pattern':/{/
    }), internal1731=internal1651.sdrtk(internal1703,  {
      'name':"CloseCurlyParen", 'pattern':/}/
    }), internal1732=internal1651.Rphkh(internal1703,  {
      'name':"QuoteS", 'pattern':/'/
    }), internal1733=internal1651.XboEI(internal1703,  {
      'name':"MulOp", 'pattern':/\*/
    }), internal1734=internal1651.HOtGO(internal1703,  {
      'name':"PlusOp", 'pattern':/\+/
    }), internal1735=internal1651.jlpCv(internal1703,  {
      'name':"DivOp", 'pattern':/\//
    }), internal1736=internal1651.UzZYm(internal1703,  {
      'name':"MinOp", 'pattern':/-/
    }), internal1737=internal1651.Zwmmr(internal1703,  {
      'name':"ConcatOp", 'pattern':/&/
    }), internal1738=internal1651.lNpdO(internal1703,  {
      'name':"ExOp", 'pattern':/\^/
    }), internal1739=internal1651.sdrtk(internal1703,  {
      'name':"PercentOp", 'pattern':/%/
    }), internal1740=internal1651.kIvxO(internal1703,  {
      'name':"GtOp", 'pattern':/>/
    }), internal1741=internal1651.Rphkh(internal1703,  {
      'name':"EqOp", 'pattern':/=/
    }), internal1742=internal1651.jtjlz(internal1703,  {
      'name':"LtOp", 'pattern':/</
    }), internal1743=internal1651.obPSf(internal1703,  {
      'name':"NeqOp", 'pattern':/<>/
    }), internal1744=internal1651.kIvxO(internal1703,  {
      'name':"GteOp", 'pattern':/>=/
    }), internal1745=internal1651.pjXni(internal1703,  {
      'name':"LteOp", 'pattern':/<=/
    }), internal1746=[internal1707, internal1708, internal1710, internal1709, internal1711, internal1712, internal1713, internal1715, internal1716, internal1718, internal1719, internal1714, internal1717, internal1721, internal1722, internal1723, internal1724, internal1725, internal1726, internal1727, internal1728, internal1730, internal1731, internal1732, internal1733, internal1734, internal1735, internal1736, internal1737, internal1738, internal1733, internal1739, internal1743, internal1744, internal1745, internal1740, internal1741, internal1742], internal1747=  {
    };
    internal1747.ensureOptimizations=!![];
    var internal1748=new internal1704(internal1746, internal1747);
    internal1746.forEach(internal1749=>  {
      internal1706[internal1749.name]=internal1749;
    }), internal1481.exports=  {
      'tokenVocabulary':internal1706, 'lex':function(internal1750)  {
        const internal1751=internal1748.tokenize(internal1750);
        if(((internal1751.errors.length) > (0)))  {
          const internal1752=internal1751.errors[0], internal1753=internal1752.line, internal1754=internal1752.column;
          let internal1755=(((('\x0a') + (internal1750.split('\x0a')[((internal1753) - (1))]))) + ('\x0a'));
          internal1755+=((internal1651.kIvxO(Array, ((internal1754) - (1))).fill('\x20').join('')) + ('^\x0a')), internal1752.message=((((internal1755) + ("Error at position "+internal1753+':'+internal1754+'\x0a'))) + (internal1752.message));
          var internal1756=  {
          };
          internal1756.line=internal1753, internal1756.column=internal1754, internal1752.errorLocation=internal1756;
          throw internal1705.ERROR(internal1752.message, internal1752);
        }
        return internal1751;
      }
    };
  }
});
var require_parsing=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/grammar/parsing.js'(internal1757, internal1758)  {
    var internal1982=  {
      'Lbhmw':function(internal1983, internal1984)  {
        return internal1983===internal1984;
      }, 'qQFhe':"TRUE", 'SnoTG':"XGXUW", 'GXKhR':"YtQpk", 'ITxjE':"Vfanu", 'kyJpY':function(internal1985, internal1986)  {
        return internal1985!==internal1986;
      }, 'qOYSo':"JHgXR", 'hrURs':function(internal1987, internal1988)  {
        return internal1987===internal1988;
      }, 'EKHYs':"PbEoc", 'lywvO':"NWJCv", 'AzShu':function(internal1989, internal1990)  {
        return internal1989>internal1990;
      }, 'JQamP':function(internal1991, internal1992)  {
        return internal1991>internal1992;
      }, 'CGKnD':function(internal1993, internal1994)  {
        return internal1993+internal1994;
      }, 'DYkex':function(internal1995, internal1996)  {
        return internal1995>internal1996;
      }, 'DxMit':function(internal1997, internal1998)  {
        return internal1997+internal1998;
      }, 'zosLK':function(internal1999, internal2000)  {
        return internal1999+internal2000;
      }, 'KOfer':function(internal2001, internal2002)  {
        return internal2001===internal2002;
      }, 'atabu':function(internal2003, internal2004)  {
        return internal2003==internal2004;
      }, 'yttBw':function(internal2005, internal2006)  {
        return internal2005>internal2006;
      }, 'VvqiP':function(internal2007, internal2008)  {
        return internal2007!==internal2008;
      }, 'jRCfi':"emPue", 'dbxXO':"yBEzR", 'GnYYN':function(internal2009, internal2010)  {
        return internal2009===internal2010;
      }, 'EZddP':"QOzNg", 'blbjL':function(internal2011, internal2012)  {
        return internal2011===internal2012;
      }, 'eqbaZ':"tYyEO", 'jmdqG':"IEZtA", 'QADQF':"PjexC", 'alnFR':"JwjqW", 'GObLk':"TtKPi", 'EfoLH':function(internal2013, internal2014)  {
        return internal2013<internal2014;
      }, 'EyAcl':function(internal2015, internal2016)  {
        return internal2015+internal2016;
      }, 'AEllQ':function(internal2017, internal2018)  {
        return internal2017>internal2018;
      }, 'uCXpi':function(internal2019, internal2020)  {
        return internal2019-internal2020;
      }, 'ZxOoP':function(internal2021, internal2022)  {
        return internal2021(internal2022);
      }, 'ERAny':"nCPVJ", 'FmaCk':"sqMqm", 'VTqbj':function(internal2023, internal2024)  {
        return internal2023>internal2024;
      }, 'KWNMt':"cqFGI", 'zphMb':"XODrM", 'EmOUt':function(internal2025, internal2026)  {
        return internal2025===internal2026;
      }, 'JtGRw':"bIxgh", 'eLPXA':"VHpKC", 'NuIyj':"DDAqw", 'UpORx':"GAvVJ", 'cMzoX':"ZqjSW", 'ekLhF':function(internal2027, internal2028)  {
        return internal2027!==internal2028;
      }, 'dbDYz':"aPZSg", 'acGVm':"WWGtv", 'CPumY':"pqMrJ", 'sKxAb':function(internal2029, internal2030)  {
        return internal2029+internal2030;
      }, 'sCvDT':"DpOOw", 'CnoBC':"GxEBA", 'tkJTl':"aSDiu", 'uVDXL':"formulaWithBinaryOp", 'LGWrZ':"plusMinusOp", 'nZPiy':"formulaWithPercentOp", 'BjlDt':"formulaWithUnaryOp", 'XPDVO':"formulaWithIntersect", 'HlFQM':"formulaWithRange", 'DDFIf':"formula", 'OsUiu':"paren", 'YeTNy':"constantArray", 'QROXU':"constantForArray", 'XKTsN':"constant", 'vGZOm':"functionCall", 'IYopd':"arguments", 'yczRT':"referenceWithoutInfix", 'qwfkl':"referenceItem", 'mJlgq':"prefixName", 'nrWly':function(internal2031)  {
        return internal2031();
      }, 'RVZkX':"chevrotain"
    }, internal2032=internal1982.nrWly(require_lexing), {
      EmbeddedActionsParser:internal2033
    }
    =internal1982.ZxOoP(require, "chevrotain"), internal2034=internal2032.tokenVocabulary, {
      String:internal2035, SheetQuoted:internal2036, ExcelRefFunction:internal2037, ExcelConditionalRefFunction:internal2038, Function:internal2039, FormulaErrorT:internal2040, RefError:internal2041, Cell:internal2042, Sheet:internal2043, Name:internal2044, Number:internal2045, Boolean:internal2046, Column:internal2047, Comma:internal2048, Colon:internal2049, Semicolon:internal2050, OpenParen:internal2051, CloseParen:internal2052, OpenCurlyParen:internal2053, CloseCurlyParen:internal2054, MulOp:internal2055, PlusOp:internal2056, DivOp:internal2057, MinOp:internal2058, ConcatOp:internal2059, ExOp:internal2060, PercentOp:internal2061, NeqOp:internal2062, GteOp:internal2063, LteOp:internal2064, GtOp:internal2065, EqOp:internal2066, LtOp:internal2067
    }
    =internal2032.tokenVocabulary;
    var internal2068=class extends internal2033  {
      constructor(internal2069, internal2070)  {
        var internal2347=  {
        };
        internal2347.outputCst=![], internal2347.maxLookahead=0x1, internal2347.skipValidations=!![], super(internal2034, internal2347), this.utils=internal2070, this.binaryOperatorsPrecedence=[['^'], ['*', '/'], ['+', '-'], ['&'], ['<', '>', '=', '<>', '<=', '>=']];
        const internal2348=this;
        internal2348.RULE("formulaWithBinaryOp", ()=>  {
           {
            const internal2349=[], internal2350=[internal2348.SUBRULE(internal2348.formulaWithPercentOp)];
            return internal2348.MANY(()=>  {
              internal2349.push(internal2348.OR(internal2348.c1||(internal2348.c1=[  {
                'ALT':()=>internal2348.CONSUME(internal2065).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2066).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2067).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2062).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2063).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2064).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2059).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2056).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2058).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2055).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2057).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2060).image
              }]))), internal2350.push(internal2348.SUBRULE2(internal2348.formulaWithPercentOp));
            }), internal2348.ACTION(()=>  {
              for(const internal2351 of this.binaryOperatorsPrecedence)  {
                for(let internal2352=0, internal2353=internal2349.length;
                ((internal2352) < (internal2353));
                internal2352++)  {
                  const internal2354=internal2349[internal2352];
                  if(!internal2351.includes(internal2354))continue;
                  internal2349.splice(internal2352, 1), internal2350.splice(internal2352, 2, this.utils.applyInfix(internal2350[internal2352], internal2354, internal2350[((internal2352) + (1))])), internal2352--, internal2353--;
                }
              }
            }), internal2350[0];
          }
        }), internal2348.RULE("plusMinusOp", ()=>internal2348.OR([  {
          'ALT':()=>internal2348.CONSUME(internal2056).image
        },  {
          'ALT':()=>internal2348.CONSUME(internal2058).image
        }])), internal2348.RULE("formulaWithPercentOp", ()=>  {
          let internal2355=internal2348.SUBRULE(internal2348.formulaWithUnaryOp);
          return internal2348.OPTION(()=>  {
             {
              const internal2356=internal2348.CONSUME(internal2061).image;
              internal2355=internal2348.ACTION(()=>this.utils.applyPostfix(internal2355, internal2356));
            }
          }), internal2355;
        }), internal2348.RULE("formulaWithUnaryOp", ()=>  {
           {
            const internal2357=[];
            internal2348.MANY(()=>  {
              const internal2358=internal2348.OR([  {
                'ALT':()=>internal2348.CONSUME(internal2056).image
              },  {
                'ALT':()=>internal2348.CONSUME(internal2058).image
              }]);
              internal2357.push(internal2358);
            });
            const internal2359=internal2348.SUBRULE(internal2348.formulaWithIntersect);
            if(((internal2357.length) > (0)))return internal2348.ACTION(()=>this.utils.applyPrefix(internal2357, internal2359));
            return internal2359;
          }
        }), internal2348.RULE("formulaWithIntersect", ()=>  {
          let internal2360=internal2348.SUBRULE(internal2348.formulaWithRange);
          const internal2361=[internal2360];
          internal2348.MANY(  {
            'GATE':()=>  {
              const internal2362=internal2348.LA(0);
              const internal2363=internal2348.LA(1);
              return ((internal2363.startOffset) > (((internal2362.endOffset) + (1))));
            }, 'DEF':()=>  {
              internal2361.push(internal2348.SUBRULE3(internal2348.formulaWithRange));
            }
          });
          if(((internal2361.length) > (1)))  {
            return internal2348.ACTION(()=>internal2348.ACTION(()=>this.utils.applyIntersect(internal2361)));
          }
          return internal2360;
        }), internal2348.RULE("formulaWithRange", ()=>  {
          const internal2364=internal2348.SUBRULE(internal2348.formula);
          const internal2365=[internal2364];
          internal2348.MANY(()=>  {
            internal2348.CONSUME(internal2049), internal2365.push(internal2348.SUBRULE2(internal2348.formula));
          });
          if(((internal2365.length) > (1)))return internal2348.ACTION(()=>internal2348.ACTION(()=>this.utils.applyRange(internal2365)));
          return internal2364;
        }), internal2348.RULE("formula", ()=>internal2348.OR9([  {
          'ALT':()=>internal2348.SUBRULE(internal2348.referenceWithoutInfix)
        },  {
          'ALT':()=>internal2348.SUBRULE(internal2348.paren)
        },  {
          'ALT':()=>internal2348.SUBRULE(internal2348.constant)
        },  {
          'ALT':()=>internal2348.SUBRULE(internal2348.functionCall)
        },  {
          'ALT':()=>internal2348.SUBRULE(internal2348.constantArray)
        }])), internal2348.RULE("paren", ()=>  {
          internal2348.CONSUME(internal2051);
          let internal2366;
          const internal2367=[];
          internal2367.push(internal2348.SUBRULE(internal2348.formulaWithBinaryOp)), internal2348.MANY(()=>  {
            internal2348.CONSUME(internal2048), internal2367.push(internal2348.SUBRULE2(internal2348.formulaWithBinaryOp));
          });
          if(((internal2367.length) > (1)))internal2366=internal2348.ACTION(()=>this.utils.applyUnion(internal2367));
          else internal2366=internal2367[0];
          return internal2348.CONSUME(internal2052), internal2366;
        }), internal2348.RULE("constantArray", ()=>  {
          const internal2368=[[]];
          let internal2369=0;
          internal2348.CONSUME(internal2053), internal2368[internal2369].push(internal2348.SUBRULE(internal2348.constantForArray)), internal2348.MANY(()=>  {
            const internal2370=internal2348.OR([  {
              'ALT':()=>internal2348.CONSUME(internal2048).image
            },  {
              'ALT':()=>internal2348.CONSUME(internal2050).image
            }]), internal2371=internal2348.SUBRULE2(internal2348.constantForArray);
            if(((internal2370) === (',')))internal2368[internal2369].push(internal2371);
            else  {
              internal2369++, internal2368[internal2369]=[], internal2368[internal2369].push(internal2371);
            }
          });
          return internal2348.CONSUME(internal2054), internal2348.ACTION(()=>this.utils.toArray(internal2368));
        }), internal2348.RULE("constantForArray", ()=>internal2348.OR([  {
          'ALT':()=>  {
             {
              const internal2372=internal2348.OPTION(()=>internal2348.SUBRULE(internal2348.plusMinusOp)), internal2373=internal2348.CONSUME(internal2045).image, internal2374=internal2348.ACTION(()=>this.utils.toNumber(internal2373));
              if(internal2372)return internal2348.ACTION(()=>this.utils.applyPrefix([internal2372], internal2374));
              return internal2374;
            }
          }
        },  {
          'ALT':()=>  {
            const internal2375=internal2348.CONSUME(internal2035).image;
            return internal2348.ACTION(()=>this.utils.toString(internal2375));
          }
        },  {
          'ALT':()=>  {
            const internal2376=internal2348.CONSUME(internal2046).image;
            return internal2348.ACTION(()=>this.utils.toBoolean(internal2376));
          }
        },  {
          'ALT':()=>  {
             {
              const internal2377=internal2348.CONSUME(internal2040).image;
              return internal2348.ACTION(()=>this.utils.toError(internal2377));
            }
          }
        },  {
          'ALT':()=>  {
            const internal2378=internal2348.CONSUME(internal2041).image;
            return internal2348.ACTION(()=>this.utils.toError(internal2378));
          }
        }])), internal2348.RULE("constant", ()=>internal2348.OR([  {
          'ALT':()=>  {
             {
              const internal2379=internal2348.CONSUME(internal2045).image;
              return internal2348.ACTION(()=>this.utils.toNumber(internal2379));
            }
          }
        },  {
          'ALT':()=>  {
            const internal2380=internal2348.CONSUME(internal2035).image;
            return internal2348.ACTION(()=>this.utils.toString(internal2380));
          }
        },  {
          'ALT':()=>  {
            const internal2381=internal2348.CONSUME(internal2046).image;
            return internal2348.ACTION(()=>this.utils.toBoolean(internal2381));
          }
        },  {
          'ALT':()=>  {
            const internal2382=internal2348.CONSUME(internal2040).image;
            return internal2348.ACTION(()=>this.utils.toError(internal2382));
          }
        }])), internal2348.RULE("functionCall", ()=>  {
          const internal2383=internal2348.CONSUME(internal2039).image.slice(0, -1);
          const internal2384=internal2348.SUBRULE(internal2348.arguments);
          return internal2348.CONSUME(internal2052), internal2348.ACTION(()=>internal2069.callFunction(internal2383, internal2384));
        }), internal2348.RULE("arguments", ()=>  {
          internal2348.MANY2(()=>  {
            internal2348.CONSUME2(internal2048);
          });
          const internal2385=[];
          internal2348.OPTION(()=>  {
            internal2385.push(internal2348.SUBRULE(internal2348.formulaWithBinaryOp)), internal2348.MANY(()=>  {
              internal2348.CONSUME1(internal2048);
              internal2385.push(null), internal2348.OPTION3(()=>  {
                internal2385.pop(), internal2385.push(internal2348.SUBRULE2(internal2348.formulaWithBinaryOp));
              });
            });
          });
          return internal2385;
        });
        internal2348.RULE("referenceWithoutInfix", ()=>internal2348.OR([  {
          'ALT':()=>internal2348.SUBRULE(internal2348.referenceItem)
        },  {
          'ALT':()=>  {
             {
              const internal2386=internal2348.SUBRULE(internal2348.prefixName), internal2387=internal2348.SUBRULE2(internal2348.formulaWithRange);
              return internal2348.ACTION(()=>  {
                 {
                  if(this.utils.isFormulaError(internal2387))return internal2387;
                  internal2387.ref.sheet=internal2386;
                }
              }), internal2387;
            }
          }
        }])), internal2348.RULE("referenceItem", ()=>internal2348.OR([  {
          'ALT':()=>  {
            const internal2388=internal2348.CONSUME(internal2042).image;
            return internal2348.ACTION(()=>this.utils.parseCellAddress(internal2388));
          }
        },  {
          'ALT':()=>  {
            const internal2389=internal2348.CONSUME(internal2044).image;
            return internal2348.ACTION(()=>internal2069.getVariable(internal2389));
          }
        },  {
          'ALT':()=>  {
            const internal2390=internal2348.CONSUME(internal2047).image;
            return internal2348.ACTION(()=>this.utils.parseCol(internal2390));
          }
        },  {
          'ALT':()=>  {
            const internal2391=internal2348.CONSUME(internal2041).image;
            return internal2348.ACTION(()=>this.utils.toError(internal2391));
          }
        }])), internal2348.RULE("prefixName", ()=>internal2348.OR([  {
          'ALT':()=>internal2348.CONSUME(internal2043).image.slice(0, -1)
        },  {
          'ALT':()=>internal2348.CONSUME(internal2036).image.slice(1, -2).replace(/''/g, '\x27')
        }])), this.performSelfAnalysis();
      }
    };
    var internal2392=  {
    };
    internal2392.Parser=internal2068, internal1758.exports=internal2392;
  }
}), require_operators=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/formulas/operators.js'(internal2393, internal2394)  {
    var internal2641=  {
      'CcmLY':function(internal2642, internal2643)  {
        return internal2642(internal2643);
      }, 'GcRqU':"Cannot intersect the whole row or column.", 'VjiCu':function(internal2644, internal2645)  {
        return internal2644===internal2645;
      }, 'gUImT':"PUDTr", 'VQYhl':function(internal2646, internal2647)  {
        return internal2646===internal2647;
      }, 'JTqsN':function(internal2648, internal2649)  {
        return internal2648!==internal2649;
      }, 'Gdmpa':"vdNgg", 'INHVP':"bgcDG", 'AXbZg':function(internal2650, internal2651)  {
        return internal2650>internal2651;
      }, 'EMrze':function(internal2652, internal2653)  {
        return internal2652*internal2653;
      }, 'NQMZN':function(internal2654, internal2655)  {
        return internal2654-internal2655;
      }, 'hPLqb':function(internal2656, internal2657)  {
        return internal2656**internal2657;
      }, 'bLdCS':function(internal2658, internal2659)  {
        return internal2658===internal2659;
      }, 'vTrOE':"string", 'QRMHX':function(internal2660, internal2661)  {
        return internal2660==internal2661;
      }, 'vlkOR':function(internal2662, internal2663)  {
        return internal2662===internal2663;
      }, 'dqzTT':"OGxgS", 'gSeSu':"ApRGE", 'bcBGN':"VYvSq", 'ZRzBa':"Vvpli", 'AIzAO':function(internal2664, internal2665)  {
        return internal2664 instanceof internal2665;
      }, 'HAcoq':"XbhaJ", 'VEpFs':"NRjzV", 'VtAuw':"number", 'PQysO':function(internal2666, internal2667)  {
        return internal2666>internal2667;
      }, 'ontqW':"vpyGE", 'trWBd':"rjhYU", 'BRJBp':"LUCAs", 'ViOtn':function(internal2668, internal2669)  {
        return internal2668!==internal2669;
      }, 'LycSL':"GgeFz", 'uAdEJ':"NNujc", 'TScqb':function(internal2670, internal2671)  {
        return internal2670 instanceof internal2671;
      }, 'yiptR':function(internal2672, internal2673)  {
        return internal2672!==internal2673;
      }, 'KtopC':"TLwHC", 'dvRzr':"aNRXF", 'ViyaS':function(internal2674, internal2675)  {
        return internal2674/internal2675;
      }, 'avuqG':function(internal2676, internal2677)  {
        return internal2676(internal2677);
      }, 'cWWrn':"Collection: data length should match references length.", 'diZMk':function(internal2678, internal2679, internal2680)  {
        return internal2678(internal2679, internal2680);
      }, 'CNpTz':function(internal2681, internal2682)  {
        return internal2681===internal2682;
      }, 'ZsZSn':"etuNl", 'Xynto':function(internal2683, internal2684)  {
        return internal2683==internal2684;
      }, 'Qtpwv':function(internal2685, internal2686)  {
        return internal2685!==internal2686;
      }, 'Nyqyj':"zfQqF", 'GOQyb':function(internal2687, internal2688)  {
        return internal2687!==internal2688;
      }, 'UoBuK':"WrfOx", 'seukJ':function(internal2689, internal2690)  {
        return internal2689<internal2690;
      }, 'CQdnw':function(internal2691, internal2692)  {
        return internal2691<=internal2692;
      }, 'IyXda':function(internal2693, internal2694)  {
        return internal2693>=internal2694;
      }, 'xrqbz':"iJQNQ", 'kbIco':function(internal2695, internal2696)  {
        return internal2695<internal2696;
      }, 'taqna':function(internal2697, internal2698)  {
        return internal2697(internal2698);
      }, 'EIfrx':"Infix.compareOp: Should not reach here.", 'GkJfW':function(internal2699, internal2700)  {
        return internal2699!==internal2700;
      }, 'hBvME':"ZWKfX", 'kAXPd':"CHxjN", 'OzDcY':function(internal2701, internal2702)  {
        return internal2701==internal2702;
      }, 'PlOkB':"CUGTj", 'DBtAU':"DgcZL", 'xqJGr':"boolean", 'tfUzm':"TRUE", 'AjHsC':"FALSE", 'EvwCF':function(internal2703, internal2704)  {
        return internal2703===internal2704;
      }, 'NBOjs':function(internal2705, internal2706)  {
        return internal2705+internal2706;
      }, 'EBIjW':function(internal2707, internal2708)  {
        return internal2707==internal2708;
      }, 'vrTOM':"MQwoV", 'WwFJP':function(internal2709, internal2710)  {
        return internal2709!==internal2710;
      }, 'vlRgi':"ZUFZE", 'GVixQ':function(internal2711, internal2712)  {
        return internal2711===internal2712;
      }, 'QRsmU':"diJlB", 'DQCSK':"PLveN", 'iDoVp':function(internal2713, internal2714)  {
        return internal2713 instanceof internal2714;
      }, 'gbPVX':function(internal2715, internal2716)  {
        return internal2715===internal2716;
      }, 'lBgOY':function(internal2717, internal2718)  {
        return internal2717**internal2718;
      }, 'nWfZQ':"Infix.mathOp: Should not reach here.", 'RnWGo':function(internal2719)  {
        return internal2719();
      }, 'rEObH':function(internal2720)  {
        return internal2720();
      }
    }, internal2721=internal2641.RnWGo(require_error), {
      FormulaHelpers:internal2722
    }
    =internal2641.rEObH(require_helpers);
    var internal2723=  {
      'unaryOp':(internal2724, internal2725, internal2726)=>  {
        let internal2727=1;
        internal2724.forEach(internal2728=>  {
           {
            if(((internal2728) === ('+')))  {
            }
            else  {
              if(((internal2728) === ('-')))internal2727=-internal2727;
              else throw new Error("Unrecognized prefix: "+internal2728);
            }
          }
        });
        ((internal2725) == (null))&&(internal2725=0);
        if(((internal2727) === (1)))  {
          return internal2725;
        }
        try  {
          internal2725=internal2722.acceptNumber(internal2725, internal2726);
        }
        catch(internal2729)  {
           {
            if(((internal2729) instanceof (internal2721)))  {
               {
                if(Array.isArray(internal2725))internal2725=internal2725[0][0];
              }
            }
            else throw internal2729;
          }
        }
        if(((typeof internal2725) === ("number"))&&internal2641.CcmLY(isNaN, internal2725))return internal2721.VALUE;
        return-internal2725;
      }
    }, internal2730=  {
      'percentOp':(internal2731, internal2732, internal2733)=>  {
         {
          try  {
            internal2731=internal2722.acceptNumber(internal2731, internal2733);
          }
          catch(internal2734)  {
             {
              if(((internal2734) instanceof (internal2721)))return internal2734;
              throw internal2734;
            }
          }
          if(((internal2732) === ('%')))  {
            return ((internal2731) / (100));
          }
          throw new Error("Unrecognized postfix: "+internal2732);
        }
      }
    };
    var internal2735=  {
    };
    internal2735.boolean=0x3, internal2735.string=0x2, internal2735.number=0x1;
    var internal2736=internal2735, internal2737=  {
      'compareOp':(internal2738, internal2739, internal2740, internal2741, internal2742)=>  {
         {
          if(((internal2738) == (null)))internal2738=0;
          if(((internal2740) == (null)))internal2740=0;
          if(internal2741)  {
            internal2738=internal2738[0][0];
          }
          if(internal2742)  {
            internal2740=internal2740[0][0];
          }
          const internal2743=typeof internal2738, internal2744=typeof internal2740;
          if(((internal2743) === (internal2744)))switch(internal2739)  {
            case'=':return ((internal2738) === (internal2740));
            case'>':return ((internal2738) > (internal2740));
            case'<':return ((internal2738) < (internal2740));
            case'<>':return ((internal2738) !== (internal2740));
            case'<=':return ((internal2738) <= (internal2740));
            case'>=':return ((internal2738) >= (internal2740));
          }
          else  {
            switch(internal2739)  {
              case'=':return![];
              case'>':return ((internal2736[internal2743]) > (internal2736[internal2744]));
              case'<':return ((internal2736[internal2743]) < (internal2736[internal2744]));
              case'<>':return!![];
              case'<=':return ((internal2736[internal2743]) <= (internal2736[internal2744]));
              case'>=':return ((internal2736[internal2743]) >= (internal2736[internal2744]));
            }
          }
          throw internal2641.taqna(Error, "Infix.compareOp: Should not reach here.");
        }
      }, 'concatOp':(internal2745, internal2746, internal2747, internal2748, internal2749)=>  {
         {
          if(((internal2745) == (null)))internal2745='';
          if(((internal2747) == (null)))internal2747='';
          internal2748&&(internal2745=internal2745[0][0]);
          internal2749&&(internal2747=internal2747[0][0]);
          const internal2750=typeof internal2745, internal2751=typeof internal2747;
          if(((internal2750) === ("boolean")))internal2745=internal2745?"TRUE":"FALSE";
          if(((internal2751) === ("boolean")))internal2747=internal2747?"TRUE":"FALSE";
          return (((('') + (internal2745))) + (internal2747));
        }
      }, 'mathOp':(internal2752, internal2753, internal2754, internal2755, internal2756)=>  {
         {
          if(((internal2752) == (null)))internal2752=0;
          if(((internal2754) == (null)))internal2754=0;
          try  {
            internal2752=internal2722.acceptNumber(internal2752, internal2755), internal2754=internal2722.acceptNumber(internal2754, internal2756);
          }
          catch(internal2757)  {
             {
              if(((internal2757) instanceof (internal2721)))return internal2757;
              throw internal2757;
            }
          }
          switch(internal2753)  {
            case'+':return ((internal2752) + (internal2754));
            case'-':return ((internal2752) - (internal2754));
            case'*':return ((internal2752) * (internal2754));
            case'/':if(((internal2754) === (0)))return internal2721.DIV0;
            return ((internal2752) / (internal2754));
            case'^':return ((internal2752) ** (internal2754));
          }
          throw internal2641.CcmLY(Error, "Infix.mathOp: Should not reach here.");
        }
      }
    }, internal2758=  {
    };
    internal2758.compareOp=['<', '>', '=', '<>', '<=', '>='], internal2758.concatOp=['&'], internal2758.mathOp=['+', '-', '*', '/', '^'];
    var internal2759=  {
    };
    internal2759.Prefix=internal2723, internal2759.Postfix=internal2730, internal2759.Infix=internal2737, internal2759.Operators=internal2758, internal2394.exports=internal2759;
  }
}), require_utils=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js'(internal2760, internal2761)  {
    var internal3128=  {
      'pAZcL':function(internal3129, internal3130)  {
        return internal3129===internal3130;
      }, 'AsfTY':"BAsNJ", 'LcVSW':function(internal3131, internal3132)  {
        return internal3131(internal3132);
      }, 'cPvVQ':"Row number must be integer.", 'OeELU':function(internal3133, internal3134)  {
        return internal3133===internal3134;
      }, 'gYElF':"ztRTT", 'hAxYJ':function(internal3135, internal3136)  {
        return internal3135!==internal3136;
      }, 'VSivZ':"PoDVE", 'nxPul':"NKVcr", 'JpIjF':function(internal3137, internal3138)  {
        return internal3137!==internal3138;
      }, 'aMazM':"HPxdx", 'TiIoe':function(internal3139, internal3140)  {
        return internal3139!==internal3140;
      }, 'tZVTn':"NCwAC", 'QZgPK':function(internal3141, internal3142)  {
        return internal3141(internal3142);
      }, 'TGybU':"sgizG", 'dkXzW':"plEhZ", 'Seubj':"Cannot intersect the whole row or column.", 'YrSFA':function(internal3143, internal3144)  {
        return internal3143>internal3144;
      }, 'BjNit':function(internal3145, internal3146)  {
        return internal3145<internal3146;
      }, 'lXGfu':function(internal3147, internal3148)  {
        return internal3147>internal3148;
      }, 'uTNUl':function(internal3149, internal3150)  {
        return internal3149<internal3150;
      }, 'lFUnd':function(internal3151, internal3152)  {
        return internal3151===internal3152;
      }, 'kUIUS':"RxzLZ", 'sEbDo':"rfxJe", 'Vjoxc':function(internal3153, internal3154)  {
        return internal3153>internal3154;
      }, 'vzfTV':function(internal3155, internal3156)  {
        return internal3155<internal3156;
      }, 'WfcjF':function(internal3157, internal3158)  {
        return internal3157<internal3158;
      }, 'gKQph':function(internal3159, internal3160)  {
        return internal3159!==internal3160;
      }, 'dJqYf':function(internal3161, internal3162)  {
        return internal3161<=internal3162;
      }, 'OWTfy':function(internal3163, internal3164)  {
        return internal3163>=internal3164;
      }, 'lOeUO':function(internal3165, internal3166)  {
        return internal3165===internal3166;
      }, 'dqTql':function(internal3167, internal3168)  {
        return internal3167!=internal3168;
      }, 'JUqaB':function(internal3169, internal3170)  {
        return internal3169==internal3170;
      }, 'yORTW':function(internal3171, internal3172)  {
        return internal3171(internal3172);
      }, 'bnbTd':function(internal3173, internal3174)  {
        return internal3173*internal3174;
      }, 'dlVuh':function(internal3175, internal3176)  {
        return internal3175-internal3176;
      }, 'VUWyG':function(internal3177, internal3178)  {
        return internal3177**internal3178;
      }, 'uFccw':function(internal3179, internal3180)  {
        return internal3179-internal3180;
      }, 'zPgoA':function(internal3181, internal3182)  {
        return internal3181===internal3182;
      }, 'zyZHW':"WYsnF", 'ZjvnL':function(internal3183, internal3184)  {
        return internal3183(internal3184);
      }, 'AESdM':function(internal3185, internal3186)  {
        return internal3185!==internal3186;
      }, 'uQsuW':"ajgQw", 'gAusa':"SjVvW", 'mxjRn':function(internal3187, internal3188)  {
        return internal3187===internal3188;
      }, 'aCFxq':function(internal3189, internal3190)  {
        return internal3189(internal3190);
      }, 'rniWp':function(internal3191, internal3192)  {
        return internal3191===internal3192;
      }, 'uJNUK':function(internal3193, internal3194)  {
        return internal3193===internal3194;
      }, 'BgmfA':function(internal3195, internal3196)  {
        return internal3195===internal3196;
      }, 'EgHIj':"RHoat", 'ExvRw':"GSVHp", 'xKukr':function(internal3197, internal3198)  {
        return internal3197!==internal3198;
      }, 'jzQdB':"XZGmc", 'zfmBS':"zCUwG", 'aNzEy':"HGoEy", 'wYgEl':"number", 'SbImS':"ZHjfU", 'IhFmZ':"LOcuk", 'lXovN':function(internal3199, internal3200)  {
        return internal3199===internal3200;
      }, 'OpIJc':function(internal3201, internal3202)  {
        return internal3201>internal3202;
      }, 'MwnuK':function(internal3203, internal3204)  {
        return internal3203>internal3204;
      }, 'kmEmQ':function(internal3205, internal3206)  {
        return internal3205<internal3206;
      }, 'pcFcs':function(internal3207, internal3208)  {
        return internal3207<internal3208;
      }, 'SwxvR':"ncnQP", 'SmnRy':function(internal3209, internal3210)  {
        return internal3209+internal3210;
      }, 'xahzC':function(internal3211, internal3212)  {
        return internal3211===internal3212;
      }, 'jSkKF':"YKIvx", 'fOUYQ':function(internal3213, internal3214, internal3215)  {
        return internal3213(internal3214, internal3215);
      }, 'XjYWk':function(internal3216, internal3217)  {
        return internal3216!==internal3217;
      }, 'OuDDW':"ERfha", 'GKNiu':"yZgnV", 'TNCkm':function(internal3218, internal3219)  {
        return internal3218!==internal3219;
      }, 'ryxWF':"pBgOY", 'qVUdj':"PPMZf", 'qSdPZ':function(internal3220, internal3221)  {
        return internal3220===internal3221;
      }, 'nLOhU':"dJrCu", 'IIhwg':"TmvLt", 'ChFyS':"ngbpL", 'eADwt':"sszzy", 'HjLsE':function(internal3222, internal3223)  {
        return internal3222===internal3223;
      }, 'BSMoN':"TRUE", 'vclvB':function(internal3224, internal3225)  {
        return internal3224===internal3225;
      }, 'FQiwU':"kfQyY", 'GKDKD':function(internal3226, internal3227)  {
        return internal3226 instanceof internal3227;
      }, 'Ayhke':function(internal3228)  {
        return internal3228();
      }
    }, internal3229=internal3128.Ayhke(require_error), {
      FormulaHelpers:internal3230, Types:internal3231, Address:internal3232
    }
    =internal3128.Ayhke(require_helpers), {
      Prefix:internal3233, Postfix:internal3234, Infix:internal3235, Operators:internal3236
    }
    =internal3128.Ayhke(require_operators), internal3237=internal3128.Ayhke(require_collection), internal3238=1048576, internal3239=16384;
    var internal3240=class  {
      constructor(internal3241)  {
        this.context=internal3241;
      }
      ["columnNameToNumber"](internal3242)  {
        return internal3232.columnNameToNumber(internal3242);
      }
      ["parseCellAddress"](internal3243)  {
         {
          const internal3244=internal3243.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
          return  {
            'ref':  {
              'col':this.columnNameToNumber(internal3244[2]), 'row':+internal3244[4]
            }
          };
        }
      }
      ["parseRow"](internal3245)  {
        const internal3246=+internal3245;
        if(!Number.isInteger(internal3246))throw internal3128.LcVSW(Error, "Row number must be integer.");
        var internal3247=  {
        };
        internal3247.col=void(0);
        internal3247.row=+internal3245;
        var internal3248=  {
        };
        return internal3248.ref=internal3247, internal3248;
      }
      ["parseCol"](internal3249)  {
        return  {
          'ref':  {
            'col':this.columnNameToNumber(internal3249), 'row':void(0)
          }
        };
      }
      ["applyPrefix"](internal3250, internal3251)  {
        return this.extractRefValue(internal3251), 0;
      }
      ["applyPostfix"](internal3252, internal3253)  {
        return this.extractRefValue(internal3252), 0;
      }
      ["applyInfix"](internal3254, internal3255, internal3256)  {
        this.extractRefValue(internal3254);
        return this.extractRefValue(internal3256), 0;
      }
      ["applyIntersect"](internal3257)  {
         {
          if(this.isFormulaError(internal3257[0]))return internal3257[0];
          if(!internal3257[0].ref)throw internal3128.ZjvnL(Error, "Expecting a reference, but got "+internal3257[0]+'.');
          let internal3258, internal3259, internal3260, internal3261, internal3262, internal3263;
          const internal3264=internal3257.shift().ref;
          internal3262=internal3264.sheet;
          if(!internal3264.from)  {
             {
              if(((internal3264.row) === (void(0)))||((internal3264.col) === (void(0))))throw internal3128.aCFxq(Error, "Cannot intersect the whole row or column.");
              internal3258=internal3260=internal3264.row, internal3259=internal3261=internal3264.col;
            }
          }
          else internal3258=Math.max(internal3264.from.row, internal3264.to.row), internal3260=Math.min(internal3264.from.row, internal3264.to.row), internal3259=Math.max(internal3264.from.col, internal3264.to.col), internal3261=Math.min(internal3264.from.col, internal3264.to.col);
          let internal3265;
          internal3257.forEach(internal3266=>  {
             {
              if(this.isFormulaError(internal3266))return internal3266;
              internal3266=internal3266.ref;
              if(!internal3266)throw internal3128.QZgPK(Error, "Expecting a reference, but got "+internal3266+'.');
              if(!internal3266.from)  {
                if(((internal3266.row) === (void(0)))||((internal3266.col) === (void(0))))  {
                  throw internal3128.LcVSW(Error, "Cannot intersect the whole row or column.");
                }
                (((internal3266.row) > (internal3258))||((internal3266.row) < (internal3260))||((internal3266.col) > (internal3259))||((internal3266.col) < (internal3261))||((internal3262) !== (internal3266.sheet)))&&(internal3265=internal3229.NULL), internal3258=internal3260=internal3266.row, internal3259=internal3261=internal3266.col;
              }
              else  {
                 {
                  const internal3267=Math.max(internal3266.from.row, internal3266.to.row), internal3268=Math.min(internal3266.from.row, internal3266.to.row), internal3269=Math.max(internal3266.from.col, internal3266.to.col), internal3270=Math.min(internal3266.from.col, internal3266.to.col);
                  (((internal3268) > (internal3258))||((internal3267) < (internal3260))||((internal3270) > (internal3259))||((internal3269) < (internal3261))||((internal3262) !== (internal3266.sheet)))&&(internal3265=internal3229.NULL), internal3258=Math.min(internal3258, internal3267), internal3260=Math.max(internal3260, internal3268), internal3259=Math.min(internal3259, internal3269), internal3261=Math.max(internal3261, internal3270);
                }
              }
            }
          });
          if(internal3265)return internal3265;
          if(((internal3258) === (internal3260))&&((internal3259) === (internal3261)))  {
            var internal3271=  {
            };
            internal3271.sheet=internal3262, internal3271.row=internal3258, internal3271.col=internal3259;
            var internal3272=  {
            };
            internal3272.ref=internal3271, internal3263=internal3272;
          }
          else  {
             {
              var internal3273=  {
              };
              internal3273.row=internal3260, internal3273.col=internal3261;
              var internal3274=  {
              };
              internal3274.row=internal3258, internal3274.col=internal3259;
              var internal3275=  {
              };
              internal3275.sheet=internal3262, internal3275.from=internal3273, internal3275.to=internal3274;
              var internal3276=  {
              };
              internal3276.ref=internal3275, internal3263=internal3276;
            }
          }
          if(!internal3263.ref.sheet)delete internal3263.ref.sheet;
          return internal3263;
        }
      }
      ["applyUnion"](internal3277)  {
         {
          const internal3278=new internal3237();
          for(let internal3279=0;
          ((internal3279) < (internal3277.length));
          internal3279++)  {
             {
              if(this.isFormulaError(internal3277[internal3279]))return internal3277[internal3279];
              internal3278.add(this.extractRefValue(internal3277[internal3279]).val, internal3277[internal3279]);
            }
          }
          return internal3278;
        }
      }
      ["applyRange"](internal3280)  {
         {
          let internal3281, internal3282=-1, internal3283=-1, internal3284=((internal3238) + (1)), internal3285=((internal3239) + (1));
          internal3280.forEach(internal3286=>  {
            if(this.isFormulaError(internal3286))return internal3286;
            ((typeof internal3286) === ("number"))&&(internal3286=this.parseRow(internal3286));
            internal3286=internal3286.ref;
            if(((internal3286.row) === (void(0))))  {
              internal3284=1, internal3282=internal3238;
            }
            ((internal3286.col) === (void(0)))&&(internal3285=1, internal3283=internal3239);
            if(((internal3286.row) > (internal3282)))internal3282=internal3286.row;
            if(((internal3286.row) < (internal3284)))internal3284=internal3286.row;
            if(((internal3286.col) > (internal3283)))internal3283=internal3286.col;
            if(((internal3286.col) < (internal3285)))internal3285=internal3286.col;
          });
          if(((internal3282) === (internal3284))&&((internal3283) === (internal3285)))  {
             {
              var internal3287=  {
              };
              internal3287.row=internal3282, internal3287.col=internal3283;
              var internal3288=  {
              };
              internal3288.ref=internal3287, internal3281=internal3288;
            }
          }
          else  {
            var internal3289=  {
            };
            internal3289.row=internal3284, internal3289.col=internal3285;
            var internal3290=  {
            };
            internal3290.row=internal3282, internal3290.col=internal3283;
            var internal3291=  {
            };
            internal3291.from=internal3289, internal3291.to=internal3290;
            var internal3292=  {
            };
            internal3292.ref=internal3291, internal3281=internal3292;
          }
          return internal3281;
        }
      }
      ["extractRefValue"](internal3293)  {
         {
          const internal3294=Array.isArray(internal3293);
          if(internal3293.ref)  {
            return  {
              'val':this.context.retrieveRef(internal3293), 'isArray':internal3294
            };
          }
          var internal3295=  {
          };
          return internal3295.val=internal3293, internal3295.isArray=internal3294, internal3295;
        }
      }
      ["toArray"](internal3296)  {
        return internal3296;
      }
      ["toNumber"](internal3297)  {
        return internal3128.aCFxq(Number, internal3297);
      }
      ["toString"](internal3298)  {
        return internal3298.substring(1, ((internal3298.length) - (1))).replace(/""/g, '\x22');
      }
      ["toBoolean"](internal3299)  {
        return (internal3299) === ("TRUE");
      }
      ["toError"](internal3300)  {
        return new internal3229(internal3300.toUpperCase());
      }
      ["isFormulaError"](internal3301)  {
        return ((internal3301) instanceof (internal3229));
      }
    };
    internal2761.exports=internal3240;
  }
});



var require_utils2=__commonJS(  {
  '../work/LesterLyu__fast-formula-parser/grammar/utils.js'(internal3302, internal3303)  {
    var internal3977=  {
      'VJBBx':function(internal3978, internal3979)  {
        return internal3978!==internal3979;
      }, 'XAhKa':"WdQlX", 'LMolT':"IWpJl", 'XzfLV':function(internal3980, internal3981)  {
        return internal3980(internal3981);
      }, 'Qwmuy':"Row number must be integer.", 'OhXxr':function(internal3982, internal3983)  {
        return internal3982!==internal3983;
      }, 'rGwoS':"mCjtc", 'cIOiN':function(internal3984, internal3985)  {
        return internal3984 instanceof internal3985;
      }, 'QBiwk':function(internal3986, internal3987)  {
        return internal3986===internal3987;
      }, 'XHnSS':function(internal3988, internal3989)  {
        return internal3988/internal3989;
      }, 'mPvnu':function(internal3990, internal3991)  {
        return internal3990!==internal3991;
      }, 'sYRjE':"vrpnJ", 'rRjzc':"zoeEP", 'YoqeY':function(internal3992, internal3993)  {
        return internal3992>internal3993;
      }, 'mwXGV':function(internal3994, internal3995)  {
        return internal3994%internal3995;
      }, 'txQum':function(internal3996, internal3997)  {
        return internal3996-internal3997;
      }, 'CsXJJ':function(internal3998, internal3999)  {
        return internal3998+internal3999;
      }, 'vKujY':"GMQKr", 'TZZcD':"pHmAN", 'Gfyyi':function(internal4000, internal4001)  {
        return internal4000===internal4001;
      }, 'VNDGE':"aTkQX", 'icTXp':"swwNA", 'mDcFm':"EyDdj", 'zMghB':function(internal4002, internal4003)  {
        return internal4002===internal4003;
      }, 'cNNDH':function(internal4004, internal4005)  {
        return internal4004===internal4005;
      }, 'lvcAc':"XHHIL", 'bLJbi':function(internal4006, internal4007)  {
        return internal4006===internal4007;
      }, 'deHdz':"HcIHF", 'ovoMP':"JEAuk", 'sazcG':"UDKIC", 'MSNLK':"EluTH", 'MQvnc':"lWlUb", 'IaYkV':function(internal4008, internal4009)  {
        return internal4008 instanceof internal4009;
      }, 'rinJR':function(internal4010, internal4011)  {
        return internal4010!==internal4011;
      }, 'qNrpM':"RGdlH", 'xSDVu':"Praoi", 'SfRWt':"DOjRr", 'dutnV':"zQCFW", 'DuepA':"jxbfX", 'anOVx':"okOpI", 'pqhHr':function(internal4012, internal4013)  {
        return internal4012(internal4013);
      }, 'DKgjI':"jFmhS", 'bkDrL':"Cannot intersect the whole row or column.", 'okxSK':function(internal4014, internal4015)  {
        return internal4014>internal4015;
      }, 'oMTJb':function(internal4016, internal4017)  {
        return internal4016<internal4017;
      }, 'CsKbv':function(internal4018, internal4019)  {
        return internal4018<internal4019;
      }, 'ozDuS':function(internal4020, internal4021)  {
        return internal4020===internal4021;
      }, 'vrbmA':"xxQaR", 'VbFNF':"CjLFw", 'jgISU':function(internal4022, internal4023)  {
        return internal4022>internal4023;
      }, 'wrYyD':"WTdnm", 'LHLXv':"1|7|2|5|6|4|8|3|0", 'FXdZf':function(internal4024, internal4025)  {
        return internal4024>internal4025;
      }, 'DVUhb':function(internal4026, internal4027)  {
        return internal4026>internal4027;
      }, 'VEHjk':function(internal4028, internal4029)  {
        return internal4028===internal4029;
      }, 'YdRVT':"number", 'OOVKc':function(internal4030, internal4031)  {
        return internal4030<internal4031;
      }, 'ocsbQ':function(internal4032, internal4033)  {
        return internal4032 instanceof internal4033;
      }, 'YJHhx':"lTtow", 'NMiOB':"zHYuf", 'EmRcw':function(internal4034, internal4035)  {
        return internal4034(internal4035);
      }, 'JMfCC':function(internal4036, internal4037)  {
        return internal4036===internal4037;
      }, 'ERweS':"huCgQ", 'cZvPB':function(internal4038, internal4039)  {
        return internal4038(internal4039);
      }, 'UIqev':function(internal4040, internal4041)  {
        return internal4040===internal4041;
      }, 'mKhfA':"qzQLx", 'DPOTM':"yAhKC", 'IfrvY':"JDroa", 'NDgdX':"jGXIR", 'smIDv':function(internal4042, internal4043)  {
        return internal4042===internal4043;
      }, 'MPgnj':"RcWFr", 'JjOat':"VKroY", 'Gtubg':function(internal4044, internal4045)  {
        return internal4044>internal4045;
      }, 'buYTj':function(internal4046, internal4047)  {
        return internal4046<internal4047;
      }, 'LFSqz':function(internal4048, internal4049)  {
        return internal4048+internal4049;
      }, 'PObga':function(internal4050, internal4051)  {
        return internal4050===internal4051;
      }, 'OscMw':function(internal4052, internal4053)  {
        return internal4052===internal4053;
      }, 'NYMPn':"xXbSO", 'fyHsX':"mKIpU", 'qBKWB':function(internal4054, internal4055)  {
        return internal4054!==internal4055;
      }, 'Wwvey':"SLiwh", 'KXBXV':function(internal4056, internal4057)  {
        return internal4056(internal4057);
      }, 'ckNbC':"Unknown type in FormulaHelpers.acceptNumber", 'oAQBG':function(internal4058, internal4059)  {
        return internal4058===internal4059;
      }, 'oTkDV':"RtFho", 'lUwuB':function(internal4060, internal4061)  {
        return internal4060(internal4061);
      }, 'AKzwM':function(internal4062, internal4063)  {
        return internal4062-internal4063;
      }, 'djTuc':function(internal4064, internal4065)  {
        return internal4064(internal4065);
      }, 'EZBfq':"QFSmq", 'wouRS':"TRUE", 'uZlBu':function(internal4066, internal4067)  {
        return internal4066-internal4067;
      }, 'NWOUL':function(internal4068, internal4069)  {
        return internal4068-internal4069;
      }, 'LnvVU':function(internal4070, internal4071)  {
        return internal4070+internal4071;
      }, 'LqvCK':function(internal4072, internal4073)  {
        return internal4072+internal4073;
      }, 'LUUXP':function(internal4074, internal4075)  {
        return internal4074===internal4075;
      }, 'QAxxC':"OOObk", 'raBHb':"eSAPC", 'aQiqd':function(internal4076, internal4077)  {
        return internal4076 instanceof internal4077;
      }, 'scBBx':"0|2|4|6|5|1|3", 'mqmZl':function(internal4078, internal4079)  {
        return internal4078 instanceof internal4079;
      }, 'YShjf':function(internal4080, internal4081)  {
        return internal4080===internal4081;
      }, 'AHnDR':"PPAkB", 'YVjsF':"cVZtq", 'sfPPE':function(internal4082, internal4083)  {
        return internal4082+internal4083;
      }, 'MqsED':function(internal4084, internal4085)  {
        return internal4084-internal4085;
      }, 'UmcwP':function(internal4086, internal4087)  {
        return internal4086(internal4087);
      }, 'qEfGV':function(internal4088, internal4089)  {
        return internal4088-internal4089;
      }, 'vlxXy':function(internal4090)  {
        return internal4090();
      }, 'lxaKp':function(internal4091, internal4092)  {
        return internal4091(internal4092);
      }, 'MYrPG':"chevrotain"
    }, internal4093=internal3977.vlxXy(require_error), {
      Address:internal4094
    }
    =internal3977.vlxXy(require_helpers), {
      Prefix:internal4095, Postfix:internal4096, Infix:internal4097, Operators:internal4098
    }
    =internal3977.vlxXy(require_operators);
    var internal4099=internal3977.vlxXy(require_collection);
    var internal4100=1048576, internal4101=16384,  {
      NotAllInputParsedException:internal4102
    }
    =internal3977.lxaKp(require, "chevrotain"), internal4103=class  {
      constructor(internal4104)  {
        this.context=internal4104;
      }
      ["columnNameToNumber"](internal4105)  {
        return internal4094.columnNameToNumber(internal4105);
      }
      ["parseCellAddress"](internal4106)  {
        const internal4107=internal4106.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return  {
          'ref':  {
            'address':internal4107[0], 'col':this.columnNameToNumber(internal4107[2]), 'row':+internal4107[4]
          }
        };
      }
      ["parseRow"](internal4108)  {
         {
          const internal4109=+internal4108;
          if(!Number.isInteger(internal4109))throw internal3977.XzfLV(Error, "Row number must be integer.");
          var internal4110=  {
          };
          internal4110.col=void(0), internal4110.row=+internal4108;
          var internal4111=  {
          };
          return internal4111.ref=internal4110, internal4111;
        }
      }
      ["parseCol"](internal4112)  {
        return  {
          'ref':  {
            'col':this.columnNameToNumber(internal4112), 'row':void(0)
          }
        };
      }
      ["parseColRange"](internal4113, internal4114)  {
        return internal4113=this.columnNameToNumber(internal4113), internal4114=this.columnNameToNumber(internal4114),  {
          'ref':  {
            'from':  {
              'col':Math.min(internal4113, internal4114), 'row':null
            }, 'to':  {
              'col':Math.max(internal4113, internal4114), 'row':null
            }
          }
        };
      }
      ["parseRowRange"](internal4115, internal4116)  {
        return  {
          'ref':  {
            'from':  {
              'col':null, 'row':Math.min(internal4115, internal4116)
            }, 'to':  {
              'col':null, 'row':Math.max(internal4115, internal4116)
            }
          }
        };
      }
      ["_applyPrefix"](internal4117, internal4118, internal4119)  {
        if(this.isFormulaError(internal4118))return internal4118;
        return internal4095.unaryOp(internal4117, internal4118, internal4119);
      }
      async["applyPrefixAsync"](internal4120, internal4121)  {
         {
          const  {
            val:internal4122, isArray:internal4123
          }
          =this.extractRefValue(await internal4121);
          return this._applyPrefix(internal4120, internal4122, internal4123);
        }
      }
      ["applyPrefix"](internal4124, internal4125)  {
        if(this.context.async)return this.applyPrefixAsync(internal4124, internal4125);
        else  {
           {
            const  {
              val:internal4126, isArray:internal4127
            }
            =this.extractRefValue(internal4125);
            return this._applyPrefix(internal4124, internal4126, internal4127);
          }
        }
      }
      ["_applyPostfix"](internal4128, internal4129, internal4130)  {
         {
          if(this.isFormulaError(internal4128))return internal4128;
          return internal4096.percentOp(internal4128, internal4130, internal4129);
        }
      }
      async["applyPostfixAsync"](internal4131, internal4132)  {
         {
          const  {
            val:internal4133, isArray:internal4134
          }
          =this.extractRefValue(await internal4131);
          return this._applyPostfix(internal4133, internal4134, internal4132);
        }
      }
      ["applyPostfix"](internal4135, internal4136)  {
         {
          if(this.context.async)  {
            return this.applyPostfixAsync(internal4135, internal4136);
          }
          else  {
            const  {
              val:internal4137, isArray:internal4138
            }
            =this.extractRefValue(internal4135);
            return this._applyPostfix(internal4137, internal4138, internal4136);
          }
        }
      }
      ["_applyInfix"](internal4139, internal4140, internal4141)  {
         {
          const internal4142=internal4139.val, internal4143=internal4139.isArray, internal4144=internal4141.val, internal4145=internal4141.isArray;
          if(this.isFormulaError(internal4142))return internal4142;
          if(this.isFormulaError(internal4144))return internal4144;
          if(internal4098.compareOp.includes(internal4140))return internal4097.compareOp(internal4142, internal4140, internal4144, internal4143, internal4145);
          else  {
            if(internal4098.concatOp.includes(internal4140))return internal4097.concatOp(internal4142, internal4140, internal4144, internal4143, internal4145);
            else  {
              if(internal4098.mathOp.includes(internal4140))return internal4097.mathOp(internal4142, internal4140, internal4144, internal4143, internal4145);
              else throw new Error("Unrecognized infix: "+internal4140);
            }
          }
        }
      }
      async["applyInfixAsync"](internal4146, internal4147, internal4148)  {
        const internal4149=this.extractRefValue(await internal4146), internal4150=this.extractRefValue(await internal4148);
        return this._applyInfix(internal4149, internal4147, internal4150);
      }
      ["applyInfix"](internal4151, internal4152, internal4153)  {
         {
          if(this.context.async)  {
            return this.applyInfixAsync(internal4151, internal4152, internal4153);
          }
          else  {
             {
              const internal4154=this.extractRefValue(internal4151), internal4155=this.extractRefValue(internal4153);
              return this._applyInfix(internal4154, internal4152, internal4155);
            }
          }
        }
      }
      ["applyIntersect"](internal4156)  {
         {
          if(this.isFormulaError(internal4156[0]))return internal4156[0];
          if(!internal4156[0].ref)throw internal3977.EmRcw(Error, "Expecting a reference, but got "+internal4156[0]+'.');
          let internal4157, internal4158, internal4159, internal4160, internal4161, internal4162;
          const internal4163=internal4156.shift().ref;
          internal4161=internal4163.sheet;
          if(!internal4163.from)  {
            if(((internal4163.row) === (void(0)))||((internal4163.col) === (void(0))))  {
              throw internal3977.cZvPB(Error, "Cannot intersect the whole row or column.");
            }
            internal4157=internal4159=internal4163.row, internal4158=internal4160=internal4163.col;
          }
          else internal4157=Math.max(internal4163.from.row, internal4163.to.row), internal4159=Math.min(internal4163.from.row, internal4163.to.row), internal4158=Math.max(internal4163.from.col, internal4163.to.col), internal4160=Math.min(internal4163.from.col, internal4163.to.col);
          let internal4164;
          internal4156.forEach(internal4165=>  {
             {
              if(this.isFormulaError(internal4165))return internal4165;
              internal4165=internal4165.ref;
              if(!internal4165)throw internal3977.pqhHr(Error, "Expecting a reference, but got "+internal4165+'.');
              if(!internal4165.from)  {
                if(((internal4165.row) === (void(0)))||((internal4165.col) === (void(0))))  {
                  throw internal3977.pqhHr(Error, "Cannot intersect the whole row or column.");
                }
                if(((internal4165.row) > (internal4157))||((internal4165.row) < (internal4159))||((internal4165.col) > (internal4158))||((internal4165.col) < (internal4160))||((internal4161) !== (internal4165.sheet)))  {
                  internal4164=internal4093.NULL;
                }
                internal4157=internal4159=internal4165.row, internal4158=internal4160=internal4165.col;
              }
              else  {
                const internal4166=Math.max(internal4165.from.row, internal4165.to.row), internal4167=Math.min(internal4165.from.row, internal4165.to.row), internal4168=Math.max(internal4165.from.col, internal4165.to.col), internal4169=Math.min(internal4165.from.col, internal4165.to.col);
                if(((internal4167) > (internal4157))||((internal4166) < (internal4159))||((internal4169) > (internal4158))||((internal4168) < (internal4160))||((internal4161) !== (internal4165.sheet)))  {
                  internal4164=internal4093.NULL;
                }
                internal4157=Math.min(internal4157, internal4166), internal4159=Math.max(internal4159, internal4167), internal4158=Math.min(internal4158, internal4168), internal4160=Math.max(internal4160, internal4169);
              }
            }
          });
          if(internal4164)return internal4164;
          if(((internal4157) === (internal4159))&&((internal4158) === (internal4160)))  {
             {
              var internal4170=  {
              };
              internal4170.sheet=internal4161, internal4170.row=internal4157, internal4170.col=internal4158;
              var internal4171=  {
              };
              internal4171.ref=internal4170, internal4162=internal4171;
            }
          }
          else  {
            var internal4172=  {
            };
            internal4172.row=internal4159, internal4172.col=internal4160;
            var internal4173=  {
            };
            internal4173.row=internal4157, internal4173.col=internal4158;
            var internal4174=  {
            };
            internal4174.sheet=internal4161, internal4174.from=internal4172, internal4174.to=internal4173;
            var internal4175=  {
            };
            internal4175.ref=internal4174, internal4162=internal4175;
          }
          if(!internal4162.ref.sheet)delete internal4162.ref.sheet;
          return internal4162;
        }
      }
      ["applyUnion"](internal4176)  {
         {
          const internal4177=new internal4099();
          for(let internal4178=0;
          ((internal4178) < (internal4176.length));
          internal4178++)  {
            if(this.isFormulaError(internal4176[internal4178]))return internal4176[internal4178];
            internal4177.add(this.extractRefValue(internal4176[internal4178]).val, internal4176[internal4178]);
          }
          return internal4177;
        }
      }
      ["applyRange"](internal4179)  {
        let internal4180, internal4181=-1, internal4182=-1, internal4183=((internal4100) + (1)), internal4184=((internal4101) + (1));
        internal4179.forEach(internal4185=>  {
          if(this.isFormulaError(internal4185))return internal4185;
          if(((typeof internal4185) === ("number")))  {
            internal4185=this.parseRow(internal4185);
          }
          internal4185=internal4185.ref;
          ((internal4185.row) === (void(0)))&&(internal4183=1, internal4181=internal4100);
          ((internal4185.col) === (void(0)))&&(internal4184=1, internal4182=internal4101);
          if(((internal4185.row) > (internal4181)))internal4181=internal4185.row;
          if(((internal4185.row) < (internal4183)))internal4183=internal4185.row;
          if(((internal4185.col) > (internal4182)))internal4182=internal4185.col;
          if(((internal4185.col) < (internal4184)))internal4184=internal4185.col;
        });
        if(((internal4181) === (internal4183))&&((internal4182) === (internal4184)))  {
          var internal4186=  {
          };
          internal4186.row=internal4181, internal4186.col=internal4182;
          var internal4187=  {
          };
          internal4187.ref=internal4186, internal4180=internal4187;
        }
        else  {
          var internal4188=  {
          };
          internal4188.row=internal4183, internal4188.col=internal4184;
          var internal4189=  {
          };
          internal4189.row=internal4181, internal4189.col=internal4182;
          var internal4190=  {
          };
          internal4190.from=internal4188, internal4190.to=internal4189;
          var internal4191=  {
          };
          internal4191.ref=internal4190, internal4180=internal4191;
        }
        return internal4180;
      }
      ["extractRefValue"](internal4192)  {
         {
          let internal4193=internal4192, internal4194=![];
          if(Array.isArray(internal4193))internal4194=!![];
          if(internal4192.ref)return  {
            'val':this.context.retrieveRef(internal4192), 'isArray':internal4194
          };
          var internal4195=  {
          };
          return internal4195.val=internal4193, internal4195.isArray=internal4194, internal4195;
        }
      }
      ["toArray"](internal4196)  {
        return internal4196;
      }
      ["toNumber"](internal4197)  {
        return internal3977.lUwuB(Number, internal4197);
      }
      ["toString"](internal4198)  {
        return internal4198.substring(1, ((internal4198.length) - (1))).replace(/""/g, '\x22');
      }
      ["toBoolean"](internal4199)  {
        return (internal4199) === ("TRUE");
      }
      ["toError"](internal4200)  {
        return new internal4093(internal4200.toUpperCase());
      }
      ["isFormulaError"](internal4201)  {
        return ((internal4201) instanceof (internal4093));
      }
      static["formatChevrotainError"](internal4202, internal4203)  {
        var internal4204=  {
        };
        internal4204.HbYQl=internal3977.scBBx;
        var internal4205=internal4204;
        let internal4206, internal4207, internal4208='';
        if(((internal4202) instanceof (internal4102)))  {
          internal4206=internal4202.token.startLine, internal4207=internal4202.token.startColumn;
        }
        else internal4206=internal4202.previousToken.startLine, internal4207=((internal4202.previousToken.startColumn) + (1));
        internal4208+=(((('\x0a') + (internal4203.split('\x0a')[((internal4206) - (1))]))) + ('\x0a')), internal4208+=((internal3977.UmcwP(Array, ((internal4207) - (1))).fill('\x20').join('')) + ('^\x0a')), internal4208+=(("Error at position "+internal4206+':'+internal4207+'\x0a') + (internal4202.message));
        var internal4209=  {
        };
        internal4209.line=internal4206;
        return internal4209.column=internal4207, internal4202.errorLocation=internal4209, internal4093.ERROR(internal4208, internal4202);
      }
    };
    internal3303.exports=internal4103;
  }
}), FormulaError=require_error(),  {
  FormulaHelpers
}
=require_helpers(),  {
  Parser
}
=require_parsing(), lexer=require_lexing(), Utils=require_utils(),  {
  formatChevrotainError
}
=require_utils2(), DepParser=class  {
  constructor(internal4210)  {
    var internal4211=  {
    };
    internal4211.mGXBB="6|0|1|4|2|5|3";
    var internal4212=internal4211, internal4213=internal4212.mGXBB.split('|'), internal4214=0;
    while(!![])  {
      switch(internal4213[internal4214++])  {
        case'0':this.utils=new Utils(this);
        continue;
        case'1':var internal4215=  {
        };
        internal4215.onVariable=()=>null, internal4210=Object.assign(internal4215, internal4210);
        continue;
        case'2':this.onVariable=internal4210.onVariable;
        continue;
        case'3':this.parser=new Parser(this, this.utils);
        continue;
        case'4':this.utils=new Utils(this);
        continue;
        case'5':this.functions=  {
        };
        continue;
        case'6':this.data=[];
        continue;
      }
      break;
    }
  }
  ["getCell"](internal4216)  {
    var internal4286=  {
    };
    internal4286.SgtSl=function(internal4287, internal4288)  {
      return internal4287%internal4288;
    }, internal4286.SIAOx=function(internal4289, internal4290)  {
      return internal4289-internal4290;
    }, internal4286.kKXPp=function(internal4291, internal4292)  {
      return internal4291+internal4292;
    }, internal4286.jcggd=function(internal4293, internal4294)  {
      return internal4293/internal4294;
    }, internal4286.lDHFc=function(internal4295, internal4296)  {
      return internal4295-internal4296;
    }, internal4286.KQzZj=function(internal4297, internal4298)  {
      return internal4297<=internal4298;
    }, internal4286.qfigA=function(internal4299, internal4300)  {
      return internal4299>=internal4300;
    }, internal4286.TDWOP=function(internal4301, internal4302)  {
      return internal4301<=internal4302;
    }, internal4286.NAPke=function(internal4303, internal4304)  {
      return internal4303===internal4304;
    };
    internal4286.hhUWi=function(internal4305, internal4306)  {
      return internal4305===internal4306;
    }, internal4286.KfqkL=function(internal4307, internal4308)  {
      return internal4307!=internal4308;
    }, internal4286.DSdKq=function(internal4309, internal4310)  {
      return internal4309===internal4310;
    }, internal4286.pCiyX="EIrjJ", internal4286.IlOWm="QOVqU", internal4286.Tkzmt=function(internal4311, internal4312)  {
      return internal4311==internal4312;
    }, internal4286.vbUYI=function(internal4313, internal4314)  {
      return internal4313===internal4314;
    };
    var internal4315=internal4286;
    if(internal4315.KfqkL(internal4216.row, null))  {
      if(internal4315.DSdKq(internal4315.pCiyX, internal4315.IlOWm))internal4316=BjJlNR.SgtSl(BjJlNR.SIAOx(internal4317, 1), 26), internal4318=BjJlNR.kKXPp(internal4319.fromCharCode(BjJlNR.kKXPp('A'.charCodeAt(0), internal4320)), internal4321), internal4322=internal4323.floor(BjJlNR.jcggd(BjJlNR.lDHFc(internal4324, internal4325), 26));
      else  {
        if(internal4315.Tkzmt(internal4216.sheet, null))internal4216.sheet=this.position?this.position.sheet:void(0);
        const internal4326=this.data.findIndex(internal4327=>  {
          return internal4327.from&&internal4315.KQzZj(internal4327.from.row, internal4216.row)&&internal4315.qfigA(internal4327.to.row, internal4216.row)&&internal4315.TDWOP(internal4327.from.col, internal4216.col)&&internal4315.qfigA(internal4327.to.col, internal4216.col)||internal4315.NAPke(internal4327.row, internal4216.row)&&internal4315.hhUWi(internal4327.col, internal4216.col)&&internal4315.NAPke(internal4327.sheet, internal4216.sheet);
        });
        if(internal4315.vbUYI(internal4326, -1))this.data.push(internal4216);
      }
    }
    return 0;
  }
  ["getRange"](internal4328)  {
    var internal4383=  {
    };
    internal4383.nGcYi=function(internal4384, internal4385)  {
      return internal4384!==internal4385;
    }, internal4383.OPkzg="HQIGY";
    internal4383.aofVs="YpSZn", internal4383.Gwyft=function(internal4386, internal4387)  {
      return internal4386===internal4387;
    }, internal4383.vXcYF=function(internal4388, internal4389)  {
      return internal4388===internal4389;
    };
    internal4383.bawom=function(internal4390, internal4391)  {
      return internal4390===internal4391;
    }, internal4383.lauNQ=function(internal4392, internal4393)  {
      return internal4392===internal4393;
    }, internal4383.ivGar=function(internal4394, internal4395)  {
      return internal4394!=internal4395;
    }, internal4383.VpsaF=function(internal4396, internal4397)  {
      return internal4396==internal4397;
    }, internal4383.SoUif=function(internal4398, internal4399)  {
      return internal4398===internal4399;
    };
    var internal4400=internal4383;
    if(internal4400.ivGar(internal4328.from.row, null))  {
      if(internal4400.VpsaF(internal4328.sheet, null))internal4328.sheet=this.position?this.position.sheet:void(0);
      const internal4401=this.data.findIndex(internal4402=>  {
        return internal4400.nGcYi(internal4400.OPkzg, internal4400.aofVs)?internal4402.from&&internal4400.Gwyft(internal4402.from.row, internal4328.from.row)&&internal4400.vXcYF(internal4402.from.col, internal4328.from.col)&&internal4400.bawom(internal4402.to.row, internal4328.to.row)&&internal4400.lauNQ(internal4402.to.col, internal4328.to.col):internal4403;
      });
      if(internal4400.SoUif(internal4401, -1))this.data.push(internal4328);
    }
    return[[0]];
  }
  ["getVariable"](internal4404)  {
    var internal4417=  {
    };
    internal4417.aaStJ=function(internal4418, internal4419)  {
      return internal4418==internal4419;
    };
    var internal4420=internal4417;
    const internal4421=  {
      'ref':this.onVariable(internal4404, this.position.sheet)
    };
    if(internal4420.aaStJ(internal4421.ref, null))return FormulaError.NAME;
    if(FormulaHelpers.isCellRef(internal4421))this.getCell(internal4421.ref);
    else this.getRange(internal4421.ref);
    return 0;
  }
  ["retrieveRef"](internal4422)  {
    var internal4441=  {
    };
    internal4441.OehyC=function(internal4442, internal4443)  {
      return internal4442===internal4443;
    };
    internal4441.wzixX="fmJhM";
    var internal4444=internal4441;
    if(FormulaHelpers.isRangeRef(internal4422))return internal4444.OehyC(internal4444.wzixX, internal4444.wzixX)?this.getRange(internal4422.ref):this.getRange(internal4445.ref);
    if(FormulaHelpers.isCellRef(internal4422))return this.getCell(internal4422.ref);
    return internal4422;
  }
  ["callFunction"](internal4446, internal4447)  {
    var internal4467=  {
    };
    internal4467.XIYzw=function(internal4468, internal4469)  {
      return internal4468===internal4469;
    }, internal4467.kAdCX="JhWAq", internal4467.wjDFo="tcrlD", internal4467.ufZcK=function(internal4470, internal4471)  {
      return internal4470==internal4471;
    };
    var internal4472=internal4467;
    internal4447.forEach(internal4473=>  {
      if(internal4472.XIYzw(internal4472.kAdCX, internal4472.wjDFo))  {
        const internal4474=internal4475.CONSUME(internal4476).image;
        return internal4477.ACTION(()=>this.utils.toError(internal4474));
      }
      else  {
        if(internal4472.ufZcK(internal4473, null))return;
        this.retrieveRef(internal4473);
      }
    });
    var internal4478=  {
    };
    return internal4478.value=0x0, internal4478.ref=  {
    }, internal4478;
  }
  ["checkFormulaResult"](internal4479)  {
    this.retrieveRef(internal4479);
  }
  ["parse"](internal4480, internal4481, internal4482=![])  {
    var internal4529=  {
      'UbACX':function(internal4530, internal4531)  {
        return internal4530(internal4531);
      }, 'ZHLEP':function(internal4532, internal4533)  {
        return internal4532===internal4533;
      }, 'PHUdY':"Input must not be empty.", 'cPjTO':"mjVUI", 'biAar':"boZOV", 'tYHDU':function(internal4534, internal4535)  {
        return internal4534===internal4535;
      }, 'vOAMf':"KpeeC", 'AGVct':"oeNeG", 'EUdJR':function(internal4536, internal4537)  {
        return internal4536!==internal4537;
      }, 'GKRkg':"mpzEa", 'FFGmu':function(internal4538, internal4539)  {
        return internal4538>internal4539;
      }, 'VIOAG':"gDmkS", 'mBdkk':"Acpim", 'mVlqj':function(internal4540, internal4541, internal4542)  {
        return internal4540(internal4541, internal4542);
      }
    };
    if(((internal4480.length) === (0)))throw internal4529.UbACX(Error, "Input must not be empty.");
    this.data=[];
    this.position=internal4481;
    const internal4543=lexer.lex(internal4480);
    this.parser.input=internal4543.tokens;
    try  {
       {
        const internal4544=this.parser.formulaWithBinaryOp();
        this.checkFormulaResult(internal4544);
      }
    }
    catch(internal4545)  {
       {
        if(!internal4482)  {
          throw FormulaError.ERROR(internal4545.message, internal4545);
        }
      }
    }
    if(((this.parser.errors.length) > (0))&&!internal4482)  {
       {
        const internal4546=this.parser.errors[0];
        throw internal4529.mVlqj(formatChevrotainError, internal4546, internal4480);
      }
    }
    return this.data;
  }
}, internal4547=  {
};
internal4547.DepParser=DepParser;
module.exports = { DepParser };
