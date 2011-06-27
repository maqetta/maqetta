/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/svg",["./_base","./path"],function(){
var _1=dojo.getObject("gfx.svg",true,dojox),d=dojo,g=dojox.gfx,gs=g.shape;
_1.useSvgWeb=(typeof window.svgweb!="undefined");
var _2=navigator.userAgent.toLowerCase(),_3=_2.search("iphone")>-1||_2.search("ipad")>-1||_2.search("ipod")>-1;
function _4(ns,_5){
if(dojo.doc.createElementNS){
return dojo.doc.createElementNS(ns,_5);
}else{
return dojo.doc.createElement(_5);
}
};
function _6(_7){
if(_1.useSvgWeb){
return dojo.doc.createTextNode(_7,true);
}else{
return dojo.doc.createTextNode(_7);
}
};
function _8(){
if(_1.useSvgWeb){
return dojo.doc.createDocumentFragment(true);
}else{
return dojo.doc.createDocumentFragment();
}
};
_1.xmlns={xlink:"http://www.w3.org/1999/xlink",svg:"http://www.w3.org/2000/svg"};
_1.getRef=function(_9){
if(!_9||_9=="none"){
return null;
}
if(_9.match(/^url\(#.+\)$/)){
return d.byId(_9.slice(5,-1));
}
if(_9.match(/^#dojoUnique\d+$/)){
return d.byId(_9.slice(1));
}
return null;
};
_1.dasharray={solid:"none",shortdash:[4,1],shortdot:[1,1],shortdashdot:[4,1,1,1],shortdashdotdot:[4,1,1,1,1,1],dot:[1,3],dash:[4,3],longdash:[8,3],dashdot:[4,3,1,3],longdashdot:[8,3,1,3],longdashdotdot:[8,3,1,3,1,3]};
d.declare("dojox.gfx.svg.Shape",gs.Shape,{setFill:function(_a){
if(!_a){
this.fillStyle=null;
this.rawNode.setAttribute("fill","none");
this.rawNode.setAttribute("fill-opacity",0);
return this;
}
var f;
var _b=function(x){
this.setAttribute(x,f[x].toFixed(8));
};
if(typeof (_a)=="object"&&"type" in _a){
switch(_a.type){
case "linear":
f=g.makeParameters(g.defaultLinearGradient,_a);
var _c=this._setFillObject(f,"linearGradient");
d.forEach(["x1","y1","x2","y2"],_b,_c);
break;
case "radial":
f=g.makeParameters(g.defaultRadialGradient,_a);
var _c=this._setFillObject(f,"radialGradient");
d.forEach(["cx","cy","r"],_b,_c);
break;
case "pattern":
f=g.makeParameters(g.defaultPattern,_a);
var _d=this._setFillObject(f,"pattern");
d.forEach(["x","y","width","height"],_b,_d);
break;
}
this.fillStyle=f;
return this;
}
var f=g.normalizeColor(_a);
this.fillStyle=f;
this.rawNode.setAttribute("fill",f.toCss());
this.rawNode.setAttribute("fill-opacity",f.a);
this.rawNode.setAttribute("fill-rule","evenodd");
return this;
},setStroke:function(_e){
var rn=this.rawNode;
if(!_e){
this.strokeStyle=null;
rn.setAttribute("stroke","none");
rn.setAttribute("stroke-opacity",0);
return this;
}
if(typeof _e=="string"||d.isArray(_e)||_e instanceof d.Color){
_e={color:_e};
}
var s=this.strokeStyle=g.makeParameters(g.defaultStroke,_e);
s.color=g.normalizeColor(s.color);
if(s){
rn.setAttribute("stroke",s.color.toCss());
rn.setAttribute("stroke-opacity",s.color.a);
rn.setAttribute("stroke-width",s.width);
rn.setAttribute("stroke-linecap",s.cap);
if(typeof s.join=="number"){
rn.setAttribute("stroke-linejoin","miter");
rn.setAttribute("stroke-miterlimit",s.join);
}else{
rn.setAttribute("stroke-linejoin",s.join);
}
var da=s.style.toLowerCase();
if(da in _1.dasharray){
da=_1.dasharray[da];
}
if(da instanceof Array){
da=d._toArray(da);
for(var i=0;i<da.length;++i){
da[i]*=s.width;
}
if(s.cap!="butt"){
for(var i=0;i<da.length;i+=2){
da[i]-=s.width;
if(da[i]<1){
da[i]=1;
}
}
for(var i=1;i<da.length;i+=2){
da[i]+=s.width;
}
}
da=da.join(",");
}
rn.setAttribute("stroke-dasharray",da);
rn.setAttribute("dojoGfxStrokeStyle",s.style);
}
return this;
},_getParentSurface:function(){
var _f=this.parent;
for(;_f&&!(_f instanceof g.Surface);_f=_f.parent){
}
return _f;
},_setFillObject:function(f,_10){
var _11=_1.xmlns.svg;
this.fillStyle=f;
var _12=this._getParentSurface(),_13=_12.defNode,_14=this.rawNode.getAttribute("fill"),ref=_1.getRef(_14);
if(ref){
_14=ref;
if(_14.tagName.toLowerCase()!=_10.toLowerCase()){
var id=_14.id;
_14.parentNode.removeChild(_14);
_14=_4(_11,_10);
_14.setAttribute("id",id);
_13.appendChild(_14);
}else{
while(_14.childNodes.length){
_14.removeChild(_14.lastChild);
}
}
}else{
_14=_4(_11,_10);
_14.setAttribute("id",g._base._getUniqueId());
_13.appendChild(_14);
}
if(_10=="pattern"){
_14.setAttribute("patternUnits","userSpaceOnUse");
var img=_4(_11,"image");
img.setAttribute("x",0);
img.setAttribute("y",0);
img.setAttribute("width",f.width.toFixed(8));
img.setAttribute("height",f.height.toFixed(8));
img.setAttributeNS(_1.xmlns.xlink,"xlink:href",f.src);
_14.appendChild(img);
}else{
_14.setAttribute("gradientUnits","userSpaceOnUse");
for(var i=0;i<f.colors.length;++i){
var c=f.colors[i],t=_4(_11,"stop"),cc=c.color=g.normalizeColor(c.color);
t.setAttribute("offset",c.offset.toFixed(8));
t.setAttribute("stop-color",cc.toCss());
t.setAttribute("stop-opacity",cc.a);
_14.appendChild(t);
}
}
this.rawNode.setAttribute("fill","url(#"+_14.getAttribute("id")+")");
this.rawNode.removeAttribute("fill-opacity");
this.rawNode.setAttribute("fill-rule","evenodd");
return _14;
},_applyTransform:function(){
var _15=this.matrix;
if(_15){
var tm=this.matrix;
this.rawNode.setAttribute("transform","matrix("+tm.xx.toFixed(8)+","+tm.yx.toFixed(8)+","+tm.xy.toFixed(8)+","+tm.yy.toFixed(8)+","+tm.dx.toFixed(8)+","+tm.dy.toFixed(8)+")");
}else{
this.rawNode.removeAttribute("transform");
}
return this;
},setRawNode:function(_16){
var r=this.rawNode=_16;
if(this.shape.type!="image"){
r.setAttribute("fill","none");
}
r.setAttribute("fill-opacity",0);
r.setAttribute("stroke","none");
r.setAttribute("stroke-opacity",0);
r.setAttribute("stroke-width",1);
r.setAttribute("stroke-linecap","butt");
r.setAttribute("stroke-linejoin","miter");
r.setAttribute("stroke-miterlimit",4);
r.__gfxObject__=this.getUID();
},setShape:function(_17){
this.shape=g.makeParameters(this.shape,_17);
for(var i in this.shape){
if(i!="type"){
this.rawNode.setAttribute(i,this.shape[i]);
}
}
this.bbox=null;
return this;
},_moveToFront:function(){
this.rawNode.parentNode.appendChild(this.rawNode);
return this;
},_moveToBack:function(){
this.rawNode.parentNode.insertBefore(this.rawNode,this.rawNode.parentNode.firstChild);
return this;
}});
dojo.declare("dojox.gfx.svg.Group",_1.Shape,{constructor:function(){
gs.Container._init.call(this);
},setRawNode:function(_18){
this.rawNode=_18;
this.rawNode.__gfxObject__=this.getUID();
}});
_1.Group.nodeType="g";
dojo.declare("dojox.gfx.svg.Rect",[_1.Shape,gs.Rect],{setShape:function(_19){
this.shape=g.makeParameters(this.shape,_19);
this.bbox=null;
for(var i in this.shape){
if(i!="type"&&i!="r"){
this.rawNode.setAttribute(i,this.shape[i]);
}
}
if(this.shape.r){
this.rawNode.setAttribute("ry",this.shape.r);
this.rawNode.setAttribute("rx",this.shape.r);
}
return this;
}});
_1.Rect.nodeType="rect";
dojo.declare("dojox.gfx.svg.Ellipse",[_1.Shape,gs.Ellipse],{});
_1.Ellipse.nodeType="ellipse";
dojo.declare("dojox.gfx.svg.Circle",[_1.Shape,gs.Circle],{});
_1.Circle.nodeType="circle";
dojo.declare("dojox.gfx.svg.Line",[_1.Shape,gs.Line],{});
_1.Line.nodeType="line";
dojo.declare("dojox.gfx.svg.Polyline",[_1.Shape,gs.Polyline],{setShape:function(_1a,_1b){
if(_1a&&_1a instanceof Array){
this.shape=g.makeParameters(this.shape,{points:_1a});
if(_1b&&this.shape.points.length){
this.shape.points.push(this.shape.points[0]);
}
}else{
this.shape=g.makeParameters(this.shape,_1a);
}
this.bbox=null;
this._normalizePoints();
var _1c=[],p=this.shape.points;
for(var i=0;i<p.length;++i){
_1c.push(p[i].x.toFixed(8),p[i].y.toFixed(8));
}
this.rawNode.setAttribute("points",_1c.join(" "));
return this;
}});
_1.Polyline.nodeType="polyline";
dojo.declare("dojox.gfx.svg.Image",[_1.Shape,gs.Image],{setShape:function(_1d){
this.shape=g.makeParameters(this.shape,_1d);
this.bbox=null;
var _1e=this.rawNode;
for(var i in this.shape){
if(i!="type"&&i!="src"){
_1e.setAttribute(i,this.shape[i]);
}
}
_1e.setAttribute("preserveAspectRatio","none");
_1e.setAttributeNS(_1.xmlns.xlink,"xlink:href",this.shape.src);
_1e.__gfxObject__=this.getUID();
return this;
}});
_1.Image.nodeType="image";
dojo.declare("dojox.gfx.svg.Text",[_1.Shape,gs.Text],{setShape:function(_1f){
this.shape=g.makeParameters(this.shape,_1f);
this.bbox=null;
var r=this.rawNode,s=this.shape;
r.setAttribute("x",s.x);
r.setAttribute("y",s.y);
r.setAttribute("text-anchor",s.align);
r.setAttribute("text-decoration",s.decoration);
r.setAttribute("rotate",s.rotated?90:0);
r.setAttribute("kerning",s.kerning?"auto":0);
r.setAttribute("text-rendering","optimizeLegibility");
if(r.firstChild){
r.firstChild.nodeValue=s.text;
}else{
r.appendChild(_6(s.text));
}
return this;
},getTextWidth:function(){
var _20=this.rawNode,_21=_20.parentNode,_22=_20.cloneNode(true);
_22.style.visibility="hidden";
var _23=0,_24=_22.firstChild.nodeValue;
_21.appendChild(_22);
if(_24!=""){
while(!_23){
if(_22.getBBox){
_23=parseInt(_22.getBBox().width);
}else{
_23=68;
}
}
}
_21.removeChild(_22);
return _23;
}});
_1.Text.nodeType="text";
dojo.declare("dojox.gfx.svg.Path",[_1.Shape,g.path.Path],{_updateWithSegment:function(_25){
this.inherited(arguments);
if(typeof (this.shape.path)=="string"){
this.rawNode.setAttribute("d",this.shape.path);
}
},setShape:function(_26){
this.inherited(arguments);
if(this.shape.path){
this.rawNode.setAttribute("d",this.shape.path);
}else{
this.rawNode.removeAttribute("d");
}
return this;
}});
_1.Path.nodeType="path";
dojo.declare("dojox.gfx.svg.TextPath",[_1.Shape,g.path.TextPath],{_updateWithSegment:function(_27){
this.inherited(arguments);
this._setTextPath();
},setShape:function(_28){
this.inherited(arguments);
this._setTextPath();
return this;
},_setTextPath:function(){
if(typeof this.shape.path!="string"){
return;
}
var r=this.rawNode;
if(!r.firstChild){
var tp=_4(_1.xmlns.svg,"textPath"),tx=_6("");
tp.appendChild(tx);
r.appendChild(tp);
}
var ref=r.firstChild.getAttributeNS(_1.xmlns.xlink,"href"),_29=ref&&_1.getRef(ref);
if(!_29){
var _2a=this._getParentSurface();
if(_2a){
var _2b=_2a.defNode;
_29=_4(_1.xmlns.svg,"path");
var id=g._base._getUniqueId();
_29.setAttribute("id",id);
_2b.appendChild(_29);
r.firstChild.setAttributeNS(_1.xmlns.xlink,"xlink:href","#"+id);
}
}
if(_29){
_29.setAttribute("d",this.shape.path);
}
},_setText:function(){
var r=this.rawNode;
if(!r.firstChild){
var tp=_4(_1.xmlns.svg,"textPath"),tx=_6("");
tp.appendChild(tx);
r.appendChild(tp);
}
r=r.firstChild;
var t=this.text;
r.setAttribute("alignment-baseline","middle");
switch(t.align){
case "middle":
r.setAttribute("text-anchor","middle");
r.setAttribute("startOffset","50%");
break;
case "end":
r.setAttribute("text-anchor","end");
r.setAttribute("startOffset","100%");
break;
default:
r.setAttribute("text-anchor","start");
r.setAttribute("startOffset","0%");
break;
}
r.setAttribute("baseline-shift","0.5ex");
r.setAttribute("text-decoration",t.decoration);
r.setAttribute("rotate",t.rotated?90:0);
r.setAttribute("kerning",t.kerning?"auto":0);
r.firstChild.data=t.text;
}});
_1.TextPath.nodeType="text";
dojo.declare("dojox.gfx.svg.Surface",gs.Surface,{constructor:function(){
gs.Container._init.call(this);
},destroy:function(){
this.defNode=null;
this.inherited(arguments);
},setDimensions:function(_2c,_2d){
if(!this.rawNode){
return this;
}
this.rawNode.setAttribute("width",_2c);
this.rawNode.setAttribute("height",_2d);
return this;
},getDimensions:function(){
var t=this.rawNode?{width:g.normalizedLength(this.rawNode.getAttribute("width")),height:g.normalizedLength(this.rawNode.getAttribute("height"))}:null;
return t;
}});
_1.createSurface=function(_2e,_2f,_30){
var s=new _1.Surface();
s.rawNode=_4(_1.xmlns.svg,"svg");
s.rawNode.setAttribute("overflow","hidden");
if(_2f){
s.rawNode.setAttribute("width",_2f);
}
if(_30){
s.rawNode.setAttribute("height",_30);
}
var _31=_4(_1.xmlns.svg,"defs");
s.rawNode.appendChild(_31);
s.defNode=_31;
s._parent=d.byId(_2e);
s._parent.appendChild(s.rawNode);
return s;
};
var _32={_setFont:function(){
var f=this.fontStyle;
this.rawNode.setAttribute("font-style",f.style);
this.rawNode.setAttribute("font-variant",f.variant);
this.rawNode.setAttribute("font-weight",f.weight);
this.rawNode.setAttribute("font-size",f.size);
this.rawNode.setAttribute("font-family",f.family);
}};
var C=gs.Container,_33={openBatch:function(){
this.fragment=_8();
},closeBatch:function(){
if(this.fragment){
this.rawNode.appendChild(this.fragment);
delete this.fragment;
}
},add:function(_34){
if(this!=_34.getParent()){
if(this.fragment){
this.fragment.appendChild(_34.rawNode);
}else{
this.rawNode.appendChild(_34.rawNode);
}
C.add.apply(this,arguments);
}
return this;
},remove:function(_35,_36){
if(this==_35.getParent()){
if(this.rawNode==_35.rawNode.parentNode){
this.rawNode.removeChild(_35.rawNode);
}
if(this.fragment&&this.fragment==_35.rawNode.parentNode){
this.fragment.removeChild(_35.rawNode);
}
C.remove.apply(this,arguments);
}
return this;
},clear:function(){
var r=this.rawNode;
while(r.lastChild){
r.removeChild(r.lastChild);
}
var _37=this.defNode;
if(_37){
while(_37.lastChild){
_37.removeChild(_37.lastChild);
}
r.appendChild(_37);
}
return C.clear.apply(this,arguments);
},_moveChildToFront:C._moveChildToFront,_moveChildToBack:C._moveChildToBack};
var _38={createObject:function(_39,_3a){
if(!this.rawNode){
return null;
}
var _3b=new _39(),_3c=_4(_1.xmlns.svg,_39.nodeType);
_3b.setRawNode(_3c);
_3b.setShape(_3a);
this.add(_3b);
return _3b;
}};
d.extend(_1.Text,_32);
d.extend(_1.TextPath,_32);
d.extend(_1.Group,_33);
d.extend(_1.Group,gs.Creator);
d.extend(_1.Group,_38);
d.extend(_1.Surface,_33);
d.extend(_1.Surface,gs.Creator);
d.extend(_1.Surface,_38);
_1.fixTarget=function(_3d,_3e){
if(!_3d.gfxTarget){
if(_3&&_3d.target.wholeText){
_3d.gfxTarget=dojox.gfx.shape.byId(_3d.target.parentElement.__gfxObject__);
}else{
_3d.gfxTarget=dojox.gfx.shape.byId(_3d.target.__gfxObject__);
}
}
return true;
};
if(_1.useSvgWeb){
_1.createSurface=function(_3f,_40,_41){
var s=new _1.Surface();
if(!_40||!_41){
var pos=d.position(_3f);
_40=_40||pos.w;
_41=_41||pos.h;
}
_3f=d.byId(_3f);
var id=_3f.id?_3f.id+"_svgweb":g._base._getUniqueId();
var _42=_4(_1.xmlns.svg,"svg");
_42.id=id;
_42.setAttribute("width",_40);
_42.setAttribute("height",_41);
svgweb.appendChild(_42,_3f);
_42.addEventListener("SVGLoad",function(){
s.rawNode=this;
s.isLoaded=true;
var _43=_4(_1.xmlns.svg,"defs");
s.rawNode.appendChild(_43);
s.defNode=_43;
if(s.onLoad){
s.onLoad(s);
}
},false);
s.isLoaded=false;
return s;
};
_1.Surface.extend({destroy:function(){
var _44=this.rawNode;
svgweb.removeChild(_44,_44.parentNode);
}});
var _45={connect:function(_46,_47,_48){
if(_46.substring(0,2)==="on"){
_46=_46.substring(2);
}
if(arguments.length==2){
_48=_47;
}else{
_48=d.hitch(_47,_48);
}
this.getEventSource().addEventListener(_46,_48,false);
return [this,_46,_48];
},disconnect:function(_49){
this.getEventSource().removeEventListener(_49[1],_49[2],false);
delete _49[0];
}};
dojo.extend(_1.Shape,_45);
dojo.extend(_1.Surface,_45);
}
return _1;
});
