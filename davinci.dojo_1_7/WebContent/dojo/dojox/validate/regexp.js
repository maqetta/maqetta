/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/regexp"],function(_1,_2){
var _3=_1.getObject("validate.regexp",true,dojox);
_3={ipAddress:function(_4){
_4=(typeof _4=="object")?_4:{};
if(typeof _4.allowDottedDecimal!="boolean"){
_4.allowDottedDecimal=true;
}
if(typeof _4.allowDottedHex!="boolean"){
_4.allowDottedHex=true;
}
if(typeof _4.allowDottedOctal!="boolean"){
_4.allowDottedOctal=true;
}
if(typeof _4.allowDecimal!="boolean"){
_4.allowDecimal=true;
}
if(typeof _4.allowHex!="boolean"){
_4.allowHex=true;
}
if(typeof _4.allowIPv6!="boolean"){
_4.allowIPv6=true;
}
if(typeof _4.allowHybrid!="boolean"){
_4.allowHybrid=true;
}
var _5="((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
var _6="(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]";
var _7="(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]";
var _8="(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|"+"4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])";
var _9="0[xX]0*[\\da-fA-F]{1,8}";
var _a="([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}";
var _b="([\\da-fA-F]{1,4}\\:){6}"+"((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
var a=[];
if(_4.allowDottedDecimal){
a.push(_5);
}
if(_4.allowDottedHex){
a.push(_6);
}
if(_4.allowDottedOctal){
a.push(_7);
}
if(_4.allowDecimal){
a.push(_8);
}
if(_4.allowHex){
a.push(_9);
}
if(_4.allowIPv6){
a.push(_a);
}
if(_4.allowHybrid){
a.push(_b);
}
var _c="";
if(a.length>0){
_c="("+a.join("|")+")";
}
return _c;
},host:function(_d){
_d=(typeof _d=="object")?_d:{};
if(typeof _d.allowIP!="boolean"){
_d.allowIP=true;
}
if(typeof _d.allowLocal!="boolean"){
_d.allowLocal=false;
}
if(typeof _d.allowPort!="boolean"){
_d.allowPort=true;
}
if(typeof _d.allowNamed!="boolean"){
_d.allowNamed=false;
}
var _e="(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)";
var _f="(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)";
var _10=_d.allowPort?"(\\:\\d+)?":"";
var _11="((?:"+_e+"\\.)+"+_f+"\\.?)";
if(_d.allowIP){
_11+="|"+_3.ipAddress(_d);
}
if(_d.allowLocal){
_11+="|localhost";
}
if(_d.allowNamed){
_11+="|^[^-][a-zA-Z0-9_-]*";
}
return "("+_11+")"+_10;
},url:function(_12){
_12=(typeof _12=="object")?_12:{};
if(!("scheme" in _12)){
_12.scheme=[true,false];
}
var _13=_2.buildGroupRE(_12.scheme,function(q){
if(q){
return "(https?|ftps?)\\://";
}
return "";
});
var _14="(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]+(?:\\?[^?#\\s/]*)?(?:#[A-Za-z][\\w.:-]*)?)?)?";
return _13+_3.host(_12)+_14;
},emailAddress:function(_15){
_15=(typeof _15=="object")?_15:{};
if(typeof _15.allowCruft!="boolean"){
_15.allowCruft=false;
}
_15.allowPort=false;
var _16="([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+";
var _17=_16+"@"+_3.host(_15);
if(_15.allowCruft){
_17="<?(mailto\\:)?"+_17+">?";
}
return _17;
},emailAddressList:function(_18){
_18=(typeof _18=="object")?_18:{};
if(typeof _18.listSeparator!="string"){
_18.listSeparator="\\s;,";
}
var _19=_3.emailAddress(_18);
var _1a="("+_19+"\\s*["+_18.listSeparator+"]\\s*)*"+_19+"\\s*["+_18.listSeparator+"]?\\s*";
return _1a;
},numberFormat:function(_1b){
_1b=(typeof _1b=="object")?_1b:{};
if(typeof _1b.format=="undefined"){
_1b.format="###-###-####";
}
var _1c=function(_1d){
return _2.escapeString(_1d,"?").replace(/\?/g,"\\d?").replace(/#/g,"\\d");
};
return _2.buildGroupRE(_1b.format,_1c);
}};
_3.ca={postalCode:function(){
return "([A-Z][0-9][A-Z] [0-9][A-Z][0-9])";
},province:function(){
return "(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)";
}};
_3.us={state:function(_1e){
_1e=(typeof _1e=="object")?_1e:{};
if(typeof _1e.allowTerritories!="boolean"){
_1e.allowTerritories=true;
}
if(typeof _1e.allowMilitary!="boolean"){
_1e.allowMilitary=true;
}
var _1f="AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|"+"NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY";
var _20="AS|FM|GU|MH|MP|PW|PR|VI";
var _21="AA|AE|AP";
if(_1e.allowTerritories){
_1f+="|"+_20;
}
if(_1e.allowMilitary){
_1f+="|"+_21;
}
return "("+_1f+")";
}};
return _3;
});
