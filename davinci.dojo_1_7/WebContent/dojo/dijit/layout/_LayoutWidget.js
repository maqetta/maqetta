/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/_LayoutWidget",["dojo/_base/kernel","..","../_Widget","../_Container","../_Contained","dojo/_base/array","dojo/_base/declare","dojo/_base/html","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.layout._LayoutWidget",[_2._Widget,_2._Container,_2._Contained],{baseClass:"dijitLayoutContainer",isLayoutContainer:true,buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"dijitContainer");
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
var _3=this.getParent&&this.getParent();
if(!(_3&&_3.isLayoutContainer)){
this.resize();
this.connect(_1.isIE?this.domNode:_1.global,"onresize",function(){
this.resize();
});
}
},resize:function(_4,_5){
var _6=this.domNode;
if(_4){
_1.marginBox(_6,_4);
if(_4.t){
_6.style.top=_4.t+"px";
}
if(_4.l){
_6.style.left=_4.l+"px";
}
}
var mb=_5||{};
_1.mixin(mb,_4||{});
if(!("h" in mb)||!("w" in mb)){
mb=_1.mixin(_1.marginBox(_6),mb);
}
var cs=_1.getComputedStyle(_6);
var me=_1._getMarginExtents(_6,cs);
var be=_1._getBorderExtents(_6,cs);
var bb=(this._borderBox={w:mb.w-(me.w+be.w),h:mb.h-(me.h+be.h)});
var pe=_1._getPadExtents(_6,cs);
this._contentBox={l:_1._toPixelValue(_6,cs.paddingLeft),t:_1._toPixelValue(_6,cs.paddingTop),w:bb.w-pe.w,h:bb.h-pe.h};
this.layout();
},layout:function(){
},_setupChild:function(_7){
var _8=this.baseClass+"-child "+(_7.baseClass?this.baseClass+"-"+_7.baseClass:"");
_1.addClass(_7.domNode,_8);
},addChild:function(_9,_a){
this.inherited(arguments);
if(this._started){
this._setupChild(_9);
}
},removeChild:function(_b){
var _c=this.baseClass+"-child"+(_b.baseClass?" "+this.baseClass+"-"+_b.baseClass:"");
_1.removeClass(_b.domNode,_c);
this.inherited(arguments);
}});
_2.layout.marginBox2contentBox=function(_d,mb){
var cs=_1.getComputedStyle(_d);
var me=_1._getMarginExtents(_d,cs);
var pb=_1._getPadBorderExtents(_d,cs);
return {l:_1._toPixelValue(_d,cs.paddingLeft),t:_1._toPixelValue(_d,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
function _e(_f){
return _f.substring(0,1).toUpperCase()+_f.substring(1);
};
function _10(_11,dim){
var _12=_11.resize?_11.resize(dim):_1.marginBox(_11.domNode,dim);
if(_12){
_1.mixin(_11,_12);
}else{
_1.mixin(_11,_1.marginBox(_11.domNode));
_1.mixin(_11,dim);
}
};
_2.layout.layoutChildren=function(_13,dim,_14,_15,_16){
dim=_1.mixin({},dim);
_1.addClass(_13,"dijitLayoutContainer");
_14=_1.filter(_14,function(_17){
return _17.region!="center"&&_17.layoutAlign!="client";
}).concat(_1.filter(_14,function(_18){
return _18.region=="center"||_18.layoutAlign=="client";
}));
_1.forEach(_14,function(_19){
var elm=_19.domNode,pos=(_19.region||_19.layoutAlign);
var _1a=elm.style;
_1a.left=dim.l+"px";
_1a.top=dim.t+"px";
_1a.position="absolute";
_1.addClass(elm,"dijitAlign"+_e(pos));
var _1b={};
if(_15&&_15==_19.id){
_1b[_19.region=="top"||_19.region=="bottom"?"h":"w"]=_16;
}
if(pos=="top"||pos=="bottom"){
_1b.w=dim.w;
_10(_19,_1b);
dim.h-=_19.h;
if(pos=="top"){
dim.t+=_19.h;
}else{
_1a.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
_1b.h=dim.h;
_10(_19,_1b);
dim.w-=_19.w;
if(pos=="left"){
dim.l+=_19.w;
}else{
_1a.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"||pos=="center"){
_10(_19,dim);
}
}
}
});
};
return _2.layout._LayoutWidget;
});
