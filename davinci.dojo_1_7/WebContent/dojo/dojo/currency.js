/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/currency",["./_base/kernel","./_base/array","./number","./i18n","./i18n!./cldr/nls/currency","./cldr/monetary"],function(_1){
_1.getObject("currency",true,_1);
_1.currency._mixInDefaults=function(_2){
_2=_2||{};
_2.type="currency";
var _3=_1.i18n.getLocalization("dojo.cldr","currency",_2.locale)||{};
var _4=_2.currency;
var _5=_1.cldr.monetary.getData(_4);
_1.forEach(["displayName","symbol","group","decimal"],function(_6){
_5[_6]=_3[_4+"_"+_6];
});
_5.fractional=[true,false];
return _1.mixin(_5,_2);
};
_1.currency.format=function(_7,_8){
return _1.number.format(_7,_1.currency._mixInDefaults(_8));
};
_1.currency.regexp=function(_9){
return _1.number.regexp(_1.currency._mixInDefaults(_9));
};
_1.currency.parse=function(_a,_b){
return _1.number.parse(_a,_1.currency._mixInDefaults(_b));
};
return _1.currency;
});
