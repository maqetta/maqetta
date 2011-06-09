/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/_base/window",["./kernel"],function(_1){
_1.doc=window["document"]||null;
_1.body=function(){
return _1.doc.body||_1.doc.getElementsByTagName("body")[0];
};
_1.setContext=function(_2,_3){
_1.global=_2;
_1.doc=_3;
};
_1.withGlobal=function(_4,_5,_6,_7){
var _8=_1.global;
try{
_1.global=_4;
return _1.withDoc.call(null,_4.document,_5,_6,_7);
}
finally{
_1.global=_8;
}
};
_1.withDoc=function(_9,_a,_b,_c){
var _d=_1.doc,_e=_1._bodyLtr,_f=_1.isQuirks;
try{
_1.doc=_9;
delete _1._bodyLtr;
_1.isQuirks=_1.doc.compatMode=="BackCompat";
if(_b&&typeof _a=="string"){
_a=_b[_a];
}
return _a.apply(_b,_c||[]);
}
finally{
_1.doc=_d;
delete _1._bodyLtr;
if(_e!==undefined){
_1._bodyLtr=_e;
}
_1.isQuirks=_f;
}
};
return _1;
});
