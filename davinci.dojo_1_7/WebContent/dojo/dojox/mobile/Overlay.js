/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Overlay",["dojo","dijit","dojox","dojo/window","dijit/_WidgetBase"],function(_1,_2,_3,_4,_5){
return _1.declare("dojox.mobile.Overlay",_2._WidgetBase,{baseClass:"mblOverlay mblOverlayHidden",show:function(_6){
var vp,_7;
var _8=_1.hitch(this,function(){
_1.style(this.domNode,{position:"",top:"auto",bottom:"0px"});
_7=_1.position(this.domNode);
vp=_1.window.getBox();
if((_7.y+_7.h)!=vp.h){
_7.y=vp.t+vp.h-_7.h;
_1.style(this.domNode,{position:"absolute",top:_7.y+"px",bottom:"auto"});
}
});
_8();
if(_6){
var _9=_1.position(_6);
if(_7.y<_9.y){
_1.global.scrollBy(0,_9.y+_9.h-_7.y);
_8();
}
}
_1.replaceClass(this.domNode,["mblCoverv","mblIn"],["mblOverlayHidden","mblRevealv","mblOut","mblReverse"]);
var _a=null;
this._moveHandle=this.connect(_1.doc.documentElement,"ontouchmove",function(){
if(_a){
clearTimeout(_a);
}
_a=setTimeout(function(){
_8();
_a=null;
},0);
});
},hide:function(){
if(this._moveHandle){
this.disconnect(this._moveHandle);
this._moveHandle=null;
}
if(_1.isWebKit){
var _b=this.connect(this.domNode,"webkitAnimationEnd",function(){
this.disconnect(_b);
_1.replaceClass(this.domNode,["mblOverlayHidden"],["mblRevealv","mblOut","mblReverse"]);
});
_1.replaceClass(this.domNode,["mblRevealv","mblOut","mblReverse"],["mblCoverv","mblIn"]);
}else{
_1.replaceClass(this.domNode,["mblOverlayHidden"],["mblCoverv","mblIn","mblRevealv","mblOut","mblReverse"]);
}
},onBlur:function(e){
return false;
}});
});
