/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/date/locale",["../main","../date","../cldr/supplemental","../regexp","../string","../i18n!../cldr/nls/gregorian"],function(_1){
_1.getObject("date.locale",true,_1);
function _2(_3,_4,_5,_6){
return _6.replace(/([a-z])\1*/ig,function(_7){
var s,_8,c=_7.charAt(0),l=_7.length,_9=["abbr","wide","narrow"];
switch(c){
case "G":
s=_4[(l<4)?"eraAbbr":"eraNames"][_3.getFullYear()<0?0:1];
break;
case "y":
s=_3.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_5.fullYear){
s=String(s);
s=s.substr(s.length-2);
break;
}
default:
_8=true;
}
break;
case "Q":
case "q":
s=Math.ceil((_3.getMonth()+1)/3);
_8=true;
break;
case "M":
var m=_3.getMonth();
if(l<3){
s=m+1;
_8=true;
}else{
var _a=["months","format",_9[l-3]].join("-");
s=_4[_a][m];
}
break;
case "w":
var _b=0;
s=_1.date.locale._getWeekOfYear(_3,_b);
_8=true;
break;
case "d":
s=_3.getDate();
_8=true;
break;
case "D":
s=_1.date.locale._getDayOfYear(_3);
_8=true;
break;
case "E":
var d=_3.getDay();
if(l<3){
s=d+1;
_8=true;
}else{
var _c=["days","format",_9[l-3]].join("-");
s=_4[_c][d];
}
break;
case "a":
var _d=(_3.getHours()<12)?"am":"pm";
s=_5[_d]||_4["dayPeriods-format-wide-"+_d];
break;
case "h":
case "H":
case "K":
case "k":
var h=_3.getHours();
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
_8=true;
break;
case "m":
s=_3.getMinutes();
_8=true;
break;
case "s":
s=_3.getSeconds();
_8=true;
break;
case "S":
s=Math.round(_3.getMilliseconds()*Math.pow(10,l-3));
_8=true;
break;
case "v":
case "z":
s=_1.date.locale._getZone(_3,true,_5);
if(s){
break;
}
l=4;
case "Z":
var _e=_1.date.locale._getZone(_3,false,_5);
var tz=[(_e<=0?"+":"-"),_1.string.pad(Math.floor(Math.abs(_e)/60),2),_1.string.pad(Math.abs(_e)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_6);
}
if(_8){
s=_1.string.pad(s,l);
}
return s;
});
};
_1.date.locale._getZone=function(_f,_10,_11){
if(_10){
return _1.date.getTimezoneName(_f);
}else{
return _f.getTimezoneOffset();
}
};
_1.date.locale.format=function(_12,_13){
_13=_13||{};
var _14=_1.i18n.normalizeLocale(_13.locale),_15=_13.formatLength||"short",_16=_1.date.locale._getGregorianBundle(_14),str=[],_17=_1.hitch(this,_2,_12,_16,_13);
if(_13.selector=="year"){
return _18(_16["dateFormatItem-yyyy"]||"yyyy",_17);
}
var _19;
if(_13.selector!="date"){
_19=_13.timePattern||_16["timeFormat-"+_15];
if(_19){
str.push(_18(_19,_17));
}
}
if(_13.selector!="time"){
_19=_13.datePattern||_16["dateFormat-"+_15];
if(_19){
str.push(_18(_19,_17));
}
}
return str.length==1?str[0]:_16["dateTimeFormat-"+_15].replace(/\{(\d+)\}/g,function(_1a,key){
return str[key];
});
};
_1.date.locale.regexp=function(_1b){
return _1.date.locale._parseInfo(_1b).regexp;
};
_1.date.locale._parseInfo=function(_1c){
_1c=_1c||{};
var _1d=_1.i18n.normalizeLocale(_1c.locale),_1e=_1.date.locale._getGregorianBundle(_1d),_1f=_1c.formatLength||"short",_20=_1c.datePattern||_1e["dateFormat-"+_1f],_21=_1c.timePattern||_1e["timeFormat-"+_1f],_22;
if(_1c.selector=="date"){
_22=_20;
}else{
if(_1c.selector=="time"){
_22=_21;
}else{
_22=_1e["dateTimeFormat-"+_1f].replace(/\{(\d+)\}/g,function(_23,key){
return [_21,_20][key];
});
}
}
var _24=[],re=_18(_22,_1.hitch(this,_25,_24,_1e,_1c));
return {regexp:re,tokens:_24,bundle:_1e};
};
_1.date.locale.parse=function(_26,_27){
var _28=/[\u200E\u200F\u202A\u202E]/g,_29=_1.date.locale._parseInfo(_27),_2a=_29.tokens,_2b=_29.bundle,re=new RegExp("^"+_29.regexp.replace(_28,"")+"$",_29.strict?"":"i"),_2c=re.exec(_26&&_26.replace(_28,""));
if(!_2c){
return null;
}
var _2d=["abbr","wide","narrow"],_2e=[1970,0,1,0,0,0,0],_2f="",_30=_1.every(_2c,function(v,i){
if(!i){
return true;
}
var _31=_2a[i-1];
var l=_31.length;
switch(_31.charAt(0)){
case "y":
if(l!=2&&_27.strict){
_2e[0]=v;
}else{
if(v<100){
v=Number(v);
var _32=""+new Date().getFullYear(),_33=_32.substring(0,2)*100,_34=Math.min(Number(_32.substring(2,4))+20,99);
_2e[0]=(v<_34)?_33+v:_33-100+v;
}else{
if(_27.strict){
return false;
}
_2e[0]=v;
}
}
break;
case "M":
if(l>2){
var _35=_2b["months-format-"+_2d[l-3]].concat();
if(!_27.strict){
v=v.replace(".","").toLowerCase();
_35=_1.map(_35,function(s){
return s.replace(".","").toLowerCase();
});
}
v=_1.indexOf(_35,v);
if(v==-1){
return false;
}
}else{
v--;
}
_2e[1]=v;
break;
case "E":
case "e":
var _36=_2b["days-format-"+_2d[l-3]].concat();
if(!_27.strict){
v=v.toLowerCase();
_36=_1.map(_36,function(d){
return d.toLowerCase();
});
}
v=_1.indexOf(_36,v);
if(v==-1){
return false;
}
break;
case "D":
_2e[1]=0;
case "d":
_2e[2]=v;
break;
case "a":
var am=_27.am||_2b["dayPeriods-format-wide-am"],pm=_27.pm||_2b["dayPeriods-format-wide-pm"];
if(!_27.strict){
var _37=/\./g;
v=v.replace(_37,"").toLowerCase();
am=am.replace(_37,"").toLowerCase();
pm=pm.replace(_37,"").toLowerCase();
}
if(_27.strict&&v!=am&&v!=pm){
return false;
}
_2f=(v==pm)?"p":(v==am)?"a":"";
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
if(v>23){
return false;
}
_2e[3]=v;
break;
case "m":
_2e[4]=v;
break;
case "s":
_2e[5]=v;
break;
case "S":
_2e[6]=v;
}
return true;
});
var _38=+_2e[3];
if(_2f==="p"&&_38<12){
_2e[3]=_38+12;
}else{
if(_2f==="a"&&_38==12){
_2e[3]=0;
}
}
var _39=new Date(_2e[0],_2e[1],_2e[2],_2e[3],_2e[4],_2e[5],_2e[6]);
if(_27.strict){
_39.setFullYear(_2e[0]);
}
var _3a=_2a.join(""),_3b=_3a.indexOf("d")!=-1,_3c=_3a.indexOf("M")!=-1;
if(!_30||(_3c&&_39.getMonth()>_2e[1])||(_3b&&_39.getDate()>_2e[2])){
return null;
}
if((_3c&&_39.getMonth()<_2e[1])||(_3b&&_39.getDate()<_2e[2])){
_39=_1.date.add(_39,"hour",1);
}
return _39;
};
function _18(_3d,_3e,_3f,_40){
var _41=function(x){
return x;
};
_3e=_3e||_41;
_3f=_3f||_41;
_40=_40||_41;
var _42=_3d.match(/(''|[^'])+/g),_43=_3d.charAt(0)=="'";
_1.forEach(_42,function(_44,i){
if(!_44){
_42[i]="";
}else{
_42[i]=(_43?_3f:_3e)(_44.replace(/''/g,"'"));
_43=!_43;
}
});
return _40(_42.join(""));
};
function _25(_45,_46,_47,_48){
_48=_1.regexp.escapeString(_48);
if(!_47.strict){
_48=_48.replace(" a"," ?a");
}
return _48.replace(/([a-z])\1*/ig,function(_49){
var s,c=_49.charAt(0),l=_49.length,p2="",p3="";
if(_47.strict){
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
s="\\d{2,4}";
break;
case "M":
s=(l>2)?"\\S+?":"1[0-2]|"+p2+"[1-9]";
break;
case "D":
s="[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|"+p2+"[1-9][0-9]|"+p3+"[1-9]";
break;
case "d":
s="3[01]|[12]\\d|"+p2+"[1-9]";
break;
case "w":
s="[1-4][0-9]|5[0-3]|"+p2+"[1-9]";
break;
case "E":
s="\\S+";
break;
case "h":
s="1[0-2]|"+p2+"[1-9]";
break;
case "k":
s="1[01]|"+p2+"\\d";
break;
case "H":
s="1\\d|2[0-3]|"+p2+"\\d";
break;
case "K":
s="1\\d|2[0-4]|"+p2+"[1-9]";
break;
case "m":
case "s":
s="[0-5]\\d";
break;
case "S":
s="\\d{"+l+"}";
break;
case "a":
var am=_47.am||_46["dayPeriods-format-wide-am"],pm=_47.pm||_46["dayPeriods-format-wide-pm"];
s=am+"|"+pm;
if(!_47.strict){
if(am!=am.toLowerCase()){
s+="|"+am.toLowerCase();
}
if(pm!=pm.toLowerCase()){
s+="|"+pm.toLowerCase();
}
if(s.indexOf(".")!=-1){
s+="|"+s.replace(/\./g,"");
}
}
s=s.replace(/\./g,"\\.");
break;
default:
s=".*";
}
if(_45){
_45.push(_49);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
var _4a=[];
_1.date.locale.addCustomFormats=function(_4b,_4c){
_4a.push({pkg:_4b,name:_4c});
};
_1.date.locale._getGregorianBundle=function(_4d){
var _4e={};
_1.forEach(_4a,function(_4f){
var _50=_1.i18n.getLocalization(_4f.pkg,_4f.name,_4d);
_4e=_1.mixin(_4e,_50);
},this);
return _4e;
};
_1.date.locale.addCustomFormats("dojo.cldr","gregorian");
_1.date.locale.getNames=function(_51,_52,_53,_54){
var _55,_56=_1.date.locale._getGregorianBundle(_54),_57=[_51,_53,_52];
if(_53=="standAlone"){
var key=_57.join("-");
_55=_56[key];
if(_55[0]==1){
_55=undefined;
}
}
_57[1]="format";
return (_55||_56[_57.join("-")]).concat();
};
_1.date.locale.isWeekend=function(_58,_59){
var _5a=_1.cldr.supplemental.getWeekend(_59),day=(_58||new Date()).getDay();
if(_5a.end<_5a.start){
_5a.end+=7;
if(day<_5a.start){
day+=7;
}
}
return day>=_5a.start&&day<=_5a.end;
};
_1.date.locale._getDayOfYear=function(_5b){
return _1.date.difference(new Date(_5b.getFullYear(),0,1,_5b.getHours()),_5b)+1;
};
_1.date.locale._getWeekOfYear=function(_5c,_5d){
if(arguments.length==1){
_5d=0;
}
var _5e=new Date(_5c.getFullYear(),0,1).getDay(),adj=(_5e-_5d+7)%7,_5f=Math.floor((_1.date.locale._getDayOfYear(_5c)+adj-1)/7);
if(_5e==_5d){
_5f++;
}
return _5f;
};
return _1.date.locale;
});
