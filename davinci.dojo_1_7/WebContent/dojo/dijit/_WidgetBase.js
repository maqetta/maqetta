/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/_WidgetBase",["require","dojo/_base/kernel",".","dojo/aspect","./_base/manager","dojo/Stateful","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/window","dojo/query"],function(_1,_2,_3,_4){
_2.declare("dijit._WidgetBase",_2.Stateful,{id:"",_setIdAttr:"domNode",lang:"",_setLangAttr:"domNode",dir:"",_setDirAttr:"domNode",textDir:"","class":"",_setClassAttr:{node:"domNode",type:"class"},style:"",title:"",tooltip:"",baseClass:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{},_blankGif:_2.config.blankGif||_1.toUrl("dojo/resources/blank.gif"),postscript:function(_5,_6){
this.create(_5,_6);
},create:function(_7,_8){
this.srcNodeRef=_2.byId(_8);
this._connects=[];
this._supportingWidgets=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_7){
this.params=_7;
_2._mixin(this,_7);
}
this.postMixInProperties();
if(!this.id){
this.id=_3.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
_3.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
var _9=this.srcNodeRef;
if(_9&&_9.parentNode&&this.domNode!==_9){
_9.parentNode.replaceChild(this.domNode,_9);
}
}
if(this.domNode){
this.domNode.setAttribute("widgetId",this.id);
}
this.postCreate();
if(this.srcNodeRef&&!this.srcNodeRef.parentNode){
delete this.srcNodeRef;
}
this._created=true;
},_applyAttributes:function(){
var _a=this.constructor,_b=_a._setterAttrs;
if(!_b){
_b=(_a._setterAttrs=[]);
for(var _c in this.attributeMap){
_b.push(_c);
}
var _d=_a.prototype;
for(var _e in _d){
if(_e in this.attributeMap){
continue;
}
var _f="_set"+_e.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
})+"Attr";
if(_f in _d){
_b.push(_e);
}
}
}
_2.forEach(_b,function(_10){
if(this.params&&_10 in this.params){
}else{
if(this[_10]){
this.set(_10,this[_10]);
}
}
},this);
for(var _11 in this.params){
this.set(_11,this[_11]);
}
},postMixInProperties:function(){
},buildRendering:function(){
if(!this.domNode){
this.domNode=this.srcNodeRef||_2.create("div");
}
if(this.baseClass){
var _12=this.baseClass.split(" ");
if(!this.isLeftToRight()){
_12=_12.concat(_2.map(_12,function(_13){
return _13+"Rtl";
}));
}
_2.addClass(this.domNode,_12);
}
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_14){
this._beingDestroyed=true;
this.destroyDescendants(_14);
this.destroy(_14);
},destroy:function(_15){
this._beingDestroyed=true;
this.uninitialize();
var c;
while(c=this._connects.pop()){
c.remove();
}
var w;
while(w=this._supportingWidgets.pop()){
if(w.destroyRecursive){
w.destroyRecursive();
}else{
if(w.destroy){
w.destroy();
}
}
}
this.destroyRendering(_15);
_3.registry.remove(this.id);
this._destroyed=true;
},destroyRendering:function(_16){
if(this.bgIframe){
this.bgIframe.destroy(_16);
delete this.bgIframe;
}
if(this.domNode){
if(_16){
_2.removeAttr(this.domNode,"widgetId");
}else{
_2.destroy(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_16){
_2.destroy(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_17){
_2.forEach(this.getChildren(),function(_18){
if(_18.destroyRecursive){
_18.destroyRecursive(_17);
}
});
},uninitialize:function(){
return false;
},_setStyleAttr:function(_19){
var _1a=this.domNode;
if(_2.isObject(_19)){
_2.style(_1a,_19);
}else{
if(_1a.style.cssText){
_1a.style.cssText+="; "+_19;
}else{
_1a.style.cssText=_19;
}
}
this._set("style",_19);
},_attrToDom:function(_1b,_1c,_1d){
_1d=arguments.length>=3?_1d:this.attributeMap[_1b];
_2.forEach(_2.isArray(_1d)?_1d:[_1d],function(_1e){
var _1f=this[_1e.node||_1e||"domNode"];
var _20=_1e.type||"attribute";
switch(_20){
case "attribute":
if(_2.isFunction(_1c)){
_1c=_2.hitch(this,_1c);
}
var _21=_1e.attribute?_1e.attribute:(/^on[A-Z][a-zA-Z]*$/.test(_1b)?_1b.toLowerCase():_1b);
_2.attr(_1f,_21,_1c);
break;
case "innerText":
_1f.innerHTML="";
_1f.appendChild(_2.doc.createTextNode(_1c));
break;
case "innerHTML":
_1f.innerHTML=_1c;
break;
case "class":
_2.replaceClass(_1f,_1c,this[_1b]);
break;
}
},this);
},get:function(_22){
var _23=this._getAttrNames(_22);
return this[_23.g]?this[_23.g]():this[_22];
},set:function(_24,_25){
if(typeof _24==="object"){
for(var x in _24){
this.set(x,_24[x]);
}
return this;
}
var _26=this._getAttrNames(_24),_27=this[_26.s];
if(_2.isFunction(_27)){
var _28=_27.apply(this,Array.prototype.slice.call(arguments,1));
}else{
var _29=this.focusNode?"focusNode":"domNode",map=_24 in this.attributeMap?this.attributeMap[_24]:_26.s in this?this[_26.s]:(_24 in this[_29]||/^aria-|^role$/.test(_24))?_29:null;
if(map!=null){
this._attrToDom(_24,_25,map);
}
this._set(_24,_25);
}
return _28||this;
},_attrPairNames:{},_getAttrNames:function(_2a){
var apn=this._attrPairNames;
if(apn[_2a]){
return apn[_2a];
}
var uc=_2a.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
});
return (apn[_2a]={n:_2a+"Node",s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"});
},_set:function(_2b,_2c){
var _2d=this[_2b];
this[_2b]=_2c;
if(this._watchCallbacks&&this._created&&_2c!==_2d){
this._watchCallbacks(_2b,_2d,_2c);
}
},on:function(_2e,_2f){
_2e=_2e.replace(/^on/,"");
return _4.after(this,"on"+_2e.charAt(0).toUpperCase()+_2e.substr(1),_2f,true);
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
return this.containerNode?_2.query("[widgetId]",this.containerNode).map(_3.byNode):[];
},getChildren:function(){
return this.containerNode?_3.findWidgets(this.containerNode):[];
},connect:function(obj,_30,_31){
var _32=_2.connect(obj,_30,this,_31);
this._connects.push(_32);
return _32;
},disconnect:function(_33){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_33){
_33.remove();
this._connects.splice(i,1);
return;
}
}
},subscribe:function(_34,_35){
var _36=_2.subscribe(_34,this,_35);
this._connects.push(_36);
return _36;
},unsubscribe:function(_37){
this.disconnect(_37);
},isLeftToRight:function(){
return this.dir?(this.dir=="ltr"):_2._isBodyLtr();
},isFocusable:function(){
return this.focus&&(_2.style(this.domNode,"display")!="none");
},placeAt:function(_38,_39){
if(_38.declaredClass&&_38.addChild){
_38.addChild(this,_39);
}else{
_2.place(this.domNode,_38,_39);
}
return this;
},getTextDir:function(_3a,_3b){
return _3b;
},applyTextDir:function(_3c,_3d){
}});
return _3._WidgetBase;
});
