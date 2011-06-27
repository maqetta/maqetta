/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/number",["./_base/kernel","./i18n","./i18n!./cldr/nls/number","./string","./regexp"],function(_1){
_1.getObject("number",true,_1);
_1.number.format=function(_2,_3){
_3=_1.mixin({},_3||{});
var _4=_1.i18n.normalizeLocale(_3.locale),_5=_1.i18n.getLocalization("dojo.cldr","number",_4);
_3.customs=_5;
var _6=_3.pattern||_5[(_3.type||"decimal")+"Format"];
if(isNaN(_2)||Math.abs(_2)==Infinity){
return null;
}
return _1.number._applyPattern(_2,_6,_3);
};
_1.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
_1.number._applyPattern=function(_7,_8,_9){
_9=_9||{};
var _a=_9.customs.group,_b=_9.customs.decimal,_c=_8.split(";"),_d=_c[0];
_8=_c[(_7<0)?1:0]||("-"+_d);
if(_8.indexOf("%")!=-1){
_7*=100;
}else{
if(_8.indexOf("‰")!=-1){
_7*=1000;
}else{
if(_8.indexOf("¤")!=-1){
_a=_9.customs.currencyGroup||_a;
_b=_9.customs.currencyDecimal||_b;
_8=_8.replace(/\u00a4{1,3}/,function(_e){
var _f=["symbol","currency","displayName"][_e.length-1];
return _9[_f]||_9.currency||"";
});
}else{
if(_8.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _10=_1.number._numberPatternRE;
var _11=_d.match(_10);
if(!_11){
throw new Error("unable to find a number expression in pattern: "+_8);
}
if(_9.fractional===false){
_9.places=0;
}
return _8.replace(_10,_1.number._formatAbsolute(_7,_11[0],{decimal:_b,group:_a,places:_9.places,round:_9.round}));
};
_1.number.round=function(_12,_13,_14){
var _15=10/(_14||10);
return (_15*+_12).toFixed(_13)/_15;
};
if((0.9).toFixed()==0){
var _16=_1.number.round;
_1.number.round=function(v,p,m){
var d=Math.pow(10,-p||0),a=Math.abs(v);
if(!v||a>=d||a*Math.pow(10,p+1)<5){
d=0;
}
return _16(v,p,m)+(v>0?d:-d);
};
}
_1.number._formatAbsolute=function(_17,_18,_19){
_19=_19||{};
if(_19.places===true){
_19.places=0;
}
if(_19.places===Infinity){
_19.places=6;
}
var _1a=_18.split("."),_1b=typeof _19.places=="string"&&_19.places.indexOf(","),_1c=_19.places;
if(_1b){
_1c=_19.places.substring(_1b+1);
}else{
if(!(_1c>=0)){
_1c=(_1a[1]||[]).length;
}
}
if(!(_19.round<0)){
_17=_1.number.round(_17,_1c,_19.round);
}
var _1d=String(Math.abs(_17)).split("."),_1e=_1d[1]||"";
if(_1a[1]||_19.places){
if(_1b){
_19.places=_19.places.substring(0,_1b);
}
var pad=_19.places!==undefined?_19.places:(_1a[1]&&_1a[1].lastIndexOf("0")+1);
if(pad>_1e.length){
_1d[1]=_1.string.pad(_1e,pad,"0",true);
}
if(_1c<_1e.length){
_1d[1]=_1e.substr(0,_1c);
}
}else{
if(_1d[1]){
_1d.pop();
}
}
var _1f=_1a[0].replace(",","");
pad=_1f.indexOf("0");
if(pad!=-1){
pad=_1f.length-pad;
if(pad>_1d[0].length){
_1d[0]=_1.string.pad(_1d[0],pad);
}
if(_1f.indexOf("#")==-1){
_1d[0]=_1d[0].substr(_1d[0].length-pad);
}
}
var _20=_1a[0].lastIndexOf(","),_21,_22;
if(_20!=-1){
_21=_1a[0].length-_20-1;
var _23=_1a[0].substr(0,_20);
_20=_23.lastIndexOf(",");
if(_20!=-1){
_22=_23.length-_20-1;
}
}
var _24=[];
for(var _25=_1d[0];_25;){
var off=_25.length-_21;
_24.push((off>0)?_25.substr(off):_25);
_25=(off>0)?_25.slice(0,off):"";
if(_22){
_21=_22;
delete _22;
}
}
_1d[0]=_24.reverse().join(_19.group||",");
return _1d.join(_19.decimal||".");
};
_1.number.regexp=function(_26){
return _1.number._parseInfo(_26).regexp;
};
_1.number._parseInfo=function(_27){
_27=_27||{};
var _28=_1.i18n.normalizeLocale(_27.locale),_29=_1.i18n.getLocalization("dojo.cldr","number",_28),_2a=_27.pattern||_29[(_27.type||"decimal")+"Format"],_2b=_29.group,_2c=_29.decimal,_2d=1;
if(_2a.indexOf("%")!=-1){
_2d/=100;
}else{
if(_2a.indexOf("‰")!=-1){
_2d/=1000;
}else{
var _2e=_2a.indexOf("¤")!=-1;
if(_2e){
_2b=_29.currencyGroup||_2b;
_2c=_29.currencyDecimal||_2c;
}
}
}
var _2f=_2a.split(";");
if(_2f.length==1){
_2f.push("-"+_2f[0]);
}
var re=_1.regexp.buildGroupRE(_2f,function(_30){
_30="(?:"+_1.regexp.escapeString(_30,".")+")";
return _30.replace(_1.number._numberPatternRE,function(_31){
var _32={signed:false,separator:_27.strict?_2b:[_2b,""],fractional:_27.fractional,decimal:_2c,exponent:false},_33=_31.split("."),_34=_27.places;
if(_33.length==1&&_2d!=1){
_33[1]="###";
}
if(_33.length==1||_34===0){
_32.fractional=false;
}else{
if(_34===undefined){
_34=_27.pattern?_33[1].lastIndexOf("0")+1:Infinity;
}
if(_34&&_27.fractional==undefined){
_32.fractional=true;
}
if(!_27.places&&(_34<_33[1].length)){
_34+=","+_33[1].length;
}
_32.places=_34;
}
var _35=_33[0].split(",");
if(_35.length>1){
_32.groupSize=_35.pop().length;
if(_35.length>1){
_32.groupSize2=_35.pop().length;
}
}
return "("+_1.number._realNumberRegexp(_32)+")";
});
},true);
if(_2e){
re=re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g,function(_36,_37,_38,_39){
var _3a=["symbol","currency","displayName"][_38.length-1],_3b=_1.regexp.escapeString(_27[_3a]||_27.currency||"");
_37=_37?"[\\s\\xa0]":"";
_39=_39?"[\\s\\xa0]":"";
if(!_27.strict){
if(_37){
_37+="*";
}
if(_39){
_39+="*";
}
return "(?:"+_37+_3b+_39+")?";
}
return _37+_3b+_39;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:_2b,decimal:_2c,factor:_2d};
};
_1.number.parse=function(_3c,_3d){
var _3e=_1.number._parseInfo(_3d),_3f=(new RegExp("^"+_3e.regexp+"$")).exec(_3c);
if(!_3f){
return NaN;
}
var _40=_3f[1];
if(!_3f[1]){
if(!_3f[2]){
return NaN;
}
_40=_3f[2];
_3e.factor*=-1;
}
_40=_40.replace(new RegExp("["+_3e.group+"\\s\\xa0"+"]","g"),"").replace(_3e.decimal,".");
return _40*_3e.factor;
};
_1.number._realNumberRegexp=function(_41){
_41=_41||{};
if(!("places" in _41)){
_41.places=Infinity;
}
if(typeof _41.decimal!="string"){
_41.decimal=".";
}
if(!("fractional" in _41)||/^0/.test(_41.places)){
_41.fractional=[true,false];
}
if(!("exponent" in _41)){
_41.exponent=[true,false];
}
if(!("eSigned" in _41)){
_41.eSigned=[true,false];
}
var _42=_1.number._integerRegexp(_41),_43=_1.regexp.buildGroupRE(_41.fractional,function(q){
var re="";
if(q&&(_41.places!==0)){
re="\\"+_41.decimal;
if(_41.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_41.places+"}";
}
}
return re;
},true);
var _44=_1.regexp.buildGroupRE(_41.exponent,function(q){
if(q){
return "([eE]"+_1.number._integerRegexp({signed:_41.eSigned})+")";
}
return "";
});
var _45=_42+_43;
if(_43){
_45="(?:(?:"+_45+")|(?:"+_43+"))";
}
return _45+_44;
};
_1.number._integerRegexp=function(_46){
_46=_46||{};
if(!("signed" in _46)){
_46.signed=[true,false];
}
if(!("separator" in _46)){
_46.separator="";
}else{
if(!("groupSize" in _46)){
_46.groupSize=3;
}
}
var _47=_1.regexp.buildGroupRE(_46.signed,function(q){
return q?"[-+]":"";
},true);
var _48=_1.regexp.buildGroupRE(_46.separator,function(sep){
if(!sep){
return "(?:\\d+)";
}
sep=_1.regexp.escapeString(sep);
if(sep==" "){
sep="\\s";
}else{
if(sep==" "){
sep="\\s\\xa0";
}
}
var grp=_46.groupSize,_49=_46.groupSize2;
if(_49){
var _4a="(?:0|[1-9]\\d{0,"+(_49-1)+"}(?:["+sep+"]\\d{"+_49+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-_49)>0)?"(?:"+_4a+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_4a;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _47+_48;
};
return _1.number;
});
