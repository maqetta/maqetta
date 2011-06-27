/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/behavior",["./main"],function(_1){
_1.behavior=new function(){
function _2(_3,_4){
if(!_3[_4]){
_3[_4]=[];
}
return _3[_4];
};
var _5=0;
function _6(_7,_8,_9){
var _a={};
for(var x in _7){
if(typeof _a[x]=="undefined"){
if(!_9){
_8(_7[x],x);
}else{
_9.call(_8,_7[x],x);
}
}
}
};
this._behaviors={};
this.add=function(_b){
_6(_b,this,function(_c,_d){
var _e=_2(this._behaviors,_d);
if(typeof _e["id"]!="number"){
_e.id=_5++;
}
var _f=[];
_e.push(_f);
if((_1.isString(_c))||(_1.isFunction(_c))){
_c={found:_c};
}
_6(_c,function(_10,_11){
_2(_f,_11).push(_10);
});
});
};
var _12=function(_13,_14,_15){
if(_1.isString(_14)){
if(_15=="found"){
_1.publish(_14,[_13]);
}else{
_1.connect(_13,_15,function(){
_1.publish(_14,arguments);
});
}
}else{
if(_1.isFunction(_14)){
if(_15=="found"){
_14(_13);
}else{
_1.connect(_13,_15,_14);
}
}
}
};
this.apply=function(){
_6(this._behaviors,function(_16,id){
_1.query(id).forEach(function(_17){
var _18=0;
var bid="_dj_behavior_"+_16.id;
if(typeof _17[bid]=="number"){
_18=_17[bid];
if(_18==(_16.length)){
return;
}
}
for(var x=_18,_19;_19=_16[x];x++){
_6(_19,function(_1a,_1b){
if(_1.isArray(_1a)){
_1.forEach(_1a,function(_1c){
_12(_17,_1c,_1b);
});
}
});
}
_17[bid]=_16.length;
});
});
};
};
_1.ready(_1.behavior,"apply");
return _1.behavior;
});
