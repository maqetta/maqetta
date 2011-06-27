/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/Stencil",["dojo","../util/oo"],function(_1){
_1.getObject("drawing.manager",true,dojox);
var _2,_3;
dojox.drawing.manager.Stencil=dojox.drawing.util.oo.declare(function(_4){
_2=_4.surface;
this.canvas=_4.canvas;
this.defaults=dojox.drawing.defaults.copy();
this.undo=_4.undo;
this.mouse=_4.mouse;
this.keys=_4.keys;
this.anchors=_4.anchors;
this.stencils={};
this.selectedStencils={};
this._mouseHandle=this.mouse.register(this);
_1.connect(this.keys,"onArrow",this,"onArrow");
_1.connect(this.keys,"onEsc",this,"deselect");
_1.connect(this.keys,"onDelete",this,"onDelete");
},{_dragBegun:false,_wasDragged:false,_secondClick:false,_isBusy:false,setRecentStencil:function(_5){
this.recent=_5;
},getRecentStencil:function(){
return this.recent;
},register:function(_6){
if(_6.isText&&!_6.editMode&&_6.deleteEmptyCreate&&!_6.getText()){
console.warn("EMPTY CREATE DELETE",_6);
_6.destroy();
return false;
}
this.stencils[_6.id]=_6;
this.setRecentStencil(_6);
if(_6.execText){
if(_6._text&&!_6.editMode){
this.selectItem(_6);
}
_6.connect("execText",this,function(){
if(_6.isText&&_6.deleteEmptyModify&&!_6.getText()){
console.warn("EMPTY MOD DELETE",_6);
this.deleteItem(_6);
}else{
if(_6.selectOnExec){
this.selectItem(_6);
}
}
});
}
_6.connect("deselect",this,function(){
if(!this._isBusy&&this.isSelected(_6)){
this.deselectItem(_6);
}
});
_6.connect("select",this,function(){
if(!this._isBusy&&!this.isSelected(_6)){
this.selectItem(_6);
}
});
return _6;
},unregister:function(_7){
if(_7){
_7.selected&&this.onDeselect(_7);
delete this.stencils[_7.id];
}
},onArrow:function(_8){
if(this.hasSelected()){
this.saveThrottledState();
this.group.applyTransform({dx:_8.x,dy:_8.y});
}
},_throttleVrl:null,_throttle:false,throttleTime:400,_lastmxx:-1,_lastmxy:-1,saveMoveState:function(){
var mx=this.group.getTransform();
if(mx.dx==this._lastmxx&&mx.dy==this._lastmxy){
return;
}
this._lastmxx=mx.dx;
this._lastmxy=mx.dy;
this.undo.add({before:_1.hitch(this.group,"setTransform",mx)});
},saveThrottledState:function(){
clearTimeout(this._throttleVrl);
clearInterval(this._throttleVrl);
this._throttleVrl=setTimeout(_1.hitch(this,function(){
this._throttle=false;
this.saveMoveState();
}),this.throttleTime);
if(this._throttle){
return;
}
this._throttle=true;
this.saveMoveState();
},unDelete:function(_9){
for(var s in _9){
_9[s].render();
this.onSelect(_9[s]);
}
},onDelete:function(_a){
if(_a!==true){
this.undo.add({before:_1.hitch(this,"unDelete",this.selectedStencils),after:_1.hitch(this,"onDelete",true)});
}
this.withSelected(function(m){
this.anchors.remove(m);
var id=m.id;
m.destroy();
delete this.stencils[id];
});
this.selectedStencils={};
},deleteItem:function(_b){
if(this.hasSelected()){
var _c=[];
for(var m in this.selectedStencils){
if(this.selectedStencils.id==_b.id){
if(this.hasSelected()==1){
this.onDelete();
return;
}
}else{
_c.push(this.selectedStencils.id);
}
}
this.deselect();
this.selectItem(_b);
this.onDelete();
_1.forEach(_c,function(id){
this.selectItem(id);
},this);
}else{
this.selectItem(_b);
this.onDelete();
}
},removeAll:function(){
this.selectAll();
this._isBusy=true;
this.onDelete();
this.stencils={};
this._isBusy=false;
},setSelectionGroup:function(){
this.withSelected(function(m){
this.onDeselect(m,true);
});
if(this.group){
_2.remove(this.group);
this.group.removeShape();
}
this.group=_2.createGroup();
this.group.setTransform({dx:0,dy:0});
this.withSelected(function(m){
this.group.add(m.container);
m.select();
});
},setConstraint:function(){
var t=Infinity,l=Infinity;
this.withSelected(function(m){
var o=m.getBounds();
t=Math.min(o.y1,t);
l=Math.min(o.x1,l);
});
this.constrain={l:-l,t:-t};
},onDeselect:function(_d,_e){
if(!_e){
delete this.selectedStencils[_d.id];
}
this.anchors.remove(_d);
_2.add(_d.container);
_d.selected&&_d.deselect();
_d.applyTransform(this.group.getTransform());
},deselectItem:function(_f){
this.onDeselect(_f);
},deselect:function(){
this.withSelected(function(m){
this.onDeselect(m);
});
this._dragBegun=false;
this._wasDragged=false;
},onSelect:function(_10){
if(!_10){
console.error("null stencil is not selected:",this.stencils);
}
if(this.selectedStencils[_10.id]){
return;
}
this.selectedStencils[_10.id]=_10;
this.group.add(_10.container);
_10.select();
if(this.hasSelected()==1){
this.anchors.add(_10,this.group);
}
},selectAll:function(){
this._isBusy=true;
for(var m in this.stencils){
this.selectItem(m);
}
this._isBusy=false;
},selectItem:function(_11){
var id=typeof (_11)=="string"?_11:_11.id;
var _12=this.stencils[id];
this.setSelectionGroup();
this.onSelect(_12);
this.group.moveToFront();
this.setConstraint();
},onLabelDoubleClick:function(obj){
if(this.selectedStencils[obj.id]){
this.deselect();
}
},onStencilDoubleClick:function(obj){
if(this.selectedStencils[obj.id]){
if(this.selectedStencils[obj.id].edit){
var m=this.selectedStencils[obj.id];
m.editMode=true;
this.deselect();
m.edit();
}
}
},onAnchorUp:function(){
this.setConstraint();
},onStencilDown:function(obj,evt){
if(!this.stencils[obj.id]){
return;
}
this.setRecentStencil(this.stencils[obj.id]);
this._isBusy=true;
if(this.selectedStencils[obj.id]&&this.keys.meta){
if(_1.isMac&&this.keys.cmmd){
}
this.onDeselect(this.selectedStencils[obj.id]);
if(this.hasSelected()==1){
this.withSelected(function(m){
this.anchors.add(m,this.group);
});
}
this.group.moveToFront();
this.setConstraint();
return;
}else{
if(this.selectedStencils[obj.id]){
var mx=this.group.getTransform();
this._offx=obj.x-mx.dx;
this._offy=obj.y-mx.dy;
return;
}else{
if(!this.keys.meta){
this.deselect();
}else{
}
}
}
this.selectItem(obj.id);
mx=this.group.getTransform();
this._offx=obj.x-mx.dx;
this._offy=obj.y-mx.dx;
this.orgx=obj.x;
this.orgy=obj.y;
this._isBusy=false;
this.undo.add({before:function(){
},after:function(){
}});
},onLabelDown:function(obj,evt){
this.onStencilDown(obj,evt);
},onStencilUp:function(obj){
},onLabelUp:function(obj){
this.onStencilUp(obj);
},onStencilDrag:function(obj){
if(!this._dragBegun){
this.onBeginDrag(obj);
this._dragBegun=true;
}else{
this.saveThrottledState();
var x=obj.x-obj.last.x,y=obj.y-obj.last.y,c=this.constrain,mz=this.defaults.anchors.marginZero;
x=obj.x-this._offx;
y=obj.y-this._offy;
if(x<c.l+mz){
x=c.l+mz;
}
if(y<c.t+mz){
y=c.t+mz;
}
this.group.setTransform({dx:x,dy:y});
}
},onLabelDrag:function(obj){
this.onStencilDrag(obj);
},onDragEnd:function(obj){
this._dragBegun=false;
},onBeginDrag:function(obj){
this._wasDragged=true;
},onDown:function(obj){
this.deselect();
},onStencilOver:function(obj){
_1.style(obj.id,"cursor","move");
},onStencilOut:function(obj){
_1.style(obj.id,"cursor","crosshair");
},exporter:function(){
var _13=[];
for(var m in this.stencils){
this.stencils[m].enabled&&_13.push(this.stencils[m].exporter());
}
return _13;
},listStencils:function(){
return this.stencils;
},toSelected:function(_14){
var _15=Array.prototype.slice.call(arguments).splice(1);
for(var m in this.selectedStencils){
var _16=this.selectedStencils[m];
_16[_14].apply(_16,_15);
}
},withSelected:function(_17){
var f=_1.hitch(this,_17);
for(var m in this.selectedStencils){
f(this.selectedStencils[m]);
}
},withUnselected:function(_18){
var f=_1.hitch(this,_18);
for(var m in this.stencils){
!this.stencils[m].selected&&f(this.stencils[m]);
}
},withStencils:function(_19){
var f=_1.hitch(this,_19);
for(var m in this.stencils){
f(this.stencils[m]);
}
},hasSelected:function(){
var ln=0;
for(var m in this.selectedStencils){
ln++;
}
return ln;
},isSelected:function(_1a){
return !!this.selectedStencils[_1a.id];
}});
return dojox.drawing.manager.Stencil;
});
