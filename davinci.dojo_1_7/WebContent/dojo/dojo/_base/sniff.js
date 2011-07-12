/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/sniff",["./kernel","../has"],function(_1,_2){
if(!1){
return _1;
}
var n=navigator,_3=n.userAgent,_4=n.appVersion,tv=parseFloat(_4),_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_10,_11,_12;
_1.isBrowser=true,_1._name="browser";
if(_3.indexOf("Opera")>=0){
_5=tv;
if(_5>=9.8){
_5=parseFloat(_3.split("Version/")[1])||tv;
}
}
if(_3.indexOf("AdobeAIR")>=0){
_6=1;
}
_7=(_4.indexOf("Konqueror")>=0)?tv:0;
_8=parseFloat(_3.split("WebKit/")[1])||undefined;
_9=parseFloat(_3.split("Chrome/")[1])||undefined;
_a=_4.indexOf("Macintosh")>=0;
_11=/iPhone|iPod|iPad/.test(_3);
_12=typeof opera!="undefined"&&opera.wiiremote;
var _13=Math.max(_4.indexOf("WebKit"),_4.indexOf("Safari"),0);
if(_13&&!_9){
_b=parseFloat(_4.split("Version/")[1]);
if(!_b||parseFloat(_4.substr(_13+7))<=419.3){
_b=2;
}
}
if(!_2("dojo-webkit")){
if(_3.indexOf("Gecko")>=0&&!_7&&!_8){
_c=_d=tv;
}
if(_d){
_f=parseFloat(_3.split("Firefox/")[1]||_3.split("Minefield/")[1])||undefined;
}
if(document.all&&!_5){
_e=parseFloat(_4.split("MSIE ")[1])||undefined;
var _14=document.documentMode;
if(_14&&_14!=5&&Math.floor(_e)!=_14){
_e=_14;
}
}
if(_e&&window.location.protocol==="file:"){
_1.config.ieForceActiveXXhr=true;
}
}
_1.locale=_1.locale||(_e?n.userLanguage:n.language).toLowerCase();
_10=document.compatMode=="BackCompat";
_2.add("opera",_1.isOpera=_5);
_2.add("air",_1.isAIR=_6);
_2.add("khtml",_1.isKhtml=_7);
_2.add("webKit",_1.isWebKit=_8);
_2.add("chrome",_1.isChrome=_9);
_2.add("mac",_1.isMac=_a);
_2.add("safari",_1.isSafari=_b);
_2.add("mozilla",_1.isMozilla=_1.isMoz=_c);
_2.add("ie",_1.isIE=_e);
_2.add("ff",_1.isFF=_f);
_2.add("quirks",_1.isQuirks=_10);
_2.add("ios",_1.isIos=_11);
_1._isDocumentOk=function(_15){
var _16=_15.status||0;
return (_16>=200&&_16<300)||_16==304||_16==1223||!_16;
};
_2.add("vml",_e);
if(_2("vml")){
try{
(function(){
document.namespaces.add("v","urn:schemas-microsoft-com:vml");
var _17=["*","group","roundrect","oval","shape","rect","imagedata","path","textpath","text"],i=0,l=1,s=document.createStyleSheet();
if(_e>=8){
i=1;
l=_17.length;
}
for(;i<l;++i){
s.addRule("v\\:"+_17[i],"behavior:url(#default#VML); display:inline-block");
}
})();
}
catch(e){
}
}
return _1;
});
