/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ToolBarButton",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","./_ItemBase"],function(_1,_2,_3,_4,_5){
return _1.declare("dojox.mobile.ToolBarButton",dojox.mobile._ItemBase,{selected:false,btnClass:"",_defaultColor:"mblColorDefault",_selColor:"mblColorDefaultSel",buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||_1.doc.createElement("div");
this.inheritParams();
_1.addClass(this.domNode,"mblToolbarButton mblArrowButtonText");
var _6;
if(this.selected){
_6=this._selColor;
}else{
if(this.domNode.className.indexOf("mblColor")==-1){
_6=this._defaultColor;
}
}
_1.addClass(this.domNode,_6);
if(!this.label){
this.label=this.domNode.innerHTML;
}
this.domNode.innerHTML=this._cv(this.label);
if(this.icon&&this.icon!="none"){
var _7;
if(this.iconPos){
var _8=_1.create("DIV",null,this.domNode);
_7=_1.create("IMG",null,_8);
_7.style.position="absolute";
var _9=this.iconPos.split(/[ ,]/);
_1.style(_8,{position:"relative",width:_9[2]+"px",height:_9[3]+"px"});
}else{
_7=_1.create("IMG",null,this.domNode);
}
_7.src=this.icon;
_7.alt=this.alt;
dojox.mobile.setupIcon(_7,this.iconPos);
this.iconNode=_7;
}else{
if(dojox.mobile.createDomButton(this.domNode)){
_1.addClass(this.domNode,"mblToolbarButtonDomButton");
}
}
this.connect(this.domNode,"onclick","onClick");
},select:function(_a){
_1.toggleClass(this.domNode,this._selColor,!_a);
this.selected=!_a;
},onClick:function(e){
this.setTransitionPos(e);
this.defaultClickAction();
},_setBtnClassAttr:function(_b){
var _c=this.domNode;
if(_c.className.match(/(mblDomButton\w+)/)){
_1.removeClass(_c,RegExp.$1);
}
_1.addClass(_c,_b);
if(dojox.mobile.createDomButton(this.domNode)){
_1.addClass(this.domNode,"mblToolbarButtonDomButton");
}
}});
});
