/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/_WidgetBase",["dojo/_base/kernel",".","dojo/aspect","./_base/manager","dojo/Stateful","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/url","dojo/_base/window","dojo/query"],function(_1,_2,_3){
_1.declare("dijit._WidgetBase",_1.Stateful,{id:"",_setIdAttr:"domNode",lang:"",_setLangAttr:"domNode",dir:"",_setDirAttr:"domNode",textDir:"","class":"",_setClassAttr:{node:"domNode",type:"class"},style:"",title:"",tooltip:"",baseClass:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{},_blankGif:(_1.config.blankGif||_1.moduleUrl("dojo","resources/blank.gif")).toString(),postscript:function(_4,_5){
this.create(_4,_5);
},create:function(_6,_7){
this.srcNodeRef=_1.byId(_7);
this._connects=[];
this._supportingWidgets=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_6){
this.params=_6;
_1._mixin(this,_6);
}
this.postMixInProperties();
if(!this.id){
this.id=_2.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
_2.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
var _8=this.srcNodeRef;
if(_8&&_8.parentNode&&this.domNode!==_8){
_8.parentNode.replaceChild(this.domNode,_8);
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
var _9=this.constructor,_a=_9._setterAttrs;
if(!_a){
_a=(_9._setterAttrs=[]);
for(var _b in this.attributeMap){
_a.push(_b);
}
var _c=_9.prototype;
for(var _d in _c){
if(_d in this.attributeMap){
continue;
}
var _e="_set"+_d.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
})+"Attr";
if(_e in _c){
_a.push(_d);
}
}
}
_1.forEach(_a,function(_f){
if(this.params&&_f in this.params){
}else{
if(this[_f]){
this.set(_f,this[_f]);
}
}
},this);
for(var _10 in this.params){
this.set(_10,this[_10]);
}
},postMixInProperties:function(){
},buildRendering:function(){
if(!this.domNode){
this.domNode=this.srcNodeRef||_1.create("div");
}
if(this.baseClass){
var _11=this.baseClass.split(" ");
if(!this.isLeftToRight()){
_11=_11.concat(_1.map(_11,function(_12){
return _12+"Rtl";
}));
}
_1.addClass(this.domNode,_11);
}
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_13){
this._beingDestroyed=true;
this.destroyDescendants(_13);
this.destroy(_13);
},destroy:function(_14){
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
this.destroyRendering(_14);
_2.registry.remove(this.id);
this._destroyed=true;
},destroyRendering:function(_15){
if(this.bgIframe){
this.bgIframe.destroy(_15);
delete this.bgIframe;
}
if(this.domNode){
if(_15){
_1.removeAttr(this.domNode,"widgetId");
}else{
_1.destroy(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_15){
_1.destroy(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_16){
_1.forEach(this.getChildren(),function(_17){
if(_17.destroyRecursive){
_17.destroyRecursive(_16);
}
});
},uninitialize:function(){
return false;
},_setStyleAttr:function(_18){
var _19=this.domNode;
if(_1.isObject(_18)){
_1.style(_19,_18);
}else{
if(_19.style.cssText){
_19.style.cssText+="; "+_18;
}else{
_19.style.cssText=_18;
}
}
this._set("style",_18);
},_attrToDom:function(_1a,_1b,_1c){
_1c=arguments.length>=3?_1c:this.attributeMap[_1a];
_1.forEach(_1.isArray(_1c)?_1c:[_1c],function(_1d){
var _1e=this[_1d.node||_1d||"domNode"];
var _1f=_1d.type||"attribute";
switch(_1f){
case "attribute":
if(_1.isFunction(_1b)){
_1b=_1.hitch(this,_1b);
}
var _20=_1d.attribute?_1d.attribute:(/^on[A-Z][a-zA-Z]*$/.test(_1a)?_1a.toLowerCase():_1a);
_1.attr(_1e,_20,_1b);
break;
case "innerText":
_1e.innerHTML="";
_1e.appendChild(_1.doc.createTextNode(_1b));
break;
case "innerHTML":
_1e.innerHTML=_1b;
break;
case "class":
_1.replaceClass(_1e,_1b,this[_1a]);
break;
}
},this);
},get:function(_21){
var _22=this._getAttrNames(_21);
return this[_22.g]?this[_22.g]():this[_21];
},set:function(_23,_24){
if(typeof _23==="object"){
for(var x in _23){
this.set(x,_23[x]);
}
return this;
}
var _25=this._getAttrNames(_23),_26=this[_25.s];
if(_1.isFunction(_26)){
var _27=_26.apply(this,Array.prototype.slice.call(arguments,1));
}else{
var _28=this.focusNode?"focusNode":"domNode",map=_23 in this.attributeMap?this.attributeMap[_23]:_25.s in this?this[_25.s]:(_23 in this[_28]||/^aria-|^role$/.test(_23))?_28:null;
if(map!=null){
this._attrToDom(_23,_24,map);
}
this._set(_23,_24);
}
return _27||this;
},_attrPairNames:{},_getAttrNames:function(_29){
var apn=this._attrPairNames;
if(apn[_29]){
return apn[_29];
}
var uc=_29.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
});
return (apn[_29]={n:_29+"Node",s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"});
},_set:function(_2a,_2b){
var _2c=this[_2a];
this[_2a]=_2b;
if(this._watchCallbacks&&this._created&&_2b!==_2c){
this._watchCallbacks(_2a,_2c,_2b);
}
},on:function(_2d,_2e){
_2d=_2d.replace(/^on/,"");
return _3.after(this,"on"+_2d.charAt(0).toUpperCase()+_2d.substr(1),_2e,true);
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
return this.containerNode?_1.query("[widgetId]",this.containerNode).map(_2.byNode):[];
},getChildren:function(){
return this.containerNode?_2.findWidgets(this.containerNode):[];
},connect:function(obj,_2f,_30){
var _31=_1.connect(obj,_2f,this,_30);
this._connects.push(_31);
return _31;
},disconnect:function(_32){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_32){
_32.remove();
this._connects.splice(i,1);
return;
}
}
},subscribe:function(_33,_34){
var _35=_1.subscribe(_33,this,_34);
this._connects.push(_35);
return _35;
},unsubscribe:function(_36){
this.disconnect(_36);
},isLeftToRight:function(){
return this.dir?(this.dir=="ltr"):_1._isBodyLtr();
},isFocusable:function(){
return this.focus&&(_1.style(this.domNode,"display")!="none");
},placeAt:function(_37,_38){
if(_37.declaredClass&&_37.addChild){
_37.addChild(this,_38);
}else{
_1.place(this.domNode,_37,_38);
}
return this;
},getTextDir:function(_39,_3a){
return _3a;
},applyTextDir:function(_3b,_3c){
}});
return _2._WidgetBase;
});
