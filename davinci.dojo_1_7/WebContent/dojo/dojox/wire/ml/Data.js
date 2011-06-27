/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/ml/Data",["dojo","dijit","dojox","dijit/_Widget","dijit/_Container","dojox/wire/ml/util"],function(_1,_2,_3){
_1.getObject("dojox.wire.ml.Data",1);
_1.declare("dojox.wire.ml.Data",[_2._Widget,_2._Container],{startup:function(){
this._initializeProperties();
},_initializeProperties:function(_4){
if(!this._properties||_4){
this._properties={};
}
var _5=this.getChildren();
for(var i in _5){
var _6=_5[i];
if((_6 instanceof _3.wire.ml.DataProperty)&&_6.name){
this.setPropertyValue(_6.name,_6.getValue());
}
}
},getPropertyValue:function(_7){
return this._properties[_7];
},setPropertyValue:function(_8,_9){
this._properties[_8]=_9;
}});
_1.declare("dojox.wire.ml.DataProperty",[_2._Widget,_2._Container],{name:"",type:"",value:"",_getValueAttr:function(){
return this.getValue();
},getValue:function(){
var _a=this.value;
if(this.type){
if(this.type=="number"){
_a=parseInt(_a);
}else{
if(this.type=="boolean"){
_a=(_a=="true");
}else{
if(this.type=="array"){
_a=[];
var _b=this.getChildren();
for(var i in _b){
var _c=_b[i];
if(_c instanceof _3.wire.ml.DataProperty){
_a.push(_c.getValue());
}
}
}else{
if(this.type=="object"){
_a={};
var _b=this.getChildren();
for(var i in _b){
var _c=_b[i];
if((_c instanceof _3.wire.ml.DataProperty)&&_c.name){
_a[_c.name]=_c.getValue();
}
}
}else{
if(this.type=="element"){
_a=new _3.wire.ml.XmlElement(_a);
var _b=this.getChildren();
for(var i in _b){
var _c=_b[i];
if((_c instanceof _3.wire.ml.DataProperty)&&_c.name){
_a.setPropertyValue(_c.name,_c.getValue());
}
}
}
}
}
}
}
}
return _a;
}});
return _1.getObject("dojox.wire.ml.Data");
});
require(["dojox/wire/ml/Data"]);
