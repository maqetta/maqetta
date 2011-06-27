/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/move",["../main","./Mover","./Moveable"],function(_1){
_1.declare("dojo.dnd.move.constrainedMoveable",_1.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_2,_3){
return new _1.dnd.move.constrainedMoveable(_3,_2);
},constructor:function(_4,_5){
if(!_5){
_5={};
}
this.constraints=_5.constraints;
this.within=_5.within;
},onFirstMove:function(_6){
var c=this.constraintBox=this.constraints.call(this,_6);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=_1._getMarginSize(_6.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_7,_8){
var c=this.constraintBox,s=_7.node.style;
this.onMoving(_7,_8);
_8.l=_8.l<c.l?c.l:c.r<_8.l?c.r:_8.l;
_8.t=_8.t<c.t?c.t:c.b<_8.t?c.b:_8.t;
s.left=_8.l+"px";
s.top=_8.t+"px";
this.onMoved(_7,_8);
}});
_1.declare("dojo.dnd.move.boxConstrainedMoveable",_1.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_9,_a){
return new _1.dnd.move.boxConstrainedMoveable(_a,_9);
},constructor:function(_b,_c){
var _d=_c&&_c.box;
this.constraints=function(){
return _d;
};
}});
_1.declare("dojo.dnd.move.parentConstrainedMoveable",_1.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_e,_f){
return new _1.dnd.move.parentConstrainedMoveable(_f,_e);
},constructor:function(_10,_11){
var _12=_11&&_11.area;
this.constraints=function(){
var n=this.node.parentNode,s=_1.getComputedStyle(n),mb=_1._getMarginBox(n,s);
if(_12=="margin"){
return mb;
}
var t=_1._getMarginExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(_12=="border"){
return mb;
}
t=_1._getBorderExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(_12=="padding"){
return mb;
}
t=_1._getPadExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
return mb;
};
}});
_1.dnd.constrainedMover=_1.dnd.move.constrainedMover;
_1.dnd.boxConstrainedMover=_1.dnd.move.boxConstrainedMover;
_1.dnd.parentConstrainedMover=_1.dnd.move.parentConstrainedMover;
return _1.dnd.move;
});
