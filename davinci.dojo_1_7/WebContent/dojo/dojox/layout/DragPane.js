/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/DragPane",["dojo","dijit","dojox","dijit/_Widget"],function(_1,_2,_3){
_1.getObject("dojox.layout.DragPane",1);
_1.declare("dojox.layout.DragPane",_2._Widget,{invert:true,postCreate:function(){
this.connect(this.domNode,"onmousedown","_down");
this.connect(this.domNode,"onmouseleave","_up");
this.connect(this.domNode,"onmouseup","_up");
},_down:function(e){
var t=this.domNode;
e.preventDefault();
_1.style(t,"cursor","move");
this._x=e.pageX;
this._y=e.pageY;
if((this._x<t.offsetLeft+t.clientWidth)&&(this._y<t.offsetTop+t.clientHeight)){
_1.setSelectable(t,false);
this._mover=this.connect(t,"onmousemove","_move");
}
},_up:function(e){
_1.setSelectable(this.domNode,true);
_1.style(this.domNode,"cursor","pointer");
this._mover&&this.disconnect(this._mover);
delete this._mover;
},_move:function(e){
var _4=this.invert?1:-1;
this.domNode.scrollTop+=(this._y-e.pageY)*_4;
this.domNode.scrollLeft+=(this._x-e.pageX)*_4;
this._x=e.pageX;
this._y=e.pageY;
}});
return _1.getObject("dojox.layout.DragPane");
});
require(["dojox/layout/DragPane"]);
