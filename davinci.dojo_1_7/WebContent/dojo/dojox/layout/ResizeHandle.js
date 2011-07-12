/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ResizeHandle",["dojo","dijit","dojox","dijit/_Widget","dijit/_Templated","dojo/fx","dojo/window"],function(_1,_2,_3){
_1.getObject("dojox.layout.ResizeHandle",1);
_1.experimental("dojox.layout.ResizeHandle");
_1.declare("dojox.layout.ResizeHandle",[_2._Widget,_2._Templated],{targetId:"",targetContainer:null,resizeAxis:"xy",activeResize:false,activeResizeClass:"dojoxResizeHandleClone",animateSizing:true,animateMethod:"chain",animateDuration:225,minHeight:100,minWidth:100,constrainMax:false,maxHeight:0,maxWidth:0,fixedAspect:false,intermediateChanges:false,startTopic:"/dojo/resize/start",endTopic:"/dojo/resize/stop",templateString:"<div dojoAttachPoint=\"resizeHandle\" class=\"dojoxResizeHandle\"><div></div></div>",postCreate:function(){
this.connect(this.resizeHandle,"onmousedown","_beginSizing");
if(!this.activeResize){
this._resizeHelper=_2.byId("dojoxGlobalResizeHelper");
if(!this._resizeHelper){
this._resizeHelper=new _3.layout._ResizeHelper({id:"dojoxGlobalResizeHelper"}).placeAt(_1.body());
_1.addClass(this._resizeHelper.domNode,this.activeResizeClass);
}
}else{
this.animateSizing=false;
}
if(!this.minSize){
this.minSize={w:this.minWidth,h:this.minHeight};
}
if(this.constrainMax){
this.maxSize={w:this.maxWidth,h:this.maxHeight};
}
this._resizeX=this._resizeY=false;
var _4=_1.partial(_1.addClass,this.resizeHandle);
switch(this.resizeAxis.toLowerCase()){
case "xy":
this._resizeX=this._resizeY=true;
_4("dojoxResizeNW");
break;
case "x":
this._resizeX=true;
_4("dojoxResizeW");
break;
case "y":
this._resizeY=true;
_4("dojoxResizeN");
break;
}
},_beginSizing:function(e){
if(this._isSizing){
return false;
}
_1.publish(this.startTopic,[this]);
this.targetWidget=_2.byId(this.targetId);
this.targetDomNode=this.targetWidget?this.targetWidget.domNode:_1.byId(this.targetId);
if(this.targetContainer){
this.targetDomNode=this.targetContainer;
}
if(!this.targetDomNode){
return false;
}
if(!this.activeResize){
var c=_1.position(this.targetDomNode,true);
this._resizeHelper.resize({l:c.x,t:c.y,w:c.w,h:c.h});
this._resizeHelper.show();
}
this._isSizing=true;
this.startPoint={x:e.clientX,y:e.clientY};
var mb=this.targetWidget?_1.marginBox(this.targetDomNode):_1.contentBox(this.targetDomNode);
this.startSize={w:mb.w,h:mb.h};
if(this.fixedAspect){
var _5,_6;
if(mb.w>mb.h){
_5="w";
_6=mb.w/mb.h;
}else{
_5="h";
_6=mb.h/mb.w;
}
this._aspect={prop:_5};
this._aspect[_5]=_6;
}
this._pconnects=[];
this._pconnects.push(_1.connect(_1.doc,"onmousemove",this,"_updateSizing"));
this._pconnects.push(_1.connect(_1.doc,"onmouseup",this,"_endSizing"));
_1.stopEvent(e);
},_updateSizing:function(e){
if(this.activeResize){
this._changeSizing(e);
}else{
var _7=this._getNewCoords(e);
if(_7===false){
return;
}
this._resizeHelper.resize(_7);
}
e.preventDefault();
},_getNewCoords:function(e){
try{
if(!e.clientX||!e.clientY){
return false;
}
}
catch(e){
return false;
}
this._activeResizeLastEvent=e;
var dx=(this.isLeftToRight()?this.startPoint.x-e.clientX:e.clientX-this.startPoint.x),dy=this.startPoint.y-e.clientY,_8=this.startSize.w-(this._resizeX?dx:0),_9=this.startSize.h-(this._resizeY?dy:0);
return this._checkConstraints(_8,_9);
},_checkConstraints:function(_a,_b){
if(this.minSize){
var tm=this.minSize;
if(_a<tm.w){
_a=tm.w;
}
if(_b<tm.h){
_b=tm.h;
}
}
if(this.constrainMax&&this.maxSize){
var ms=this.maxSize;
if(_a>ms.w){
_a=ms.w;
}
if(_b>ms.h){
_b=ms.h;
}
}
if(this.fixedAspect){
var ta=this._aspect[this._aspect.prop];
if(_a<_b){
_b=_a*ta;
}else{
if(_b<_a){
_a=_b*ta;
}
}
}
return {w:_a,h:_b};
},_changeSizing:function(e){
var _c=this._getNewCoords(e);
if(_c===false){
return;
}
if(this.targetWidget&&_1.isFunction(this.targetWidget.resize)){
this.targetWidget.resize(_c);
}else{
if(this.animateSizing){
var _d=_1.fx[this.animateMethod]([_1.animateProperty({node:this.targetDomNode,properties:{width:{start:this.startSize.w,end:_c.w}},duration:this.animateDuration}),_1.animateProperty({node:this.targetDomNode,properties:{height:{start:this.startSize.h,end:_c.h}},duration:this.animateDuration})]);
_d.play();
}else{
_1.style(this.targetDomNode,{width:_c.w+"px",height:_c.h+"px"});
}
}
if(this.intermediateChanges){
this.onResize(e);
}
},_endSizing:function(e){
_1.forEach(this._pconnects,_1.disconnect);
var _e=_1.partial(_1.publish,this.endTopic,[this]);
if(!this.activeResize){
this._resizeHelper.hide();
this._changeSizing(e);
setTimeout(_e,this.animateDuration+15);
}else{
_e();
}
this._isSizing=false;
this.onResize(e);
},onResize:function(e){
}});
_1.declare("dojox.layout._ResizeHelper",_2._Widget,{show:function(){
_1.fadeIn({node:this.domNode,duration:120,beforeBegin:function(n){
_1.style(n,"display","");
}}).play();
},hide:function(){
_1.fadeOut({node:this.domNode,duration:250,onEnd:function(n){
_1.style(n,"display","none");
}}).play();
},resize:function(_f){
_1.marginBox(this.domNode,_f);
}});
return _1.getObject("dojox.layout.ResizeHandle");
});
require(["dojox/layout/ResizeHandle"]);
