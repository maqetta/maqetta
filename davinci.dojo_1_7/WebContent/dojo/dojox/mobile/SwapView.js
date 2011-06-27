/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/SwapView",["./View","./_ScrollableMixin"],function(_1,_2){
return dojo.declare("dojox.mobile.SwapView",[dojox.mobile.View,dojox.mobile._ScrollableMixin],{scrollDir:"f",weight:1.2,buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"mblSwapView");
this.setSelectable(this.domNode,false);
this.containerNode=this.domNode;
dojo.subscribe("/dojox/mobile/nextPage",this,"handleNextPage");
dojo.subscribe("/dojox/mobile/prevPage",this,"handlePrevPage");
this.findAppBars();
},onTouchStart:function(e){
var _3=this.nextView(this.domNode);
if(_3){
_3.stopAnimation();
dojo.addClass(_3.domNode,"mblIn");
}
var _4=this.previousView(this.domNode);
if(_4){
_4.stopAnimation();
dojo.addClass(_4.domNode,"mblIn");
}
this.inherited(arguments);
},handleNextPage:function(w){
var _5=w.refId&&dojo.byId(w.refId)||w.domNode;
if(this.domNode.parentNode!==_5.parentNode){
return;
}
if(this.getShowingView()!==this){
return;
}
this.goTo(1);
},handlePrevPage:function(w){
var _6=w.refId&&dojo.byId(w.refId)||w.domNode;
if(this.domNode.parentNode!==_6.parentNode){
return;
}
if(this.getShowingView()!==this){
return;
}
this.goTo(-1);
},goTo:function(_7){
var w=this.domNode.offsetWidth;
var _8=(_7==1)?this.nextView(this.domNode):this.previousView(this.domNode);
if(!_8){
return;
}
_8._beingFlipped=true;
_8.scrollTo({x:w*_7});
_8._beingFlipped=false;
_8.domNode.style.display="";
dojo.addClass(_8.domNode,"mblIn");
this.slideTo({x:0},0.5,"ease-out",{x:-w*_7});
},isSwapView:function(_9){
return (_9&&_9.nodeType===1&&dojo.hasClass(_9,"mblSwapView"));
},nextView:function(_a){
for(var n=_a.nextSibling;n;n=n.nextSibling){
if(this.isSwapView(n)){
return dijit.byNode(n);
}
}
return null;
},previousView:function(_b){
for(var n=_b.previousSibling;n;n=n.previousSibling){
if(this.isSwapView(n)){
return dijit.byNode(n);
}
}
return null;
},scrollTo:function(to){
if(!this._beingFlipped){
var _c,x;
if(to.x<0){
_c=this.nextView(this.domNode);
x=to.x+this.domNode.offsetWidth;
}else{
_c=this.previousView(this.domNode);
x=to.x-this.domNode.offsetWidth;
}
if(_c){
_c.domNode.style.display="";
_c._beingFlipped=true;
_c.scrollTo({x:x});
_c._beingFlipped=false;
}
}
this.inherited(arguments);
},slideTo:function(to,_d,_e,_f){
if(!this._beingFlipped){
var w=this.domNode.offsetWidth;
var pos=_f||this.getPos();
var _10,_11;
if(pos.x<0){
_10=this.nextView(this.domNode);
if(pos.x<-w/4){
if(_10){
to.x=-w;
_11=0;
}
}else{
if(_10){
_11=w;
}
}
}else{
_10=this.previousView(this.domNode);
if(pos.x>w/4){
if(_10){
to.x=w;
_11=0;
}
}else{
if(_10){
_11=-w;
}
}
}
if(_10){
_10._beingFlipped=true;
_10.slideTo({x:_11},_d,_e);
_10._beingFlipped=false;
if(_11===0){
dojox.mobile.currentView=_10;
}
_10.domNode._isShowing=(_10&&_11===0);
}
this.domNode._isShowing=!(_10&&_11===0);
}
this.inherited(arguments);
},onFlickAnimationEnd:function(e){
if(e&&e.animationName&&e.animationName!=="scrollableViewScroll2"){
return;
}
var _12=this.domNode.parentNode.childNodes;
for(var i=0;i<_12.length;i++){
var c=_12[i];
if(this.isSwapView(c)){
dojo.removeClass(c,"mblIn");
if(!c._isShowing){
c.style.display="none";
}
}
}
this.inherited(arguments);
if(this.getShowingView()===this){
dojo.publish("/dojox/mobile/viewChanged",[this]);
}
}});
});
