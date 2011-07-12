/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dnd/BoundingBoxController",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.dnd.BoundingBoxController",1);
_1.declare("dojox.dnd.BoundingBoxController",null,{_startX:null,_startY:null,_endX:null,_endY:null,constructor:function(_4,_5){
this.events=[_1.connect(_1.doc,"onmousedown",this,"_onMouseDown"),_1.connect(_1.doc,"onmouseup",this,"_onMouseUp"),_1.connect(_1.doc,"onscroll",this,"_finishSelecting")];
this.subscriptions=[_1.subscribe("/dojox/bounding/cancel",this,"_finishSelecting")];
_1.forEach(_4,function(_6){
if(_6.selectByBBox){
this.subscriptions.push(_1.subscribe("/dojox/dnd/bounding",_6,"selectByBBox"));
}
},this);
this.domNode=_1.byId(_5);
_1.style(this.domNode,{position:"absolute",display:"none"});
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
_1.forEach(this.subscriptions,_1.unsubscribe);
this.domNode=null;
},boundingBoxIsViable:function(){
return true;
},_onMouseDown:function(_7){
if(_1.mouseButtons.isLeft(_7)){
if(this._startX===null){
this._startX=_7.clientX;
this._startY=_7.clientY;
}
this.events.push(_1.connect(_1.doc,"onmousemove",this,"_onMouseMove"));
}
},_onMouseMove:function(_8){
this._endX=_8.clientX;
this._endY=_8.clientY;
this._drawBoundingBox();
},_onMouseUp:function(_9){
if(this._endX!==null&&this.boundingBoxIsViable()){
_1.publish("/dojox/dnd/bounding",[this._startX,this._startY,this._endX,this._endY]);
}
this._finishSelecting();
},_finishSelecting:function(){
if(this._startX!==null){
_1.disconnect(this.events.pop());
_1.style(this.domNode,"display","none");
this._startX=this._endX=null;
}
},_drawBoundingBox:function(){
_1.style(this.domNode,{left:Math.min(this._startX,this._endX)+"px",top:Math.min(this._startY,this._endY)+"px",width:Math.abs(this._startX-this._endX)+"px",height:Math.abs(this._startY-this._endY)+"px",display:""});
}});
return _1.getObject("dojox.dnd.BoundingBoxController");
});
require(["dojox/dnd/BoundingBoxController"]);
