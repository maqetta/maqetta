/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/model",["dojo","dojox/mvc/StatefulModel"],function(_1){
return function(_2,_3){
var _4={};
if(_3){
_1.mixin(_4,_3);
}
if(_2){
for(var _5 in _2){
if(_5.charAt(0)!=="_"){
var _6=_2[_5].params?_2[_5].params:{};
var _7={"store":_6.store.store,"query":_6.store.query?_6.store.query:{}};
_4[_5]=_1.when(dojox.mvc.newStatefulModel(_7),function(_8){
return _8;
});
}
}
}
return _4;
};
});
