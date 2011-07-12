/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/uacss",["./_base/kernel","./dom-geometry","./_base/lang","./ready","./_base/sniff","./_base/window"],function(_1){
var _2=_1.doc.documentElement,ie=_1.isIE,_3=_1.isOpera,_4=Math.floor,ff=_1.isFF,_5=_1.boxModel.replace(/-/,""),_6={"dj_ie":ie,"dj_ie6":_4(ie)==6,"dj_ie7":_4(ie)==7,"dj_ie8":_4(ie)==8,"dj_ie9":_4(ie)==9,"dj_quirks":_1.isQuirks,"dj_iequirks":ie&&_1.isQuirks,"dj_opera":_3,"dj_khtml":_1.isKhtml,"dj_webkit":_1.isWebKit,"dj_safari":_1.isSafari,"dj_chrome":_1.isChrome,"dj_gecko":_1.isMozilla,"dj_ff3":_4(ff)==3};
_6["dj_"+_5]=true;
var _7="";
for(var _8 in _6){
if(_6[_8]){
_7+=_8+" ";
}
}
_2.className=_1.trim(_2.className+" "+_7);
_1.ready(90,function(){
if(!_1._isBodyLtr()){
var _9="dj_rtl dijitRtl "+_7.replace(/ /g,"-rtl ");
_2.className=_1.trim(_2.className+" "+_9+"dj_rtl dijitRtl "+_7.replace(/ /g,"-rtl "));
}
});
return _1;
});
