/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/Stateful",["./_base/kernel","./_base/declare","./_base/array"],function(_1,_2){
return _1.declare("dojo.Stateful",null,{postscript:function(_3){
if(_3){
_1.mixin(this,_3);
}
},get:function(_4){
return this[_4];
},set:function(_5,_6){
if(typeof _5==="object"){
for(var x in _5){
this.set(x,_5[x]);
}
return this;
}
var _7=this[_5];
this[_5]=_6;
if(this._watchCallbacks){
this._watchCallbacks(_5,_7,_6);
}
return this;
},watch:function(_8,_9){
var _a=this._watchCallbacks;
if(!_a){
var _b=this;
_a=this._watchCallbacks=function(_c,_d,_e,_f){
var _10=function(_11){
if(_11){
_11=_11.slice();
for(var i=0,l=_11.length;i<l;i++){
try{
_11[i].call(_b,_c,_d,_e);
}
catch(e){
console.error(e);
}
}
}
};
_10(_a["_"+_c]);
if(!_f){
_10(_a["*"]);
}
};
}
if(!_9&&typeof _8==="function"){
_9=_8;
_8="*";
}else{
_8="_"+_8;
}
var _12=_a[_8];
if(typeof _12!=="object"){
_12=_a[_8]=[];
}
_12.push(_9);
return {unwatch:function(){
_12.splice(_1.indexOf(_12,_9),1);
}};
}});
});
