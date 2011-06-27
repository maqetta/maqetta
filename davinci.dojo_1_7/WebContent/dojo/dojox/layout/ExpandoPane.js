/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ExpandoPane",["dojo","dijit","dojox","dijit/layout/ContentPane","dijit/_Templated","dijit/_Contained"],function(_1,_2,_3){
_1.getObject("dojox.layout.ExpandoPane",1);
_1.experimental("dojox.layout.ExpandoPane");
_1.declare("dojox.layout.ExpandoPane",[_2.layout.ContentPane,_2._TemplatedMixin,_2._Contained,_2._Container],{attributeMap:_1.delegate(_2.layout.ContentPane.prototype.attributeMap,{title:{node:"titleNode",type:"innerHTML"}}),templateString:_1.cache("dojox.layout","resources/ExpandoPane.html","<div class=\"dojoxExpandoPane\">\n\t<div dojoAttachPoint=\"titleWrapper\" class=\"dojoxExpandoTitle\">\n\t\t<div class=\"dojoxExpandoIcon\" dojoAttachPoint=\"iconNode\" dojoAttachEvent=\"onclick:toggle\"><span class=\"a11yNode\">X</span></div>\t\t\t\n\t\t<span class=\"dojoxExpandoTitleNode\" dojoAttachPoint=\"titleNode\">${title}</span>\n\t</div>\n\t<div class=\"dojoxExpandoWrapper\" dojoAttachPoint=\"cwrapper\" dojoAttachEvent=\"ondblclick:_trap\">\n\t\t<div class=\"dojoxExpandoContent\" dojoAttachPoint=\"containerNode\"></div>\n\t</div>\n</div>\n"),easeOut:"dojo._DefaultEasing",easeIn:"dojo._DefaultEasing",duration:420,startExpanded:true,previewOpacity:0.75,previewOnDblClick:false,baseClass:"dijitExpandoPane",postCreate:function(){
this.inherited(arguments);
this._animConnects=[];
this._isHorizontal=true;
if(_1.isString(this.easeOut)){
this.easeOut=_1.getObject(this.easeOut);
}
if(_1.isString(this.easeIn)){
this.easeIn=_1.getObject(this.easeIn);
}
var _4="",_5=!this.isLeftToRight();
if(this.region){
switch(this.region){
case "trailing":
case "right":
_4=_5?"Left":"Right";
break;
case "leading":
case "left":
_4=_5?"Right":"Left";
break;
case "top":
_4="Top";
break;
case "bottom":
_4="Bottom";
break;
}
_1.addClass(this.domNode,"dojoxExpando"+_4);
_1.addClass(this.iconNode,"dojoxExpandoIcon"+_4);
this._isHorizontal=/top|bottom/.test(this.region);
}
_1.style(this.domNode,{overflow:"hidden",padding:0});
this.connect(this.domNode,"ondblclick",this.previewOnDblClick?"preview":"toggle");
if(this.previewOnDblClick){
this.connect(this.getParent(),"_layoutChildren",_1.hitch(this,function(){
this._isonlypreview=false;
}));
}
},_startupSizes:function(){
this._container=this.getParent();
this._closedSize=this._titleHeight=_1.marginBox(this.titleWrapper).h;
if(this.splitter){
var _6=this.id;
_2.registry.filter(function(w){
return w&&w.child&&w.child.id==_6;
}).forEach(_1.hitch(this,function(w){
this.connect(w,"_stopDrag","_afterResize");
}));
}
this._currentSize=_1.contentBox(this.domNode);
this._showSize=this._currentSize[(this._isHorizontal?"h":"w")];
this._setupAnims();
if(this.startExpanded){
this._showing=true;
}else{
this._showing=false;
this._hideWrapper();
this._hideAnim.gotoPercent(99,true);
}
this._hasSizes=true;
},_afterResize:function(e){
var _7=this._currentSize;
this._currentSize=_1.marginBox(this.domNode);
var n=this._currentSize[(this._isHorizontal?"h":"w")];
if(n>this._titleHeight){
if(!this._showing){
this._showing=!this._showing;
this._showEnd();
}
this._showSize=n;
this._setupAnims();
}else{
this._showSize=_7[(this._isHorizontal?"h":"w")];
this._showing=false;
this._hideWrapper();
this._hideAnim.gotoPercent(89,true);
}
},_setupAnims:function(){
_1.forEach(this._animConnects,_1.disconnect);
var _8={node:this.domNode,duration:this.duration},_9=this._isHorizontal,_a={},_b={},_c=_9?"height":"width";
_a[_c]={end:this._showSize};
_b[_c]={end:this._closedSize};
this._showAnim=_1.animateProperty(_1.mixin(_8,{easing:this.easeIn,properties:_a}));
this._hideAnim=_1.animateProperty(_1.mixin(_8,{easing:this.easeOut,properties:_b}));
this._animConnects=[_1.connect(this._showAnim,"onEnd",this,"_showEnd"),_1.connect(this._hideAnim,"onEnd",this,"_hideEnd")];
},preview:function(){
if(!this._showing){
this._isonlypreview=!this._isonlypreview;
}
this.toggle();
},toggle:function(){
if(this._showing){
this._hideWrapper();
this._showAnim&&this._showAnim.stop();
this._hideAnim.play();
}else{
this._hideAnim&&this._hideAnim.stop();
this._showAnim.play();
}
this._showing=!this._showing;
},_hideWrapper:function(){
_1.addClass(this.domNode,"dojoxExpandoClosed");
_1.style(this.cwrapper,{visibility:"hidden",opacity:"0",overflow:"hidden"});
},_showEnd:function(){
_1.style(this.cwrapper,{opacity:0,visibility:"visible"});
_1.anim(this.cwrapper,{opacity:this._isonlypreview?this.previewOpacity:1},227);
_1.removeClass(this.domNode,"dojoxExpandoClosed");
if(!this._isonlypreview){
setTimeout(_1.hitch(this._container,"layout"),15);
}else{
this._previewShowing=true;
this.resize();
}
},_hideEnd:function(){
if(!this._isonlypreview){
setTimeout(_1.hitch(this._container,"layout"),25);
}else{
this._previewShowing=false;
}
this._isonlypreview=false;
},resize:function(_d){
if(!this._hasSizes){
this._startupSizes(_d);
}
var _e=_1.marginBox(this.domNode);
this._contentBox={w:_d&&"w" in _d?_d.w:_e.w,h:(_d&&"h" in _d?_d.h:_e.h)-this._titleHeight};
_1.style(this.containerNode,"height",this._contentBox.h+"px");
if(_d){
_1.marginBox(this.domNode,_d);
}
this._layoutChildren();
},_trap:function(e){
_1.stopEvent(e);
}});
return _1.getObject("dojox.layout.ExpandoPane");
});
require(["dojox/layout/ExpandoPane"]);
