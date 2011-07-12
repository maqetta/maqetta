/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/window",["./kernel"],function(_1){
_1.doc=window["document"]||null;
_1.body=function(){
return _1.doc.body||_1.doc.getElementsByTagName("body")[0];
};
_1.setContext=function(_2,_3){
_1.global=_4.global=_2;
_1.doc=_4.doc=_3;
};
_1.withGlobal=function(_5,_6,_7,_8){
var _9=_1.global;
try{
_1.global=_4.global=_5;
return _1.withDoc.call(null,_5.document,_6,_7,_8);
}
finally{
_1.global=_4.global=_9;
}
};
_1.withDoc=function(_a,_b,_c,_d){
var _e=_1.doc,_f=_1._bodyLtr,_10=_1.isQuirks;
try{
_1.doc=_4.doc=_a;
delete _1._bodyLtr;
_1.isQuirks=_1.doc.compatMode=="BackCompat";
if(_c&&typeof _b=="string"){
_b=_c[_b];
}
return _b.apply(_c,_d||[]);
}
finally{
_1.doc=_4.doc=_e;
delete _1._bodyLtr;
if(_f!==undefined){
_1._bodyLtr=_f;
}
_1.isQuirks=_10;
}
};
var _4={global:_1.global,doc:_1.doc,body:_1.body,setContext:_1.setContext,withGlobal:_1.withGlobal,withDoc:_1.withDoc};
return _4;
});
