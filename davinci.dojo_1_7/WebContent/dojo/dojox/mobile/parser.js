/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/parser",["dojo/ready"],function(_1){
dojo.getObject("mobile",true,dojox);
dojox.mobile.parser=new function(){
this.instantiate=function(_2,_3,_4){
_3=_3||{};
_4=_4||{};
var i,ws=[];
if(_2){
for(i=0;i<_2.length;i++){
var n=_2[i];
var _5=dojo.getObject(n.getAttribute("dojoType")||n.getAttribute("data-dojo-type"));
var _6=_5.prototype;
var _7={},_8,v,t;
dojo._mixin(_7,eval("({"+(n.getAttribute("data-dojo-props")||"")+"})"));
dojo._mixin(_7,_4.defaults);
dojo._mixin(_7,_3);
for(_8 in _6){
v=n.getAttributeNode(_8);
v=v&&v.nodeValue;
t=typeof _6[_8];
if(!v&&(t!=="boolean"||v!=="")){
continue;
}
if(t==="string"){
_7[_8]=v;
}else{
if(t==="number"){
_7[_8]=v-0;
}else{
if(t==="boolean"){
_7[_8]=(v!=="false");
}else{
if(t==="object"){
_7[_8]=eval("("+v+")");
}
}
}
}
}
_7["class"]=n.className;
_7.style=n.style&&n.style.cssText;
v=n.getAttribute("data-dojo-attach-point");
if(v){
_7.dojoAttachPoint=v;
}
v=n.getAttribute("data-dojo-attach-event");
if(v){
_7.dojoAttachEvent=v;
}
var _9=new _5(_7,n);
ws.push(_9);
var _a=n.getAttribute("jsId")||n.getAttribute("data-dojo-id");
if(_a){
dojo.setObject(_a,_9);
}
}
for(i=0;i<ws.length;i++){
var w=ws[i];
!_4.noStart&&w.startup&&!w._started&&(!w.getParent||!w.getParent())&&w.startup();
}
}
return ws;
};
this.parse=function(_b,_c){
if(!_b){
_b=dojo.body();
}else{
if(!_c&&_b.rootNode){
_c=_b;
_b=_b.rootNode;
}
}
var _d=_b.getElementsByTagName("*");
var i,_e=[];
for(i=0;i<_d.length;i++){
var n=_d[i];
if(n.getAttribute("dojoType")||n.getAttribute("data-dojo-type")){
_e.push(n);
}
}
var _f=_c&&_c.template?{template:true}:null;
return this.instantiate(_e,_f,_c);
};
}();
if(dojo.config.parseOnLoad){
dojo.ready(100,dojox.mobile.parser,"parse");
}
dojo.parser=dojox.mobile.parser;
return dojox.mobile.parser;
});
