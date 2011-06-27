/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/string/BidiEngine",["dojo/_base/kernel","dojo/_base/declare"],function(_1){
_1.getObject("string",true,dojox);
_1.declare("dojox.string.BidiEngine",null,{bidiTransform:function(_2,_3,_4){
if(!_2){
return "";
}
if(!_3&&!_4){
return _2;
}
var _5=/^[(I|V)][(L|R|C|D)][(Y|N)][(S|N)][N]$/;
if(!_5.test(_3)||!_5.test(_4)){
throw new Error("dojox.string.BidiEngine: the bidi layout string is wrong!");
}
if(_3==_4){
return _2;
}
var _6=_7(_3.charAt(1)),_8=_7(_4.charAt(1)),_9=(_3.charAt(0)=="I")?"L":_3.charAt(0),_a=(_4.charAt(0)=="I")?"L":_4.charAt(0),_b=_9+_6,_c=_a+_8,_d=_3.charAt(2)+_4.charAt(2);
if(_b){
_e.defInFormat=_b;
}
if(_c){
_e.defOutFormat=_c;
}
if(_d){
_e.defSwap=_d;
}
var _f=_10(_2,_9+_6,_a+_8,_3.charAt(2)+_4.charAt(2)),_11=false;
if(_4.charAt(1)=="R"){
_11=true;
}else{
if(_4.charAt(1)=="C"||_4.charAt(1)=="D"){
_11=this.checkContextual(_f);
}
}
if(_3.charAt(3)==_4.charAt(3)){
return _f;
}else{
if(_4.charAt(3)=="S"){
return _12(_11,_f,true);
}
}
if(_4.charAt(3)=="N"){
return _13(_f,_11,true);
}
},checkContextual:function(_14){
var dir=_15(_14);
if(dir!="ltr"&&dir!="rtl"){
dir=document.dir.toLowerCase();
if(dir!="ltr"&&dir!="rtl"){
dir="ltr";
}
}
return dir;
},hasBidiChar:function(_16){
var _17=null,uc=null,hi=null;
for(var i=0;i<_16.length;i++){
uc=_16.charAt(i).charCodeAt(0);
hi=_18[uc>>8];
_17=hi<_19?hi:_1a[hi-_19][uc&255];
if(_17==_1b||_17==_1c){
return true;
}
if(_17==_1d){
break;
}
}
return false;
}});
function _10(_1e,_1f,_20,_21){
if(_1f==undefined){
_1f=_e.defInFormat;
}
if(_20==undefined){
_20=_e.defOutFormat;
}
if(_21==undefined){
_21=_e.defSwap;
}
if(_1f==_20){
return _1e;
}
var dir,_22=_1f.substring(0,1),_23=_1f.substring(1,4),_24=_20.substring(0,1),_25=_20.substring(1,4);
if(_23.charAt(0)=="C"){
dir=_15(_1e);
if(dir=="ltr"||dir=="rtl"){
_23=dir.toUpperCase();
}else{
_23=_1f.charAt(2)=="L"?"LTR":"RTL";
}
_1f=_22+_23;
}
if(_25.charAt(0)=="C"){
dir=_15(_1e);
if(dir=="rtl"){
_25="RTL";
}else{
if(dir=="ltr"){
dir=_26(_1e);
_25=dir.toUpperCase();
}else{
_25=_20.charAt(2)=="L"?"LTR":"RTL";
}
}
_20=_24+_25;
}
if(_1f==_20){
return _1e;
}
_e.inFormat=_1f;
_e.outFormat=_20;
_e.swap=_21;
if((_22=="L")&&(_20=="VLTR")){
if(_23=="LTR"){
_e.dir=LTR;
return _27(_1e);
}
if(_23=="RTL"){
_e.dir=RTL;
return _27(_1e);
}
}
if((_22=="V")&&(_24=="V")){
return _28(_1e);
}
if((_22=="L")&&(_20=="VRTL")){
if(_23=="LTR"){
_e.dir=LTR;
_1e=_27(_1e);
}else{
_e.dir=RTL;
_1e=_27(_1e);
}
return _28(_1e);
}
if((_1f=="VLTR")&&(_20=="LLTR")){
_e.dir=LTR;
return _27(_1e);
}
if((_22=="V")&&(_24=="L")&&(_23!=_25)){
_1e=_28(_1e);
return (_23=="RTL")?_10(_1e,"LLTR","VLTR",_21):_10(_1e,"LRTL","VRTL",_21);
}
if((_1f=="VRTL")&&(_20=="LRTL")){
return _10(_1e,"LRTL","VRTL",_21);
}
if((_22=="L")&&(_24=="L")){
var _29=_e.swap;
_e.swap=_29.substr(0,1)+"N";
if(_23=="RTL"){
_e.dir=RTL;
_1e=_27(_1e);
_e.swap="N"+_29.substr(1,2);
_e.dir=LTR;
_1e=_27(_1e);
}else{
_e.dir=LTR;
_1e=_27(_1e);
_e.swap="N"+_29.substr(1,2);
_1e=_10(_1e,"VLTR","LRTL",_e.swap);
}
return _1e;
}
};
function _12(rtl,_2a,_2b){
if(_2a.length==0){
return;
}
if(rtl==undefined){
rtl=true;
}
if(_2b==undefined){
_2b=true;
}
_2a=new String(_2a);
var _2c=_2a.split(""),Ix=0,_2d=+1,_2e=_2c.length;
if(!rtl){
Ix=_2c.length-1;
_2d=-1;
_2e=1;
}
var _2f=0,_30=[],_31=0;
for(var _32=Ix;_32*_2d<_2e;_32=_32+_2d){
if(_33(_2c[_32])||_34(_2c[_32])){
if(_2c[_32]=="ل"){
if(_35(_2c,(_32+_2d),_2d,_2e)){
_2c[_32]=(_2f==0)?_36(_2c[_32+_2d],_37):_36(_2c[_32+_2d],_38);
_32+=_2d;
_39(_2c,_32,_2d,_2e);
if(_2b){
_30[_31]=_32;
_31++;
}
_2f=0;
continue;
}
}
var _3a=_2c[_32];
if(_2f==1){
_2c[_32]=(_3b(_2c,(_32+_2d),_2d,_2e))?_3c(_2c[_32]):_3d(_2c[_32],_3e);
}else{
if(_3b(_2c,(_32+_2d),_2d,_2e)==true){
_2c[_32]=_3d(_2c[_32],_3f);
}else{
_2c[_32]=_3d(_2c[_32],_40);
}
}
if(!_34(_3a)){
_2f=1;
}
if(_41(_3a)==true){
_2f=0;
}
}else{
_2f=0;
}
}
var _42="";
for(idx=0;idx<_2c.length;idx++){
if(!(_2b&&_43(_30,_30.length,idx)>-1)){
_42+=_2c[idx];
}
}
return _42;
};
function _15(_44){
var _45=null,uc=null,hi=null;
for(var i=0;i<_44.length;i++){
uc=_44.charAt(i).charCodeAt(0);
hi=_18[uc>>8];
_45=hi<_19?hi:_1a[hi-_19][uc&255];
if(_45==_1b||_45==_1c){
return "rtl";
}
if(_45==_46){
return "ltr";
}
if(_45==_1d){
break;
}
}
return "";
};
function _26(_47){
var _48=null;
for(var i=_47.length-1;i>=0;i--){
_48=_49(_47.charAt(i));
if(_48==_1b||_48==_1c){
return "rtl";
}
if(_48==_46){
return "ltr";
}
if(_48==_1d){
break;
}
}
return "";
};
function _13(_4a,rtl,_4b){
if(_4a.length==0){
return;
}
if(_4b==undefined){
_4b=true;
}
if(rtl==undefined){
rtl=true;
}
_4a=new String(_4a);
var _4c="",_4d=[],_4e="";
if(_4b){
for(var j=0;j<_4a.length;j++){
if(_4a.charAt(j)==" "){
if(rtl){
if(j>0){
if(_4a.charAt(j-1)>="ﻵ"&&_4a.charAt(j-1)<="ﻼ"){
continue;
}
}
}else{
if(j+1<_4a.length){
if(_4a.charAt(j+1)>="ﻵ"&&_4a.charAt(j+1)<="ﻼ"){
continue;
}
}
}
}
_4e+=_4a.charAt(j);
}
}else{
_4e=new String(_4a);
}
_4d=_4e.split("");
for(var i=0;i<_4e.length;i++){
if(_4d[i]>="ﹰ"&&_4d[i]<"﻿"){
var _4f=_4e.charCodeAt(i);
if(_4d[i]>="ﻵ"&&_4d[i]<="ﻼ"){
if(rtl){
_4c+="ل";
_4c+=_50[parseInt((_4f-65269)/2)];
}else{
_4c+=_50[parseInt((_4f-65269)/2)];
_4c+="ل";
}
}else{
_4c+=_51[_4f-65136];
}
}else{
_4c+=_4d[i];
}
}
return _4c;
};
function _27(str){
var _52=str.split(""),_53=[];
_54(_52,_53);
_55(_52,_53);
_56(2,_52,_53);
_56(1,_52,_53);
return _52.join("");
};
function _54(_57,_58){
var len=_57.length,_59=_e.dir?_5a:_5b,_5c=null,_5d=null,_5e=null,_5f=0,_60=null,_61=null,_62=-1,i=null,ix=null,_63=[],_64=[];
_e.hiLevel=_e.dir;
_e.lastArabic=false;
_e.hasUBAT_AL=false,_e.hasUBAT_B=false;
_e.hasUBAT_S=false;
for(i=0;i<len;i++){
_63[i]=_49(_57[i]);
}
for(ix=0;ix<len;ix++){
_5c=_5f;
_64[ix]=_5d=_65(_57,_63,_64,ix);
_5f=_59[_5c][_5d];
_60=_5f&240;
_5f&=15;
_58[ix]=_5e=_59[_5f][_66];
if(_60>0){
if(_60==16){
for(i=_62;i<ix;i++){
_58[i]=1;
}
_62=-1;
}else{
_62=-1;
}
}
_61=_59[_5f][_67];
if(_61){
if(_62==-1){
_62=ix;
}
}else{
if(_62>-1){
for(i=_62;i<ix;i++){
_58[i]=_5e;
}
_62=-1;
}
}
if(_63[ix]==_1d){
_58[ix]=0;
}
_e.hiLevel|=_5e;
}
if(_e.hasUBAT_S){
for(i=0;i<len;i++){
if(_63[i]==_68){
_58[i]=_e.dir;
for(var j=i-1;j>=0;j--){
if(_63[j]==_69){
_58[j]=_e.dir;
}else{
break;
}
}
}
}
}
};
function _55(_6a,_6b){
if(_e.hiLevel==0||_e.swap.substr(0,1)==_e.swap.substr(1,2)){
return;
}
for(var i=0;i<_6a.length;i++){
if(_6b[i]==1){
_6a[i]=_6c(_6a[i]);
}
}
};
function _49(ch){
var uc=ch.charCodeAt(0),hi=_18[uc>>8];
return (hi<_19)?hi:_1a[hi-_19][uc&255];
};
function _28(str){
var _6d=str.split("");
_6d.reverse();
return _6d.join("");
};
function _43(_6e,_6f,idx){
var _70=-1;
for(var i=0;i<_6f;i++){
if(_6e[i]==idx){
return i;
}
}
return -1;
};
function _33(c){
for(var i=0;i<_71.length;i++){
if(c>=_71[i]&&c<=_72[i]){
return true;
}
}
return false;
};
function _3b(_73,_74,_75,_76){
while(((_74)*_75)<_76&&_34(_73[_74])){
_74+=_75;
}
if(((_74)*_75)<_76&&_33(_73[_74])){
return true;
}
return false;
};
function _35(_77,_78,_79,_7a){
while(((_78)*_79)<_7a&&_34(_77[_78])){
_78+=_79;
}
var c=" ";
if(((_78)*_79)<_7a){
c=_77[_78];
}else{
return false;
}
for(var i=0;i<_50.length;i++){
if(_50[i]==c){
return true;
}
}
return false;
};
function _56(lev,_7b,_7c){
if(_e.hiLevel<lev){
return;
}
if(lev==1&&_e.dir==RTL&&!_e.hasUBAT_B){
_7b.reverse();
return;
}
var len=_7b.length,_7d=0,end,lo,hi,tmp;
while(_7d<len){
if(_7c[_7d]>=lev){
end=_7d+1;
while(end<len&&_7c[end]>=lev){
end++;
}
for(lo=_7d,hi=end-1;lo<hi;lo++,hi--){
tmp=_7b[lo];
_7b[lo]=_7b[hi];
_7b[hi]=tmp;
}
_7d=end;
}
_7d++;
}
};
function _65(_7e,_7f,_80,ix){
var _81=_7f[ix],_82,_83,len,i;
switch(_81){
case _46:
case _1b:
_e.lastArabic=false;
case _84:
case _85:
return _81;
case _86:
return _e.lastArabic?_85:_86;
case _1c:
_e.lastArabic=true;
_e.hasUBAT_AL=true;
return _1b;
case _69:
return _84;
case _87:
if(ix<1||(ix+1)>=_7f.length||((_82=_80[ix-1])!=_86&&_82!=_85)||((_83=_7f[ix+1])!=_86&&_83!=_85)){
return _84;
}
if(_e.lastArabic){
_83=_85;
}
return _83==_82?_83:_84;
case _88:
_82=ix>0?_80[ix-1]:_1d;
if(_82==_86&&(ix+1)<_7f.length&&_7f[ix+1]==_86){
return _86;
}
return _84;
case _89:
if(ix>0&&_80[ix-1]==_86){
return _86;
}
if(_e.lastArabic){
return _84;
}
i=ix+1;
len=_7f.length;
while(i<len&&_7f[i]==_89){
i++;
}
if(i<len&&_7f[i]==_86){
return _86;
}
return _84;
case _8a:
if(_e.inFormat=="VLTR"){
len=_7f.length;
i=ix+1;
while(i<len&&_7f[i]==_8a){
i++;
}
if(i<len){
var c=_7e[ix],_8b=(c>=1425&&c<=2303)||c==64286;
_82=_7f[i];
if(_8b&&(_82==_1b||_82==_1c)){
return _1b;
}
}
}
if(ix<1||(_82=_7f[ix-1])==_1d){
return _84;
}
return _80[ix-1];
case _1d:
lastArabic=false;
_e.hasUBAT_B=true;
return _e.dir;
case _68:
_e.hasUBAT_S=true;
return _84;
case _8c:
case _8d:
case _8e:
case _8f:
case _90:
lastArabic=false;
case _91:
return _84;
}
};
function _6c(c){
var mid,low=0,_92=_93.length-1;
while(low<=_92){
mid=Math.floor((low+_92)/2);
if(c<_93[mid][0]){
_92=mid-1;
}else{
if(c>_93[mid][0]){
low=mid+1;
}else{
return _93[mid][1];
}
}
}
return c;
};
function _41(c){
for(var i=0;i<_94.length;i++){
if(_94[i]==c){
return true;
}
}
return false;
};
function _3c(c){
for(var i=0;i<_95.length;i++){
if(c==_95[i]){
return _96[i];
}
}
return c;
};
function _3d(c,_97){
for(var i=0;i<_95.length;i++){
if(c==_95[i]){
return _97[i];
}
}
return c;
};
function _34(c){
return (c>="ً"&&c<="ٕ")?true:false;
};
function _7(oc){
if(oc=="L"){
return "LTR";
}
if(oc=="R"){
return "RTL";
}
if(oc=="C"){
return "CLR";
}
if(oc=="D"){
return "CRL";
}
};
function _39(_98,_99,_9a,_9b){
while(((_99)*_9a)<_9b&&_34(_98[_99])){
_99+=_9a;
}
if(((_99)*_9a)<_9b){
_98[_99]=" ";
return true;
}
return false;
};
function _36(_9c,_9d){
for(var i=0;i<_50.length;i++){
if(_9c==_50[i]){
return _9d[i];
}
}
return _9c;
};
function _9e(_9f){
for(var i=0;i<_50.length;i++){
if(_50[i]==_9f){
return _50[i];
}
}
return 0;
};
var _e={dir:0,defInFormat:"LLTR",defoutFormat:"VLTR",defSwap:"YN",inFormat:"LLTR",outFormat:"VLTR",swap:"YN",hiLevel:0,lastArabic:false,hasUBAT_AL:false,hasBlockSep:false,hasSegSep:false};
var _66=5;
var _67=6;
var LTR=0;
var RTL=1;
var _93=[["(",")"],[")","("],["<",">"],[">","<"],["[","]"],["]","["],["{","}"],["}","{"],["«","»"],["»","«"],["‹","›"],["›","‹"],["⁽","⁾"],["⁾","⁽"],["₍","₎"],["₎","₍"],["≤","≥"],["≥","≤"],["〈","〉"],["〉","〈"],["﹙","﹚"],["﹚","﹙"],["﹛","﹜"],["﹜","﹛"],["﹝","﹞"],["﹞","﹝"],["﹤","﹥"],["﹥","﹤"]];
var _50=["آ","أ","إ","ا"];
var _a0=[65153,65154,65155,65156,65159,65160,65165,65166];
var _a1=[65245,65246,65247,65248];
var _37=["ﻵ","ﻷ","ﻹ","ﻻ"];
var _38=["ﻶ","ﻸ","ﻺ","ﻼ"];
var _95=["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","إ","أ","آ","ة","ى","ی","ئ","ؤ","ً","ٌ","ٍ","َ","ُ","ِ","ّ","ْ","ء"];
var _40=["ﺍ","ﺏ","ﺕ","ﺙ","ﺝ","ﺡ","ﺥ","ﺩ","ﺫ","ﺭ","ﺯ","ﺱ","ﺵ","ﺹ","ﺽ","ﻁ","ﻅ","ﻉ","ﻍ","ﻑ","ﻕ","ﻙ","ﻝ","ﻡ","ﻥ","ﻩ","ﻭ","ﻱ","ﺇ","ﺃ","ﺁ","ﺓ","ﻯ","ﯼ","ﺉ","ﺅ","ﹰ","ﹲ","ﹴ","ﹶ","ﹸ","ﹺ","ﹼ","ﹾ","ﺀ"];
var _3e=["ﺎ","ﺐ","ﺖ","ﺚ","ﺞ","ﺢ","ﺦ","ﺪ","ﺬ","ﺮ","ﺰ","ﺲ","ﺶ","ﺺ","ﺾ","ﻂ","ﻆ","ﻊ","ﻎ","ﻒ","ﻖ","ﻚ","ﻞ","ﻢ","ﻦ","ﻪ","ﻮ","ﻲ","ﺈ","ﺄ","ﺂ","ﺔ","ﻰ","ﯽ","ﺊ","ﺆ","ﹰ","ﹲ","ﹴ","ﹶ","ﹸ","ﹺ","ﹼ","ﹾ","ﺀ"];
var _96=["ﺎ","ﺒ","ﺘ","ﺜ","ﺠ","ﺤ","ﺨ","ﺪ","ﺬ","ﺮ","ﺰ","ﺴ","ﺸ","ﺼ","ﻀ","ﻄ","ﻈ","ﻌ","ﻐ","ﻔ","ﻘ","ﻜ","ﻠ","ﻤ","ﻨ","ﻬ","ﻮ","ﻴ","ﺈ","ﺄ","ﺂ","ﺔ","ﻰ","ﯿ","ﺌ","ﺆ","ﹱ","ﹲ","ﹴ","ﹷ","ﹹ","ﹻ","ﹽ","ﹿ","ﺀ"];
var _3f=["ﺍ","ﺑ","ﺗ","ﺛ","ﺟ","ﺣ","ﺧ","ﺩ","ﺫ","ﺭ","ﺯ","ﺳ","ﺷ","ﺻ","ﺿ","ﻃ","ﻇ","ﻋ","ﻏ","ﻓ","ﻗ","ﻛ","ﻟ","ﻣ","ﻧ","ﻫ","ﻭ","ﻳ","ﺇ","ﺃ","ﺁ","ﺓ","ﻯ","ﯾ","ﺋ","ﺅ","ﹰ","ﹲ","ﹴ","ﹶ","ﹸ","ﹺ","ﹼ","ﹾ","ﺀ"];
var _94=["ء","ا","د","ذ","ر","ز","و","آ","ة","ئ","ؤ","إ","ٵ","أ"];
var _51=["ً","ً","ٌ","؟","ٍ","؟","َ","َ","ُ","ُ","ِ","ِ","ّ","ّ","ْ","ْ","ء","آ","آ","أ","أ","ؤ","ؤ","إ","إ","ئ","ئ","ئ","ئ","ا","ا","ب","ب","ب","ب","ة","ة","ت","ت","ت","ت","ث","ث","ث","ث","ج","ج","ج","ج","ح","ح","ح","ح","خ","خ","خ","خ","د","د","ذ","ذ","ر","ر","ز","ز","س","س","س","س","ش","ش","ش","ش","ص","ص","ص","ص","ض","ض","ض","ض","ط","ط","ط","ط","ظ","ظ","ظ","ظ","ع","ع","ع","ع","غ","غ","غ","غ","ف","ف","ف","ف","ق","ق","ق","ق","ك","ك","ك","ك","ل","ل","ل","ل","م","م","م","م","ن","ن","ن","ن","ه","ه","ه","ه","و","و","ى","ى","ي","ي","ي","ي","ﻵ","ﻶ","ﻷ","ﻸ","ﻹ","ﻺ","ﻻ","ﻼ","؟","؟","؟"];
var _71=["ء","ف"];
var _72=["غ","ي"];
var _a2=[1+32+256*17,1+32+256*19,1+256*21,1+32+256*23,1+2+256*25,1+32+256*29,1+2+256*31,1+256*35,1+2+256*37,1+2+256*41,1+2+256*45,1+2+256*49,1+2+256*53,1+256*57,1+256*59,1+256*61,1+256*63,1+2+256*65,1+2+256*69,1+2+256*73,1+2+256*77,1+2+256*81,1+2+256*85,1+2+256*89,1+2+256*93,0,0,0,0,0,1+2,1+2+256*97,1+2+256*101,1+2+256*105,1+2+16+256*109,1+2+256*113,1+2+256*117,1+2+256*121,1+256*125,1+256*127,1+2+256*129,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,1+256*133,1+256*135,1+256*137,1+256*139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1+32,1+32,0,1+32,1,1,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1,1+2,1,1,1,1,1,1,1,1,1,1,1+2,1,1+2,1+2,1+2,1+2,1,1];
var _a3=[1+2,1+2,1+2,0,1+2,0,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,1+2,0,0+32,1+32,0+32,1+32,0,1,0+32,1+32,0,2,1+2,1,0+32,1+32,0,2,1+2,1,0,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,1,0,1,0,1,0,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0+16,2+16,1+2+16,1+16,0,2,1+2,1,0,2,1+2,1,0,2,1+2,1,0,1,0,1,0,2,1+2,1,0,1,0,1,0,1,0,1];
var _5b=[[0,3,0,1,0,0,0],[0,3,0,1,2,2,0],[0,3,0,17,2,0,1],[0,3,5,5,4,1,0],[0,3,21,21,4,0,1],[0,3,5,5,4,2,0]];
var _5a=[[2,0,1,1,0,1,0],[2,0,1,1,0,2,0],[2,0,2,1,3,2,0],[2,0,2,33,3,1,1]];
var _46=0;
var _1b=1;
var _86=2;
var _85=3;
var _84=4;
var _1d=5;
var _68=6;
var _1c=7;
var _69=8;
var _87=9;
var _88=10;
var _89=11;
var _8a=12;
var _8c=13;
var _8d=14;
var _90=15;
var _8e=16;
var _8f=17;
var _91=18;
var _19=100;
var _a4=_19+0;
var _a5=_19+1;
var _a6=_19+2;
var _a7=_19+3;
var _a8=_19+4;
var _a9=_19+5;
var _aa=_19+6;
var _ab=_19+7;
var L=_46;
var R=_1b;
var EN=_86;
var AN=_85;
var ON=_84;
var B=_1d;
var S=_68;
var AL=_1c;
var WS=_69;
var CS=_87;
var ES=_88;
var ET=_89;
var NSM=_8a;
var LRE=_8c;
var RLE=_8d;
var PDF=_90;
var LRO=_8e;
var RLO=_8f;
var BN=_91;
var _18=[_a4,L,L,L,L,_a5,_a6,_a7,R,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,_a8,ON,ON,ON,L,ON,L,ON,L,ON,ON,ON,L,L,ON,ON,L,L,L,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,ON,ON,L,L,ON,ON,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,L,_a9,AL,AL,_aa,_ab];
delete _a4;
delete _a5;
delete _a6;
delete _a7;
delete _a8;
delete _a9;
delete _aa;
delete _ab;
var _1a=[[BN,BN,BN,BN,BN,BN,BN,BN,BN,S,B,S,WS,B,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,B,B,B,S,WS,ON,ON,ET,ET,ET,ON,ON,ON,ON,ON,ES,CS,ES,CS,CS,EN,EN,EN,EN,EN,EN,EN,EN,EN,EN,CS,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,BN,BN,BN,BN,BN,BN,B,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,BN,CS,ON,ET,ET,ET,ET,ON,ON,ON,ON,L,ON,ON,BN,ON,ON,ET,ET,EN,EN,ON,L,ON,ON,ON,EN,L,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,L,L,L,L,L,L,L,L],[L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,L,L,L,L,L,L,L,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,L,ON,ON,ON,ON,ON,ON,ON,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,R,NSM,R,NSM,NSM,R,NSM,NSM,R,NSM,ON,ON,ON,ON,ON,ON,ON,ON,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,ON,ON,ON,ON,ON,R,R,R,R,R,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON],[AN,AN,AN,AN,ON,ON,ON,ON,AL,ET,ET,AL,CS,AL,ON,ON,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,AL,ON,ON,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,AN,AN,AN,AN,AN,AN,AN,AN,AN,AN,ET,AN,AN,AL,AL,AL,NSM,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,NSM,NSM,NSM,NSM,NSM,NSM,NSM,AN,ON,NSM,NSM,NSM,NSM,NSM,NSM,AL,AL,NSM,NSM,ON,NSM,NSM,NSM,NSM,AL,AL,EN,EN,EN,EN,EN,EN,EN,EN,EN,EN,AL,AL,AL,AL,AL,AL],[AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,ON,AL,AL,NSM,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,ON,ON,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,AL,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,R,R,ON,ON,ON,ON,R,ON,ON,ON,ON,ON],[WS,WS,WS,WS,WS,WS,WS,WS,WS,WS,WS,BN,BN,BN,L,R,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,WS,B,LRE,RLE,PDF,LRO,RLO,CS,ET,ET,ET,ET,ET,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,CS,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,WS,BN,BN,BN,BN,BN,ON,ON,ON,ON,ON,BN,BN,BN,BN,BN,BN,EN,L,ON,ON,EN,EN,EN,EN,EN,EN,ES,ES,ON,ON,ON,L,EN,EN,EN,EN,EN,EN,EN,EN,EN,EN,ES,ES,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ET,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON],[L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,L,L,L,ON,ON,ON,ON,ON,R,NSM,R,R,R,R,R,R,R,R,R,R,ES,R,R,R,R,R,R,R,R,R,R,R,R,R,ON,R,R,R,R,R,ON,R,ON,R,R,ON,R,R,ON,R,R,R,R,R,R,R,R,R,R,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL],[NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,NSM,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,NSM,NSM,NSM,NSM,NSM,NSM,NSM,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,CS,ON,CS,ON,ON,CS,ON,ON,ON,ON,ON,ON,ON,ON,ON,ET,ON,ON,ES,ES,ON,ON,ON,ON,ON,ET,ET,ON,ON,ON,ON,ON,AL,AL,AL,AL,AL,ON,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,AL,ON,ON,BN],[ON,ON,ON,ET,ET,ET,ON,ON,ON,ON,ON,ES,CS,ES,CS,CS,EN,EN,EN,EN,EN,EN,EN,EN,EN,EN,CS,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,ON,ON,ON,L,L,L,L,L,L,ON,ON,L,L,L,L,L,L,ON,ON,L,L,L,L,L,L,ON,ON,L,L,L,ON,ON,ON,ET,ET,ON,ON,ON,ET,ET,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON,ON]];
delete L;
delete R;
delete EN;
delete AN;
delete ON;
delete B;
delete S;
delete AL;
delete WS;
delete CS;
delete ES;
delete ET;
delete NSM;
delete LRE;
delete RLE;
delete PDF;
delete LRO;
delete RLO;
delete BN;
return dojox.string.BidiEngine;
});
