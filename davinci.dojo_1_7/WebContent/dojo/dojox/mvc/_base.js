/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/lang","./StatefulModel","./Bind","./_DataBindingMixin","./_patches"],function(_1,_2,_3){
_1.experimental("dojox.mvc");
var _4=_1.getObject("dojox.mvc",true);
_4.newStatefulModel=function(_5){
if(_5.data){
return new _3({data:_5.data});
}else{
if(_5.store&&typeof _2.isFunction(_5.store.query)){
var _6;
var _7=_5.store.query(_5.query);
if(_7.then){
return (_7.then(function(_8){
_6=new _3({data:_8});
_6.store=_5.store;
return _6;
}));
}else{
_6=new _3({data:_7});
_6.store=_5.store;
return _6;
}
}
}
};
return _4;
});
