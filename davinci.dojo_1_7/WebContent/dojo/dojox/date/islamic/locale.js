/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/islamic/locale",["dojo","dijit","dojox","dojo/i18n","dojo/cldr/nls/islamic"],function(_1,_2,_3){
_1.getObject("dojox.date.islamic.locale",1);
define(["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojo/date","dojo/i18n","dojo/regexp","dojo/string","./Date","dojo/i18n!dojo/cldr/nls/islamic"],function(d,_4,_5,dd,_6,_7,_8,_9){
_1.getObject("date.islamic.locale",true,_3);
_1.experimental("dojox.date.islamic.locale");
_1.requireLocalization("dojo.cldr","islamic");
function _a(_b,_c,_d,_e,_f){
return _f.replace(/([a-z])\1*/ig,function(_10){
var s,pad;
var c=_10.charAt(0);
var l=_10.length;
var _11=["abbr","wide","narrow"];
switch(c){
case "G":
s=_c["eraAbbr"][0];
break;
case "y":
s=String(_b.getFullYear());
break;
case "M":
var m=_b.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _12=["months","format",_11[l-3]].join("-");
s=_c[_12][m];
}
break;
case "d":
s=_b.getDate(true);
pad=true;
break;
case "E":
var d=_b.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _13=["days","format",_11[l-3]].join("-");
s=_c[_13][d];
}
break;
case "a":
var _14=(_b.getHours()<12)?"am":"pm";
s=_c["dayPeriods-format-wide-"+_14];
break;
case "h":
case "H":
case "K":
case "k":
var h=_b.getHours();
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
s=_b.getMinutes();
pad=true;
break;
case "s":
s=_b.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_b.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "z":
s=dd.getTimezoneName(_b.toGregorian());
if(s){
break;
}
l=4;
case "Z":
var _15=_b.toGregorian().getTimezoneOffset();
var tz=[(_15<=0?"+":"-"),_8.pad(Math.floor(Math.abs(_15)/60),2),_8.pad(Math.abs(_15)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojox.date.islamic.locale.formatPattern: invalid pattern char: "+_f);
}
if(pad){
s=_8.pad(s,l);
}
return s;
});
};
_3.date.islamic.locale.format=function(_16,_17){
_17=_17||{};
var _18=_6.normalizeLocale(_17.locale);
var _19=_17.formatLength||"short";
var _1a=_3.date.islamic.locale._getIslamicBundle(_18);
var str=[];
var _1b=_1.hitch(this,_a,_16,_1a,_18,_17.fullYear);
if(_17.selector=="year"){
var _1c=_16.getFullYear();
return _1c;
}
if(_17.selector!="time"){
var _1d=_17.datePattern||_1a["dateFormat-"+_19];
if(_1d){
str.push(_1e(_1d,_1b));
}
}
if(_17.selector!="date"){
var _1f=_17.timePattern||_1a["timeFormat-"+_19];
if(_1f){
str.push(_1e(_1f,_1b));
}
}
var _20=str.join(" ");
return _20;
};
_3.date.islamic.locale.regexp=function(_21){
return _3.date.islamic.locale._parseInfo(_21).regexp;
};
_3.date.islamic.locale._parseInfo=function(_22){
_22=_22||{};
var _23=_6.normalizeLocale(_22.locale);
var _24=_3.date.islamic.locale._getIslamicBundle(_23);
var _25=_22.formatLength||"short";
var _26=_22.datePattern||_24["dateFormat-"+_25];
var _27=_22.timePattern||_24["timeFormat-"+_25];
var _28;
if(_22.selector=="date"){
_28=_26;
}else{
if(_22.selector=="time"){
_28=_27;
}else{
_28=(typeof (_27)=="undefined")?_26:_26+" "+_27;
}
}
var _29=[];
var re=_1e(_28,_1.hitch(this,_2a,_29,_24,_22));
return {regexp:re,tokens:_29,bundle:_24};
};
_3.date.islamic.locale.parse=function(_2b,_2c){
_2b=_2b.replace(/[\u200E\u200F\u202A\u202E]/g,"");
if(!_2c){
_2c={};
}
var _2d=_3.date.islamic.locale._parseInfo(_2c);
var _2e=_2d.tokens,_2f=_2d.bundle;
var _30=_2d.regexp.replace(/[\u200E\u200F\u202A\u202E]/g,"");
var re=new RegExp("^"+_30+"$");
var _31=re.exec(_2b);
var _32=_6.normalizeLocale(_2c.locale);
if(!_31){
return null;
}
var _33,_34;
var _35=[1389,0,1,0,0,0,0];
var _36="";
var _37=0;
var _38=["abbr","wide","narrow"];
var _39=_1.every(_31,function(v,i){
if(!i){
return true;
}
var _3a=_2e[i-1];
var l=_3a.length;
switch(_3a.charAt(0)){
case "y":
_35[0]=Number(v);
break;
case "M":
if(l>2){
var _3b=_2f["months-format-"+_38[l-3]].concat();
if(!_2c.strict){
v=v.replace(".","").toLowerCase();
_3b=_1.map(_3b,function(s){
return s?s.replace(".","").toLowerCase():s;
});
}
v=_1.indexOf(_3b,v);
if(v==-1){
return false;
}
_37=l;
}else{
v--;
}
_35[1]=Number(v);
break;
case "D":
_35[1]=0;
case "d":
_35[2]=Number(v);
break;
case "a":
var am=_2c.am||_2f["dayPeriods-format-wide-am"],pm=_2c.pm||_2f["dayPeriods-format-wide-pm"];
if(!_2c.strict){
var _3c=/\./g;
v=v.replace(_3c,"").toLowerCase();
am=am.replace(_3c,"").toLowerCase();
pm=pm.replace(_3c,"").toLowerCase();
}
if(_2c.strict&&v!=am&&v!=pm){
return false;
}
_36=(v==pm)?"p":(v==am)?"a":"";
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
_35[3]=Number(v);
break;
case "m":
_35[4]=Number(v);
break;
case "s":
_35[5]=Number(v);
break;
case "S":
_35[6]=Number(v);
}
return true;
});
var _3d=+_35[3];
if(_36==="p"&&_3d<12){
_35[3]=_3d+12;
}else{
if(_36==="a"&&_3d==12){
_35[3]=0;
}
}
var _3e=new _9(_35[0],_35[1],_35[2],_35[3],_35[4],_35[5],_35[6]);
return _3e;
};
function _1e(_3f,_40,_41,_42){
var _43=function(x){
return x;
};
_40=_40||_43;
_41=_41||_43;
_42=_42||_43;
var _44=_3f.match(/(''|[^'])+/g);
var _45=_3f.charAt(0)=="'";
_1.forEach(_44,function(_46,i){
if(!_46){
_44[i]="";
}else{
_44[i]=(_45?_41:_40)(_46);
_45=!_45;
}
});
return _42(_44.join(""));
};
function _2a(_47,_48,_49,_4a){
_4a=_7.escapeString(_4a);
var _4b=_6.normalizeLocale(_49.locale);
return _4a.replace(/([a-z])\1*/ig,function(_4c){
var s;
var c=_4c.charAt(0);
var l=_4c.length;
var p2="",p3="";
if(_49.strict){
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
s="\\d+";
break;
case "M":
s=(l>2)?"\\S+ ?\\S+":p2+"[1-9]|1[0-2]";
break;
case "d":
s="[12]\\d|"+p2+"[1-9]|3[01]";
break;
case "E":
s="\\S+";
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
var am=_49.am||_48["dayPeriods-format-wide-am"],pm=_49.pm||_48["dayPeriods-format-wide-pm"];
if(_49.strict){
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
if(_47){
_47.push(_4c);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
var _4d=[];
_3.date.islamic.locale.addCustomFormats=function(_4e,_4f){
_4d.push({pkg:_4e,name:_4f});
};
_3.date.islamic.locale._getIslamicBundle=function(_50){
var _51={};
_1.forEach(_4d,function(_52){
var _53=_6.getLocalization(_52.pkg,_52.name,_50);
_51=_1.mixin(_51,_53);
},this);
return _51;
};
_3.date.islamic.locale.addCustomFormats("dojo.cldr","islamic");
_3.date.islamic.locale.getNames=function(_54,_55,_56,_57,_58){
var _59;
var _5a=_3.date.islamic.locale._getIslamicBundle(_57);
var _5b=[_54,_56,_55];
if(_56=="standAlone"){
var key=_5b.join("-");
_59=_5a[key];
if(_59[0]==1){
_59=undefined;
}
}
_5b[1]="format";
return (_59||_5a[_5b.join("-")]).concat();
};
_3.date.islamic.locale.weekDays=_3.date.islamic.locale.getNames("days","wide","format");
_3.date.islamic.locale.months=_3.date.islamic.locale.getNames("months","wide","format");
return _3.date.islamic.locale;
});
return _1.getObject("dojox.date.islamic.locale");
});
require(["dojox/date/islamic/locale"]);
