/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/loader",["./kernel","../has","require","./json"],function(_1,_2,_3,_4){
if(!1){
console.error("cannot load the Dojo v1.x loader with a foreign loader");
return 0;
}
var _5=_3.getDojoLoader(_1,_3);
_2.add("config-publishRequireResult",1,0,0);
_1.require=function(_6,_7){
var _8=_5(_6);
if(!_7&&!_8){
}
if(_2("config-publishRequireResult")&&!_1.exists(_6)&&_8!==undefined){
_1.setObject(_6,_8);
}
return _8;
};
_1.loadInit=function(f){
f();
};
_1.registerModulePath=function(_9,_a){
var _b={};
_b[_9.replace(/\./g,"/")]=_a;
_3({paths:_b});
};
_1.platformRequire=function(_c){
var _d=_c.common||[];
var _e=_d.concat(_c[_1._name]||_c["default"]||[]);
for(var x=0;x<_e.length;x++){
var _f=_e[x];
if(_f.constructor==Array){
_1.require.apply(_1,_f);
}else{
_1.require(_f);
}
}
};
_1.requireIf=_1.requireAfterIf=function(_10,_11,_12){
if(_10){
_1.require(_11,_12);
}
};
_1.requireLocalization=function(_13,_14,_15){
_3(["../i18n"],function(_16){
_16.getLocalization(_13,_14,_15);
});
};
_1._getText=_3.getText;
return _1;
});
