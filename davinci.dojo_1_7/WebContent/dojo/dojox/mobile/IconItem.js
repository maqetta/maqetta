/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/IconItem",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/array","./common","./_ItemBase","./TransitionEvent"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.IconItem",dojox.mobile._ItemBase,{lazy:false,requires:"",timeout:10,closeBtnClass:"mblDomButtonBlueMinus",closeBtnProp:null,templateString:"<li class=\"mblIconItem\">"+"<div class=\"mblIconArea\" dojoAttachPoint=\"iconDivNode\">"+"<div><img src=\"${icon}\" dojoAttachPoint=\"iconNode\"></div><span dojoAttachPoint=\"labelNode1\"></span>"+"</div>"+"</li>",templateStringSub:"<li class=\"mblIconItemSub\" lazy=\"${lazy}\" style=\"display:none;\" dojoAttachPoint=\"contentNode\">"+"<h2 class=\"mblIconContentHeading\" dojoAttachPoint=\"closeNode\">"+"<div class=\"${closeBtnClass}\" style=\"position:absolute;left:4px;top:2px;\" dojoAttachPoint=\"closeIconNode\"></div><span dojoAttachPoint=\"labelNode2\"></span>"+"</h2>"+"<div class=\"mblContent\" dojoAttachPoint=\"containerNode\"></div>"+"</li>",createTemplate:function(s){
_1.forEach(["lazy","icon","closeBtnClass"],function(v){
while(s.indexOf("${"+v+"}")!=-1){
s=s.replace("${"+v+"}",this[v]);
}
},this);
var _8=_1.doc.createElement("DIV");
_8.innerHTML=s;
var _9=_8.getElementsByTagName("*");
var i,_a,s1;
_a=_9.length;
for(i=0;i<_a;i++){
s1=_9[i].getAttribute("dojoAttachPoint");
if(s1){
this[s1]=_9[i];
}
}
if(this.closeIconNode&&this.closeBtnProp){
_1.attr(this.closeIconNode,this.closeBtnProp);
}
var _b=_8.removeChild(_8.firstChild);
_8=null;
return _b;
},buildRendering:function(){
this.inheritParams();
this.domNode=this.createTemplate(this.templateString);
this.subNode=this.createTemplate(this.templateStringSub);
this.subNode._parentNode=this.domNode;
if(this.srcNodeRef){
for(var i=0,_c=this.srcNodeRef.childNodes.length;i<_c;i++){
this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
}
this.srcNodeRef.parentNode.replaceChild(this.domNode,this.srcNodeRef);
this.srcNodeRef=null;
}
},postCreate:function(){
dojox.mobile.createDomButton(this.closeIconNode,{top:"-2px",left:"1px"});
this.connect(this.iconNode,"onmousedown","onMouseDownIcon");
this.connect(this.iconNode,"onclick","iconClicked");
this.connect(this.closeIconNode,"onclick","closeIconClicked");
this.connect(this.iconNode,"onerror","onError");
},highlight:function(){
_1.addClass(this.iconDivNode,"mblVibrate");
if(this.timeout>0){
var _d=this;
setTimeout(function(){
_d.unhighlight();
},this.timeout*1000);
}
},unhighlight:function(){
_1.removeClass(this.iconDivNode,"mblVibrate");
},instantiateWidget:function(e){
var _e=this.containerNode.getElementsByTagName("*");
var _f=_e.length;
var s;
for(var i=0;i<_f;i++){
s=_e[i].getAttribute("dojoType");
if(s){
_1["require"](s);
}
}
if(_f>0){
_1.parser.parse(this.containerNode);
}
this.lazy=false;
},isOpen:function(e){
return this.containerNode.style.display!="none";
},onMouseDownIcon:function(e){
_1.style(this.iconNode,"opacity",this.getParent().pressedIconOpacity);
},iconClicked:function(e){
if(e){
this.setTransitionPos(e);
setTimeout(_1.hitch(this,function(d){
this.iconClicked();
}),0);
return;
}
var _10;
if(this.moveTo||this.href||this.url||this.scene){
_10={moveTo:this.moveTo,href:this.href,url:this.url,scene:this.scene,transitionDir:this.transitionDir,transition:this.transition};
}else{
if(this.transitionOptions){
_10=this.transitionOptions;
}
}
if(_10){
setTimeout(_1.hitch(this,function(d){
_1.style(this.iconNode,"opacity",1);
}),1500);
}else{
return this.open(e);
}
if(_10){
return new _7(this.domNode,_10,e).dispatch();
}
},closeIconClicked:function(e){
if(e){
setTimeout(_1.hitch(this,function(d){
this.closeIconClicked();
}),0);
return;
}
this.close();
},open:function(e){
var _11=this.getParent();
if(this.transition=="below"){
if(_11.single){
_11.closeAll();
_1.style(this.iconNode,"opacity",this.getParent().pressedIconOpacity);
}
this._open_1();
}else{
_11._opening=this;
if(_11.single){
_11.closeAll();
var _12=dijit.byId(_11.id+"_mblApplView");
_12._heading._setLabelAttr(this.label);
}
var _13=this.transitionOptions||{transition:this.transition,transitionDir:this.transitionDir,moveTo:_11.id+"_mblApplView"};
new _7(this.domNode,_13,e).dispatch();
}
},_open_1:function(){
this.contentNode.style.display="";
this.unhighlight();
if(this.lazy){
if(this.requires){
_1.forEach(this.requires.split(/,/),function(c){
_1["require"](c);
});
}
this.instantiateWidget();
}
this.contentNode.scrollIntoView();
this.onOpen();
},close:function(){
if(_1.isWebKit){
var t=this.domNode.parentNode.offsetWidth/8;
var y=this.iconNode.offsetLeft;
var pos=0;
for(var i=1;i<=3;i++){
if(t*(2*i-1)<y&&y<=t*(2*(i+1)-1)){
pos=i;
break;
}
}
_1.addClass(this.containerNode.parentNode,"mblCloseContent mblShrink"+pos);
}else{
this.containerNode.parentNode.style.display="none";
}
_1.style(this.iconNode,"opacity",1);
this.onClose();
},onOpen:function(){
},onClose:function(){
},onError:function(){
var icon=this.getParent().defaultIcon;
if(icon){this.iconNode.src=icon;}
},_setIconAttr:function(_14){
if(!this.getParent()){
return;
}
this.icon=_14;
this.iconNode.src=_14;
this.iconNode.alt=this.alt;
dojox.mobile.setupIcon(this.iconNode,this.iconPos);
},_setLabelAttr:function(_15){
this.label=_15;
var s=this._cv(_15);
this.labelNode1.innerHTML=s;
this.labelNode2.innerHTML=s;
}});
});
