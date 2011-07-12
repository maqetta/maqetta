/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_WidgetBase",["require","dojo/_base/kernel",".","dojo/aspect","./_base/manager","dojo/Stateful","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/window","dojo/query"],function(_1,_2,_3,_4){
var _5={};
function _6(_7){
var _8={};
for(var _9 in _7){
_8[_9.toLowerCase()]=true;
}
return _8;
};
_2.declare("dijit._WidgetBase",_2.Stateful,{id:"",_setIdAttr:"domNode",lang:"",_setLangAttr:"domNode",dir:"",_setDirAttr:"domNode",textDir:"","class":"",_setClassAttr:{node:"domNode",type:"class"},style:"",title:"",tooltip:"",baseClass:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{},_blankGif:_2.config.blankGif||_1.toUrl("dojo/resources/blank.gif"),postscript:function(_a,_b){
this.create(_a,_b);
},create:function(_c,_d){
this.srcNodeRef=_2.byId(_d);
this._connects=[];
this._supportingWidgets=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_c){
this.params=_c;
_2._mixin(this,_c);
}
this.postMixInProperties();
if(!this.id){
this.id=_3.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
_3.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
var _e=this.srcNodeRef;
if(_e&&_e.parentNode&&this.domNode!==_e){
_e.parentNode.replaceChild(this.domNode,_e);
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
var _f=this.constructor,_10=_f._setterAttrs;
if(!_10){
_10=(_f._setterAttrs=[]);
for(var _11 in this.attributeMap){
_10.push(_11);
}
var _12=_f.prototype;
for(var _13 in _12){
if(_13 in this.attributeMap){
continue;
}
var _14="_set"+_13.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
})+"Attr";
if(_14 in _12){
_10.push(_13);
}
}
}
_2.forEach(_10,function(_15){
if(this.params&&_15 in this.params){
}else{
if(this[_15]){
this.set(_15,this[_15]);
}
}
},this);
for(var _16 in this.params){
this.set(_16,this[_16]);
}
},postMixInProperties:function(){
},buildRendering:function(){
if(!this.domNode){
this.domNode=this.srcNodeRef||_2.create("div");
}
if(this.baseClass){
var _17=this.baseClass.split(" ");
if(!this.isLeftToRight()){
_17=_17.concat(_2.map(_17,function(_18){
return _18+"Rtl";
}));
}
_2.addClass(this.domNode,_17);
}
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_19){
this._beingDestroyed=true;
this.destroyDescendants(_19);
this.destroy(_19);
},destroy:function(_1a){
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
this.destroyRendering(_1a);
_3.registry.remove(this.id);
this._destroyed=true;
},destroyRendering:function(_1b){
if(this.bgIframe){
this.bgIframe.destroy(_1b);
delete this.bgIframe;
}
if(this.domNode){
if(_1b){
_2.removeAttr(this.domNode,"widgetId");
}else{
_2.destroy(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_1b){
_2.destroy(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_1c){
_2.forEach(this.getChildren(),function(_1d){
if(_1d.destroyRecursive){
_1d.destroyRecursive(_1c);
}
});
},uninitialize:function(){
return false;
},_setStyleAttr:function(_1e){
var _1f=this.domNode;
if(_2.isObject(_1e)){
_2.style(_1f,_1e);
}else{
if(_1f.style.cssText){
_1f.style.cssText+="; "+_1e;
}else{
_1f.style.cssText=_1e;
}
}
this._set("style",_1e);
},_attrToDom:function(_20,_21,_22){
_22=arguments.length>=3?_22:this.attributeMap[_20];
_2.forEach(_2.isArray(_22)?_22:[_22],function(_23){
var _24=this[_23.node||_23||"domNode"];
var _25=_23.type||"attribute";
switch(_25){
case "attribute":
if(_2.isFunction(_21)){
_21=_2.hitch(this,_21);
}
var _26=_23.attribute?_23.attribute:(/^on[A-Z][a-zA-Z]*$/.test(_20)?_20.toLowerCase():_20);
_2.attr(_24,_26,_21);
break;
case "innerText":
_24.innerHTML="";
_24.appendChild(_2.doc.createTextNode(_21));
break;
case "innerHTML":
_24.innerHTML=_21;
break;
case "class":
_2.replaceClass(_24,_21,this[_20]);
break;
}
},this);
},get:function(_27){
var _28=this._getAttrNames(_27);
return this[_28.g]?this[_28.g]():this[_27];
},set:function(_29,_2a){
if(typeof _29==="object"){
for(var x in _29){
this.set(x,_29[x]);
}
return this;
}
var _2b=this._getAttrNames(_29),_2c=this[_2b.s];
if(_2.isFunction(_2c)){
var _2d=_2c.apply(this,Array.prototype.slice.call(arguments,1));
}else{
var _2e=this.focusNode&&!_2.isFunction(this.focusNode)?"focusNode":"domNode",tag=this[_2e].tagName,_2f=_5[tag]||(_5[tag]=_6(this[_2e])),map=_29 in this.attributeMap?this.attributeMap[_29]:_2b.s in this?this[_2b.s]:((_2b.l in _2f&&typeof _2a!="function")||/^aria-|^data-|^role$/.test(_29))?_2e:null;
if(map!=null){
this._attrToDom(_29,_2a,map);
}
this._set(_29,_2a);
}
return _2d||this;
},_attrPairNames:{},_getAttrNames:function(_30){
var apn=this._attrPairNames;
if(apn[_30]){
return apn[_30];
}
var uc=_30.replace(/^[a-z]|-[a-zA-Z]/g,function(c){
return c.charAt(c.length-1).toUpperCase();
});
return (apn[_30]={n:_30+"Node",s:"_set"+uc+"Attr",g:"_get"+uc+"Attr",l:uc.toLowerCase()});
},_set:function(_31,_32){
var _33=this[_31];
this[_31]=_32;
if(this._watchCallbacks&&this._created&&_32!==_33){
this._watchCallbacks(_31,_33,_32);
}
},on:function(_34,_35){
_34=_34.replace(/^on/,"");
return _4.after(this,"on"+_34.charAt(0).toUpperCase()+_34.substr(1),_35,true);
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
return this.containerNode?_2.query("[widgetId]",this.containerNode).map(_3.byNode):[];
},getChildren:function(){
return this.containerNode?_3.findWidgets(this.containerNode):[];
},connect:function(obj,_36,_37){
var _38=_2.connect(obj,_36,this,_37);
this._connects.push(_38);
return _38;
},disconnect:function(_39){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_39){
_39.remove();
this._connects.splice(i,1);
return;
}
}
},subscribe:function(_3a,_3b){
var _3c=_2.subscribe(_3a,this,_3b);
this._connects.push(_3c);
return _3c;
},unsubscribe:function(_3d){
this.disconnect(_3d);
},isLeftToRight:function(){
return this.dir?(this.dir=="ltr"):_2._isBodyLtr();
},isFocusable:function(){
return this.focus&&(_2.style(this.domNode,"display")!="none");
},placeAt:function(_3e,_3f){
if(_3e.declaredClass&&_3e.addChild){
_3e.addChild(this,_3f);
}else{
_2.place(this.domNode,_3e,_3f);
}
return this;
},getTextDir:function(_40,_41){
return _41;
},applyTextDir:function(_42,_43){
}});
return _3._WidgetBase;
});
