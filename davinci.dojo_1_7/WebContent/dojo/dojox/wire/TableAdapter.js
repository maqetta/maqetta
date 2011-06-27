/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/TableAdapter",["dojo","dijit","dojox","dojox/wire/CompositeWire"],function(_1,_2,_3){
_1.getObject("dojox.wire.TableAdapter",1);
_1.declare("dojox.wire.TableAdapter",_3.wire.CompositeWire,{_wireClass:"dojox.wire.TableAdapter",constructor:function(_4){
this._initializeChildren(this.columns);
},_getValue:function(_5){
if(!_5||!this.columns){
return _5;
}
var _6=_5;
if(!_1.isArray(_6)){
_6=[_6];
}
var _7=[];
for(var i in _6){
var _8=this._getRow(_6[i]);
_7.push(_8);
}
return _7;
},_setValue:function(_9,_a){
throw new Error("Unsupported API: "+this._wireClass+"._setValue");
},_getRow:function(_b){
var _c=(_1.isArray(this.columns)?[]:{});
for(var c in this.columns){
_c[c]=this.columns[c].getValue(_b);
}
return _c;
}});
return _1.getObject("dojox.wire.TableAdapter");
});
require(["dojox/wire/TableAdapter"]);
