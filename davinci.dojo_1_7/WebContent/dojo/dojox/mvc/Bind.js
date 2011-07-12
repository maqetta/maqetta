/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/Bind",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array"],function(_1,_2,_3){
var _4=_1.getObject("dojox.mvc",true);
return _1.mixin(_4,{bind:function(_5,_6,_7,_8,_9,_a){
var _b;
return _5.watch(_6,function(_c,_d,_e){
_b=_2.isFunction(_9)?_9(_e):_e;
if(!_a||_b!=_7.get(_8)){
_7.set(_8,_b);
}
});
},bindInputs:function(_f,_10){
var _11=[];
_3.forEach(_f,function(h){
_11.push(h.watch("value",_10));
});
return _11;
}});
});
