//>>built
define("dojox/gfx/canvas",["./_base","dojo/_base/lang","dojo/_base/array","dojo/_base/declare","dojo/_base/window","dojo/dom-geometry","dojo/dom","./_base","./shape","./path","./arc","./matrix","./decompose"],function(g,_1,_2,_3,_4,_5,_6,_7,gs,_8,ga,m,_9){
var _a=g.canvas={};
var _b=null,mp=m.multiplyPoint,pi=Math.PI,_c=2*pi,_d=pi/2,_e=_1.extend;
_3("dojox.gfx.canvas.Shape",gs.Shape,{_render:function(_f){
_f.save();
this._renderTransform(_f);
this._renderShape(_f);
this._renderFill(_f,true);
this._renderStroke(_f,true);
_f.restore();
},_renderTransform:function(ctx){
if("canvasTransform" in this){
var t=this.canvasTransform;
ctx.translate(t.dx,t.dy);
ctx.rotate(t.angle2);
ctx.scale(t.sx,t.sy);
ctx.rotate(t.angle1);
}
},_renderShape:function(ctx){
},_renderFill:function(ctx,_10){
if("canvasFill" in this){
var fs=this.fillStyle;
if("canvasFillImage" in this){
var w=fs.width,h=fs.height,iw=this.canvasFillImage.width,ih=this.canvasFillImage.height,sx=w==iw?1:w/iw,sy=h==ih?1:h/ih,s=Math.min(sx,sy),dx=(w-s*iw)/2,dy=(h-s*ih)/2;
_b.width=w;
_b.height=h;
var _11=_b.getContext("2d");
_11.clearRect(0,0,w,h);
_11.drawImage(this.canvasFillImage,0,0,iw,ih,dx,dy,s*iw,s*ih);
this.canvasFill=ctx.createPattern(_b,"repeat");
delete this.canvasFillImage;
}
ctx.fillStyle=this.canvasFill;
if(_10){
if(fs.type==="pattern"&&(fs.x!==0||fs.y!==0)){
ctx.translate(fs.x,fs.y);
}
ctx.fill();
}
}else{
ctx.fillStyle="rgba(0,0,0,0.0)";
}
},_renderStroke:function(ctx,_12){
var s=this.strokeStyle;
if(s){
ctx.strokeStyle=s.color.toString();
ctx.lineWidth=s.width;
ctx.lineCap=s.cap;
if(typeof s.join=="number"){
ctx.lineJoin="miter";
ctx.miterLimit=s.join;
}else{
ctx.lineJoin=s.join;
}
if(_12){
ctx.stroke();
}
}else{
if(!_12){
ctx.strokeStyle="rgba(0,0,0,0.0)";
}
}
},getEventSource:function(){
return null;
},connect:function(){
},disconnect:function(){
}});
var _13=function(_14,_15,_16){
var old=_14.prototype[_15];
_14.prototype[_15]=_16?function(){
this.surface.makeDirty();
old.apply(this,arguments);
_16.call(this);
return this;
}:function(){
this.surface.makeDirty();
return old.apply(this,arguments);
};
};
_13(_a.Shape,"setTransform",function(){
if(this.matrix){
this.canvasTransform=g.decompose(this.matrix);
}else{
delete this.canvasTransform;
}
});
_13(_a.Shape,"setFill",function(){
var fs=this.fillStyle,f;
if(fs){
if(typeof (fs)=="object"&&"type" in fs){
var ctx=this.surface.rawNode.getContext("2d");
switch(fs.type){
case "linear":
case "radial":
f=fs.type=="linear"?ctx.createLinearGradient(fs.x1,fs.y1,fs.x2,fs.y2):ctx.createRadialGradient(fs.cx,fs.cy,0,fs.cx,fs.cy,fs.r);
_2.forEach(fs.colors,function(_17){
f.addColorStop(_17.offset,g.normalizeColor(_17.color).toString());
});
break;
case "pattern":
if(!_b){
_b=document.createElement("canvas");
}
var img=new Image();
this.surface.downloadImage(img,fs.src);
this.canvasFillImage=img;
}
}else{
f=fs.toString();
}
this.canvasFill=f;
}else{
delete this.canvasFill;
}
});
_13(_a.Shape,"setStroke");
_13(_a.Shape,"setShape");
_3("dojox.gfx.canvas.Group",_a.Shape,{constructor:function(){
gs.Container._init.call(this);
},_render:function(ctx){
ctx.save();
this._renderTransform(ctx);
for(var i=0;i<this.children.length;++i){
this.children[i]._render(ctx);
}
ctx.restore();
}});
_3("dojox.gfx.canvas.Rect",[_a.Shape,gs.Rect],{_renderShape:function(ctx){
var s=this.shape,r=Math.min(s.r,s.height/2,s.width/2),xl=s.x,xr=xl+s.width,yt=s.y,yb=yt+s.height,xl2=xl+r,xr2=xr-r,yt2=yt+r,yb2=yb-r;
ctx.beginPath();
ctx.moveTo(xl2,yt);
if(r){
ctx.arc(xr2,yt2,r,-_d,0,false);
ctx.arc(xr2,yb2,r,0,_d,false);
ctx.arc(xl2,yb2,r,_d,pi,false);
ctx.arc(xl2,yt2,r,pi,pi+_d,false);
}else{
ctx.lineTo(xr2,yt);
ctx.lineTo(xr,yb2);
ctx.lineTo(xl2,yb);
ctx.lineTo(xl,yt2);
}
ctx.closePath();
}});
var _18=[];
(function(){
var u=ga.curvePI4;
_18.push(u.s,u.c1,u.c2,u.e);
for(var a=45;a<360;a+=45){
var r=m.rotateg(a);
_18.push(mp(r,u.c1),mp(r,u.c2),mp(r,u.e));
}
})();
_3("dojox.gfx.canvas.Ellipse",[_a.Shape,gs.Ellipse],{setShape:function(){
this.inherited(arguments);
var s=this.shape,t,c1,c2,r=[],M=m.normalize([m.translate(s.cx,s.cy),m.scale(s.rx,s.ry)]);
t=mp(M,_18[0]);
r.push([t.x,t.y]);
for(var i=1;i<_18.length;i+=3){
c1=mp(M,_18[i]);
c2=mp(M,_18[i+1]);
t=mp(M,_18[i+2]);
r.push([c1.x,c1.y,c2.x,c2.y,t.x,t.y]);
}
this.canvasEllipse=r;
return this;
},_renderShape:function(ctx){
var r=this.canvasEllipse;
ctx.beginPath();
ctx.moveTo.apply(ctx,r[0]);
for(var i=1;i<r.length;++i){
ctx.bezierCurveTo.apply(ctx,r[i]);
}
ctx.closePath();
}});
_3("dojox.gfx.canvas.Circle",[_a.Shape,gs.Circle],{_renderShape:function(ctx){
var s=this.shape;
ctx.beginPath();
ctx.arc(s.cx,s.cy,s.r,0,_c,1);
}});
_3("dojox.gfx.canvas.Line",[_a.Shape,gs.Line],{_renderShape:function(ctx){
var s=this.shape;
ctx.beginPath();
ctx.moveTo(s.x1,s.y1);
ctx.lineTo(s.x2,s.y2);
}});
_3("dojox.gfx.canvas.Polyline",[_a.Shape,gs.Polyline],{setShape:function(){
this.inherited(arguments);
var p=this.shape.points,f=p[0],r,c,i;
this.bbox=null;
this._normalizePoints();
if(p.length){
if(typeof f=="number"){
r=p;
}else{
r=[];
for(i=0;i<p.length;++i){
c=p[i];
r.push(c.x,c.y);
}
}
}else{
r=[];
}
this.canvasPolyline=r;
return this;
},_renderShape:function(ctx){
var p=this.canvasPolyline;
if(p.length){
ctx.beginPath();
ctx.moveTo(p[0],p[1]);
for(var i=2;i<p.length;i+=2){
ctx.lineTo(p[i],p[i+1]);
}
}
}});
_3("dojox.gfx.canvas.Image",[_a.Shape,gs.Image],{setShape:function(){
this.inherited(arguments);
var img=new Image();
this.surface.downloadImage(img,this.shape.src);
this.canvasImage=img;
return this;
},_renderShape:function(ctx){
var s=this.shape;
ctx.drawImage(this.canvasImage,s.x,s.y,s.width,s.height);
}});
_3("dojox.gfx.canvas.Text",[_a.Shape,gs.Text],{_setFont:function(){
if(this.fontStyle){
this.canvasFont=g.makeFontString(this.fontStyle);
}else{
delete this.canvasFont;
}
},getTextWidth:function(){
var s=this.shape,w=0,ctx;
if(s.text&&s.text.length>0){
ctx=this.surface.rawNode.getContext("2d");
ctx.save();
this._renderTransform(ctx);
this._renderFill(ctx,false);
this._renderStroke(ctx,false);
if(this.canvasFont){
ctx.font=this.canvasFont;
}
w=ctx.measureText(s.text).width;
ctx.restore();
}
return w;
},_render:function(ctx){
ctx.save();
this._renderTransform(ctx);
this._renderFill(ctx,false);
this._renderStroke(ctx,false);
this._renderShape(ctx);
ctx.restore();
},_renderShape:function(ctx){
var ta,s=this.shape;
if(!s.text||s.text.length==0){
return;
}
ta=s.align==="middle"?"center":s.align;
ctx.textAlign=ta;
if(this.canvasFont){
ctx.font=this.canvasFont;
}
if(this.canvasFill){
ctx.fillText(s.text,s.x,s.y);
}
if(this.strokeStyle){
ctx.beginPath();
ctx.strokeText(s.text,s.x,s.y);
ctx.closePath();
}
}});
_13(_a.Text,"setFont");
if(typeof _4.doc.createElement("canvas").getContext("2d").fillText!="function"){
_a.Text.extend({getTextWidth:function(){
return 0;
},_renderShape:function(){
}});
}
var _19={M:"_moveToA",m:"_moveToR",L:"_lineToA",l:"_lineToR",H:"_hLineToA",h:"_hLineToR",V:"_vLineToA",v:"_vLineToR",C:"_curveToA",c:"_curveToR",S:"_smoothCurveToA",s:"_smoothCurveToR",Q:"_qCurveToA",q:"_qCurveToR",T:"_qSmoothCurveToA",t:"_qSmoothCurveToR",A:"_arcTo",a:"_arcTo",Z:"_closePath",z:"_closePath"};
_3("dojox.gfx.canvas.Path",[_a.Shape,_8.Path],{constructor:function(){
this.lastControl={};
},setShape:function(){
this.canvasPath=[];
return this.inherited(arguments);
},_updateWithSegment:function(_1a){
var _1b=_1.clone(this.last);
this[_19[_1a.action]](this.canvasPath,_1a.action,_1a.args);
this.last=_1b;
this.inherited(arguments);
},_renderShape:function(ctx){
var r=this.canvasPath;
ctx.beginPath();
for(var i=0;i<r.length;i+=2){
ctx[r[i]].apply(ctx,r[i+1]);
}
},_moveToA:function(_1c,_1d,_1e){
_1c.push("moveTo",[_1e[0],_1e[1]]);
for(var i=2;i<_1e.length;i+=2){
_1c.push("lineTo",[_1e[i],_1e[i+1]]);
}
this.last.x=_1e[_1e.length-2];
this.last.y=_1e[_1e.length-1];
this.lastControl={};
},_moveToR:function(_1f,_20,_21){
if("x" in this.last){
_1f.push("moveTo",[this.last.x+=_21[0],this.last.y+=_21[1]]);
}else{
_1f.push("moveTo",[this.last.x=_21[0],this.last.y=_21[1]]);
}
for(var i=2;i<_21.length;i+=2){
_1f.push("lineTo",[this.last.x+=_21[i],this.last.y+=_21[i+1]]);
}
this.lastControl={};
},_lineToA:function(_22,_23,_24){
for(var i=0;i<_24.length;i+=2){
_22.push("lineTo",[_24[i],_24[i+1]]);
}
this.last.x=_24[_24.length-2];
this.last.y=_24[_24.length-1];
this.lastControl={};
},_lineToR:function(_25,_26,_27){
for(var i=0;i<_27.length;i+=2){
_25.push("lineTo",[this.last.x+=_27[i],this.last.y+=_27[i+1]]);
}
this.lastControl={};
},_hLineToA:function(_28,_29,_2a){
for(var i=0;i<_2a.length;++i){
_28.push("lineTo",[_2a[i],this.last.y]);
}
this.last.x=_2a[_2a.length-1];
this.lastControl={};
},_hLineToR:function(_2b,_2c,_2d){
for(var i=0;i<_2d.length;++i){
_2b.push("lineTo",[this.last.x+=_2d[i],this.last.y]);
}
this.lastControl={};
},_vLineToA:function(_2e,_2f,_30){
for(var i=0;i<_30.length;++i){
_2e.push("lineTo",[this.last.x,_30[i]]);
}
this.last.y=_30[_30.length-1];
this.lastControl={};
},_vLineToR:function(_31,_32,_33){
for(var i=0;i<_33.length;++i){
_31.push("lineTo",[this.last.x,this.last.y+=_33[i]]);
}
this.lastControl={};
},_curveToA:function(_34,_35,_36){
for(var i=0;i<_36.length;i+=6){
_34.push("bezierCurveTo",_36.slice(i,i+6));
}
this.last.x=_36[_36.length-2];
this.last.y=_36[_36.length-1];
this.lastControl.x=_36[_36.length-4];
this.lastControl.y=_36[_36.length-3];
this.lastControl.type="C";
},_curveToR:function(_37,_38,_39){
for(var i=0;i<_39.length;i+=6){
_37.push("bezierCurveTo",[this.last.x+_39[i],this.last.y+_39[i+1],this.lastControl.x=this.last.x+_39[i+2],this.lastControl.y=this.last.y+_39[i+3],this.last.x+_39[i+4],this.last.y+_39[i+5]]);
this.last.x+=_39[i+4];
this.last.y+=_39[i+5];
}
this.lastControl.type="C";
},_smoothCurveToA:function(_3a,_3b,_3c){
for(var i=0;i<_3c.length;i+=4){
var _3d=this.lastControl.type=="C";
_3a.push("bezierCurveTo",[_3d?2*this.last.x-this.lastControl.x:this.last.x,_3d?2*this.last.y-this.lastControl.y:this.last.y,_3c[i],_3c[i+1],_3c[i+2],_3c[i+3]]);
this.lastControl.x=_3c[i];
this.lastControl.y=_3c[i+1];
this.lastControl.type="C";
}
this.last.x=_3c[_3c.length-2];
this.last.y=_3c[_3c.length-1];
},_smoothCurveToR:function(_3e,_3f,_40){
for(var i=0;i<_40.length;i+=4){
var _41=this.lastControl.type=="C";
_3e.push("bezierCurveTo",[_41?2*this.last.x-this.lastControl.x:this.last.x,_41?2*this.last.y-this.lastControl.y:this.last.y,this.last.x+_40[i],this.last.y+_40[i+1],this.last.x+_40[i+2],this.last.y+_40[i+3]]);
this.lastControl.x=this.last.x+_40[i];
this.lastControl.y=this.last.y+_40[i+1];
this.lastControl.type="C";
this.last.x+=_40[i+2];
this.last.y+=_40[i+3];
}
},_qCurveToA:function(_42,_43,_44){
for(var i=0;i<_44.length;i+=4){
_42.push("quadraticCurveTo",_44.slice(i,i+4));
}
this.last.x=_44[_44.length-2];
this.last.y=_44[_44.length-1];
this.lastControl.x=_44[_44.length-4];
this.lastControl.y=_44[_44.length-3];
this.lastControl.type="Q";
},_qCurveToR:function(_45,_46,_47){
for(var i=0;i<_47.length;i+=4){
_45.push("quadraticCurveTo",[this.lastControl.x=this.last.x+_47[i],this.lastControl.y=this.last.y+_47[i+1],this.last.x+_47[i+2],this.last.y+_47[i+3]]);
this.last.x+=_47[i+2];
this.last.y+=_47[i+3];
}
this.lastControl.type="Q";
},_qSmoothCurveToA:function(_48,_49,_4a){
for(var i=0;i<_4a.length;i+=2){
var _4b=this.lastControl.type=="Q";
_48.push("quadraticCurveTo",[this.lastControl.x=_4b?2*this.last.x-this.lastControl.x:this.last.x,this.lastControl.y=_4b?2*this.last.y-this.lastControl.y:this.last.y,_4a[i],_4a[i+1]]);
this.lastControl.type="Q";
}
this.last.x=_4a[_4a.length-2];
this.last.y=_4a[_4a.length-1];
},_qSmoothCurveToR:function(_4c,_4d,_4e){
for(var i=0;i<_4e.length;i+=2){
var _4f=this.lastControl.type=="Q";
_4c.push("quadraticCurveTo",[this.lastControl.x=_4f?2*this.last.x-this.lastControl.x:this.last.x,this.lastControl.y=_4f?2*this.last.y-this.lastControl.y:this.last.y,this.last.x+_4e[i],this.last.y+_4e[i+1]]);
this.lastControl.type="Q";
this.last.x+=_4e[i];
this.last.y+=_4e[i+1];
}
},_arcTo:function(_50,_51,_52){
var _53=_51=="a";
for(var i=0;i<_52.length;i+=7){
var x1=_52[i+5],y1=_52[i+6];
if(_53){
x1+=this.last.x;
y1+=this.last.y;
}
var _54=ga.arcAsBezier(this.last,_52[i],_52[i+1],_52[i+2],_52[i+3]?1:0,_52[i+4]?1:0,x1,y1);
_2.forEach(_54,function(p){
_50.push("bezierCurveTo",p);
});
this.last.x=x1;
this.last.y=y1;
}
this.lastControl={};
},_closePath:function(_55,_56,_57){
_55.push("closePath",[]);
this.lastControl={};
}});
_2.forEach(["moveTo","lineTo","hLineTo","vLineTo","curveTo","smoothCurveTo","qCurveTo","qSmoothCurveTo","arcTo","closePath"],function(_58){
_13(_a.Path,_58);
});
_3("dojox.gfx.canvas.TextPath",[_a.Shape,_8.TextPath],{_renderShape:function(ctx){
var s=this.shape;
},_setText:function(){
},_setFont:function(){
}});
_3("dojox.gfx.canvas.Surface",gs.Surface,{constructor:function(){
gs.Container._init.call(this);
this.pendingImageCount=0;
this.makeDirty();
},setDimensions:function(_59,_5a){
this.width=g.normalizedLength(_59);
this.height=g.normalizedLength(_5a);
if(!this.rawNode){
return this;
}
var _5b=false;
if(this.rawNode.width!=this.width){
this.rawNode.width=this.width;
_5b=true;
}
if(this.rawNode.height!=this.height){
this.rawNode.height=this.height;
_5b=true;
}
if(_5b){
this.makeDirty();
}
return this;
},getDimensions:function(){
return this.rawNode?{width:this.rawNode.width,height:this.rawNode.height}:null;
},_render:function(){
if(this.pendingImageCount){
return;
}
var ctx=this.rawNode.getContext("2d");
ctx.save();
ctx.clearRect(0,0,this.rawNode.width,this.rawNode.height);
for(var i=0;i<this.children.length;++i){
this.children[i]._render(ctx);
}
ctx.restore();
if("pendingRender" in this){
clearTimeout(this.pendingRender);
delete this.pendingRender;
}
},makeDirty:function(){
if(!this.pendingImagesCount&&!("pendingRender" in this)){
this.pendingRender=setTimeout(_1.hitch(this,this._render),0);
}
},downloadImage:function(img,url){
var _5c=_1.hitch(this,this.onImageLoad);
if(!this.pendingImageCount++&&"pendingRender" in this){
clearTimeout(this.pendingRender);
delete this.pendingRender;
}
img.onload=_5c;
img.onerror=_5c;
img.onabort=_5c;
img.src=url;
},onImageLoad:function(){
if(!--this.pendingImageCount){
this._render();
}
},getEventSource:function(){
return null;
},connect:function(){
},disconnect:function(){
}});
_a.createSurface=function(_5d,_5e,_5f){
if(!_5e&&!_5f){
var pos=_5.position(_5d);
_5e=_5e||pos.w;
_5f=_5f||pos.h;
}
if(typeof _5e=="number"){
_5e=_5e+"px";
}
if(typeof _5f=="number"){
_5f=_5f+"px";
}
var s=new _a.Surface(),p=_6.byId(_5d),c=p.ownerDocument.createElement("canvas");
c.width=g.normalizedLength(_5e);
c.height=g.normalizedLength(_5f);
p.appendChild(c);
s.rawNode=c;
s._parent=p;
s.surface=s;
return s;
};
var C=gs.Container,_60={add:function(_61){
this.surface.makeDirty();
return C.add.apply(this,arguments);
},remove:function(_62,_63){
this.surface.makeDirty();
return C.remove.apply(this,arguments);
},clear:function(){
this.surface.makeDirty();
return C.clear.apply(this,arguments);
},_moveChildToFront:function(_64){
this.surface.makeDirty();
return C._moveChildToFront.apply(this,arguments);
},_moveChildToBack:function(_65){
this.surface.makeDirty();
return C._moveChildToBack.apply(this,arguments);
}};
var _66={createObject:function(_67,_68){
var _69=new _67();
_69.surface=this.surface;
_69.setShape(_68);
this.add(_69);
return _69;
}};
_e(_a.Group,_60);
_e(_a.Group,gs.Creator);
_e(_a.Group,_66);
_e(_a.Surface,_60);
_e(_a.Surface,gs.Creator);
_e(_a.Surface,_66);
_a.fixTarget=function(_6a,_6b){
return true;
};
return _a;
});
