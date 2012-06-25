//>>built
define("dojox/mobile/_EditableIconMixin",["dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/lang","dojo/dom-geometry","dojo/dom-style","dojo/touch","dijit/registry","./IconItem","./sniff"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b){
return _3("dojox.mobile._EditableIconMixin",null,{deleteIconForEdit:"mblDomButtonBlackCircleCross",threshold:4,destroy:function(){
if(this._blankItem){
this._blankItem.destroy();
}
this.inherited(arguments);
},startEdit:function(){
if(!this.editable||this.isEditing){
return;
}
this.isEditing=true;
if(!this._handles){
this._handles=[this.connect(this.domNode,"webkitTransitionStart","_onTransitionStart"),this.connect(this.domNode,"webkitTransitionEnd","_onTransitionEnd")];
}
var _c=0;
_1.forEach(this.getChildren(),function(w){
setTimeout(_5.hitch(this,function(){
w.set("deleteIcon",this.deleteIconForEdit);
if(w.deleteIconNode){
w._deleteHandle=this.connect(w.deleteIconNode,"onclick","_deleteIconClicked");
}
w.highlight(0);
}),15*_c++);
},this);
_2.publish("/dojox/mobile/startEdit",[this]);
this.onStartEdit();
},endEdit:function(){
if(!this.isEditing){
return;
}
_1.forEach(this.getChildren(),function(w){
w.unhighlight();
if(w._deleteHandle){
this.disconnect(w._deleteHandle);
w._deleteHandle=null;
}
w.set("deleteIcon","");
},this);
this._movingItem=null;
if(this._handles){
_1.forEach(this._handles,this.disconnect,this);
this._handles=null;
}
_2.publish("/dojox/mobile/endEdit",[this]);
this.onEndEdit();
this.isEditing=false;
},scaleItem:function(_d,_e){
_7.set(_d.domNode,{webkitTransition:_b("android")?"":"-webkit-transform .1s ease-in-out",webkitTransform:_e==1?"":"scale("+_e+")"});
},_onTransitionStart:function(e){
_4.stop(e);
},_onTransitionEnd:function(e){
_4.stop(e);
var w=_9.getEnclosingWidget(e.target);
w._moving=false;
_7.set(w.domNode,"webkitTransition","");
},_onTouchStart:function(e){
if(!this._blankItem){
this._blankItem=new _a();
this._blankItem.domNode.style.visibility="hidden";
this._blankItem._onClick=function(){
};
}
var _f=this._movingItem=_9.getEnclosingWidget(e.target);
var _10=false;
for(var n=e.target;n!==_f.domNode;n=n.parentNode){
if(n===_f.iconNode){
_10=true;
break;
}
}
if(!_10){
return;
}
if(!this._conn){
this._conn=[this.connect(this.domNode,_8.move,"_onTouchMove"),this.connect(this.domNode,_8.release,"_onTouchEnd")];
}
this._touchStartPosX=e.touches?e.touches[0].pageX:e.pageX;
this._touchStartPosY=e.touches?e.touches[0].pageY:e.pageY;
if(this.isEditing){
this._onDragStart(e);
}else{
this._pressTimer=setTimeout(_5.hitch(this,function(){
this.startEdit();
this._onDragStart(e);
}),1000);
}
},_onDragStart:function(e){
this._dragging=true;
var _11=this._movingItem;
if(_11.get("selected")){
_11.set("selected",false);
}
this.scaleItem(_11,1.1);
var x=e.touches?e.touches[0].pageX:e.pageX;
var y=e.touches?e.touches[0].pageY:e.pageY;
var _12=this._startPos=_6.position(_11.domNode,true);
this._offsetPos={x:_12.x-x,y:_12.y-y};
this._startIndex=this.getIndexOfChild(_11);
this.addChild(this._blankItem,this._startIndex);
this.moveChild(_11,this.getChildren().length);
_7.set(_11.domNode,{position:"absolute",top:_12.y+"px",left:_12.x+"px",zIndex:100});
},_onTouchMove:function(e){
var x=e.touches?e.touches[0].pageX:e.pageX;
var y=e.touches?e.touches[0].pageY:e.pageY;
if(this._dragging){
_7.set(this._movingItem.domNode,{top:(this._offsetPos.y+y)+"px",left:(this._offsetPos.x+x)+"px"});
this._detectOverlap({x:x,y:y});
_4.stop(e);
}else{
var dx=Math.abs(this._touchStartPosX-x);
var dy=Math.abs(this._touchStartPosY-y);
if(dx>this.threshold||dy>this.threshold){
this._clearPressTimer();
}
}
},_onTouchEnd:function(e){
this._clearPressTimer();
if(this._conn){
_1.forEach(this._conn,this.disconnect,this);
this._conn=null;
}
if(this._dragging){
this._dragging=false;
var _13=this._movingItem;
this.scaleItem(_13,1);
_7.set(_13.domNode,{position:"",top:"",left:"",zIndex:""});
var _14=this._startIndex;
var _15=this.getIndexOfChild(this._blankItem);
this.moveChild(_13,_15);
this.removeChild(this._blankItem);
_2.publish("/dojox/mobile/moveIconItem",[this,_13,_14,_15]);
this.onMoveItem(_13,_14,_15);
}
},_clearPressTimer:function(){
if(this._pressTimer){
clearTimeout(this._pressTimer);
this._pressTimer=null;
}
},_detectOverlap:function(_16){
var _17=this.getChildren(),_18=this._blankItem,_19=_6.position(_18.domNode,true),_1a=this.getIndexOfChild(_18),dir=1;
if(this._contains(_16,_19)){
return;
}else{
if(_16.y<_19.y||(_16.y<=_19.y+_19.h&&_16.x<_19.x)){
dir=-1;
}
}
for(var i=_1a+dir;i>=0&&i<_17.length-1;i+=dir){
var w=_17[i];
if(w._moving){
continue;
}
var pos=_6.position(w.domNode,true);
if(this._contains(_16,pos)){
setTimeout(_5.hitch(this,function(){
this.moveChildWithAnimation(_18,dir==1?i+1:i);
}),0);
break;
}else{
if((dir==1&&pos.y>_16.y)||(dir==-1&&pos.y+pos.h<_16.y)){
break;
}
}
}
},_contains:function(_1b,pos){
return pos.x<_1b.x&&_1b.x<pos.x+pos.w&&pos.y<_1b.y&&_1b.y<pos.y+pos.h;
},_animate:function(_1c,to){
if(_1c==to){
return;
}
var dir=_1c<to?1:-1;
var _1d=this.getChildren();
var _1e=[];
for(var i=_1c;i!=to;i+=dir){
_1e.push({t:(_1d[i+dir].domNode.offsetTop-_1d[i].domNode.offsetTop)+"px",l:(_1d[i+dir].domNode.offsetLeft-_1d[i].domNode.offsetLeft)+"px"});
}
for(var i=_1c,j=0;i!=to;i+=dir,j++){
var w=_1d[i];
w._moving=true;
_7.set(w.domNode,{top:_1e[j].t,left:_1e[j].l});
setTimeout(_5.hitch(w,function(){
_7.set(this.domNode,{webkitTransition:"top .3s ease-in-out, left .3s ease-in-out",top:"0px",left:"0px"});
}),j*10);
}
},removeChildWithAnimation:function(_1f){
var _20=(typeof _1f==="number")?_1f:this.getIndexOfChild(_1f);
this.removeChild(_1f);
this.addChild(this._blankItem);
this._animate(_20,this.getChildren().length-1);
this.removeChild(this._blankItem);
},moveChild:function(_21,_22){
this.addChild(_21,_22);
this.paneContainerWidget.addChild(_21.paneWidget,_22);
},moveChildWithAnimation:function(_23,_24){
var _25=this.getIndexOfChild(this._blankItem);
this.moveChild(_23,_24);
this._animate(_25,_24);
},_deleteIconClicked:function(e){
if(this.deleteIconClicked(e)===false){
return;
}
var _26=_9.getEnclosingWidget(e.target);
this.deleteItem(_26);
},deleteIconClicked:function(){
},deleteItem:function(_27){
if(_27._deleteHandle){
this.disconnect(_27._deleteHandle);
}
this.removeChildWithAnimation(_27);
_2.publish("/dojox/mobile/deleteIconItem",[this,_27]);
this.onDeleteItem(_27);
_27.destroy();
},onDeleteItem:function(_28){
},onMoveItem:function(_29,_2a,to){
},onStartEdit:function(){
},onEndEdit:function(){
},_setEditableAttr:function(_2b){
this._set("editable",_2b);
if(_2b&&!this._touchStartHandle){
this._touchStartHandle=this.connect(this.domNode,_8.press,"_onTouchStart");
}else{
if(!_2b&&this._touchStartHandle){
this.disconnect(this._touchStartHandle);
this._touchStartHandle=null;
}
}
}});
});
