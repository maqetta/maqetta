/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_Widget",["dojo/_base/kernel",".","./_WidgetBase","./_OnDijitClickMixin","./_FocusMixin","dojo/_base/lang","dojo/_base/connect","dojo/uacss","dijit/hccss","./_base/manager"],function(_1,_2){
_2._connectToDomNode=function(_3){
};
_1.declare("dijit._Widget",[_2._WidgetBase,_2._OnDijitClickMixin,_2._FocusMixin],{onClick:_2._connectToDomNode,onDblClick:_2._connectToDomNode,onKeyDown:_2._connectToDomNode,onKeyPress:_2._connectToDomNode,onKeyUp:_2._connectToDomNode,onMouseDown:_2._connectToDomNode,onMouseMove:_2._connectToDomNode,onMouseOut:_2._connectToDomNode,onMouseOver:_2._connectToDomNode,onMouseLeave:_2._connectToDomNode,onMouseEnter:_2._connectToDomNode,onMouseUp:_2._connectToDomNode,constructor:function(_4){
this._toConnect={};
for(var _5 in _4){
if(this[_5]===_2._connectToDomNode){
this._toConnect[_5]=_4[_5];
delete _4[_5];
}
}
},postCreate:function(){
this.inherited(arguments);
for(var _6 in this._toConnect){
this.on(_6,this._toConnect[_6]);
}
delete this._toConnect;
},on:function(_7,_8){
_7=_7.replace(/^on/,"");
if(this["on"+_7.charAt(0).toUpperCase()+_7.substr(1)]===_2._connectToDomNode){
return _1.connect(this.domNode,_7.toLowerCase(),this,_8);
}else{
return this.inherited(arguments);
}
},_setFocusedAttr:function(_9){
this._focused=_9;
this._set("focused",_9);
},setAttribute:function(_a,_b){
_1.deprecated(this.declaredClass+"::setAttribute(attr, value) is deprecated. Use set() instead.","","2.0");
this.set(_a,_b);
},attr:function(_c,_d){
if(_1.config.isDebug){
var _e=arguments.callee._ach||(arguments.callee._ach={}),_f=(arguments.callee.caller||"unknown caller").toString();
if(!_e[_f]){
_1.deprecated(this.declaredClass+"::attr() is deprecated. Use get() or set() instead, called from "+_f,"","2.0");
_e[_f]=true;
}
}
var _10=arguments.length;
if(_10>=2||typeof _c==="object"){
return this.set.apply(this,arguments);
}else{
return this.get(_c);
}
},_onShow:function(){
this.onShow();
},onShow:function(){
},onHide:function(){
},onClose:function(){
return true;
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _11=["dijit/_base/focus","dijit/_base/place","dijit/_base/popup","dijit/_base/scroll","dijit/_base/typematic","dijit/_base/wai","dijit/_base/window"];
require(_11);
});
}
return _2._Widget;
});
