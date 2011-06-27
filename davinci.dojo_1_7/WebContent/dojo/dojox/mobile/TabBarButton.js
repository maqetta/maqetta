/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/TabBarButton",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","./common","./_ItemBase"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.mobile.TabBarButton",[dojox.mobile._ItemBase],{icon1:"",icon2:"",iconPos1:"",iconPos2:"",selected:false,transition:"none",tag:"LI",selectOne:true,inheritParams:function(){
var _7=this.getParent();
if(_7){
if(!this.transition){
this.transition=_7.transition;
}
if(this.icon1&&_7.iconBase&&_7.iconBase.charAt(_7.iconBase.length-1)==="/"){
this.icon1=_7.iconBase+this.icon1;
}
if(!this.icon1){
this.icon1=_7.iconBase;
}
if(!this.iconPos1){
this.iconPos1=_7.iconPos;
}
if(this.icon2&&_7.iconBase&&_7.iconBase.charAt(_7.iconBase.length-1)==="/"){
this.icon2=_7.iconBase+this.icon2;
}
if(!this.icon2){
this.icon2=_7.iconBase||this.icon1;
}
if(!this.iconPos2){
this.iconPos2=_7.iconPos||this.iconPos1;
}
}
},buildRendering:function(){
var a=this.anchorNode=_1.create("A",{className:"mblTabBarButtonAnchor"});
this.connect(a,"onclick","onClick");
var _8=_1.create("DIV",{className:"mblTabBarButtonDiv"},a);
var _9=this.innerDivNode=_1.create("DIV",{className:"mblTabBarButtonDiv mblTabBarButtonDivInner"},_8);
this.box=_1.create("DIV",{className:"mblTabBarButtonTextBox"},a);
var _a=this.box;
var _b="";
var r=this.srcNodeRef;
if(r){
for(var i=0,_c=r.childNodes.length;i<_c;i++){
var n=r.firstChild;
if(n.nodeType===3){
_b+=_1.trim(n.nodeValue);
n.nodeValue=this._cv(n.nodeValue);
}
_a.appendChild(n);
}
}
if(this.label){
_a.appendChild(_1.doc.createTextNode(this._cv(this.label)));
}else{
this.label=_b;
}
this.domNode=this.srcNodeRef||_1.create(this.tag);
this.containerNode=this.domNode;
this.domNode.appendChild(a);
if(this.domNode.className.indexOf("mblDomButton")!=-1){
var _d=_1.create("DIV",null,a);
dojox.mobile.createDomButton(this.domNode,null,_d);
_1.addClass(this.domNode,"mblTabButtonDomButton");
}
},startup:function(){
if(this._started){
return;
}
this.inheritParams();
var _e=this.getParent();
var _f=_e?_e._clsName:"mblTabBarButton";
_1.addClass(this.domNode,_f+(this.selected?" mblTabButtonSelected":""));
if(_e&&_e.barType=="segmentedControl"){
_1.removeClass(this.domNode,"mblTabBarButton");
_1.addClass(this.domNode,_e._clsName);
this.box.className="";
}
this.set({icon1:this.icon1,icon2:this.icon2});
this.inherited(arguments);
},select:function(_10){
if(_10){
this.selected=false;
_1.removeClass(this.domNode,"mblTabButtonSelected");
}else{
this.selected=true;
_1.addClass(this.domNode,"mblTabButtonSelected");
for(var i=0,c=this.domNode.parentNode.childNodes;i<c.length;i++){
if(c[i].nodeType!=1){
continue;
}
var w=dijit.byNode(c[i]);
if(w&&w!=this){
w.select(true);
}
}
}
if(this.iconNode1){
this.iconNode1.style.visibility=this.selected?"hidden":"";
}
if(this.iconNode2){
this.iconNode2.style.visibility=this.selected?"":"hidden";
}
},onClick:function(e){
this.defaultClickAction();
},_setIcon:function(_11,pos,num,sel){
var i="icon"+num,n="iconNode"+num,p="iconPos"+num;
if(_11){
this[i]=_11;
}
if(pos){
if(this[p]===pos){
return;
}
this[p]=pos;
}
var div=this.innerDivNode;
if(_11&&_11.indexOf("mblDomButton")===0){
if(!this[n]){
this[n]=_1.create("DIV",null,div);
}
this[n].className=_11+" mblTabBarButtonIcon";
dojox.mobile.createDomButton(this[n]);
_1.removeClass(div,"mblTabBarButtonNoIcon");
}else{
if(_11&&_11!="none"){
if(!this[n]){
this[n]=_1.create("IMG",{className:"mblTabBarButtonIcon",alt:this.alt},div);
}
this[n].src=_11;
this[n].style.visibility=sel?"hidden":"";
dojox.mobile.setupIcon(this[n],this[p]);
this[n].onload=function(){
var _12=this.style.display;
this.style.display="none";
this.style.display=_12;
};
}else{
_1.addClass(div,"mblTabBarButtonNoIcon");
}
}
},_setIcon1Attr:function(_13){
this._setIcon(_13,null,1,this.selected);
},_setIcon2Attr:function(_14){
this._setIcon(_14,null,2,!this.selected);
},_setIconPos1Attr:function(pos){
this._setIcon(null,pos,1,this.selected);
},_setIconPos2Attr:function(pos){
this._setIcon(null,pos,2,!this.selected);
}});
});
