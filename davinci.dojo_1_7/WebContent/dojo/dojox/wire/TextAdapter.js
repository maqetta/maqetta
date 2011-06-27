/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/TextAdapter",["dojo","dijit","dojox","dojox/wire/CompositeWire"],function(_1,_2,_3){
_1.getObject("dojox.wire.TextAdapter",1);
_1.declare("dojox.wire.TextAdapter",_3.wire.CompositeWire,{_wireClass:"dojox.wire.TextAdapter",constructor:function(_4){
this._initializeChildren(this.segments);
if(!this.delimiter){
this.delimiter="";
}
},_getValue:function(_5){
if(!_5||!this.segments){
return _5;
}
var _6="";
for(var i in this.segments){
var _7=this.segments[i].getValue(_5);
_6=this._addSegment(_6,_7);
}
return _6;
},_setValue:function(_8,_9){
throw new Error("Unsupported API: "+this._wireClass+"._setValue");
},_addSegment:function(_a,_b){
if(!_b){
return _a;
}else{
if(!_a){
return _b;
}else{
return _a+this.delimiter+_b;
}
}
}});
return _1.getObject("dojox.wire.TextAdapter");
});
require(["dojox/wire/TextAdapter"]);
