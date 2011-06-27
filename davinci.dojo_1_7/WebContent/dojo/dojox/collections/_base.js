/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/collections/_base",["dojo/_base/kernel","dojo/_base/array"],function(_1,_2){
_1.getObject("collections",true,dojox);
dojox.collections.DictionaryEntry=function(k,v){
this.key=k;
this.value=v;
this.valueOf=function(){
return this.value;
};
this.toString=function(){
return String(this.value);
};
};
dojox.collections.Iterator=function(_3){
var a=_3;
var _4=0;
this.element=a[_4]||null;
this.atEnd=function(){
return (_4>=a.length);
};
this.get=function(){
if(this.atEnd()){
return null;
}
this.element=a[_4++];
return this.element;
};
this.map=function(fn,_5){
return _1.map(a,fn,_5);
};
this.reset=function(){
_4=0;
this.element=a[_4];
};
};
dojox.collections.DictionaryIterator=function(_6){
var a=[];
var _7={};
for(var p in _6){
if(!_7[p]){
a.push(_6[p]);
}
}
var _8=0;
this.element=a[_8]||null;
this.atEnd=function(){
return (_8>=a.length);
};
this.get=function(){
if(this.atEnd()){
return null;
}
this.element=a[_8++];
return this.element;
};
this.map=function(fn,_9){
return _1.map(a,fn,_9);
};
this.reset=function(){
_8=0;
this.element=a[_8];
};
};
return dojox.collections;
});
