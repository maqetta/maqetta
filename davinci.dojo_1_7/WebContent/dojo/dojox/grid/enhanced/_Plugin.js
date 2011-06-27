/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/_Plugin",["dojo","dojox","../EnhancedGrid"],function(_1,_2){
_1.declare("dojox.grid.enhanced._Plugin",null,{name:"plugin",grid:null,option:{},_connects:[],_subscribes:[],privates:{},constructor:function(_3,_4){
this.grid=_3;
this.option=_4;
this._connects=[];
this._subscribes=[];
this.privates=_1.mixin({},_2.grid.enhanced._Plugin.prototype);
this.init();
},init:function(){
},onPreInit:function(){
},onPostInit:function(){
},onStartUp:function(){
},connect:function(_5,_6,_7){
var _8=_1.connect(_5,_6,this,_7);
this._connects.push(_8);
return _8;
},disconnect:function(_9){
_1.some(this._connects,function(_a,i,_b){
if(_a==_9){
_1.disconnect(_9);
_b.splice(i,1);
return true;
}
return false;
});
},subscribe:function(_c,_d){
var _e=_1.subscribe(_c,this,_d);
this._subscribes.push(_e);
return _e;
},unsubscribe:function(_f){
_1.some(this._subscribes,function(_10,i,_11){
if(_10==_f){
_1.unsubscribe(_f);
_11.splice(i,1);
return true;
}
return false;
});
},onSetStore:function(_12){
},destroy:function(){
_1.forEach(this._connects,_1.disconnect);
_1.forEach(this._subscribes,_1.unsubscribe);
delete this._connects;
delete this._subscribes;
delete this.option;
delete this.privates;
}});
return _2.grid.enhanced._Plugin;
});
