/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/canvasWithEvents",["./canvas"],function(){
var _1=dojo.getObject("dojox.gfx.canvasWithEvents",true);
dojo.experimental("dojox.gfx.canvasWithEvents");
var d=dojo,g=dojox.gfx,gs=g.shape,ga=g.arc,_2=g.canvas,m=g.matrix;
d.declare("dojox.gfx.canvasWithEvents.Shape",_2.Shape,{_testInputs:function(_3,_4){
if(!this.canvasFill&&this.strokeStyle){
this._hitTestPixel(_3,_4);
}else{
this._renderShape(_3);
var _5=_4.length,t=this.getTransform();
for(var i=0;i<_4.length;++i){
var _6=_4[i];
if(_6.target){
continue;
}
var x=_6.x,y=_6.y;
var p=t?dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.invert(t),x,y):{x:x,y:y};
_6.target=this._hitTestGeometry(_3,p.x,p.y);
}
}
},_hitTestPixel:function(_7,_8){
for(var i=0;i<_8.length;++i){
var _9=_8[i];
if(_9.target){
continue;
}
var x=_9.x,y=_9.y;
_7.save();
_7.translate(-x,-y);
this._render(_7,true);
_9.target=_7.getImageData(0,0,1,1).data[0]?this:null;
_7.restore();
}
},_hitTestGeometry:function(_a,x,y){
return _a.isPointInPath(x,y)?this:null;
},_renderFill:function(_b,_c){
if(_b.pickingMode){
if("canvasFill" in this&&_c){
_b.fill();
}
return;
}
this.inherited(arguments);
},_renderStroke:function(_d,_e){
if(this.strokeStyle&&_d.pickingMode){
var c=this.strokeStyle.color;
try{
this.strokeStyle.color=new dojo.Color(_d.strokeStyle);
this.inherited(arguments);
}
finally{
this.strokeStyle.color=c;
}
}else{
this.inherited(arguments);
}
},getEventSource:function(){
return this.surface.getEventSource();
},connect:function(_f,_10,_11){
this.surface._setupEvents(_f);
return arguments.length>2?dojo.connect(this,_f,_10,_11):dojo.connect(this,_f,_10);
},disconnect:function(_12){
dojo.disconnect(_12);
},oncontextmenu:function(){
},onclick:function(){
},ondblclick:function(){
},onmouseenter:function(){
},onmouseleave:function(){
},onmouseout:function(){
},onmousedown:function(){
},ontouchstart:function(){
},touchstart:function(){
},onmouseup:function(){
},ontouchend:function(){
},touchend:function(){
},onmouseover:function(){
},onmousemove:function(){
},ontouchmove:function(){
},touchmove:function(){
},onkeydown:function(){
},onkeyup:function(){
}});
d.declare("dojox.gfx.canvasWithEvents.Group",[_1.Shape,_2.Group],{_testInputs:function(ctx,pos){
var _13=this.children,t=this.getTransform(),i,j;
if(_13.length==0){
return;
}
var _14=[];
for(i=0;i<pos.length;++i){
var _15=pos[i];
_14[i]={x:_15.x,y:_15.y};
if(_15.target){
continue;
}
var x=_15.x,y=_15.y;
var p=t?dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.invert(t),x,y):{x:x,y:y};
_15.x=p.x;
_15.y=p.y;
}
for(i=_13.length-1;i>=0;--i){
_13[i]._testInputs(ctx,pos);
var _16=true;
for(j=0;j<pos.length;++j){
if(pos[j].target==null){
_16=false;
break;
}
}
if(_16){
break;
}
}
for(i=0;i<pos.length;++i){
pos[i].x=_14[i].x;
pos[i].y=_14[i].y;
}
}});
d.declare("dojox.gfx.canvasWithEvents.Image",[_1.Shape,_2.Image],{_renderShape:function(ctx){
var s=this.shape;
if(ctx.pickingMode){
ctx.fillRect(s.x,s.y,s.width,s.height);
}else{
this.inherited(arguments);
}
},_hitTestGeometry:function(ctx,x,y){
var s=this.shape;
return x>=s.x&&x<=s.x+s.width&&y>=s.y&&y<=s.y+s.height?this:null;
}});
d.declare("dojox.gfx.canvasWithEvents.Text",[_1.Shape,_2.Text],{_testInputs:function(ctx,pos){
return this._hitTestPixel(ctx,pos);
}});
d.declare("dojox.gfx.canvasWithEvents.Rect",[_1.Shape,_2.Rect],{});
d.declare("dojox.gfx.canvasWithEvents.Circle",[_1.Shape,_2.Circle],{});
d.declare("dojox.gfx.canvasWithEvents.Ellipse",[_1.Shape,_2.Ellipse],{});
d.declare("dojox.gfx.canvasWithEvents.Line",[_1.Shape,_2.Line],{});
d.declare("dojox.gfx.canvasWithEvents.Polyline",[_1.Shape,_2.Polyline],{});
d.declare("dojox.gfx.canvasWithEvents.Path",[_1.Shape,_2.Path],{});
d.declare("dojox.gfx.canvasWithEvents.TextPath",[_1.Shape,_2.TextPath],{});
var _17={onmouseenter:"onmousemove",onmouseleave:"onmousemove",onmouseout:"onmousemove",onmouseover:"onmousemove",touchstart:"ontouchstart",touchend:"ontouchend",touchmove:"ontouchmove"};
var _18={ontouchstart:"touchstart",ontouchend:"touchend",ontouchmove:"touchmove"};
var _19=navigator.userAgent.toLowerCase(),_1a=_19.search("iphone")>-1||_19.search("ipad")>-1||_19.search("ipod")>-1;
dojo.declare("dojox.gfx.canvasWithEvents.Surface",_2.Surface,{constructor:function(){
this._pick={curr:null,last:null};
this._pickOfMouseDown=null;
this._pickOfMouseUp=null;
},connect:function(_1b,_1c,_1d){
if(_1b.indexOf("touch")!==-1){
this._setupEvents(_1b);
_1b="_on"+_1b+"Impl_";
return dojo.connect(this,_1b,_1c,_1d);
}else{
this._initMirrorCanvas();
return dojo.connect(this.getEventSource(),_1b,null,dojox.gfx.shape.fixCallback(this,g.fixTarget,_1c,_1d));
}
},_ontouchstartImpl_:function(){
},_ontouchendImpl_:function(){
},_ontouchmoveImpl_:function(){
},_initMirrorCanvas:function(){
if(!this.mirrorCanvas){
var p=this._parent,_1e=p.ownerDocument.createElement("canvas");
_1e.width=1;
_1e.height=1;
_1e.style.position="absolute";
_1e.style.left="-99999px";
_1e.style.top="-99999px";
p.appendChild(_1e);
this.mirrorCanvas=_1e;
}
},_setupEvents:function(_1f){
if(_1f in _17){
_1f=_17[_1f];
}
if(this._eventsH&&this._eventsH[_1f]){
return;
}
this._initMirrorCanvas();
if(!this._eventsH){
this._eventsH={};
}
this._eventsH[_1f]=dojo.connect(this.getEventSource(),_1f,dojox.gfx.shape.fixCallback(this,g.fixTarget,this,"_"+_1f));
if(_1f==="onclick"||_1f==="ondblclick"){
if(!this._eventsH["onmousedown"]){
this._eventsH["onmousedown"]=dojo.connect(this.getEventSource(),"onmousedown",dojox.gfx.shape.fixCallback(this,g.fixTarget,this,"_onmousedown"));
}
if(!this._eventsH["onmouseup"]){
this._eventsH["onmouseup"]=dojo.connect(this.getEventSource(),"onmouseup",dojox.gfx.shape.fixCallback(this,g.fixTarget,this,"_onmouseup"));
}
}
},destroy:function(){
dojox.gfx.canvas.Surface.destroy.apply(this);
for(var i in this._eventsH){
dojo.disconnect(this._eventsH[i]);
}
this._eventsH=this.mirrorCanvas=null;
},getEventSource:function(){
return this.rawNode;
},_invokeHandler:function(_20,_21,_22){
var _23=_20[_21];
if(_23&&_23.after){
_23.apply(_20,[_22]);
}else{
if(_21 in _18){
_23=_20[_18[_21]];
if(_23&&_23.after){
_23.apply(_20,[_22]);
}
}
}
if(!_23&&_21.indexOf("touch")!==-1){
_21="_"+_21+"Impl_";
_23=_20[_21];
if(_23){
_23.apply(_20,[_22]);
}
}
if(!_24(_22)&&_20.parent){
this._invokeHandler(_20.parent,_21,_22);
}
},_oncontextmenu:function(e){
if(this._pick.curr){
this._invokeHandler(this._pick.curr,"oncontextmenu",e);
}
},_ondblclick:function(e){
if(this._pickOfMouseUp){
this._invokeHandler(this._pickOfMouseUp,"ondblclick",e);
}
},_onclick:function(e){
if(this._pickOfMouseUp&&this._pickOfMouseUp==this._pickOfMouseDown){
this._invokeHandler(this._pickOfMouseUp,"onclick",e);
}
},_onmousedown:function(e){
this._pickOfMouseDown=this._pick.curr;
if(this._pick.curr){
this._invokeHandler(this._pick.curr,"onmousedown",e);
}
},_ontouchstart:function(e){
if(this._pick.curr){
this._fireTouchEvent(e);
}
},_onmouseup:function(e){
this._pickOfMouseUp=this._pick.curr;
if(this._pick.curr){
this._invokeHandler(this._pick.curr,"onmouseup",e);
}
},_ontouchend:function(e){
if(this._pick.curr){
for(var i=0;i<this._pick.curr.length;++i){
if(this._pick.curr[i].target){
e.gfxTarget=this._pick.curr[i].target;
this._invokeHandler(this._pick.curr[i].target,"ontouchend",e);
}
}
}
},_onmousemove:function(e){
if(this._pick.last&&this._pick.last!=this._pick.curr){
this._invokeHandler(this._pick.last,"onmouseleave",e);
this._invokeHandler(this._pick.last,"onmouseout",e);
}
if(this._pick.curr){
if(this._pick.last==this._pick.curr){
this._invokeHandler(this._pick.curr,"onmousemove",e);
}else{
this._invokeHandler(this._pick.curr,"onmouseenter",e);
this._invokeHandler(this._pick.curr,"onmouseover",e);
}
}
},_ontouchmove:function(e){
if(this._pick.curr){
this._fireTouchEvent(e);
}
},_fireTouchEvent:function(e){
var _25=[];
for(var i=0;i<this._pick.curr.length;++i){
var _26=this._pick.curr[i];
if(_26.target){
var _27=_26.target.__gfxtt;
if(!_27){
_27=[];
_26.target.__gfxtt=_27;
}
_27.push(_26.t);
if(!_26.target.__inToFire){
_25.push(_26.target);
_26.target.__inToFire=true;
}
}
}
if(_25.length===0){
this._invokeHandler(this,"on"+e.type,e);
}else{
for(i=0;i<_25.length;++i){
(function(){
var _28=_25[i].__gfxtt;
var evt=dojo.delegate(e,{gfxTarget:_25[i]});
if(_1a){
evt.preventDefault=function(){
e.preventDefault();
};
evt.stopPropagation=function(){
e.stopPropagation();
};
}
evt.__defineGetter__("targetTouches",function(){
return _28;
});
delete _25[i].__gfxtt;
delete _25[i].__inToFire;
this._invokeHandler(_25[i],"on"+e.type,evt);
}).call(this);
}
}
},_onkeydown:function(){
},_onkeyup:function(){
},_whatsUnderEvent:function(evt){
var _29=this,i,pos=dojo.position(_29.rawNode,true),_2a=[],_2b=evt.changedTouches,_2c=evt.touches;
if(_2b){
for(i=0;i<_2b.length;++i){
_2a.push({t:_2b[i],x:_2b[i].pageX-pos.x,y:_2b[i].pageY-pos.y});
}
}else{
if(_2c){
for(i=0;i<_2c.length;++i){
_2a.push({t:_2c[i],x:_2c[i].pageX-pos.x,y:_2c[i].pageY-pos.y});
}
}else{
_2a.push({x:evt.pageX-pos.x,y:evt.pageY-pos.y});
}
}
var _2d=_29.mirrorCanvas,ctx=_2d.getContext("2d"),_2e=_29.children;
ctx.clearRect(0,0,_2d.width,_2d.height);
ctx.save();
ctx.strokeStyle="rgba(127,127,127,1.0)";
ctx.fillStyle="rgba(127,127,127,1.0)";
ctx.pickingMode=true;
var _2f=null;
for(i=_2e.length-1;i>=0;i--){
_2e[i]._testInputs(ctx,_2a);
var _30=true;
for(j=0;j<_2a.length;++j){
if(_2a[j].target==null){
_30=false;
break;
}
}
if(_30){
break;
}
}
ctx.restore();
return (_2c||_2b)?_2a:_2a[0].target;
}});
_1.createSurface=function(_31,_32,_33){
if(!_32&&!_33){
var pos=d.position(_31);
_32=_32||pos.w;
_33=_33||pos.h;
}
if(typeof _32=="number"){
_32=_32+"px";
}
if(typeof _33=="number"){
_33=_33+"px";
}
var s=new _1.Surface(),p=d.byId(_31),c=p.ownerDocument.createElement("canvas");
c.width=g.normalizedLength(_32);
c.height=g.normalizedLength(_33);
p.appendChild(c);
s.rawNode=c;
s._parent=p;
s.surface=s;
return s;
};
var _24=function(evt){
if(evt.cancelBubble!==undefined){
return evt.cancelBubble;
}
return false;
};
_1.fixTarget=function(_34,_35){
if(_24(_34)){
return false;
}
if(!_34.gfxTarget){
_35._pick.last=_35._pick.curr;
_35._pick.curr=_35._whatsUnderEvent(_34);
if(!dojo.isArray(_35._pick.curr)){
_34.gfxTarget=_35._pick.curr;
}
}
return true;
};
return _1;
});
