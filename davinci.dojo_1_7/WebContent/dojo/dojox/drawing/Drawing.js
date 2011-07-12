/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/Drawing",["dojo","../","./manager/_registry","../gfx","./util/oo","./util/common","./util/typeset","./defaults","./manager/Anchors","./manager/Canvas","./manager/keys","./manager/Mouse","./manager/Stencil","./manager/StencilUI","./manager/Undo","./stencil/_Base","./stencil/Ellipse","./stencil/Image","./stencil/Line","./stencil/Path","./stencil/Rect","./stencil/Text","./annotations/Angle","./annotations/Arrow","./annotations/BoxShadow","./annotations/Label"],function(_1,_2){
_1.experimental("dojox.drawing");
var _3=false;
_1.declare("dojox.drawing.Drawing",[],{ready:false,mode:"",width:0,height:0,constructor:function(_4,_5){
var _6=_1.attr(_5,"defaults");
if(_6){
_2.drawing.defaults=_1.getObject(_6);
}
this.defaults=_2.drawing.defaults;
this.id=_5.id;
_2.drawing.register(this,"drawing");
this.mode=(_4.mode||_1.attr(_5,"mode")||"").toLowerCase();
var _7=_1.contentBox(_5);
this.width=_7.w;
this.height=_7.h;
this.util=_2.drawing.util.common;
this.util.register(this);
this.keys=_2.drawing.manager.keys;
this.mouse=new _2.drawing.manager.Mouse({util:this.util,keys:this.keys,id:this.mode=="ui"?"MUI":"mse"});
this.mouse.setEventMode(this.mode);
this.tools={};
this.stencilTypes={};
this.stencilTypeMap={};
this.srcRefNode=_5;
this.domNode=_5;
if(_4.plugins){
this.plugins=eval(_4.plugins);
}else{
this.plugins=[];
}
this.widgetId=this.id;
_1.attr(this.domNode,"widgetId",this.widgetId);
if(dijit&&dijit.registry){
dijit.registry.add(this);
}else{
dijit.registry={objs:{},add:function(_8){
this.objs[_8.id]=_8;
}};
dijit.byId=function(id){
return dijit.registry.objs[id];
};
dijit.registry.add(this);
}
var _9=_2.drawing.getRegistered("stencil");
for(var nm in _9){
this.registerTool(_9[nm].name);
}
var _a=_2.drawing.getRegistered("tool");
for(nm in _a){
this.registerTool(_a[nm].name);
}
var _b=_2.drawing.getRegistered("plugin");
for(nm in _b){
this.registerTool(_b[nm].name);
}
this._createCanvas();
},_createCanvas:function(){
this.canvas=new _2.drawing.manager.Canvas({srcRefNode:this.domNode,util:this.util,mouse:this.mouse,callback:_1.hitch(this,"onSurfaceReady")});
this.initPlugins();
},resize:function(_c){
_c&&_1.style(this.domNode,{width:_c.w+"px",height:_c.h+"px"});
if(!this.canvas){
this._createCanvas();
}else{
if(_c){
this.canvas.resize(_c.w,_c.h);
}
}
},startup:function(){
},getShapeProps:function(_d,_e){
var _f=_d.stencilType;
var ui=this.mode=="ui"||_e=="ui";
return _1.mixin({container:ui&&!_f?this.canvas.overlay.createGroup():this.canvas.surface.createGroup(),util:this.util,keys:this.keys,mouse:this.mouse,drawing:this,drawingType:ui&&!_f?"ui":"stencil",style:this.defaults.copy()},_d||{});
},addPlugin:function(_10){
this.plugins.push(_10);
if(this.canvas.surfaceReady){
this.initPlugins();
}
},initPlugins:function(){
if(!this.canvas||!this.canvas.surfaceReady){
var c=_1.connect(this,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.initPlugins();
});
return;
}
_1.forEach(this.plugins,function(p,i){
var _11=_1.mixin({util:this.util,keys:this.keys,mouse:this.mouse,drawing:this,stencils:this.stencils,anchors:this.anchors,canvas:this.canvas},p.options||{});
this.registerTool(p.name,_1.getObject(p.name));
try{
this.plugins[i]=new this.tools[p.name](_11);
}
catch(e){
console.error("Failed to initilaize plugin:\t"+p.name+". Did you require it?");
}
},this);
_3=true;
this.mouse.setCanvas();
},onSurfaceReady:function(){
this.ready=true;
this.mouse.init(this.canvas.domNode);
this.undo=new _2.drawing.manager.Undo({keys:this.keys});
this.anchors=new _2.drawing.manager.Anchors({drawing:this,mouse:this.mouse,undo:this.undo,util:this.util});
if(this.mode=="ui"){
this.uiStencils=new _2.drawing.manager.StencilUI({canvas:this.canvas,surface:this.canvas.surface,mouse:this.mouse,keys:this.keys});
}else{
this.stencils=new _2.drawing.manager.Stencil({canvas:this.canvas,surface:this.canvas.surface,mouse:this.mouse,undo:this.undo,keys:this.keys,anchors:this.anchors});
this.uiStencils=new _2.drawing.manager.StencilUI({canvas:this.canvas,surface:this.canvas.surface,mouse:this.mouse,keys:this.keys});
}
if(_2.gfx.renderer=="silverlight"){
try{
new _2.drawing.plugins.drawing.Silverlight({util:this.util,mouse:this.mouse,stencils:this.stencils,anchors:this.anchors,canvas:this.canvas});
}
catch(e){
throw new Error("Attempted to install the Silverlight plugin, but it was not found.");
}
}
_1.forEach(this.plugins,function(p){
p.onSurfaceReady&&p.onSurfaceReady();
});
},addUI:function(_12,_13){
if(!this.ready){
var c=_1.connect(this,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.addUI(_12,_13);
});
return false;
}
if(_13&&!_13.data&&!_13.points){
_13={data:_13};
}
if(!this.stencilTypes[_12]){
if(_12!="tooltip"){
console.warn("Not registered:",_12);
}
return null;
}
var s=this.uiStencils.register(new this.stencilTypes[_12](this.getShapeProps(_13,"ui")));
return s;
},addStencil:function(_14,_15){
if(!this.ready){
var c=_1.connect(this,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.addStencil(_14,_15);
});
return false;
}
if(_15&&!_15.data&&!_15.points){
_15={data:_15};
}
var s=this.stencils.register(new this.stencilTypes[_14](this.getShapeProps(_15)));
this.currentStencil&&this.currentStencil.moveToFront();
return s;
},removeStencil:function(_16){
this.stencils.unregister(_16);
_16.destroy();
},removeAll:function(){
this.stencils.removeAll();
},selectAll:function(){
this.stencils.selectAll();
},toSelected:function(_17){
this.stencils.toSelected.apply(this.stencils,arguments);
},exporter:function(){
return this.stencils.exporter();
},importer:function(_18){
_1.forEach(_18,function(m){
this.addStencil(m.type,m);
},this);
},changeDefaults:function(_19,_1a){
if(_1a!=undefined&&_1a){
for(var nm in _19){
this.defaults[nm]=_19[nm];
}
}else{
for(var nm in _19){
for(var n in _19[nm]){
this.defaults[nm][n]=_19[nm][n];
}
}
}
if(this.currentStencil!=undefined&&(!this.currentStencil.created||this.defaults.clickMode)){
this.unSetTool();
this.setTool(this.currentType);
}
},onRenderStencil:function(_1b){
this.stencils.register(_1b);
this.unSetTool();
if(!this.defaults.clickMode){
this.setTool(this.currentType);
}else{
this.defaults.clickable=true;
}
},onDeleteStencil:function(_1c){
this.stencils.unregister(_1c);
},registerTool:function(_1d){
if(this.tools[_1d]){
return;
}
var _1e=_1.getObject(_1d);
this.tools[_1d]=_1e;
var _1f=this.util.abbr(_1d);
this.stencilTypes[_1f]=_1e;
this.stencilTypeMap[_1f]=_1d;
},getConstructor:function(_20){
return this.stencilTypes[_20];
},setTool:function(_21){
if(this.mode=="ui"){
return;
}
if(!this.canvas||!this.canvas.surface){
var c=_1.connect(this,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.setTool(_21);
});
return;
}
if(this.currentStencil){
this.unSetTool();
}
this.currentType=this.tools[_21]?_21:this.stencilTypeMap[_21];
try{
this.currentStencil=new this.tools[this.currentType]({container:this.canvas.surface.createGroup(),util:this.util,mouse:this.mouse,keys:this.keys});
if(this.defaults.clickMode){
this.defaults.clickable=false;
}
this.currentStencil.connect(this.currentStencil,"onRender",this,"onRenderStencil");
this.currentStencil.connect(this.currentStencil,"destroy",this,"onDeleteStencil");
}
catch(e){
console.error("dojox.drawing.setTool Error:",e);
console.error(this.currentType+" is not a constructor: ",this.tools[this.currentType]);
}
},set:function(_22,_23){
},unSetTool:function(){
if(!this.currentStencil.created){
this.currentStencil.destroy();
}
}});
return _2.drawing.Drawing;
});
