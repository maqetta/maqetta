/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/ml/DataStore",["dojo","dijit","dojox","dijit/_Widget","dojox/wire/_base"],function(_1,_2,_3){
_1.getObject("dojox.wire.ml.DataStore",1);
_1.declare("dojox.wire.ml.DataStore",_2._Widget,{storeClass:"",postCreate:function(){
this.store=this._createStore();
},_createStore:function(){
if(!this.storeClass){
return null;
}
var _4=_3.wire._getClass(this.storeClass);
if(!_4){
return null;
}
var _5={};
var _6=this.domNode.attributes;
for(var i=0;i<_6.length;i++){
var a=_6.item(i);
if(a.specified&&!this[a.nodeName]){
_5[a.nodeName]=a.nodeValue;
}
}
return new _4(_5);
},getFeatures:function(){
return this.store.getFeatures();
},fetch:function(_7){
return this.store.fetch(_7);
},save:function(_8){
this.store.save(_8);
},newItem:function(_9){
return this.store.newItem(_9);
},deleteItem:function(_a){
return this.store.deleteItem(_a);
},revert:function(){
return this.store.revert();
}});
return _1.getObject("dojox.wire.ml.DataStore");
});
require(["dojox/wire/ml/DataStore"]);
