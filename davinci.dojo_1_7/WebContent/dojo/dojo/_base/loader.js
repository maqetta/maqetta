/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/_base/loader",["./kernel","../has","require"],function(_1,_2,_3){
if(!1){
console.error("cannot load the Dojo v1.x loader with a foreign loader");
return;
}
var _4=_3.getDojoLoader(_1);
_2.add("config-publishRequireResult",1,0,0);
_1.require=function(_5,_6){
var _7=_4(_5);
if(!_6&&!_7){
}
if(_2("config-publishRequireResult")&&!_1.exists(_5)&&_7!==undefined){
_1.setObject(_5,_7);
}
return _7;
};
_1.loadInit=function(f){
f();
};
_1.registerModulePath=function(_8,_9){
var _a={};
_a[_8.replace(/\./g,"/")]=_9;
_3({paths:_a});
};
_1.platformRequire=function(_b){
var _c=_b.common||[];
var _d=_c.concat(_b[_1._name]||_b["default"]||[]);
for(var x=0;x<_d.length;x++){
var _e=_d[x];
if(_e.constructor==Array){
_1.require.apply(_1,_e);
}else{
_1.require(_e);
}
}
};
_1.requireIf=_1.requireAfterIf=function(_f,_10,_11){
if(_f){
_1.require(_10,_11);
}
};
_1.requireLocalization=function(_12,_13,_14){
_3(["../i18n"],function(_15){
_15.getLocalization(_12,_13,_14);
});
};
_1._getText=_3.getText;
});
