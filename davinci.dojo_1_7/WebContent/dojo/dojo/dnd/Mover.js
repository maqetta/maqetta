/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/Mover",["../main","./common","./autoscroll"],function(_1){
_1.declare("dojo.dnd.Mover",null,{constructor:function(_2,e,_3){
this.node=_1.byId(_2);
var _4=e.touches?e.touches[0]:e;
this.marginBox={l:_4.pageX,t:_4.pageY};
this.mouseButton=e.button;
var h=(this.host=_3),d=_2.ownerDocument;
this.events=[_1.connect(d,"onmousemove",this,"onFirstMove"),_1.connect(d,"ontouchmove",this,"onFirstMove"),_1.connect(d,"onmousemove",this,"onMouseMove"),_1.connect(d,"ontouchmove",this,"onMouseMove"),_1.connect(d,"onmouseup",this,"onMouseUp"),_1.connect(d,"ontouchend",this,"onMouseUp"),_1.connect(d,"ondragstart",_1.stopEvent),_1.connect(d.body,"onselectstart",_1.stopEvent)];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
_1.dnd.autoScroll(e);
var m=this.marginBox,_5=e.touches?e.touches[0]:e;
this.host.onMove(this,{l:m.l+_5.pageX,t:m.t+_5.pageY},e);
_1.stopEvent(e);
},onMouseUp:function(e){
if(_1.isWebKit&&_1.isMac&&this.mouseButton==2?e.button==0:this.mouseButton==e.button){
this.destroy();
}
_1.stopEvent(e);
},onFirstMove:function(e){
var s=this.node.style,l,t,h=this.host;
switch(s.position){
case "relative":
case "absolute":
l=Math.round(parseFloat(s.left))||0;
t=Math.round(parseFloat(s.top))||0;
break;
default:
s.position="absolute";
var m=_1.marginBox(this.node);
var b=_1.doc.body;
var bs=_1.getComputedStyle(b);
var bm=_1._getMarginBox(b,bs);
var bc=_1._getContentBox(b,bs);
l=m.l-(bc.l-bm.l);
t=m.t-(bc.t-bm.t);
break;
}
this.marginBox.l=l-this.marginBox.l;
this.marginBox.t=t-this.marginBox.t;
if(h&&h.onFirstMove){
h.onFirstMove(this,e);
}
_1.disconnect(this.events.shift());
_1.disconnect(this.events.shift());
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
var h=this.host;
if(h&&h.onMoveStop){
h.onMoveStop(this);
}
this.events=this.node=this.host=null;
}});
return _1.dnd.Mover;
});
