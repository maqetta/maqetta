/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_TemplatedMixin",["dojo/_base/kernel",".","dojo/touch","./_WidgetBase","dojo/string","dojo/cache","dojo/_base/array","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window","dojo/text"],function(_1,_2,_3){
_1.declare("dijit._TemplatedMixin",null,{templateString:null,templatePath:null,_skipNodeCache:false,_earlyTemplatedStartup:false,constructor:function(){
this._attachPoints=[];
this._attachEvents=[];
},_stringRepl:function(_4){
var _5=this.declaredClass,_6=this;
return _1.string.substitute(_4,this,function(_7,_8){
if(_8.charAt(0)=="!"){
_7=_1.getObject(_8.substr(1),false,_6);
}
if(typeof _7=="undefined"){
throw new Error(_5+" template:"+_8);
}
if(_7==null){
return "";
}
return _8.charAt(0)=="!"?_7:_7.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
if(!this.templateString){
this.templateString=_1.cache(this.templatePath,{sanitize:true});
}
var _9=_2._TemplatedMixin.getCachedTemplate(this.templateString,this._skipNodeCache);
var _a;
if(_1.isString(_9)){
_a=_1.toDom(this._stringRepl(_9));
if(_a.nodeType!=1){
throw new Error("Invalid template: "+_9);
}
}else{
_a=_9.cloneNode(true);
}
this.domNode=_a;
this.inherited(arguments);
this._attachTemplateNodes(_a,function(n,p){
return n.getAttribute(p);
});
this._beforeFillContent();
this._fillContent(this.srcNodeRef);
},_beforeFillContent:function(){
},_fillContent:function(_b){
var _c=this.containerNode;
if(_b&&_c){
while(_b.hasChildNodes()){
_c.appendChild(_b.firstChild);
}
}
},_attachTemplateNodes:function(_d,_e){
var _f=_1.isArray(_d)?_d:(_d.all||_d.getElementsByTagName("*"));
var x=_1.isArray(_d)?0:-1;
for(;x<_f.length;x++){
var _10=(x==-1)?_d:_f[x];
if(this.widgetsInTemplate&&(_e(_10,"dojoType")||_e(_10,"data-dojo-type"))){
continue;
}
var _11=_e(_10,"dojoAttachPoint")||_e(_10,"data-dojo-attach-point");
if(_11){
var _12,_13=_11.split(/\s*,\s*/);
while((_12=_13.shift())){
if(_1.isArray(this[_12])){
this[_12].push(_10);
}else{
this[_12]=_10;
}
this._attachPoints.push(_12);
}
}
var _14=_e(_10,"dojoAttachEvent")||_e(_10,"data-dojo-attach-event");
if(_14){
var _15,_16=_14.split(/\s*,\s*/);
var _17=_1.trim;
while((_15=_16.shift())){
if(_15){
var _18=null;
if(_15.indexOf(":")!=-1){
var _19=_15.split(":");
_15=_17(_19[0]);
_18=_17(_19[1]);
}else{
_15=_17(_15);
}
if(!_18){
_18=_15;
}
this._attachEvents.push(this.connect(_10,_3[_15]||_15,_18));
}
}
}
}
},destroyRendering:function(){
_1.forEach(this._attachPoints,function(_1a){
delete this[_1a];
},this);
this._attachPoints=[];
_1.forEach(this._attachEvents,this.disconnect,this);
this._attachEvents=[];
this.inherited(arguments);
}});
_2._TemplatedMixin._templateCache={};
_2._TemplatedMixin.getCachedTemplate=function(_1b,_1c){
var _1d=_2._TemplatedMixin._templateCache;
var key=_1b;
var _1e=_1d[key];
if(_1e){
try{
if(!_1e.ownerDocument||_1e.ownerDocument==_1.doc){
return _1e;
}
}
catch(e){
}
_1.destroy(_1e);
}
_1b=_1.string.trim(_1b);
if(_1c||_1b.match(/\$\{([^\}]+)\}/g)){
return (_1d[key]=_1b);
}else{
var _1f=_1.toDom(_1b);
if(_1f.nodeType!=1){
throw new Error("Invalid template: "+_1b);
}
return (_1d[key]=_1f);
}
};
if(_1.isIE){
_1.addOnWindowUnload(function(){
var _20=_2._TemplatedMixin._templateCache;
for(var key in _20){
var _21=_20[key];
if(typeof _21=="object"){
_1.destroy(_21);
}
delete _20[key];
}
});
}
_1.extend(_2._WidgetBase,{dojoAttachEvent:"",dojoAttachPoint:""});
return _2._TemplatedMixin;
});
