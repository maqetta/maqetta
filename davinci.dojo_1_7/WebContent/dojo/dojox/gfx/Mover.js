/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/Mover",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","dojo/_base/connect"],function(_1){
return _1.declare("dojox.gfx.Mover",null,{constructor:function(_2,e,_3){
this.shape=_2;
this.lastX=e.clientX;
this.lastY=e.clientY;
var h=this.host=_3,d=document,_4=_1.connect(d,"onmousemove",this,"onFirstMove");
this.events=[_1.connect(d,"onmousemove",this,"onMouseMove"),_1.connect(d,"onmouseup",this,"destroy"),_1.connect(d,"ondragstart",_1,"stopEvent"),_1.connect(d,"onselectstart",_1,"stopEvent"),_4];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
var x=e.clientX;
var y=e.clientY;
this.host.onMove(this,{dx:x-this.lastX,dy:y-this.lastY});
this.lastX=x;
this.lastY=y;
_1.stopEvent(e);
},onFirstMove:function(){
this.host.onFirstMove(this);
_1.disconnect(this.events.pop());
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
var h=this.host;
if(h&&h.onMoveStop){
h.onMoveStop(this);
}
this.events=this.shape=null;
}});
});
