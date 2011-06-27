/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/Context",["dojo/_base/kernel","dojo/_base/lang","./_base"],function(_1,_2,dd){
dojox.dtl.Context=_1.extend(function(_3){
this._this={};
dd._Context.call(this,_3);
},dd._Context.prototype,{getKeys:function(){
var _4=[];
for(var _5 in this){
if(this.hasOwnProperty(_5)&&_5!="_this"){
_4.push(_5);
}
}
return _4;
},extend:function(_6){
return _1.delegate(this,_6);
},filter:function(_7){
var _8=new dd.Context();
var _9=[];
var i,_a;
if(_7 instanceof dd.Context){
_9=_7.getKeys();
}else{
if(typeof _7=="object"){
for(var _b in _7){
_9.push(_b);
}
}else{
for(i=0;_a=arguments[i];i++){
if(typeof _a=="string"){
_9.push(_a);
}
}
}
}
for(i=0,_b;_b=_9[i];i++){
_8[_b]=this[_b];
}
return _8;
},setThis:function(_c){
this._this=_c;
},getThis:function(){
return this._this;
},hasKey:function(_d){
if(this._getter){
var _e=this._getter(_d);
if(typeof _e!="undefined"){
return true;
}
}
if(typeof this[_d]!="undefined"){
return true;
}
return false;
}});
return dojox.dtl.Context;
});
