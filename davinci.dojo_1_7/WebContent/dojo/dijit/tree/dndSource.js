/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/tree/dndSource",["dojo/_base/kernel","..","dojo/touch","./_dndSelector","dojo/dnd/Manager","dojo/_base/array","dojo/_base/connect","dojo/_base/html"],function(_1,_2,_3){
_1.declare("dijit.tree.dndSource",_2.tree._dndSelector,{isSource:true,accept:["text","treeNode"],copyOnly:false,dragThreshold:5,betweenThreshold:0,constructor:function(_4,_5){
if(!_5){
_5={};
}
_1.mixin(this,_5);
this.isSource=typeof _5.isSource=="undefined"?true:_5.isSource;
var _6=_5.accept instanceof Array?_5.accept:["text","treeNode"];
this.accept=null;
if(_6.length){
this.accept={};
for(var i=0;i<_6.length;++i){
this.accept[_6[i]]=1;
}
}
this.isDragging=false;
this.mouseDown=false;
this.targetAnchor=null;
this.targetBox=null;
this.dropPosition="";
this._lastX=0;
this._lastY=0;
this.sourceState="";
if(this.isSource){
_1.addClass(this.node,"dojoDndSource");
}
this.targetState="";
if(this.accept){
_1.addClass(this.node,"dojoDndTarget");
}
this.topics=[_1.subscribe("/dnd/source/over",this,"onDndSourceOver"),_1.subscribe("/dnd/start",this,"onDndStart"),_1.subscribe("/dnd/drop",this,"onDndDrop"),_1.subscribe("/dnd/cancel",this,"onDndCancel")];
},checkAcceptance:function(_7,_8){
return true;
},copyState:function(_9){
return this.copyOnly||_9;
},destroy:function(){
this.inherited("destroy",arguments);
_1.forEach(this.topics,_1.unsubscribe);
this.targetAnchor=null;
},_onDragMouse:function(e){
var m=_1.dnd.manager(),_a=this.targetAnchor,_b=this.current,_c=this.dropPosition;
var _d="Over";
if(_b&&this.betweenThreshold>0){
if(!this.targetBox||_a!=_b){
this.targetBox=_1.position(_b.rowNode,true);
}
if((e.pageY-this.targetBox.y)<=this.betweenThreshold){
_d="Before";
}else{
if((e.pageY-this.targetBox.y)>=(this.targetBox.h-this.betweenThreshold)){
_d="After";
}
}
}
if(_b!=_a||_d!=_c){
if(_a){
this._removeItemClass(_a.rowNode,_c);
}
if(_b){
this._addItemClass(_b.rowNode,_d);
}
if(!_b){
m.canDrop(false);
}else{
if(_b==this.tree.rootNode&&_d!="Over"){
m.canDrop(false);
}else{
if(m.source==this&&(_b.id in this.selection)){
m.canDrop(false);
}else{
if(this.checkItemAcceptance(_b.rowNode,m.source,_d.toLowerCase())&&!this._isParentChildDrop(m.source,_b.rowNode)){
m.canDrop(true);
}else{
m.canDrop(false);
}
}
}
}
this.targetAnchor=_b;
this.dropPosition=_d;
}
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
this.inherited(arguments);
var m=_1.dnd.manager();
if(this.isDragging){
this._onDragMouse(e);
}else{
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>=this.dragThreshold||Math.abs(e.pageY-this._lastY)>=this.dragThreshold)){
var _e=this.getSelectedTreeNodes();
if(_e.length){
if(_e.length>1){
var _f=this.selection,i=0,r=[],n,p;
nextitem:
while((n=_e[i++])){
for(p=n.getParent();p&&p!==this.tree;p=p.getParent()){
if(_f[p.id]){
continue nextitem;
}
}
r.push(n);
}
_e=r;
}
_e=_1.map(_e,function(n){
return n.domNode;
});
m.startDrag(this,_e,this.copyState(_1.isCopyKey(e)));
}
}
}
},onMouseDown:function(e){
this.mouseDown=true;
this.mouseButton=e.button;
this._lastX=e.pageX;
this._lastY=e.pageY;
this.inherited(arguments);
},onMouseUp:function(e){
if(this.mouseDown){
this.mouseDown=false;
this.inherited(arguments);
}
},onMouseOut:function(){
this.inherited(arguments);
this._unmarkTargetAnchor();
},checkItemAcceptance:function(_10,_11,_12){
return true;
},onDndSourceOver:function(_13){
if(this!=_13){
this.mouseDown=false;
this._unmarkTargetAnchor();
}else{
if(this.isDragging){
var m=_1.dnd.manager();
m.canDrop(false);
}
}
},onDndStart:function(_14,_15,_16){
if(this.isSource){
this._changeState("Source",this==_14?(_16?"Copied":"Moved"):"");
}
var _17=this.checkAcceptance(_14,_15);
this._changeState("Target",_17?"":"Disabled");
if(this==_14){
_1.dnd.manager().overSource(this);
}
this.isDragging=true;
},itemCreator:function(_18,_19,_1a){
return _1.map(_18,function(_1b){
return {"id":_1b.id,"name":_1b.textContent||_1b.innerText||""};
});
},onDndDrop:function(_1c,_1d,_1e){
if(this.containerState=="Over"){
var _1f=this.tree,_20=_1f.model,_21=this.targetAnchor,_22=false;
this.isDragging=false;
var _23;
var _24;
_23=(_21&&_21.item)||_1f.item;
if(this.dropPosition=="Before"||this.dropPosition=="After"){
_23=(_21.getParent()&&_21.getParent().item)||_1f.item;
_24=_21.getIndexInParent();
if(this.dropPosition=="After"){
_24=_21.getIndexInParent()+1;
}
}else{
_23=(_21&&_21.item)||_1f.item;
}
var _25;
_1.forEach(_1d,function(_26,idx){
var _27=_1c.getItem(_26.id);
if(_1.indexOf(_27.type,"treeNode")!=-1){
var _28=_27.data,_29=_28.item,_2a=_28.getParent().item;
}
if(_1c==this){
if(typeof _24=="number"){
if(_23==_2a&&_28.getIndexInParent()<_24){
_24-=1;
}
}
_20.pasteItem(_29,_2a,_23,_1e,_24);
}else{
if(_20.isItem(_29)){
_20.pasteItem(_29,_2a,_23,_1e,_24);
}else{
if(!_25){
_25=this.itemCreator(_1d,_21.rowNode,_1c);
}
_20.newItem(_25[idx],_23,_24);
}
}
},this);
this.tree._expandNode(_21);
}
this.onDndCancel();
},onDndCancel:function(){
this._unmarkTargetAnchor();
this.isDragging=false;
this.mouseDown=false;
delete this.mouseButton;
this._changeState("Source","");
this._changeState("Target","");
},onOverEvent:function(){
this.inherited(arguments);
_1.dnd.manager().overSource(this);
},onOutEvent:function(){
this._unmarkTargetAnchor();
var m=_1.dnd.manager();
if(this.isDragging){
m.canDrop(false);
}
m.outSource(this);
this.inherited(arguments);
},_isParentChildDrop:function(_2b,_2c){
if(!_2b.tree||_2b.tree!=this.tree){
return false;
}
var _2d=_2b.tree.domNode;
var ids=_2b.selection;
var _2e=_2c.parentNode;
while(_2e!=_2d&&!ids[_2e.id]){
_2e=_2e.parentNode;
}
return _2e.id&&ids[_2e.id];
},_unmarkTargetAnchor:function(){
if(!this.targetAnchor){
return;
}
this._removeItemClass(this.targetAnchor.rowNode,this.dropPosition);
this.targetAnchor=null;
this.targetBox=null;
this.dropPosition=null;
},_markDndStatus:function(_2f){
this._changeState("Source",_2f?"Copied":"Moved");
}});
return _2.tree.dndSource;
});
