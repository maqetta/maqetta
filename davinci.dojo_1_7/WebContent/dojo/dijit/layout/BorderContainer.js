/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/BorderContainer",["dojo/_base/kernel","..","dojo/touch","dojo/cookie","../_WidgetBase","../_TemplatedMixin","./_LayoutWidget","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2,_3){
_1.declare("dijit.layout.BorderContainer",_2.layout._LayoutWidget,{design:"headline",gutters:true,liveSplitters:true,persist:false,baseClass:"dijitBorderContainer",_splitterClass:"dijit.layout._Splitter",postMixInProperties:function(){
if(!this.gutters){
this.baseClass+="NoGutter";
}
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
_1.forEach(this.getChildren(),this._setupChild,this);
this.inherited(arguments);
},_setupChild:function(_4){
var _5=_4.region;
if(_5){
this.inherited(arguments);
_1.addClass(_4.domNode,this.baseClass+"Pane");
var _6=this.isLeftToRight();
if(_5=="leading"){
_5=_6?"left":"right";
}
if(_5=="trailing"){
_5=_6?"right":"left";
}
if(_5!="center"&&(_4.splitter||this.gutters)&&!_4._splitterWidget){
var _7=_1.getObject(_4.splitter?this._splitterClass:"dijit.layout._Gutter");
var _8=new _7({id:_4.id+"_splitter",container:this,child:_4,region:_5,live:this.liveSplitters});
_8.isSplitter=true;
_4._splitterWidget=_8;
_1.place(_8.domNode,_4.domNode,"after");
_8.startup();
}
_4.region=_5;
}
},layout:function(){
this._layoutChildren();
},addChild:function(_9,_a){
this.inherited(arguments);
if(this._started){
this.layout();
}
},removeChild:function(_b){
var _c=_b.region;
var _d=_b._splitterWidget;
if(_d){
_d.destroy();
delete _b._splitterWidget;
}
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
_1.removeClass(_b.domNode,this.baseClass+"Pane");
_1.style(_b.domNode,{top:"auto",bottom:"auto",left:"auto",right:"auto",position:"static"});
_1.style(_b.domNode,_c=="top"||_c=="bottom"?"width":"height","auto");
},getChildren:function(){
return _1.filter(this.inherited(arguments),function(_e){
return !_e.isSplitter;
});
},getSplitter:function(_f){
return _1.filter(this.getChildren(),function(_10){
return _10.region==_f;
})[0]._splitterWidget;
},resize:function(_11,_12){
if(!this.cs||!this.pe){
var _13=this.domNode;
this.cs=_1.getComputedStyle(_13);
this.pe=_1._getPadExtents(_13,this.cs);
this.pe.r=_1._toPixelValue(_13,this.cs.paddingRight);
this.pe.b=_1._toPixelValue(_13,this.cs.paddingBottom);
_1.style(_13,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_14,_15){
if(!this._borderBox||!this._borderBox.h){
return;
}
var _16=_1.map(this.getChildren(),function(_17,idx){
return {pane:_17,weight:[_17.region=="center"?Infinity:0,_17.layoutPriority,(this.design=="sidebar"?1:-1)*(/top|bottom/.test(_17.region)?1:-1),idx]};
},this);
_16.sort(function(a,b){
var aw=a.weight,bw=b.weight;
for(var i=0;i<aw.length;i++){
if(aw[i]!=bw[i]){
return aw[i]-bw[i];
}
}
return 0;
});
var _18=[];
_1.forEach(_16,function(_19){
var _1a=_19.pane;
_18.push(_1a);
if(_1a._splitterWidget){
_18.push(_1a._splitterWidget);
}
});
var dim={l:this.pe.l,t:this.pe.t,w:this._borderBox.w-this.pe.w,h:this._borderBox.h-this.pe.h};
_2.layout.layoutChildren(this.domNode,dim,_18,_14,_15);
},destroyRecursive:function(){
_1.forEach(this.getChildren(),function(_1b){
var _1c=_1b._splitterWidget;
if(_1c){
_1c.destroy();
}
delete _1b._splitterWidget;
});
this.inherited(arguments);
}});
_1.extend(_2._WidgetBase,{region:"",layoutPriority:0,splitter:false,minSize:0,maxSize:Infinity});
_1.declare("dijit.layout._Splitter",[_2._Widget,_2._TemplatedMixin],{live:true,templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,press:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\" tabIndex=\"0\" role=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>",postMixInProperties:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
this._factor=/top|left/.test(this.region)?1:-1;
this._cookieName=this.container.id+"_"+this.region;
},buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V"));
if(this.container.persist){
var _1d=_1.cookie(this._cookieName);
if(_1d){
this.child.domNode.style[this.horizontal?"height":"width"]=_1d;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_1e=_1.marginBox(this.child.domNode)[dim],_1f=_1.filter(this.container.getChildren(),function(_20){
return _20.region=="center";
})[0],_21=_1.marginBox(_1f.domNode)[dim];
return Math.min(this.child.maxSize,_1e+_21);
},_startDrag:function(e){
if(!this.cover){
this.cover=_1.doc.createElement("div");
_1.addClass(this.cover,"dijitSplitterCover");
_1.place(this.cover,this.child.domNode,"after");
}
_1.addClass(this.cover,"dijitSplitterCoverActive");
if(this.fake){
_1.destroy(this.fake);
}
if(!(this._resize=this.live)){
(this.fake=this.domNode.cloneNode(true)).removeAttribute("id");
_1.addClass(this.domNode,"dijitSplitterShadow");
_1.place(this.fake,this.domNode,"after");
}
_1.addClass(this.domNode,"dijitSplitterActive dijitSplitter"+(this.horizontal?"H":"V")+"Active");
if(this.fake){
_1.removeClass(this.fake,"dijitSplitterHover dijitSplitter"+(this.horizontal?"H":"V")+"Hover");
}
var _22=this._factor,_23=this.horizontal,_24=_23?"pageY":"pageX",_25=e[_24],_26=this.domNode.style,dim=_23?"h":"w",_27=_1.marginBox(this.child.domNode)[dim],max=this._computeMaxSize(),min=this.child.minSize||20,_28=this.region,_29=_28=="top"||_28=="bottom"?"top":"left",_2a=parseInt(_26[_29],10),_2b=this._resize,_2c=_1.hitch(this.container,"_layoutChildren",this.child.id),de=_1.doc;
this._handlers=(this._handlers||[]).concat([_1.connect(de,_3.move,this._drag=function(e,_2d){
var _2e=e[_24]-_25,_2f=_22*_2e+_27,_30=Math.max(Math.min(_2f,max),min);
if(_2b||_2d){
_2c(_30);
}
_26[_29]=_2e+_2a+_22*(_30-_2f)+"px";
}),_1.connect(de,"ondragstart",_1.stopEvent),_1.connect(_1.body(),"onselectstart",_1.stopEvent),_1.connect(de,_3.release,this,"_stopDrag")]);
_1.stopEvent(e);
},_onMouse:function(e){
var o=(e.type=="mouseover"||e.type=="mouseenter");
_1.toggleClass(this.domNode,"dijitSplitterHover",o);
_1.toggleClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V")+"Hover",o);
},_stopDrag:function(e){
try{
if(this.cover){
_1.removeClass(this.cover,"dijitSplitterCoverActive");
}
if(this.fake){
_1.destroy(this.fake);
}
_1.removeClass(this.domNode,"dijitSplitterActive dijitSplitter"+(this.horizontal?"H":"V")+"Active dijitSplitterShadow");
this._drag(e);
this._drag(e,true);
}
finally{
this._cleanupHandlers();
delete this._drag;
}
if(this.container.persist){
_1.cookie(this._cookieName,this.child.domNode.style[this.horizontal?"height":"width"],{expires:365});
}
},_cleanupHandlers:function(){
_1.forEach(this._handlers,_1.disconnect);
delete this._handlers;
},_onKeyPress:function(e){
this._resize=true;
var _31=this.horizontal;
var _32=1;
var dk=_1.keys;
switch(e.charOrCode){
case _31?dk.UP_ARROW:dk.LEFT_ARROW:
_32*=-1;
case _31?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _33=_1._getMarginSize(this.child.domNode)[_31?"h":"w"]+this._factor*_32;
this.container._layoutChildren(this.child.id,Math.max(Math.min(_33,this._computeMaxSize()),this.child.minSize));
_1.stopEvent(e);
},destroy:function(){
this._cleanupHandlers();
delete this.child;
delete this.container;
delete this.cover;
delete this.fake;
this.inherited(arguments);
}});
_1.declare("dijit.layout._Gutter",[_2._Widget,_2._TemplatedMixin],{templateString:"<div class=\"dijitGutter\" role=\"presentation\"></div>",postMixInProperties:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
},buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"dijitGutter"+(this.horizontal?"H":"V"));
}});
return _2.layout.BorderContainer;
});
