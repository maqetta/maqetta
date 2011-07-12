/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/ready",["./_base/kernel","./has","require","./domReady","./_base/lang"],function(_1,_2,_3,_4,_5){
var _6=0,_7,_8=[],_9=0,_a=function(){
if(_6&&!_9&&_8.length){
_9=1;
var f=_8.shift();
if(0){
try{
f();
}
catch(e){
if(!_3.error("loader/onLoad",[e])){
throw e;
}
}
finally{
_9=0;
}
}else{
f();
}
_9=0;
if(_8.length){
_7(_a);
}
}
};
if(1){
_3.on("idle",_a);
_7=function(){
if(_3.idle()){
_a();
}
};
}else{
_7=function(){
_3.ready(_a);
};
}
var _b=_1.ready=_1.addOnLoad=function(_c,_d,_e){
var _f=_5._toArray(arguments);
if(typeof _c!="number"){
_e=_d;
_d=_c;
_c=1000;
}else{
_f.shift();
}
_e=_e?_5.hitch.apply(_1,_f):function(){
_d();
};
_e.priority=_c;
for(var i=0;i<_8.length&&_c>=_8[i].priority;i++){
}
_8.splice(i,0,_e);
_7();
};
true||_2.add("dojo-config-addOnLoad",1);
if(1){
var dca=_1.config.addOnLoad;
if(dca){
_b[(_5.isArray(dca)?"apply":"call")](_1,dca);
}
}
_4(function(){
_6=1;
_1._postLoad=_1.config.afterOnLoad=true;
if(_8.length){
_7(_a);
}
});
if(1&&_1.config.parseOnLoad&&!_1.isAsync){
_b(99,function(){
if(!_1.parser){
_1.deprecated("Add explicit require(['dojo/parser']);","","2.0");
_3(["dojo/parser"]);
}
});
}
return _b;
});
