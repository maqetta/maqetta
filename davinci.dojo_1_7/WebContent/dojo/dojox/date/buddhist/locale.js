/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/buddhist/locale",["dojo/_base/kernel","dojo/date","dojo/i18n","dojo/regexp","dojo/string","./Date","dojo/i18n!dojo/cldr/nls/buddhist"],function(d,dd,_1,_2,_3,_4){
dojo.getObject("date.buddhist.locale",true,dojox);
dojo.experimental("dojox.date.buddhist.locale");
function _5(_6,_7,_8,_9,_a){
return _a.replace(/([a-z])\1*/ig,function(_b){
var s,_c;
var c=_b.charAt(0);
var l=_b.length;
var _d=["abbr","wide","narrow"];
switch(c){
case "G":
s=_7["eraAbbr"][0];
break;
case "y":
s=String(_6.getFullYear());
break;
case "M":
var m=_6.getMonth();
if(l<3){
s=m+1;
_c=true;
}else{
var _e=["months","format",_d[l-3]].join("-");
s=_7[_e][m];
}
break;
case "d":
s=_6.getDate(true);
_c=true;
break;
case "E":
var d=_6.getDay();
if(l<3){
s=d+1;
_c=true;
}else{
var _f=["days","format",_d[l-3]].join("-");
s=_7[_f][d];
}
break;
case "a":
var _10=(_6.getHours()<12)?"am":"pm";
s=_7["dayPeriods-format-wide-"+_10];
break;
case "h":
case "H":
case "K":
case "k":
var h=_6.getHours();
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
_c=true;
break;
case "m":
s=_6.getMinutes();
_c=true;
break;
case "s":
s=_6.getSeconds();
_c=true;
break;
case "S":
s=Math.round(_6.getMilliseconds()*Math.pow(10,l-3));
_c=true;
break;
case "z":
s=dojo.date.getTimezoneName(_6.toGregorian());
if(s){
break;
}
l=4;
case "Z":
var _11=_6.toGregorian().getTimezoneOffset();
var tz=[(_11<=0?"+":"-"),_3.pad(Math.floor(Math.abs(_11)/60),2),_3.pad(Math.abs(_11)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojox.date.buddhist.locale.formatPattern: invalid pattern char: "+_a);
}
if(_c){
s=_3.pad(s,l);
}
return s;
});
};
dojox.date.buddhist.locale.format=function(_12,_13){
_13=_13||{};
var _14=_1.normalizeLocale(_13.locale);
var _15=_13.formatLength||"short";
var _16=dojox.date.buddhist.locale._getBuddhistBundle(_14);
var str=[];
var _17=dojo.hitch(this,_5,_12,_16,_14,_13.fullYear);
if(_13.selector=="year"){
var _18=_12.getFullYear();
return _18;
}
if(_13.selector!="time"){
var _19=_13.datePattern||_16["dateFormat-"+_15];
if(_19){
str.push(_1a(_19,_17));
}
}
if(_13.selector!="date"){
var _1b=_13.timePattern||_16["timeFormat-"+_15];
if(_1b){
str.push(_1a(_1b,_17));
}
}
var _1c=str.join(" ");
return _1c;
};
dojox.date.buddhist.locale.regexp=function(_1d){
return dojox.date.buddhist.locale._parseInfo(_1d).regexp;
};
dojox.date.buddhist.locale._parseInfo=function(_1e){
_1e=_1e||{};
var _1f=_1.normalizeLocale(_1e.locale);
var _20=dojox.date.buddhist.locale._getBuddhistBundle(_1f);
var _21=_1e.formatLength||"short";
var _22=_1e.datePattern||_20["dateFormat-"+_21];
var _23=_1e.timePattern||_20["timeFormat-"+_21];
var _24;
if(_1e.selector=="date"){
_24=_22;
}else{
if(_1e.selector=="time"){
_24=_23;
}else{
_24=(typeof (_23)=="undefined")?_22:_22+" "+_23;
}
}
var _25=[];
var re=_1a(_24,dojo.hitch(this,_26,_25,_20,_1e));
return {regexp:re,tokens:_25,bundle:_20};
};
dojox.date.buddhist.locale.parse=function(_27,_28){
_27=_27.replace(/[\u200E\u200F\u202A-\u202E]/g,"");
if(!_28){
_28={};
}
var _29=dojox.date.buddhist.locale._parseInfo(_28);
var _2a=_29.tokens,_2b=_29.bundle;
var re=new RegExp("^"+_29.regexp+"$");
var _2c=re.exec(_27);
var _2d=_1.normalizeLocale(_28.locale);
if(!_2c){
return null;
}
var _2e,_2f;
var _30=[2513,0,1,0,0,0,0];
var _31="";
var _32=0;
var _33=["abbr","wide","narrow"];
var _34=dojo.every(_2c,function(v,i){
if(!i){
return true;
}
var _35=_2a[i-1];
var l=_35.length;
switch(_35.charAt(0)){
case "y":
_30[0]=Number(v);
break;
case "M":
if(l>2){
var _36=_2b["months-format-"+_33[l-3]].concat();
if(!_28.strict){
v=v.replace(".","").toLowerCase();
_36=dojo.map(_36,function(s){
return s?s.replace(".","").toLowerCase():s;
});
}
v=dojo.indexOf(_36,v);
if(v==-1){
return false;
}
_32=l;
}else{
v--;
}
_30[1]=Number(v);
break;
case "D":
_30[1]=0;
case "d":
_30[2]=Number(v);
break;
case "a":
var am=_28.am||_2b["dayPeriods-format-wide-am"],pm=_28.pm||_2b["dayPeriods-format-wide-pm"];
if(!_28.strict){
var _37=/\./g;
v=v.replace(_37,"").toLowerCase();
am=am.replace(_37,"").toLowerCase();
pm=pm.replace(_37,"").toLowerCase();
}
if(_28.strict&&v!=am&&v!=pm){
return false;
}
_31=(v==pm)?"p":(v==am)?"a":"";
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
_30[3]=Number(v);
break;
case "m":
_30[4]=Number(v);
break;
case "s":
_30[5]=Number(v);
break;
case "S":
_30[6]=Number(v);
}
return true;
});
var _38=+_30[3];
if(_31==="p"&&_38<12){
_30[3]=_38+12;
}else{
if(_31==="a"&&_38==12){
_30[3]=0;
}
}
var _39=new _4(_30[0],_30[1],_30[2],_30[3],_30[4],_30[5],_30[6]);
return _39;
};
function _1a(_3a,_3b,_3c,_3d){
var _3e=function(x){
return x;
};
_3b=_3b||_3e;
_3c=_3c||_3e;
_3d=_3d||_3e;
var _3f=_3a.match(/(''|[^'])+/g);
var _40=_3a.charAt(0)=="'";
dojo.forEach(_3f,function(_41,i){
if(!_41){
_3f[i]="";
}else{
_3f[i]=(_40?_3c:_3b)(_41);
_40=!_40;
}
});
return _3d(_3f.join(""));
};
function _26(_42,_43,_44,_45){
_45=_2.escapeString(_45);
var _46=_1.normalizeLocale(_44.locale);
return _45.replace(/([a-z])\1*/ig,function(_47){
var s;
var c=_47.charAt(0);
var l=_47.length;
var p2="",p3="";
if(_44.strict){
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
s=(l>2)?"\\S+":p2+"[1-9]|1[0-2]";
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
var am=_44.am||_43["dayPeriods-format-wide-am"],pm=_44.pm||_43["dayPeriods-format-wide-pm"];
if(_44.strict){
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
if(_42){
_42.push(_47);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
var _48=[];
dojox.date.buddhist.locale.addCustomFormats=function(_49,_4a){
_48.push({pkg:_49,name:_4a});
};
dojox.date.buddhist.locale._getBuddhistBundle=function(_4b){
var _4c={};
dojo.forEach(_48,function(_4d){
var _4e=_1.getLocalization(_4d.pkg,_4d.name,_4b);
_4c=dojo.mixin(_4c,_4e);
},this);
return _4c;
};
dojox.date.buddhist.locale.addCustomFormats("dojo.cldr","buddhist");
dojox.date.buddhist.locale.getNames=function(_4f,_50,_51,_52,_53){
var _54;
var _55=dojox.date.buddhist.locale._getBuddhistBundle(_52);
var _56=[_4f,_51,_50];
if(_51=="standAlone"){
var key=_56.join("-");
_54=_55[key];
if(_54[0]==1){
_54=undefined;
}
}
_56[1]="format";
return (_54||_55[_56.join("-")]).concat();
};
});
