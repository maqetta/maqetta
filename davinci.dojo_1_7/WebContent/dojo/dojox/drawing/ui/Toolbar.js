/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/ui/Toolbar",["dojo","../util/common"],function(_1){
_1.declare("dojox.drawing.ui.Toolbar",[],{constructor:function(_2,_3){
this.util=dojox.drawing.util.common;
if(_2.drawing){
this.toolDrawing=_2.drawing;
this.drawing=this.toolDrawing;
this.width=this.toolDrawing.width;
this.height=this.toolDrawing.height;
this.strSelected=_2.selected;
this.strTools=_2.tools;
this.strPlugs=_2.plugs;
this._mixprops(["padding","margin","size","radius"],_2);
this.addBack();
this.orient=_2.orient?_2.orient:false;
}else{
var _4=_1.marginBox(_3);
this.width=_4.w;
this.height=_4.h;
this.strSelected=_1.attr(_3,"selected");
this.strTools=_1.attr(_3,"tools");
this.strPlugs=_1.attr(_3,"plugs");
this._mixprops(["padding","margin","size","radius"],_3);
this.toolDrawing=new dojox.drawing.Drawing({mode:"ui"},_3);
this.orient=_1.attr(_3,"orient");
}
this.horizontal=this.orient?this.orient=="H":this.width>this.height;
if(this.toolDrawing.ready){
this.makeButtons();
if(!this.strSelected&&this.drawing.defaults.clickMode){
this.drawing.mouse.setCursor("default");
}
}else{
var c=_1.connect(this.toolDrawing,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.drawing=dojox.drawing.getRegistered("drawing",_1.attr(_3,"drawingId"));
this.makeButtons();
if(!this.strSelected&&this.drawing.defaults.clickMode){
var c=_1.connect(this.drawing,"onSurfaceReady",this,function(){
_1.disconnect(c);
this.drawing.mouse.setCursor("default");
});
}
});
}
},padding:10,margin:5,size:30,radius:3,toolPlugGap:20,strSelected:"",strTools:"",strPlugs:"",makeButtons:function(){
this.buttons=[];
this.plugins=[];
var x=this.padding,y=this.padding,w=this.size,h=this.size,r=this.radius,g=this.margin,_5=dojox.drawing.library.icons,s={place:"BR",size:2,mult:4};
if(this.strTools){
var _6=[];
var _7=dojox.drawing.getRegistered("tool");
var _8={};
for(var nm in _7){
var _9=this.util.abbr(nm);
_8[_9]=_7[nm];
if(this.strTools=="all"){
_6.push(_9);
var _a=dojox.drawing.getRegistered("tool",nm);
if(_a.secondary){
_6.push(_a.secondary.name);
}
}
}
if(this.strTools!="all"){
var _b=this.strTools.split(",");
_1.forEach(_b,function(_c){
_c=_1.trim(_c);
_6.push(_c);
var _d=dojox.drawing.getRegistered("tool",_8[_c].name);
if(_d.secondary){
_6.push(_d.secondary.name);
}
},this);
}
_1.forEach(_6,function(t){
t=_1.trim(t);
var _e=false;
if(t.indexOf("Secondary")>-1){
var _f=t.substring(0,t.indexOf("Secondary"));
var sec=dojox.drawing.getRegistered("tool",_8[_f].name).secondary;
var _10=sec.label;
this[t]=sec.funct;
if(sec.setup){
_1.hitch(this,sec.setup)();
}
var btn=this.toolDrawing.addUI("button",{data:{x:x,y:y,width:w,height:h/2,r:r},toolType:t,secondary:true,text:_10,shadow:s,scope:this,callback:this[t]});
if(sec.postSetup){
_1.hitch(this,sec.postSetup,btn)();
}
_e=true;
}else{
var btn=this.toolDrawing.addUI("button",{data:{x:x,y:y,width:w,height:h,r:r},toolType:t,icon:_5[t],shadow:s,scope:this,callback:"onToolClick"});
}
dojox.drawing.register(btn,"button");
this.buttons.push(btn);
if(this.strSelected==t){
btn.select();
this.selected=btn;
this.drawing.setTool(btn.toolType);
}
if(this.horizontal){
x+=h+g;
}else{
var _11=_e?h/2+g:h+g;
y+=_11;
}
},this);
}
if(this.horizontal){
x+=this.toolPlugGap;
}else{
y+=this.toolPlugGap;
}
if(this.strPlugs){
var _12=[];
var _13=dojox.drawing.getRegistered("plugin");
var _14={};
for(var nm in _13){
var _15=this.util.abbr(nm);
_14[_15]=_13[nm];
if(this.strPlugs=="all"){
_12.push(_15);
}
}
if(this.strPlugs!="all"){
_12=this.strPlugs.split(",");
_1.map(_12,function(p){
return _1.trim(p);
});
}
_1.forEach(_12,function(p){
var t=_1.trim(p);
if(_14[p].button!=false){
var btn=this.toolDrawing.addUI("button",{data:{x:x,y:y,width:w,height:h,r:r},toolType:t,icon:_5[t],shadow:s,scope:this,callback:"onPlugClick"});
dojox.drawing.register(btn,"button");
this.plugins.push(btn);
if(this.horizontal){
x+=h+g;
}else{
y+=h+g;
}
}
var _16={};
_14[p].button==false?_16={name:this.drawing.stencilTypeMap[p]}:_16={name:this.drawing.stencilTypeMap[p],options:{button:btn}};
this.drawing.addPlugin(_16);
},this);
}
_1.connect(this.drawing,"onRenderStencil",this,"onRenderStencil");
},onRenderStencil:function(_17){
if(this.drawing.defaults.clickMode){
this.drawing.mouse.setCursor("default");
this.selected&&this.selected.deselect();
this.selected=null;
}
},addTool:function(){
},addPlugin:function(){
},addBack:function(){
this.toolDrawing.addUI("rect",{data:{x:0,y:0,width:this.width,height:this.size+(this.padding*2),fill:"#ffffff",borderWidth:0}});
},onToolClick:function(_18){
if(this.drawing.defaults.clickMode){
this.drawing.mouse.setCursor("crosshair");
}
_1.forEach(this.buttons,function(b){
if(b.id==_18.id){
b.select();
this.selected=b;
this.drawing.setTool(_18.toolType);
}else{
if(!b.secondary){
b.deselect();
}
}
},this);
},onPlugClick:function(_19){
},_mixprops:function(_1a,_1b){
_1.forEach(_1a,function(p){
this[p]=_1b.tagName?_1.attr(_1b,p)===null?this[p]:_1.attr(_1b,p):_1b[p]===undefined?this[p]:_1b[p];
},this);
}});
return dojox.drawing.ui.Toolbar;
});
