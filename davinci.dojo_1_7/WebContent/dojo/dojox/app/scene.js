/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/scene",["dojo","dijit","dojox","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dojox/mobile/transition","./model","./view","./bind"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
var _b=function(_c,mb){
var cs=_1.getComputedStyle(_c);
var me=_1._getMarginExtents(_c,cs);
var pb=_1._getPadBorderExtents(_c,cs);
return {l:_1._toPixelValue(_c,cs.paddingLeft),t:_1._toPixelValue(_c,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
var _d=function(_e){
return _e.substring(0,1).toUpperCase()+_e.substring(1);
};
var _f=function(_10,dim){
var _11=_10.resize?_10.resize(dim):_1.marginBox(_10.domNode,dim);
if(_11){
_1.mixin(_10,_11);
}else{
_1.mixin(_10,_1.marginBox(_10.domNode));
_1.mixin(_10,dim);
}
};
return _1.declare("dojox.app.scene",[_2._WidgetBase,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{isContainer:true,widgetsInTemplate:true,defaultView:"default",selectedChild:null,baseClass:"scene mblView",isFullScreen:false,defaultViewType:_9,getParent:function(){
return null;
},constructor:function(_12,_13){
this.children={};
if(_12.parent){
this.parent=_12.parent;
}
if(_12.app){
this.app=_12.app;
}
},buildRendering:function(){
this.inherited(arguments);
_1.style(this.domNode,{width:"100%","height":"100%"});
_1.addClass(this.domNode,"dijitContainer");
},splitChildRef:function(_14){
var id=_14.split(",");
if(id.length>0){
var to=id.shift();
}else{
console.warn("invalid child id passed to splitChildRef(): ",_14);
}
return {id:to||this.defaultView,next:id.join(",")};
},loadChild:function(_15,_16){
if(!_15){
return error("Child ID: '"+_15+"' not found");
}
var cid=this.id+"_"+_15;
if(this.children[cid]){
return this.children[cid];
}
if(this.views&&this.views[_15]){
var _17=this.views[_15];
if(!_17.dependencies){
_17.dependencies=[];
}
var _18=_17.template?_17.dependencies.concat(["dojo/text!app/"+_17.template]):_17.dependencies.concat([]);
var def=new _1.Deferred();
if(_18.length>0){
require(_18,function(){
def.resolve.call(def,arguments);
});
}else{
def.resolve(true);
}
var _19=this;
return _1.when(def,function(){
var _1a;
if(_17.type){
_1a=_1.getObject(_17.type);
}else{
if(_19.defaultViewType){
_1a=_19.defaultViewType;
}else{
throw Error("Unable to find appropriate ctor for the base child class");
}
}
var _1b=_1.mixin({},_17,{id:_19.id+"_"+_15,templateString:_17.template?arguments[0][arguments[0].length-1]:"<div></div>",parent:_19,app:_19.app});
if(_16){
_1b.defaultView=_16;
}
var _1c=new _1a(_1b);
if(!_1c.loadedModels){
_1c.loadedModels=_8(_17.models,_19.loadedModels);
_a([_1c],_1c.loadedModels);
}
return _19.addChild(_1c);
});
}
throw Error("Child '"+_15+"' not found.");
},resize:function(_1d,_1e){
var _1f=this.domNode;
if(_1d){
_1.marginBox(_1f,_1d);
if(_1d.t){
_1f.style.top=_1d.t+"px";
}
if(_1d.l){
_1f.style.left=_1d.l+"px";
}
}
var mb=_1e||{};
_1.mixin(mb,_1d||{});
if(!("h" in mb)||!("w" in mb)){
mb=_1.mixin(_1.marginBox(_1f),mb);
}
var cs=_1.getComputedStyle(_1f);
var me=_1._getMarginExtents(_1f,cs);
var be=_1._getBorderExtents(_1f,cs);
var bb=(this._borderBox={w:mb.w-(me.w+be.w),h:mb.h-(me.h+be.h)});
var pe=_1._getPadExtents(_1f,cs);
this._contentBox={l:_1._toPixelValue(_1f,cs.paddingLeft),t:_1._toPixelValue(_1f,cs.paddingTop),w:bb.w-pe.w,h:bb.h-pe.h};
this.layout();
},layout:function(){
var _20,_21,_22;
if(this.selectedChild&&this.selectedChild.isFullScreen){
console.warn("fullscreen sceen layout");
}else{
_21=_1.query("> [region]",this.domNode).map(function(_23){
var w=_2.getEnclosingWidget(_23);
if(w){
return w;
}
return {domNode:_23,region:_1.attr(_23,"region")};
});
if(this.selectedChild){
_21=_1.filter(_21,function(c){
if(c.region=="center"&&this.selectedChild&&this.selectedChild.domNode!==c.domNode){
_1.style(c.domNode,"z-index",25);
_1.style(c.domNode,"display","none");
return false;
}else{
if(c.region!="center"){
_1.style(c.domNode,"display","");
_1.style(c.domNode,"z-index",100);
}
}
return c.domNode&&c.region;
},this);
}else{
_1.forEach(_21,function(c){
if(c&&c.domNode&&c.region=="center"){
_1.style(c.domNode,"z-index",25);
_1.style(c.domNode,"display","none");
}
});
}
}
this.layoutChildren(this.domNode,this._contentBox,_21);
_1.forEach(this.getChildren(),function(_24){
if(!_24._started&&_24.startup){
_24.startup();
}
});
},layoutChildren:function(_25,dim,_26,_27,_28){
dim=_1.mixin({},dim);
_1.addClass(_25,"dijitLayoutContainer");
_26=_1.filter(_26,function(_29){
return _29.region!="center"&&_29.layoutAlign!="client";
}).concat(_1.filter(_26,function(_2a){
return _2a.region=="center"||_2a.layoutAlign=="client";
}));
_1.forEach(_26,function(_2b){
var elm=_2b.domNode,pos=(_2b.region||_2b.layoutAlign);
var _2c=elm.style;
_2c.left=dim.l+"px";
_2c.top=dim.t+"px";
_2c.position="absolute";
_1.addClass(elm,"dijitAlign"+_d(pos));
var _2d={};
if(_27&&_27==_2b.id){
_2d[_2b.region=="top"||_2b.region=="bottom"?"h":"w"]=_28;
}
if(pos=="top"||pos=="bottom"){
_2d.w=dim.w;
_f(_2b,_2d);
dim.h-=_2b.h;
if(pos=="top"){
dim.t+=_2b.h;
}else{
_2c.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
_2d.h=dim.h;
_f(_2b,_2d);
dim.w-=_2b.w;
if(pos=="left"){
dim.l+=_2b.w;
}else{
_2c.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"||pos=="center"){
_f(_2b,dim);
}
}
}
});
},getChildren:function(){
return this._supportingWidgets;
},startup:function(){
if(this._started){
return;
}
this._started=true;
var _2e=this.defaultView?this.defaultView.split(","):"default";
toId=_2e.shift();
_2f=_2e.join(",");
var _2f;
if(this.views[this.defaultView]&&this.views[this.defaultView]["defaultView"]){
_2f=this.views[this.defaultView]["defaultView"];
}
if(this.models&&!this.loadedModels){
this.loadedModels=_8(this.models);
_a(this.getChildren(),this.loadedModels);
}
var _30=this.loadChild(toId,_2f);
_1.when(_30,_1.hitch(this,function(_31){
this.set("selectedChild",_31);
var _32=this.getParent&&this.getParent();
if(!(_32&&_32.isLayoutContainer)){
this.resize();
this.connect(_1.isIE?this.domNode:_1.global,"onresize",function(){
this.resize();
});
}
_1.forEach(this.getChildren(),function(_33){
_33.startup();
});
}));
},addChild:function(_34){
_1.addClass(_34.domNode,this.baseClass+"_child");
_34.region="center";
_1.attr(_34.domNode,"region","center");
this._supportingWidgets.push(_34);
_1.place(_34.domNode,this.domNode);
this.children[_34.id]=_34;
if(this._started){
this.layout();
}
if(this._started&&!_34._started){
_34.startup();
}
return _34;
},removeChild:function(_35){
if(_35){
var _36=_35.domNode;
if(_36&&_36.parentNode){
_36.parentNode.removeChild(_36);
}
return _35;
}
},_setSelectedChildAttr:function(_37,_38){
if(_37!==this.selectedChild){
return _1.when(_37,_1.hitch(this,function(_39){
if(this.selectedChild){
if(this.selectedChild.deactivate){
this.selectedChild.deactivate();
}
_1.style(this.selectedChild.domNode,"zIndex",25);
}
this.selectedChild=_39;
_1.style(_39.domNode,"display","");
_1.style(_39.domNode,"zIndex",50);
this.selectedChild=_39;
if(this._started){
if(_39.startup&&!_39._started){
_39.startup();
}else{
if(_39.activate){
_39.activate();
}
}
}
this.layout();
}));
}
},transition:function(_3a,_3b){
var _3c,_3d,_3e,_3f=this.selectedChild;
if(_3a){
var _40=_3a.split(",");
_3c=_40.shift();
_3d=_40.join(",");
}else{
_3c=this.defaultView;
if(this.views[this.defaultView]&&this.views[this.defaultView]["defaultView"]){
_3d=this.views[this.defaultView]["defaultView"];
}
}
_3e=this.loadChild(_3c,_3d);
if(!_3f){
return this.set("selectedChild",_3e);
}
return _1.when(_3e,_1.hitch(this,function(_41){
if(_41!==_3f){
this.set("selectedChild",_41);
return def=_7(_3f.domNode,_41.domNode,_1.mixin({},_3b,{transition:this.defaultTransition||"none"})).then(_1.hitch(this,function(){
if(_3c&&_41.transition){
return _41.transition(_3d,_3b);
}
}));
}
if(_3d&&_41.transition){
return _41.transition(_3d,_3b);
}
}));
},toString:function(){
return this.id;
},activate:function(){
},deactive:function(){
}});
});
