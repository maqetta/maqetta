/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/has",["require"],function(_1){
var _2=_1.has||function(){
};
if(!1){
var _3=typeof window!="undefined"&&typeof location!="undefined"&&typeof document!="undefined"&&window.location==location&&window.document==document,_4=this,_5=_3&&document,_6=_5&&_5.createElement("DiV"),_7={};
_2=function(_8){
return _7[_8]=typeof _7[_8]=="function"?_7[_8](_4,_5,_6):_7[_8];
};
_2.cache=_7;
_2.add=function(_9,_a,_b,_c){
(typeof _7[_9]=="undefined"||_c)&&(_7[_9]=_a);
return _b&&_2(_9);
};
true||_2.add("host-browser",_3);
true||_2.add("dom",_3);
true||_2.add("dojo-dom-ready-api",1);
true||_2.add("dojo-sniff",1);
}
if(1){
var _d=navigator.userAgent;
_2.add("dom-addeventlistener",!!document.addEventListener);
_2.add("touch","ontouchstart" in document);
_2.add("device-width",screen.availWidth||innerWidth);
_2.add("agent-ios",!!_d.match(/iPhone|iP[ao]d/));
_2.add("agent-android",_d.indexOf("android")>1);
}
_2.clearElement=function(_e){
_e.innerHTML="";
return _e;
};
_2.load=function(id,_f,_10){
var _11=id.match(/[\?:]|[^:\?]*/g),i=0,get=function(_12){
var _13=_11[i++];
if(_13==":"){
return undefined;
}else{
if(_11[i++]=="?"){
if(!_12&&_2(_13)){
return get();
}else{
get(true);
return get(_12);
}
}
return _13;
}
};
id=get();
if(id){
_f([id],_10);
}else{
_10();
}
};
return _2;
});
