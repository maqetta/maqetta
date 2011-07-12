/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/Toaster",["dojo","dijit","dojox/main","dijit/_Widget","dijit/_Templated","dijit/BackgroundIframe","dojo/fx","dojo/window"],function(_1,_2,_3){
_1.getObject("widget",true,_3);
return _1.declare("dojox.widget.Toaster",[_2._Widget,_2._Templated],{templateString:"<div class=\"dijitToasterClip\" dojoAttachPoint=\"clipNode\"><div class=\"dijitToasterContainer\" dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onclick:onSelect\"><div class=\"dijitToasterContent\" dojoAttachPoint=\"contentNode\"></div></div></div>",messageTopic:"",messageTypes:{MESSAGE:"message",WARNING:"warning",ERROR:"error",FATAL:"fatal"},defaultType:"message",positionDirection:"br-up",positionDirectionTypes:["br-up","br-left","bl-up","bl-right","tr-down","tr-left","tl-down","tl-right"],duration:2000,slideDuration:500,separator:"<hr></hr>",postCreate:function(){
this.inherited(arguments);
this.hide();
_1.body().appendChild(this.domNode);
if(this.messageTopic){
_1.subscribe(this.messageTopic,this,"_handleMessage");
}
},_handleMessage:function(_4){
if(_1.isString(_4)){
this.setContent(_4);
}else{
this.setContent(_4.message,_4.type,_4.duration);
}
},_capitalize:function(w){
return w.substring(0,1).toUpperCase()+w.substring(1);
},setContent:function(_5,_6,_7){
_7=_7||this.duration;
if(this.slideAnim){
if(this.slideAnim.status()!="playing"){
this.slideAnim.stop();
}
if(this.slideAnim.status()=="playing"||(this.fadeAnim&&this.fadeAnim.status()=="playing")){
setTimeout(_1.hitch(this,function(){
this.setContent(_5,_6,_7);
}),50);
return;
}
}
for(var _8 in this.messageTypes){
_1.removeClass(this.containerNode,"dijitToaster"+this._capitalize(this.messageTypes[_8]));
}
_1.style(this.containerNode,"opacity",1);
this._setContent(_5);
_1.addClass(this.containerNode,"dijitToaster"+this._capitalize(_6||this.defaultType));
this.show();
var _9=_1.marginBox(this.containerNode);
this._cancelHideTimer();
if(this.isVisible){
this._placeClip();
if(!this._stickyMessage){
this._setHideTimer(_7);
}
}else{
var _a=this.containerNode.style;
var pd=this.positionDirection;
if(pd.indexOf("-up")>=0){
_a.left=0+"px";
_a.top=_9.h+10+"px";
}else{
if(pd.indexOf("-left")>=0){
_a.left=_9.w+10+"px";
_a.top=0+"px";
}else{
if(pd.indexOf("-right")>=0){
_a.left=0-_9.w-10+"px";
_a.top=0+"px";
}else{
if(pd.indexOf("-down")>=0){
_a.left=0+"px";
_a.top=0-_9.h-10+"px";
}else{
throw new Error(this.id+".positionDirection is invalid: "+pd);
}
}
}
}
this.slideAnim=_1.fx.slideTo({node:this.containerNode,top:0,left:0,duration:this.slideDuration});
this.connect(this.slideAnim,"onEnd",function(_b,_c){
this.fadeAnim=_1.fadeOut({node:this.containerNode,duration:1000});
this.connect(this.fadeAnim,"onEnd",function(_d){
this.isVisible=false;
this.hide();
});
this._setHideTimer(_7);
this.connect(this,"onSelect",function(_e){
this._cancelHideTimer();
this._stickyMessage=false;
this.fadeAnim.play();
});
this.isVisible=true;
});
this.slideAnim.play();
}
},_setContent:function(_f){
if(_1.isFunction(_f)){
_f(this);
return;
}
if(_f&&this.isVisible){
_f=this.contentNode.innerHTML+this.separator+_f;
}
this.contentNode.innerHTML=_f;
},_cancelHideTimer:function(){
if(this._hideTimer){
clearTimeout(this._hideTimer);
this._hideTimer=null;
}
},_setHideTimer:function(_10){
this._cancelHideTimer();
if(_10>0){
this._cancelHideTimer();
this._hideTimer=setTimeout(_1.hitch(this,function(evt){
if(this.bgIframe&&this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
this._hideTimer=null;
this._stickyMessage=false;
this.fadeAnim.play();
}),_10);
}else{
this._stickyMessage=true;
}
},_placeClip:function(){
var _11=_1.window.getBox();
var _12=_1.marginBox(this.containerNode);
var _13=this.clipNode.style;
_13.height=_12.h+"px";
_13.width=_12.w+"px";
var pd=this.positionDirection;
if(pd.match(/^t/)){
_13.top=_11.t+"px";
}else{
if(pd.match(/^b/)){
_13.top=(_11.h-_12.h-2+_11.t)+"px";
}
}
if(pd.match(/^[tb]r-/)){
_13.left=(_11.w-_12.w-1-_11.l)+"px";
}else{
if(pd.match(/^[tb]l-/)){
_13.left=0+"px";
}
}
_13.clip="rect(0px, "+_12.w+"px, "+_12.h+"px, 0px)";
if(_1.isIE){
if(!this.bgIframe){
this.clipNode.id=_2.getUniqueId("dojox_widget_Toaster_clipNode");
this.bgIframe=new _2.BackgroundIframe(this.clipNode);
}
var _14=this.bgIframe.iframe;
if(_14){
_14.style.display="block";
}
}
},onSelect:function(e){
},show:function(){
_1.style(this.domNode,"display","block");
this._placeClip();
if(!this._scrollConnected){
this._scrollConnected=_1.connect(window,"onscroll",this,this._placeClip);
}
},hide:function(){
_1.style(this.domNode,"display","none");
if(this._scrollConnected){
_1.disconnect(this._scrollConnected);
this._scrollConnected=false;
}
_1.style(this.containerNode,"opacity",1);
}});
});
