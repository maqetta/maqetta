/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/hebrew/locale",["dojo","dijit","dojox","dojo/i18n","dojo/cldr/nls/hebrew"],function(_1,_2,_3){
_1.getObject("dojox.date.hebrew.locale",1);
define(["dojo/_base/kernel","dojo/date","dojo/i18n","dojo/regexp","dojo/string","./Date","./numerals","dojo/i18n!dojo/cldr/nls/hebrew"],function(d,dd,_4,_5,_6,_7,_8){
_1.getObject("date.hebrew.locale",true,_3);
_1.experimental("dojox.date.hebrew.locale");
_1.requireLocalization("dojo.cldr","hebrew");
function _9(_a,_b,_c,_d,_e){
return _e.replace(/([a-z])\1*/ig,function(_f){
var s,pad;
var c=_f.charAt(0);
var l=_f.length;
var _10=["abbr","wide","narrow"];
switch(c){
case "y":
if(_c.match(/^he(?:-.+)?$/)){
s=_8.getYearHebrewLetters(_a.getFullYear());
}else{
s=String(_a.getFullYear());
}
break;
case "M":
var m=_a.getMonth();
if(l<3){
if(!_a.isLeapYear(_a.getFullYear())&&m>5){
m--;
}
if(_c.match(/^he(?:-.+)?$/)){
s=_8.getMonthHebrewLetters(m);
}else{
s=m+1;
pad=true;
}
}else{
var _11=_3.date.hebrew.locale.getNames("months",_10[l-3],"format",_c,_a);
s=_11[m];
}
break;
case "d":
if(_c.match(/^he(?:-.+)?$/)){
s=_a.getDateLocalized(_c);
}else{
s=_a.getDate();
pad=true;
}
break;
case "E":
var d=_a.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _12=["days","format",_10[l-3]].join("-");
s=_b[_12][d];
}
break;
case "a":
var _13=(_a.getHours()<12)?"am":"pm";
s=_b["dayPeriods-format-wide-"+_13];
break;
case "h":
case "H":
case "K":
case "k":
var h=_a.getHours();
switch(c){
case "h":
s=(h%12)||12;
break;
case "H":
s=h;
break;
case "K":
s=(h%12);
break;
case "k":
s=h||24;
break;
}
pad=true;
break;
case "m":
s=_a.getMinutes();
pad=true;
break;
case "s":
s=_a.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_a.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "z":
s="";
break;
default:
throw new Error("dojox.date.hebrew.locale.formatPattern: invalid pattern char: "+_e);
}
if(pad){
s=_6.pad(s,l);
}
return s;
});
};
_3.date.hebrew.locale.format=function(_14,_15){
_15=_15||{};
var _16=_4.normalizeLocale(_15.locale);
var _17=_15.formatLength||"short";
var _18=_3.date.hebrew.locale._getHebrewBundle(_16);
var str=[];
var _19=_1.hitch(this,_9,_14,_18,_16,_15.fullYear);
if(_15.selector=="year"){
var _1a=_14.getFullYear();
return _16.match(/^he(?:-.+)?$/)?_8.getYearHebrewLetters(_1a):_1a;
}
if(_15.selector!="time"){
var _1b=_15.datePattern||_18["dateFormat-"+_17];
if(_1b){
str.push(_1c(_1b,_19));
}
}
if(_15.selector!="date"){
var _1d=_15.timePattern||_18["timeFormat-"+_17];
if(_1d){
str.push(_1c(_1d,_19));
}
}
var _1e=str.join(" ");
return _1e;
};
_3.date.hebrew.locale.regexp=function(_1f){
return _3.date.hebrew.locale._parseInfo(_1f).regexp;
};
_3.date.hebrew.locale._parseInfo=function(_20){
_20=_20||{};
var _21=_4.normalizeLocale(_20.locale);
var _22=_3.date.hebrew.locale._getHebrewBundle(_21);
var _23=_20.formatLength||"short";
var _24=_20.datePattern||_22["dateFormat-"+_23];
var _25=_20.timePattern||_22["timeFormat-"+_23];
var _26;
if(_20.selector=="date"){
_26=_24;
}else{
if(_20.selector=="time"){
_26=_25;
}else{
_26=(_25===undefined)?_24:_24+" "+_25;
}
}
var _27=[];
var re=_1c(_26,_1.hitch(this,_28,_27,_22,_20));
return {regexp:re,tokens:_27,bundle:_22};
};
_3.date.hebrew.locale.parse=function(_29,_2a){
_29=_29.replace(/[\u200E\u200F\u202A-\u202E]/g,"");
if(!_2a){
_2a={};
}
var _2b=_3.date.hebrew.locale._parseInfo(_2a);
var _2c=_2b.tokens,_2d=_2b.bundle;
var re=new RegExp("^"+_2b.regexp+"$");
var _2e=re.exec(_29);
var _2f=_4.normalizeLocale(_2a.locale);
if(!_2e){
return null;
}
var _30,_31;
var _32=[5730,3,23,0,0,0,0];
var _33="";
var _34=0;
var _35=["abbr","wide","narrow"];
var _36=_1.every(_2e,function(v,i){
if(!i){
return true;
}
var _37=_2c[i-1];
var l=_37.length;
switch(_37.charAt(0)){
case "y":
if(_2f.match(/^he(?:-.+)?$/)){
_32[0]=_8.parseYearHebrewLetters(v);
}else{
_32[0]=Number(v);
}
break;
case "M":
if(l>2){
var _38=_3.date.hebrew.locale.getNames("months",_35[l-3],"format",_2f,new _7(5769,1,1)),_39=_3.date.hebrew.locale.getNames("months",_35[l-3],"format",_2f,new _7(5768,1,1));
if(!_2a.strict){
v=v.replace(".","").toLowerCase();
_38=_1.map(_38,function(s){
return s?s.replace(".","").toLowerCase():s;
});
_39=_1.map(_39,function(s){
return s?s.replace(".","").toLowerCase():s;
});
}
var _3a=v;
v=_1.indexOf(_38,_3a);
if(v==-1){
v=_1.indexOf(_39,_3a);
if(v==-1){
return false;
}
}
_34=l;
}else{
if(_2f.match(/^he(?:-.+)?$/)){
v=_8.parseMonthHebrewLetters(v);
}else{
v--;
}
}
_32[1]=Number(v);
break;
case "D":
_32[1]=0;
case "d":
if(_2f.match(/^he(?:-.+)?$/)){
_32[2]=_8.parseDayHebrewLetters(v);
}else{
_32[2]=Number(v);
}
break;
case "a":
var am=_2a.am||_2d["dayPeriods-format-wide-am"],pm=_2a.pm||_2d["dayPeriods-format-wide-pm"];
if(!_2a.strict){
var _3b=/\./g;
v=v.replace(_3b,"").toLowerCase();
am=am.replace(_3b,"").toLowerCase();
pm=pm.replace(_3b,"").toLowerCase();
}
if(_2a.strict&&v!=am&&v!=pm){
return false;
}
_33=(v==pm)?"p":(v==am)?"a":"";
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
_32[3]=Number(v);
break;
case "m":
_32[4]=Number(v);
break;
case "s":
_32[5]=Number(v);
break;
case "S":
_32[6]=Number(v);
}
return true;
});
var _3c=+_32[3];
if(_33==="p"&&_3c<12){
_32[3]=_3c+12;
}else{
if(_33==="a"&&_3c==12){
_32[3]=0;
}
}
var _3d=new _7(_32[0],_32[1],_32[2],_32[3],_32[4],_32[5],_32[6]);
if(_34<3&&_32[1]>=5&&!_3d.isLeapYear(_3d.getFullYear())){
_3d.setMonth(_32[1]+1);
}
return _3d;
};
function _1c(_3e,_3f,_40,_41){
var _42=function(x){
return x;
};
_3f=_3f||_42;
_40=_40||_42;
_41=_41||_42;
var _43=_3e.match(/(''|[^'])+/g);
var _44=_3e.charAt(0)=="'";
_1.forEach(_43,function(_45,i){
if(!_45){
_43[i]="";
}else{
_43[i]=(_44?_40:_3f)(_45);
_44=!_44;
}
});
return _41(_43.join(""));
};
function _28(_46,_47,_48,_49){
_49=_5.escapeString(_49);
var _4a=_4.normalizeLocale(_48.locale);
return _49.replace(/([a-z])\1*/ig,function(_4b){
var s;
var c=_4b.charAt(0);
var l=_4b.length;
var p2="",p3="";
if(_48.strict){
if(l>1){
p2="0"+"{"+(l-1)+"}";
}
if(l>2){
p3="0"+"{"+(l-2)+"}";
}
}else{
p2="0?";
p3="0{0,2}";
}
switch(c){
case "y":
s="\\S+";
break;
case "M":
if(_4a.match("^he(?:-.+)?$")){
s=(l>2)?"\\S+ ?\\S+":"\\S{1,4}";
}else{
s=(l>2)?"\\S+ ?\\S+":p2+"[1-9]|1[0-2]";
}
break;
case "d":
if(_4a.match("^he(?:-.+)?$")){
s="\\S['\"'׳]{1,2}\\S?";
}else{
s="[12]\\d|"+p2+"[1-9]|30";
}
break;
case "E":
if(_4a.match("^he(?:-.+)?$")){
s=(l>3)?"\\S+ ?\\S+":"\\S";
}else{
s="\\S+";
}
break;
case "h":
s=p2+"[1-9]|1[0-2]";
break;
case "k":
s=p2+"\\d|1[01]";
break;
case "H":
s=p2+"\\d|1\\d|2[0-3]";
break;
case "K":
s=p2+"[1-9]|1\\d|2[0-4]";
break;
case "m":
case "s":
s=p2+"\\d|[0-5]\\d";
break;
case "S":
s="\\d{"+l+"}";
break;
case "a":
var am=_48.am||_47["dayPeriods-format-wide-am"],pm=_48.pm||_47["dayPeriods-format-wide-pm"];
if(_48.strict){
s=am+"|"+pm;
}else{
s=am+"|"+pm;
if(am!=am.toLowerCase()){
s+="|"+am.toLowerCase();
}
if(pm!=pm.toLowerCase()){
s+="|"+pm.toLowerCase();
}
}
break;
default:
s=".*";
}
if(_46){
_46.push(_4b);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
var _4c=[];
_3.date.hebrew.locale.addCustomFormats=function(_4d,_4e){
_4c.push({pkg:_4d,name:_4e});
};
_3.date.hebrew.locale._getHebrewBundle=function(_4f){
var _50={};
_1.forEach(_4c,function(_51){
var _52=_4.getLocalization(_51.pkg,_51.name,_4f);
_50=_1.mixin(_50,_52);
},this);
return _50;
};
_3.date.hebrew.locale.addCustomFormats("dojo.cldr","hebrew");
_3.date.hebrew.locale.getNames=function(_53,_54,_55,_56,_57){
var _58,_59=_3.date.hebrew.locale._getHebrewBundle(_56),_5a=[_53,_55,_54];
if(_55=="standAlone"){
var key=_5a.join("-");
_58=_59[key];
if(_58[0]==1){
_58=undefined;
}
}
_5a[1]="format";
var _5b=(_58||_59[_5a.join("-")]).concat();
if(_53=="months"){
if(_57.isLeapYear(_57.getFullYear())){
_5a.push("leap");
_5b[6]=_59[_5a.join("-")];
}else{
delete _5b[5];
}
}
return _5b;
};
return _3.date.hebrew.locale;
});
return _1.getObject("dojox.date.hebrew.locale");
});
require(["dojox/date/hebrew/locale"]);
