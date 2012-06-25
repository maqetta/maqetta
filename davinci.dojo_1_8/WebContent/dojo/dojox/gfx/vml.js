//>>built
define("dojox/gfx/vml",["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","dojo/_base/Color","dojo/_base/sniff","dojo/_base/config","dojo/dom","dojo/dom-geometry","dojo/_base/kernel","./_base","./shape","./path","./arc","./gradient","./matrix"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,g,gs,_a,_b,_c,m){
var _d=g.vml={};
_d.xmlns="urn:schemas-microsoft-com:vml";
document.namespaces.add("v",_d.xmlns);
var _e=["*","group","roundrect","oval","shape","rect","imagedata","path","textpath","text"],i=0,l=1,s=document.createStyleSheet();
if(_5("ie")>=8){
i=1;
l=_e.length;
}
for(;i<l;++i){
s.addRule("v\\:"+_e[i],"behavior:url(#default#VML); display:inline-block");
}
_d.text_alignment={start:"left",middle:"center",end:"right"};
_d._parseFloat=function(_f){
return _f.match(/^\d+f$/i)?parseInt(_f)/65536:parseFloat(_f);
};
_d._bool={"t":1,"true":1};
_d.Shape=_2("dojox.gfx.vml.Shape",gs.Shape,{destroy:function(){
this.rawNode=null;
gs.Shape.prototype.destroy.apply(this,arguments);
},setFill:function(_10){
if(!_10){
this.fillStyle=null;
this.rawNode.filled="f";
return this;
}
var i,f,fo,a,s;
if(typeof _10=="object"&&"type" in _10){
switch(_10.type){
case "linear":
var _11=this._getRealMatrix(),_12=this.getBoundingBox(),_13=this._getRealBBox?this._getRealBBox():this.getTransformedBoundingBox();
s=[];
if(this.fillStyle!==_10){
this.fillStyle=g.makeParameters(g.defaultLinearGradient,_10);
}
f=g.gradient.project(_11,this.fillStyle,{x:_12.x,y:_12.y},{x:_12.x+_12.width,y:_12.y+_12.height},_13[0],_13[2]);
a=f.colors;
if(a[0].offset.toFixed(5)!="0.00000"){
s.push("0 "+g.normalizeColor(a[0].color).toHex());
}
for(i=0;i<a.length;++i){
s.push(a[i].offset.toFixed(5)+" "+g.normalizeColor(a[i].color).toHex());
}
i=a.length-1;
if(a[i].offset.toFixed(5)!="1.00000"){
s.push("1 "+g.normalizeColor(a[i].color).toHex());
}
fo=this.rawNode.fill;
fo.colors.value=s.join(";");
fo.method="sigma";
fo.type="gradient";
fo.angle=(270-m._radToDeg(f.angle))%360;
fo.on=true;
break;
case "radial":
f=g.makeParameters(g.defaultRadialGradient,_10);
this.fillStyle=f;
var l=parseFloat(this.rawNode.style.left),t=parseFloat(this.rawNode.style.top),w=parseFloat(this.rawNode.style.width),h=parseFloat(this.rawNode.style.height),c=isNaN(w)?1:2*f.r/w;
a=[];
if(f.colors[0].offset>0){
a.push({offset:1,color:g.normalizeColor(f.colors[0].color)});
}
_3.forEach(f.colors,function(v,i){
a.push({offset:1-v.offset*c,color:g.normalizeColor(v.color)});
});
i=a.length-1;
while(i>=0&&a[i].offset<0){
--i;
}
if(i<a.length-1){
var q=a[i],p=a[i+1];
p.color=_4.blendColors(q.color,p.color,q.offset/(q.offset-p.offset));
p.offset=0;
while(a.length-i>2){
a.pop();
}
}
i=a.length-1,s=[];
if(a[i].offset>0){
s.push("0 "+a[i].color.toHex());
}
for(;i>=0;--i){
s.push(a[i].offset.toFixed(5)+" "+a[i].color.toHex());
}
fo=this.rawNode.fill;
fo.colors.value=s.join(";");
fo.method="sigma";
fo.type="gradientradial";
if(isNaN(w)||isNaN(h)||isNaN(l)||isNaN(t)){
fo.focusposition="0.5 0.5";
}else{
fo.focusposition=((f.cx-l)/w).toFixed(5)+" "+((f.cy-t)/h).toFixed(5);
}
fo.focussize="0 0";
fo.on=true;
break;
case "pattern":
f=g.makeParameters(g.defaultPattern,_10);
this.fillStyle=f;
fo=this.rawNode.fill;
fo.type="tile";
fo.src=f.src;
if(f.width&&f.height){
fo.size.x=g.px2pt(f.width);
fo.size.y=g.px2pt(f.height);
}
fo.alignShape="f";
fo.position.x=0;
fo.position.y=0;
fo.origin.x=f.width?f.x/f.width:0;
fo.origin.y=f.height?f.y/f.height:0;
fo.on=true;
break;
}
this.rawNode.fill.opacity=1;
return this;
}
this.fillStyle=g.normalizeColor(_10);
fo=this.rawNode.fill;
if(!fo){
fo=this.rawNode.ownerDocument.createElement("v:fill");
}
fo.method="any";
fo.type="solid";
fo.opacity=this.fillStyle.a;
var _14=this.rawNode.filters["DXImageTransform.Microsoft.Alpha"];
if(_14){
_14.opacity=Math.round(this.fillStyle.a*100);
}
this.rawNode.fillcolor=this.fillStyle.toHex();
this.rawNode.filled=true;
return this;
},setStroke:function(_15){
if(!_15){
this.strokeStyle=null;
this.rawNode.stroked="f";
return this;
}
if(typeof _15=="string"||_1.isArray(_15)||_15 instanceof _4){
_15={color:_15};
}
var s=this.strokeStyle=g.makeParameters(g.defaultStroke,_15);
s.color=g.normalizeColor(s.color);
var rn=this.rawNode;
rn.stroked=true;
rn.strokecolor=s.color.toCss();
rn.strokeweight=s.width+"px";
if(rn.stroke){
rn.stroke.opacity=s.color.a;
rn.stroke.endcap=this._translate(this._capMap,s.cap);
if(typeof s.join=="number"){
rn.stroke.joinstyle="miter";
rn.stroke.miterlimit=s.join;
}else{
rn.stroke.joinstyle=s.join;
}
rn.stroke.dashstyle=s.style=="none"?"Solid":s.style;
}
return this;
},_capMap:{butt:"flat"},_capMapReversed:{flat:"butt"},_translate:function(_16,_17){
return (_17 in _16)?_16[_17]:_17;
},_applyTransform:function(){
var _18=this._getRealMatrix();
if(_18){
var _19=this.rawNode.skew;
if(typeof _19=="undefined"){
for(var i=0;i<this.rawNode.childNodes.length;++i){
if(this.rawNode.childNodes[i].tagName=="skew"){
_19=this.rawNode.childNodes[i];
break;
}
}
}
if(_19){
_19.on="f";
var mt=_18.xx.toFixed(8)+" "+_18.xy.toFixed(8)+" "+_18.yx.toFixed(8)+" "+_18.yy.toFixed(8)+" 0 0",_1a=Math.floor(_18.dx).toFixed()+"px "+Math.floor(_18.dy).toFixed()+"px",s=this.rawNode.style,l=parseFloat(s.left),t=parseFloat(s.top),w=parseFloat(s.width),h=parseFloat(s.height);
if(isNaN(l)){
l=0;
}
if(isNaN(t)){
t=0;
}
if(isNaN(w)||!w){
w=1;
}
if(isNaN(h)||!h){
h=1;
}
var _1b=(-l/w-0.5).toFixed(8)+" "+(-t/h-0.5).toFixed(8);
_19.matrix=mt;
_19.origin=_1b;
_19.offset=_1a;
_19.on=true;
}
}
if(this.fillStyle&&this.fillStyle.type=="linear"){
this.setFill(this.fillStyle);
}
if(this.clip){
this.setClip(this.clip);
}
return this;
},_setDimensions:function(_1c,_1d){
return this;
},setRawNode:function(_1e){
_1e.stroked="f";
_1e.filled="f";
this.rawNode=_1e;
this.rawNode.__gfxObject__=this.getUID();
},_moveToFront:function(){
this.rawNode.parentNode.appendChild(this.rawNode);
return this;
},_moveToBack:function(){
var r=this.rawNode,p=r.parentNode,n=p.firstChild;
p.insertBefore(r,n);
if(n.tagName=="rect"){
n.swapNode(r);
}
return this;
},_getRealMatrix:function(){
return this.parentMatrix?new m.Matrix2D([this.parentMatrix,this.matrix]):this.matrix;
},setClip:function(_1f){
this.inherited(arguments);
var _20=this.rawNode.style;
if(!_1f){
_20.position="absolute";
_20.clip="rect(0px "+_20.width+" "+_20.height+" 0px)";
}else{
if("width" in _1f){
var _21=this._getRealMatrix(),l=parseFloat(_20.left),t=parseFloat(_20.top);
if(isNaN(l)){
l=0;
}
if(isNaN(t)){
t=0;
}
var _22=m.multiplyRectangle(_21,_1f);
var pt=m.multiplyPoint(_21,{x:l,y:t});
_20.clip="rect("+Math.round(_22.y-pt.y)+"px "+Math.round(_22.x-pt.x+_22.width)+"px "+Math.round(_22.y-pt.y+_22.height)+"px "+Math.round(_22.x-pt.x)+"px)";
}
}
return this;
}});
_d.Group=_2("dojox.gfx.vml.Group",_d.Shape,{constructor:function(){
gs.Container._init.call(this);
},_applyTransform:function(){
var _23=this._getRealMatrix();
for(var i=0;i<this.children.length;++i){
this.children[i]._updateParentMatrix(_23);
}
if(this.clip){
this.setClip(this.clip);
}
return this;
},_setDimensions:function(_24,_25){
var r=this.rawNode,rs=r.style,bs=this.bgNode.style;
rs.width=_24;
rs.height=_25;
r.coordsize=_24+" "+_25;
bs.width=_24;
bs.height=_25;
for(var i=0;i<this.children.length;++i){
this.children[i]._setDimensions(_24,_25);
}
return this;
},setClip:function(_26){
this.clip=_26;
var _27=this.rawNode.style;
if(!_26){
_27.position="absolute";
_27.clip="rect(0px "+_27.width+" "+_27.height+" 0px)";
}else{
if("width" in _26){
var _28=this._getRealMatrix();
var _29=m.multiplyRectangle(_28,_26);
var _2a=this.getBoundingBox();
_2a=_2a?m.multiplyRectangle(_28,_2a):null;
var _2b=_2a&&_2a.x<0?_2a.x:0,_2c=_2a&&_2a.y<0?_2a.y:0;
_27.position="absolute";
_27.clip="rect("+Math.round(_29.y-_2c)+"px "+Math.round(_29.x+_29.width-_2b)+"px "+Math.round(_29.y+_29.height-_2c)+"px "+Math.round(_29.x-_2b)+"px)";
}
}
return this;
},destroy:function(){
this.clear(true);
_d.Shape.prototype.destroy.apply(this,arguments);
}});
_d.Group.nodeType="group";
_d.Rect=_2("dojox.gfx.vml.Rect",[_d.Shape,gs.Rect],{setShape:function(_2d){
var _2e=this.shape=g.makeParameters(this.shape,_2d);
this.bbox=null;
var r=Math.min(1,(_2e.r/Math.min(parseFloat(_2e.width),parseFloat(_2e.height)))).toFixed(8);
var _2f=this.rawNode.parentNode,_30=null;
if(_2f){
if(_2f.lastChild!==this.rawNode){
for(var i=0;i<_2f.childNodes.length;++i){
if(_2f.childNodes[i]===this.rawNode){
_30=_2f.childNodes[i+1];
break;
}
}
}
_2f.removeChild(this.rawNode);
}
if(_5("ie")>7){
var _31=this.rawNode.ownerDocument.createElement("v:roundrect");
_31.arcsize=r;
_31.style.display="inline-block";
this.rawNode=_31;
this.rawNode.__gfxObject__=this.getUID();
}else{
this.rawNode.arcsize=r;
}
if(_2f){
if(_30){
_2f.insertBefore(this.rawNode,_30);
}else{
_2f.appendChild(this.rawNode);
}
}
var _32=this.rawNode.style;
_32.left=_2e.x.toFixed();
_32.top=_2e.y.toFixed();
_32.width=(typeof _2e.width=="string"&&_2e.width.indexOf("%")>=0)?_2e.width:Math.max(_2e.width.toFixed(),0);
_32.height=(typeof _2e.height=="string"&&_2e.height.indexOf("%")>=0)?_2e.height:Math.max(_2e.height.toFixed(),0);
return this.setTransform(this.matrix).setFill(this.fillStyle).setStroke(this.strokeStyle);
}});
_d.Rect.nodeType="roundrect";
_d.Ellipse=_2("dojox.gfx.vml.Ellipse",[_d.Shape,gs.Ellipse],{setShape:function(_33){
var _34=this.shape=g.makeParameters(this.shape,_33);
this.bbox=null;
var _35=this.rawNode.style;
_35.left=(_34.cx-_34.rx).toFixed();
_35.top=(_34.cy-_34.ry).toFixed();
_35.width=(_34.rx*2).toFixed();
_35.height=(_34.ry*2).toFixed();
return this.setTransform(this.matrix);
}});
_d.Ellipse.nodeType="oval";
_d.Circle=_2("dojox.gfx.vml.Circle",[_d.Shape,gs.Circle],{setShape:function(_36){
var _37=this.shape=g.makeParameters(this.shape,_36);
this.bbox=null;
var _38=this.rawNode.style;
_38.left=(_37.cx-_37.r).toFixed();
_38.top=(_37.cy-_37.r).toFixed();
_38.width=(_37.r*2).toFixed();
_38.height=(_37.r*2).toFixed();
return this;
}});
_d.Circle.nodeType="oval";
_d.Line=_2("dojox.gfx.vml.Line",[_d.Shape,gs.Line],{constructor:function(_39){
if(_39){
_39.setAttribute("dojoGfxType","line");
}
},setShape:function(_3a){
var _3b=this.shape=g.makeParameters(this.shape,_3a);
this.bbox=null;
this.rawNode.path.v="m"+_3b.x1.toFixed()+" "+_3b.y1.toFixed()+"l"+_3b.x2.toFixed()+" "+_3b.y2.toFixed()+"e";
return this.setTransform(this.matrix);
}});
_d.Line.nodeType="shape";
_d.Polyline=_2("dojox.gfx.vml.Polyline",[_d.Shape,gs.Polyline],{constructor:function(_3c){
if(_3c){
_3c.setAttribute("dojoGfxType","polyline");
}
},setShape:function(_3d,_3e){
if(_3d&&_3d instanceof Array){
this.shape=g.makeParameters(this.shape,{points:_3d});
if(_3e&&this.shape.points.length){
this.shape.points.push(this.shape.points[0]);
}
}else{
this.shape=g.makeParameters(this.shape,_3d);
}
this.bbox=null;
this._normalizePoints();
var _3f=[],p=this.shape.points;
if(p.length>0){
_3f.push("m");
_3f.push(p[0].x.toFixed(),p[0].y.toFixed());
if(p.length>1){
_3f.push("l");
for(var i=1;i<p.length;++i){
_3f.push(p[i].x.toFixed(),p[i].y.toFixed());
}
}
}
_3f.push("e");
this.rawNode.path.v=_3f.join(" ");
return this.setTransform(this.matrix);
}});
_d.Polyline.nodeType="shape";
_d.Image=_2("dojox.gfx.vml.Image",[_d.Shape,gs.Image],{setShape:function(_40){
var _41=this.shape=g.makeParameters(this.shape,_40);
this.bbox=null;
this.rawNode.firstChild.src=_41.src;
return this.setTransform(this.matrix);
},_applyTransform:function(){
var _42=this._getRealMatrix(),_43=this.rawNode,s=_43.style,_44=this.shape;
if(_42){
_42=m.multiply(_42,{dx:_44.x,dy:_44.y});
}else{
_42=m.normalize({dx:_44.x,dy:_44.y});
}
if(_42.xy==0&&_42.yx==0&&_42.xx>0&&_42.yy>0){
s.filter="";
s.width=Math.floor(_42.xx*_44.width);
s.height=Math.floor(_42.yy*_44.height);
s.left=Math.floor(_42.dx);
s.top=Math.floor(_42.dy);
}else{
var ps=_43.parentNode.style;
s.left="0px";
s.top="0px";
s.width=ps.width;
s.height=ps.height;
_42=m.multiply(_42,{xx:_44.width/parseInt(s.width),yy:_44.height/parseInt(s.height)});
var f=_43.filters["DXImageTransform.Microsoft.Matrix"];
if(f){
f.M11=_42.xx;
f.M12=_42.xy;
f.M21=_42.yx;
f.M22=_42.yy;
f.Dx=_42.dx;
f.Dy=_42.dy;
}else{
s.filter="progid:DXImageTransform.Microsoft.Matrix(M11="+_42.xx+", M12="+_42.xy+", M21="+_42.yx+", M22="+_42.yy+", Dx="+_42.dx+", Dy="+_42.dy+")";
}
}
return this;
},_setDimensions:function(_45,_46){
var r=this.rawNode,f=r.filters["DXImageTransform.Microsoft.Matrix"];
if(f){
var s=r.style;
s.width=_45;
s.height=_46;
return this._applyTransform();
}
return this;
}});
_d.Image.nodeType="rect";
_d.Text=_2("dojox.gfx.vml.Text",[_d.Shape,gs.Text],{constructor:function(_47){
if(_47){
_47.setAttribute("dojoGfxType","text");
}
this.fontStyle=null;
},_alignment:{start:"left",middle:"center",end:"right"},setShape:function(_48){
this.shape=g.makeParameters(this.shape,_48);
this.bbox=null;
var r=this.rawNode,s=this.shape,x=s.x,y=s.y.toFixed(),_49;
switch(s.align){
case "middle":
x-=5;
break;
case "end":
x-=10;
break;
}
_49="m"+x.toFixed()+","+y+"l"+(x+10).toFixed()+","+y+"e";
var p=null,t=null,c=r.childNodes;
for(var i=0;i<c.length;++i){
var tag=c[i].tagName;
if(tag=="path"){
p=c[i];
if(t){
break;
}
}else{
if(tag=="textpath"){
t=c[i];
if(p){
break;
}
}
}
}
if(!p){
p=r.ownerDocument.createElement("v:path");
r.appendChild(p);
}
if(!t){
t=r.ownerDocument.createElement("v:textpath");
r.appendChild(t);
}
p.v=_49;
p.textPathOk=true;
t.on=true;
var a=_d.text_alignment[s.align];
t.style["v-text-align"]=a?a:"left";
t.style["text-decoration"]=s.decoration;
t.style["v-rotate-letters"]=s.rotated;
t.style["v-text-kern"]=s.kerning;
t.string=s.text;
return this.setTransform(this.matrix);
},_setFont:function(){
var f=this.fontStyle,c=this.rawNode.childNodes;
for(var i=0;i<c.length;++i){
if(c[i].tagName=="textpath"){
c[i].style.font=g.makeFontString(f);
break;
}
}
this.setTransform(this.matrix);
},_getRealMatrix:function(){
var _4a=this.inherited(arguments);
if(_4a){
_4a=m.multiply(_4a,{dy:-g.normalizedLength(this.fontStyle?this.fontStyle.size:"10pt")*0.35});
}
return _4a;
},getTextWidth:function(){
var _4b=this.rawNode,_4c=_4b.style.display;
_4b.style.display="inline";
var _4d=g.pt2px(parseFloat(_4b.currentStyle.width));
_4b.style.display=_4c;
return _4d;
}});
_d.Text.nodeType="shape";
_d.Path=_2("dojox.gfx.vml.Path",[_d.Shape,_a.Path],{constructor:function(_4e){
if(_4e&&!_4e.getAttribute("dojoGfxType")){
_4e.setAttribute("dojoGfxType","path");
}
this.vmlPath="";
this.lastControl={};
},_updateWithSegment:function(_4f){
var _50=_1.clone(this.last);
this.inherited(arguments);
if(arguments.length>1){
return;
}
var _51=this[this.renderers[_4f.action]](_4f,_50);
if(typeof this.vmlPath=="string"){
this.vmlPath+=_51.join("");
this.rawNode.path.v=this.vmlPath+" r0,0 e";
}else{
Array.prototype.push.apply(this.vmlPath,_51);
}
},setShape:function(_52){
this.vmlPath=[];
this.lastControl.type="";
this.inherited(arguments);
this.vmlPath=this.vmlPath.join("");
this.rawNode.path.v=this.vmlPath+" r0,0 e";
return this;
},_pathVmlToSvgMap:{m:"M",l:"L",t:"m",r:"l",c:"C",v:"c",qb:"Q",x:"z",e:""},renderers:{M:"_moveToA",m:"_moveToR",L:"_lineToA",l:"_lineToR",H:"_hLineToA",h:"_hLineToR",V:"_vLineToA",v:"_vLineToR",C:"_curveToA",c:"_curveToR",S:"_smoothCurveToA",s:"_smoothCurveToR",Q:"_qCurveToA",q:"_qCurveToR",T:"_qSmoothCurveToA",t:"_qSmoothCurveToR",A:"_arcTo",a:"_arcTo",Z:"_closePath",z:"_closePath"},_addArgs:function(_53,_54,_55,_56){
var n=_54 instanceof Array?_54:_54.args;
for(var i=_55;i<_56;++i){
_53.push(" ",n[i].toFixed());
}
},_adjustRelCrd:function(_57,_58,_59){
var n=_58 instanceof Array?_58:_58.args,l=n.length,_5a=new Array(l),i=0,x=_57.x,y=_57.y;
if(typeof x!="number"){
_5a[0]=x=n[0];
_5a[1]=y=n[1];
i=2;
}
if(typeof _59=="number"&&_59!=2){
var j=_59;
while(j<=l){
for(;i<j;i+=2){
_5a[i]=x+n[i];
_5a[i+1]=y+n[i+1];
}
x=_5a[j-2];
y=_5a[j-1];
j+=_59;
}
}else{
for(;i<l;i+=2){
_5a[i]=(x+=n[i]);
_5a[i+1]=(y+=n[i+1]);
}
}
return _5a;
},_adjustRelPos:function(_5b,_5c){
var n=_5c instanceof Array?_5c:_5c.args,l=n.length,_5d=new Array(l);
for(var i=0;i<l;++i){
_5d[i]=(_5b+=n[i]);
}
return _5d;
},_moveToA:function(_5e){
var p=[" m"],n=_5e instanceof Array?_5e:_5e.args,l=n.length;
this._addArgs(p,n,0,2);
if(l>2){
p.push(" l");
this._addArgs(p,n,2,l);
}
this.lastControl.type="";
return p;
},_moveToR:function(_5f,_60){
return this._moveToA(this._adjustRelCrd(_60,_5f));
},_lineToA:function(_61){
var p=[" l"],n=_61 instanceof Array?_61:_61.args;
this._addArgs(p,n,0,n.length);
this.lastControl.type="";
return p;
},_lineToR:function(_62,_63){
return this._lineToA(this._adjustRelCrd(_63,_62));
},_hLineToA:function(_64,_65){
var p=[" l"],y=" "+_65.y.toFixed(),n=_64 instanceof Array?_64:_64.args,l=n.length;
for(var i=0;i<l;++i){
p.push(" ",n[i].toFixed(),y);
}
this.lastControl.type="";
return p;
},_hLineToR:function(_66,_67){
return this._hLineToA(this._adjustRelPos(_67.x,_66),_67);
},_vLineToA:function(_68,_69){
var p=[" l"],x=" "+_69.x.toFixed(),n=_68 instanceof Array?_68:_68.args,l=n.length;
for(var i=0;i<l;++i){
p.push(x," ",n[i].toFixed());
}
this.lastControl.type="";
return p;
},_vLineToR:function(_6a,_6b){
return this._vLineToA(this._adjustRelPos(_6b.y,_6a),_6b);
},_curveToA:function(_6c){
var p=[],n=_6c instanceof Array?_6c:_6c.args,l=n.length,lc=this.lastControl;
for(var i=0;i<l;i+=6){
p.push(" c");
this._addArgs(p,n,i,i+6);
}
lc.x=n[l-4];
lc.y=n[l-3];
lc.type="C";
return p;
},_curveToR:function(_6d,_6e){
return this._curveToA(this._adjustRelCrd(_6e,_6d,6));
},_smoothCurveToA:function(_6f,_70){
var p=[],n=_6f instanceof Array?_6f:_6f.args,l=n.length,lc=this.lastControl,i=0;
if(lc.type!="C"){
p.push(" c");
this._addArgs(p,[_70.x,_70.y],0,2);
this._addArgs(p,n,0,4);
lc.x=n[0];
lc.y=n[1];
lc.type="C";
i=4;
}
for(;i<l;i+=4){
p.push(" c");
this._addArgs(p,[2*_70.x-lc.x,2*_70.y-lc.y],0,2);
this._addArgs(p,n,i,i+4);
lc.x=n[i];
lc.y=n[i+1];
}
return p;
},_smoothCurveToR:function(_71,_72){
return this._smoothCurveToA(this._adjustRelCrd(_72,_71,4),_72);
},_qCurveToA:function(_73){
var p=[],n=_73 instanceof Array?_73:_73.args,l=n.length,lc=this.lastControl;
for(var i=0;i<l;i+=4){
p.push(" qb");
this._addArgs(p,n,i,i+4);
}
lc.x=n[l-4];
lc.y=n[l-3];
lc.type="Q";
return p;
},_qCurveToR:function(_74,_75){
return this._qCurveToA(this._adjustRelCrd(_75,_74,4));
},_qSmoothCurveToA:function(_76,_77){
var p=[],n=_76 instanceof Array?_76:_76.args,l=n.length,lc=this.lastControl,i=0;
if(lc.type!="Q"){
p.push(" qb");
this._addArgs(p,[lc.x=_77.x,lc.y=_77.y],0,2);
lc.type="Q";
this._addArgs(p,n,0,2);
i=2;
}
for(;i<l;i+=2){
p.push(" qb");
this._addArgs(p,[lc.x=2*_77.x-lc.x,lc.y=2*_77.y-lc.y],0,2);
this._addArgs(p,n,i,i+2);
}
return p;
},_qSmoothCurveToR:function(_78,_79){
return this._qSmoothCurveToA(this._adjustRelCrd(_79,_78,2),_79);
},_arcTo:function(_7a,_7b){
var p=[],n=_7a.args,l=n.length,_7c=_7a.action=="a";
for(var i=0;i<l;i+=7){
var x1=n[i+5],y1=n[i+6];
if(_7c){
x1+=_7b.x;
y1+=_7b.y;
}
var _7d=_b.arcAsBezier(_7b,n[i],n[i+1],n[i+2],n[i+3]?1:0,n[i+4]?1:0,x1,y1);
for(var j=0;j<_7d.length;++j){
p.push(" c");
var t=_7d[j];
this._addArgs(p,t,0,t.length);
this._updateBBox(t[0],t[1]);
this._updateBBox(t[2],t[3]);
this._updateBBox(t[4],t[5]);
}
_7b.x=x1;
_7b.y=y1;
}
this.lastControl.type="";
return p;
},_closePath:function(){
this.lastControl.type="";
return ["x"];
}});
_d.Path.nodeType="shape";
_d.TextPath=_2("dojox.gfx.vml.TextPath",[_d.Path,_a.TextPath],{constructor:function(_7e){
if(_7e){
_7e.setAttribute("dojoGfxType","textpath");
}
this.fontStyle=null;
if(!("text" in this)){
this.text=_1.clone(g.defaultTextPath);
}
if(!("fontStyle" in this)){
this.fontStyle=_1.clone(g.defaultFont);
}
},setText:function(_7f){
this.text=g.makeParameters(this.text,typeof _7f=="string"?{text:_7f}:_7f);
this._setText();
return this;
},setFont:function(_80){
this.fontStyle=typeof _80=="string"?g.splitFontString(_80):g.makeParameters(g.defaultFont,_80);
this._setFont();
return this;
},_setText:function(){
this.bbox=null;
var r=this.rawNode,s=this.text,p=null,t=null,c=r.childNodes;
for(var i=0;i<c.length;++i){
var tag=c[i].tagName;
if(tag=="path"){
p=c[i];
if(t){
break;
}
}else{
if(tag=="textpath"){
t=c[i];
if(p){
break;
}
}
}
}
if(!p){
p=this.rawNode.ownerDocument.createElement("v:path");
r.appendChild(p);
}
if(!t){
t=this.rawNode.ownerDocument.createElement("v:textpath");
r.appendChild(t);
}
p.textPathOk=true;
t.on=true;
var a=_d.text_alignment[s.align];
t.style["v-text-align"]=a?a:"left";
t.style["text-decoration"]=s.decoration;
t.style["v-rotate-letters"]=s.rotated;
t.style["v-text-kern"]=s.kerning;
t.string=s.text;
},_setFont:function(){
var f=this.fontStyle,c=this.rawNode.childNodes;
for(var i=0;i<c.length;++i){
if(c[i].tagName=="textpath"){
c[i].style.font=g.makeFontString(f);
break;
}
}
}});
_d.TextPath.nodeType="shape";
_d.Surface=_2("dojox.gfx.vml.Surface",gs.Surface,{constructor:function(){
gs.Container._init.call(this);
},setDimensions:function(_81,_82){
this.width=g.normalizedLength(_81);
this.height=g.normalizedLength(_82);
if(!this.rawNode){
return this;
}
var cs=this.clipNode.style,r=this.rawNode,rs=r.style,bs=this.bgNode.style,ps=this._parent.style,i;
ps.width=_81;
ps.height=_82;
cs.width=_81;
cs.height=_82;
cs.clip="rect(0px "+_81+"px "+_82+"px 0px)";
rs.width=_81;
rs.height=_82;
r.coordsize=_81+" "+_82;
bs.width=_81;
bs.height=_82;
for(i=0;i<this.children.length;++i){
this.children[i]._setDimensions(_81,_82);
}
return this;
},getDimensions:function(){
var t=this.rawNode?{width:g.normalizedLength(this.rawNode.style.width),height:g.normalizedLength(this.rawNode.style.height)}:null;
if(t.width<=0){
t.width=this.width;
}
if(t.height<=0){
t.height=this.height;
}
return t;
}});
_d.createSurface=function(_83,_84,_85){
if(!_84&&!_85){
var pos=_8.position(_83);
_84=_84||pos.w;
_85=_85||pos.h;
}
if(typeof _84=="number"){
_84=_84+"px";
}
if(typeof _85=="number"){
_85=_85+"px";
}
var s=new _d.Surface(),p=_7.byId(_83),c=s.clipNode=p.ownerDocument.createElement("div"),r=s.rawNode=p.ownerDocument.createElement("v:group"),cs=c.style,rs=r.style;
if(_5("ie")>7){
rs.display="inline-block";
}
s._parent=p;
s._nodes.push(c);
p.style.width=_84;
p.style.height=_85;
cs.position="absolute";
cs.width=_84;
cs.height=_85;
cs.clip="rect(0px "+_84+" "+_85+" 0px)";
rs.position="absolute";
rs.width=_84;
rs.height=_85;
r.coordsize=(_84==="100%"?_84:parseFloat(_84))+" "+(_85==="100%"?_85:parseFloat(_85));
r.coordorigin="0 0";
var b=s.bgNode=r.ownerDocument.createElement("v:rect"),bs=b.style;
bs.left=bs.top=0;
bs.width=rs.width;
bs.height=rs.height;
b.filled=b.stroked="f";
r.appendChild(b);
c.appendChild(r);
p.appendChild(c);
s.width=g.normalizedLength(_84);
s.height=g.normalizedLength(_85);
return s;
};
function _86(_87,f,o){
o=o||_9.global;
f.call(o,_87);
if(_87 instanceof g.Surface||_87 instanceof g.Group){
_3.forEach(_87.children,function(_88){
_86(_88,f,o);
});
}
};
var _89=function(_8a){
if(this!=_8a.getParent()){
var _8b=_8a.getParent();
if(_8b){
_8b.remove(_8a);
}
this.rawNode.appendChild(_8a.rawNode);
C.add.apply(this,arguments);
_86(this,function(s){
if(typeof (s.getFont)=="function"){
s.setShape(s.getShape());
s.setFont(s.getFont());
}
if(typeof (s.setFill)=="function"){
s.setFill(s.getFill());
s.setStroke(s.getStroke());
}
});
}
return this;
};
var _8c=function(_8d){
if(this!=_8d.getParent()){
this.rawNode.appendChild(_8d.rawNode);
if(!_8d.getParent()){
_8d.setFill(_8d.getFill());
_8d.setStroke(_8d.getStroke());
}
C.add.apply(this,arguments);
}
return this;
};
var C=gs.Container,_8e={add:_6.fixVmlAdd===true?_89:_8c,remove:function(_8f,_90){
if(this==_8f.getParent()){
if(this.rawNode==_8f.rawNode.parentNode){
this.rawNode.removeChild(_8f.rawNode);
}
C.remove.apply(this,arguments);
}
return this;
},clear:function(){
var r=this.rawNode;
while(r.firstChild!=r.lastChild){
if(r.firstChild!=this.bgNode){
r.removeChild(r.firstChild);
}
if(r.lastChild!=this.bgNode){
r.removeChild(r.lastChild);
}
}
return C.clear.apply(this,arguments);
},getBoundingBox:C.getBoundingBox,_moveChildToFront:C._moveChildToFront,_moveChildToBack:C._moveChildToBack};
var _91={createGroup:function(){
var _92=this.createObject(_d.Group,null);
var r=_92.rawNode.ownerDocument.createElement("v:rect");
r.style.left=r.style.top=0;
r.style.width=_92.rawNode.style.width;
r.style.height=_92.rawNode.style.height;
r.filled=r.stroked="f";
_92.rawNode.appendChild(r);
_92.bgNode=r;
return _92;
},createImage:function(_93){
if(!this.rawNode){
return null;
}
var _94=new _d.Image(),doc=this.rawNode.ownerDocument,_95=doc.createElement("v:rect");
_95.stroked="f";
_95.style.width=this.rawNode.style.width;
_95.style.height=this.rawNode.style.height;
var img=doc.createElement("v:imagedata");
_95.appendChild(img);
_94.setRawNode(_95);
this.rawNode.appendChild(_95);
_94.setShape(_93);
this.add(_94);
return _94;
},createRect:function(_96){
if(!this.rawNode){
return null;
}
var _97=new _d.Rect,_98=this.rawNode.ownerDocument.createElement("v:roundrect");
if(_5("ie")>7){
_98.style.display="inline-block";
}
_97.setRawNode(_98);
this.rawNode.appendChild(_98);
_97.setShape(_96);
this.add(_97);
return _97;
},createObject:function(_99,_9a){
if(!this.rawNode){
return null;
}
var _9b=new _99(),_9c=this.rawNode.ownerDocument.createElement("v:"+_99.nodeType);
_9b.setRawNode(_9c);
this.rawNode.appendChild(_9c);
switch(_99){
case _d.Group:
case _d.Line:
case _d.Polyline:
case _d.Image:
case _d.Text:
case _d.Path:
case _d.TextPath:
this._overrideSize(_9c);
}
_9b.setShape(_9a);
this.add(_9b);
return _9b;
},_overrideSize:function(_9d){
var s=this.rawNode.style,w=s.width,h=s.height;
_9d.style.width=w;
_9d.style.height=h;
_9d.coordsize=parseInt(w)+" "+parseInt(h);
}};
_1.extend(_d.Group,_8e);
_1.extend(_d.Group,gs.Creator);
_1.extend(_d.Group,_91);
_1.extend(_d.Surface,_8e);
_1.extend(_d.Surface,gs.Creator);
_1.extend(_d.Surface,_91);
_d.fixTarget=function(_9e,_9f){
if(!_9e.gfxTarget){
_9e.gfxTarget=gs.byId(_9e.target.__gfxObject__);
}
return true;
};
return _d;
});
