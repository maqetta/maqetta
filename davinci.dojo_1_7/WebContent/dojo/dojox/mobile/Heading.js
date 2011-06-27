/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Heading",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/array","dojo/_base/lang","./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
return _1.declare("dojox.mobile.Heading",[dijit._WidgetBase,dijit._Container,dijit._Contained],{back:"",href:"",moveTo:"",transition:"slide",label:"",iconBase:"",backProp:{className:"mblArrowButton"},tag:"H1",buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||_1.doc.createElement(this.tag);
this.domNode.className="mblHeading";
if(!this.label){
_1.forEach(this.domNode.childNodes,function(n){
if(n.nodeType==3){
var v=_1.trim(n.nodeValue);
if(v){
this.label=v;
this.labelNode=_1.create("SPAN",{innerHTML:v},n,"replace");
}
}
},this);
}
if(!this.labelNode){
this.labelNode=_1.create("SPAN",null,this.domNode);
}
this.labelNode.className="mblHeadingSpanTitle";
this.labelDivNode=_1.create("DIV",{className:"mblHeadingDivTitle",innerHTML:this.labelNode.innerHTML},this.domNode);
},startup:function(){
if(this._started){
return;
}
var _a=this.getParent&&this.getParent();
if(!_a||!_a.resize){
var _b=this;
setTimeout(function(){
_b.resize();
},0);
}
this.inherited(arguments);
},resize:function(){
if(this._btn){
this._btn.style.width=this._body.offsetWidth+this._head.offsetWidth+"px";
}
if(this.labelNode){
var _c,_d;
var _e=this.containerNode.childNodes;
for(var i=_e.length-1;i>=0;i--){
var c=_e[i];
if(c.nodeType===1){
if(!_d&&_1.hasClass(c,"mblToolbarButton")&&_1.style(c,"float")==="right"){
_d=c;
}
if(!_c&&(_1.hasClass(c,"mblToolbarButton")&&_1.style(c,"float")==="left"||c===this._btn)){
_c=c;
}
}
}
if(!this.labelNodeLen&&this.label){
this.labelNode.style.display="inline";
this.labelNodeLen=this.labelNode.offsetWidth;
this.labelNode.style.display="";
}
var bw=this.domNode.offsetWidth;
var rw=_d?bw-_d.offsetLeft+5:0;
var lw=_c?_c.offsetLeft+_c.offsetWidth+5:0;
var tw=this.labelNodeLen||0;
_1[bw-Math.max(rw,lw)*2>tw?"addClass":"removeClass"](this.domNode,"mblHeadingCenterTitle");
}
_1.forEach(this.getChildren(),function(_f){
if(_f.resize){
_f.resize();
}
});
},_setBackAttr:function(_10){
if(!this._btn){
var btn=_1.create("DIV",this.backProp,this.domNode,"first");
var _11=_1.create("DIV",{className:"mblArrowButtonHead"},btn);
var _12=_1.create("DIV",{className:"mblArrowButtonBody mblArrowButtonText"},btn);
this._body=_12;
this._head=_11;
this._btn=btn;
this.backBtnNode=btn;
this.connect(_12,"onclick","onClick");
var _13=_1.create("DIV",{className:"mblArrowButtonNeck"},btn);
}
this.back=_10;
this._body.innerHTML=this._cv(this.back);
this.resize();
},_setLabelAttr:function(_14){
this.label=_14;
this.labelNode.innerHTML=this.labelDivNode.innerHTML=this._cv(_14);
},findCurrentView:function(){
var w=this;
while(true){
w=w.getParent();
if(!w){
return null;
}
if(w instanceof dojox.mobile.View){
break;
}
}
return w;
},onClick:function(e){
var h1=this.domNode;
_1.addClass(h1,"mblArrowButtonSelected");
setTimeout(function(){
_1.removeClass(h1,"mblArrowButtonSelected");
},1000);
if(this.back&&!this.moveTo&&!this.href&&history){
history.back();
return;
}
var _15=this.findCurrentView();
if(_15){
_15.clickedPosX=e.clientX;
_15.clickedPosY=e.clientY;
}
this.goTo(this.moveTo,this.href);
},goTo:function(_16,_17){
var _18=this.findCurrentView();
if(!_18){
return;
}
if(_17){
_18.performTransition(null,-1,this.transition,this,function(){
location.href=_17;
});
}else{
if(dojox.mobile.app&&dojox.mobile.app.STAGE_CONTROLLER_ACTIVE){
_1.publish("/dojox/mobile/app/goback");
}else{
var _19=dijit.byId(_18.convertToId(_16));
if(_19){
var _1a=_19.getParent();
while(_18){
var _1b=_18.getParent();
if(_1a===_1b){
break;
}
_18=_1b;
}
}
if(_18){
_18.performTransition(_16,-1,this.transition);
}
}
}
}});
});
