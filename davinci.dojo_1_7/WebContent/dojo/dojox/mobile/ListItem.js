/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ListItem",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","./_ItemBase","./TransitionEvent"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.mobile.ListItem",dojox.mobile._ItemBase,{rightText:"",rightIcon2:"",rightIcon:"",anchorLabel:false,noArrow:false,selected:false,checked:false,arrowClass:"mblDomButtonArrow",checkClass:"mblDomButtonCheck",variableHeight:false,rightIconTitle:"",rightIcon2Title:"",btnClass:"",btnClass2:"",postMixInProperties:function(){
if(this.btnClass){
this.rightIcon=this.btnClass;
}
this._setBtnClassAttr=this._setRightIconAttr;
this._setBtnClass2Attr=this._setRightIcon2Attr;
},buildRendering:function(){
this.inherited(arguments);
this.domNode.className="mblListItem"+(this.selected?" mblItemSelected":"");
var _7=this.box=_1.create("DIV");
_7.className="mblListItemTextBox";
if(this.anchorLabel){
_7.style.cursor="pointer";
}
var r=this.srcNodeRef;
if(r&&!this.label){
this.label="";
for(var i=0,_8=r.childNodes.length;i<_8;i++){
var n=r.firstChild;
if(n.nodeType===3&&_1.trim(n.nodeValue)!==""){
n.nodeValue=this._cv(n.nodeValue);
this.labelNode=_1.create("SPAN",{className:"mblListItemLabel"});
this.labelNode.appendChild(n);
n=this.labelNode;
}
_7.appendChild(n);
}
}
if(!this.labelNode){
this.labelNode=_1.create("SPAN",{className:"mblListItemLabel"},_7);
}
if(this.anchorLabel){
_7.style.display="inline";
}
var a=this.anchorNode=_1.create("A");
a.className="mblListItemAnchor";
this.domNode.appendChild(a);
a.appendChild(_7);
this.rightTextNode=_1.create("DIV",{className:"mblListItemRightText"},a,"first");
this.rightIcon2Node=_1.create("DIV",{className:"mblListItemRightIcon2"},a,"first");
this.rightIconNode=_1.create("DIV",{className:"mblListItemRightIcon"},a,"first");
this.iconNode=_1.create("DIV",{className:"mblListItemIcon"},a,"first");
},startup:function(){
if(this._started){
return;
}
this.inheritParams();
var _9=this.getParent();
if(this.moveTo||this.href||this.url||this.clickable){
this.connect(this.anchorNode,"onclick","onClick");
}
this.setArrow();
if(_9&&_9.select){
this.connect(this.anchorNode,"onclick","onClick");
}
if(_1.hasClass(this.domNode,"mblVariableHeight")){
this.variableHeight=true;
}
if(this.variableHeight){
_1.addClass(this.domNode,"mblVariableHeight");
_1.subscribe("/dojox/mobile/resizeAll",this,"layoutVariableHeight");
setTimeout(_1.hitch(this,"layoutVariableHeight"));
}
this.set("icon",this.icon);
this.inherited(arguments);
},onClick:function(e){
var a=e.currentTarget;
var li=a.parentNode;
if(_1.hasClass(li,"mblItemSelected")){
return;
}
if(this.anchorLabel){
for(var p=e.target;p.tagName!=="LI";p=p.parentNode){
if(p.className=="mblListItemTextBox"){
_1.addClass(p,"mblListItemTextBoxSelected");
setTimeout(function(){
_1.removeClass(p,"mblListItemTextBoxSelected");
},_1.isAndroid?300:1000);
this.onAnchorLabelClicked(e);
return;
}
}
}
var _a=this.getParent();
if(_a.select){
if(_a.select==="single"){
if(!this.checked){
this.set("checked",true);
}
}else{
if(_a.select==="multiple"){
this.set("checked",!this.checked);
}
}
}
this.select();
var _b;
if(this.moveTo||this.href||this.url||this.scene){
_b={moveTo:this.moveTo,href:this.href,url:this.url,scene:this.scene,transition:this.transition,transitionDir:this.transitionDir};
}else{
if(this.transitionOptions){
_b=this.transitionOptions;
}
}
if(_b){
this.setTransitionPos(e);
return new _6(this.domNode,_b,e).dispatch();
}
},deselect:function(){
_1.removeClass(this.domNode,"mblItemSelected");
},select:function(){
var _c=this.getParent();
if(_c.stateful){
_c.deselectAll();
}else{
var _d=this;
setTimeout(function(){
_d.deselect();
},_1.isAndroid?300:1000);
}
_1.addClass(this.domNode,"mblItemSelected");
},onAnchorLabelClicked:function(e){
},layoutVariableHeight:function(e){
var h=this.anchorNode.offsetHeight;
_1.forEach([this.rightTextNode,this.rightIcon2Node,this.rightIconNode,this.iconNode],function(n){
var t=Math.round((h-n.offsetHeight)/2);
n.style.marginTop=t+"px";
});
},setArrow:function(){
if(this.checked){
return;
}
var c="";
var _e=this.getParent();
if(this.moveTo||this.href||this.url||this.clickable){
if(!this.noArrow&&!(_e&&_e.stateful)){
c=this.arrowClass;
}
}
if(c){
this._setRightIconAttr(c);
}
},_setIconAttr:function(_f){
if(!this.getParent()){
return;
}
this.icon=_f;
var a=this.anchorNode;
_1.empty(this.iconNode);
if(_f&&_f!=="none"){
dojox.mobile.createIcon(_f,this.iconPos,null,this.alt,this.iconNode);
if(this.iconPos){
_1.addClass(this.iconNode.firstChild,"mblListItemSpriteIcon");
}
_1.removeClass(a,"mblListItemAnchorNoIcon");
}else{
_1.addClass(a,"mblListItemAnchorNoIcon");
}
},_setCheckedAttr:function(_10){
var _11=this.getParent();
if(_11.select==="single"&&_10){
_1.forEach(_11.getChildren(),function(_12){
_12.set("checked",false);
});
}
this._setRightIconAttr(this.checkClass);
this.rightIconNode.style.display=_10?"":"none";
_1.toggleClass(this.domNode,"mblListItemChecked",_10);
if(this.checked!==_10){
this.getParent().onCheckStateChanged(this,_10);
}
this.checked=_10;
},_setRightTextAttr:function(_13){
this.rightText=_13;
this.rightTextNode.innerHTML=this._cv(_13);
},_setRightIconAttr:function(_14){
this.rightIcon=_14;
_1.empty(this.rightIconNode);
dojox.mobile.createIcon(_14,null,null,this.rightIconTitle,this.rightIconNode);
},_setRightIcon2Attr:function(_15){
this.rightIcon2=_15;
_1.empty(this.rightIcon2Node);
dojox.mobile.createIcon(_15,null,null,this.rightIcon2Title,this.rightIcon2Node);
},_setLabelAttr:function(_16){
this.label=_16;
this.labelNode.innerHTML=this._cv(_16);
}});
});
