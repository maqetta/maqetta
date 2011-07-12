/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/Source",["../main","./Selector","./Manager"],function(_1){
_1.declare("dojo.dnd.Source",_1.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,selfCopy:false,selfAccept:true,skipForm:false,withHandles:false,autoSync:false,delay:0,accept:["text"],generateText:true,constructor:function(_2,_3){
_1.mixin(this,_1.mixin({},_3));
var _4=this.accept;
if(_4.length){
this.accept={};
for(var i=0;i<_4.length;++i){
this.accept[_4[i]]=1;
}
}
this.isDragging=false;
this.mouseDown=false;
this.targetAnchor=null;
this.targetBox=null;
this.before=true;
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
if(this.horizontal){
_1.addClass(this.node,"dojoDndHorizontal");
}
this.topics=[_1.subscribe("/dnd/source/over",this,"onDndSourceOver"),_1.subscribe("/dnd/start",this,"onDndStart"),_1.subscribe("/dnd/drop",this,"onDndDrop"),_1.subscribe("/dnd/cancel",this,"onDndCancel")];
},checkAcceptance:function(_5,_6){
if(this==_5){
return !this.copyOnly||this.selfAccept;
}
for(var i=0;i<_6.length;++i){
var _7=_5.getItem(_6[i].id).type;
var _8=false;
for(var j=0;j<_7.length;++j){
if(_7[j] in this.accept){
_8=true;
break;
}
}
if(!_8){
return false;
}
}
return true;
},copyState:function(_9,_a){
if(_9){
return true;
}
if(arguments.length<2){
_a=this==_1.dnd.manager().target;
}
if(_a){
if(this.copyOnly){
return this.selfCopy;
}
}else{
return this.copyOnly;
}
return false;
},destroy:function(){
_1.dnd.Source.superclass.destroy.call(this);
_1.forEach(this.topics,_1.unsubscribe);
this.targetAnchor=null;
},markupFactory:function(_b,_c){
_b._skipStartup=true;
return new _1.dnd.Source(_c,_b);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
_1.dnd.Source.superclass.onMouseMove.call(this,e);
var m=_1.dnd.manager();
if(!this.isDragging){
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay)){
var _d=this.getSelectedNodes();
if(_d.length){
m.startDrag(this,_d,this.copyState(_1.isCopyKey(e),true));
}
}
}
if(this.isDragging){
var _e=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox=_1.position(this.current,true);
}
if(this.horizontal){
_e=(e.pageX-this.targetBox.x)<(this.targetBox.w/2);
}else{
_e=(e.pageY-this.targetBox.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_e!=this.before){
this._markTargetAnchor(_e);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}
},onMouseDown:function(e){
if(!this.mouseDown&&this._legalMouseDown(e)&&(!this.skipForm||!_1.dnd.isFormElement(e))){
this.mouseDown=true;
this._lastX=e.pageX;
this._lastY=e.pageY;
_1.dnd.Source.superclass.onMouseDown.call(this,e);
}
},onMouseUp:function(e){
if(this.mouseDown){
this.mouseDown=false;
_1.dnd.Source.superclass.onMouseUp.call(this,e);
}
},onDndSourceOver:function(_f){
if(this!=_f){
this.mouseDown=false;
if(this.targetAnchor){
this._unmarkTargetAnchor();
}
}else{
if(this.isDragging){
var m=_1.dnd.manager();
m.canDrop(this.targetState!="Disabled"&&(!this.current||m.source!=this||!(this.current.id in this.selection)));
}
}
},onDndStart:function(_10,_11,_12){
if(this.autoSync){
this.sync();
}
if(this.isSource){
this._changeState("Source",this==_10?(_12?"Copied":"Moved"):"");
}
var _13=this.accept&&this.checkAcceptance(_10,_11);
this._changeState("Target",_13?"":"Disabled");
if(this==_10){
_1.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_14,_15,_16,_17){
if(this==_17){
this.onDrop(_14,_15,_16);
}
this.onDndCancel();
},onDndCancel:function(){
if(this.targetAnchor){
this._unmarkTargetAnchor();
this.targetAnchor=null;
}
this.before=true;
this.isDragging=false;
this.mouseDown=false;
this._changeState("Source","");
this._changeState("Target","");
},onDrop:function(_18,_19,_1a){
if(this!=_18){
this.onDropExternal(_18,_19,_1a);
}else{
this.onDropInternal(_19,_1a);
}
},onDropExternal:function(_1b,_1c,_1d){
var _1e=this._normalizedCreator;
if(this.creator){
this._normalizedCreator=function(_1f,_20){
return _1e.call(this,_1b.getItem(_1f.id).data,_20);
};
}else{
if(_1d){
this._normalizedCreator=function(_21,_22){
var t=_1b.getItem(_21.id);
var n=_21.cloneNode(true);
n.id=_1.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(_23,_24){
var t=_1b.getItem(_23.id);
_1b.delItem(_23.id);
return {node:_23,data:t.data,type:t.type};
};
}
}
this.selectNone();
if(!_1d&&!this.creator){
_1b.selectNone();
}
this.insertNodes(true,_1c,this.before,this.current);
if(!_1d&&this.creator){
_1b.deleteSelectedNodes();
}
this._normalizedCreator=_1e;
},onDropInternal:function(_25,_26){
var _27=this._normalizedCreator;
if(this.current&&this.current.id in this.selection){
return;
}
if(_26){
if(this.creator){
this._normalizedCreator=function(_28,_29){
return _27.call(this,this.getItem(_28.id).data,_29);
};
}else{
this._normalizedCreator=function(_2a,_2b){
var t=this.getItem(_2a.id);
var n=_2a.cloneNode(true);
n.id=_1.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}
}else{
if(!this.current){
return;
}
this._normalizedCreator=function(_2c,_2d){
var t=this.getItem(_2c.id);
return {node:_2c,data:t.data,type:t.type};
};
}
this._removeSelection();
this.insertNodes(true,_25,this.before,this.current);
this._normalizedCreator=_27;
},onDraggingOver:function(){
},onDraggingOut:function(){
},onOverEvent:function(){
_1.dnd.Source.superclass.onOverEvent.call(this);
_1.dnd.manager().overSource(this);
if(this.isDragging&&this.targetState!="Disabled"){
this.onDraggingOver();
}
},onOutEvent:function(){
_1.dnd.Source.superclass.onOutEvent.call(this);
_1.dnd.manager().outSource(this);
if(this.isDragging&&this.targetState!="Disabled"){
this.onDraggingOut();
}
},_markTargetAnchor:function(_2e){
if(this.current==this.targetAnchor&&this.before==_2e){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_2e;
if(this.targetAnchor){
this._addItemClass(this.targetAnchor,this.before?"Before":"After");
}
},_unmarkTargetAnchor:function(){
if(!this.targetAnchor){
return;
}
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
this.targetAnchor=null;
this.targetBox=null;
this.before=true;
},_markDndStatus:function(_2f){
this._changeState("Source",_2f?"Copied":"Moved");
},_legalMouseDown:function(e){
if(!_1.mouseButtons.isLeft(e)){
return false;
}
if(!this.withHandles){
return true;
}
for(var _30=e.target;_30&&_30!==this.node;_30=_30.parentNode){
if(_1.hasClass(_30,"dojoDndHandle")){
return true;
}
if(_1.hasClass(_30,"dojoDndItem")||_1.hasClass(_30,"dojoDndIgnore")){
break;
}
}
return false;
}});
_1.declare("dojo.dnd.Target",_1.dnd.Source,{constructor:function(_31,_32){
this.isSource=false;
_1.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_33,_34){
_33._skipStartup=true;
return new _1.dnd.Target(_34,_33);
}});
_1.declare("dojo.dnd.AutoSource",_1.dnd.Source,{constructor:function(_35,_36){
this.autoSync=true;
},markupFactory:function(_37,_38){
_37._skipStartup=true;
return new _1.dnd.AutoSource(_38,_37);
}});
return _1.dnd.Source;
});
