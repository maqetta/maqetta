/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/path",["./matrix","./shape"],function(_1,_2){
dojo.declare("dojox.gfx.path.Path",dojox.gfx.shape.Shape,{constructor:function(_3){
this.shape=dojo.clone(dojox.gfx.defaultPath);
this.segments=[];
this.tbbox=null;
this.absolute=true;
this.last={};
this.rawNode=_3;
this.segmented=false;
},setAbsoluteMode:function(_4){
this._confirmSegmented();
this.absolute=typeof _4=="string"?(_4=="absolute"):_4;
return this;
},getAbsoluteMode:function(){
this._confirmSegmented();
return this.absolute;
},getBoundingBox:function(){
this._confirmSegmented();
return (this.bbox&&("l" in this.bbox))?{x:this.bbox.l,y:this.bbox.t,width:this.bbox.r-this.bbox.l,height:this.bbox.b-this.bbox.t}:null;
},_getRealBBox:function(){
this._confirmSegmented();
if(this.tbbox){
return this.tbbox;
}
var _5=this.bbox,_1=this._getRealMatrix();
this.bbox=null;
for(var i=0,_6=this.segments.length;i<_6;++i){
this._updateWithSegment(this.segments[i],_1);
}
var t=this.bbox;
this.bbox=_5;
this.tbbox=t?[{x:t.l,y:t.t},{x:t.r,y:t.t},{x:t.r,y:t.b},{x:t.l,y:t.b}]:null;
return this.tbbox;
},getLastPosition:function(){
this._confirmSegmented();
return "x" in this.last?this.last:null;
},_applyTransform:function(){
this.tbbox=null;
return this.inherited(arguments);
},_updateBBox:function(x,y,_7){
if(_7){
var t=dojox.gfx.matrix.multiplyPoint(_7,x,y);
x=t.x;
y=t.y;
}
if(this.bbox&&("l" in this.bbox)){
if(this.bbox.l>x){
this.bbox.l=x;
}
if(this.bbox.r<x){
this.bbox.r=x;
}
if(this.bbox.t>y){
this.bbox.t=y;
}
if(this.bbox.b<y){
this.bbox.b=y;
}
}else{
this.bbox={l:x,b:y,r:x,t:y};
}
},_updateWithSegment:function(_8,_9){
var n=_8.args,l=n.length,i;
switch(_8.action){
case "M":
case "L":
case "C":
case "S":
case "Q":
case "T":
for(i=0;i<l;i+=2){
this._updateBBox(n[i],n[i+1],_9);
}
this.last.x=n[l-2];
this.last.y=n[l-1];
this.absolute=true;
break;
case "H":
for(i=0;i<l;++i){
this._updateBBox(n[i],this.last.y,_9);
}
this.last.x=n[l-1];
this.absolute=true;
break;
case "V":
for(i=0;i<l;++i){
this._updateBBox(this.last.x,n[i],_9);
}
this.last.y=n[l-1];
this.absolute=true;
break;
case "m":
var _a=0;
if(!("x" in this.last)){
this._updateBBox(this.last.x=n[0],this.last.y=n[1],_9);
_a=2;
}
for(i=_a;i<l;i+=2){
this._updateBBox(this.last.x+=n[i],this.last.y+=n[i+1],_9);
}
this.absolute=false;
break;
case "l":
case "t":
for(i=0;i<l;i+=2){
this._updateBBox(this.last.x+=n[i],this.last.y+=n[i+1],_9);
}
this.absolute=false;
break;
case "h":
for(i=0;i<l;++i){
this._updateBBox(this.last.x+=n[i],this.last.y,_9);
}
this.absolute=false;
break;
case "v":
for(i=0;i<l;++i){
this._updateBBox(this.last.x,this.last.y+=n[i],_9);
}
this.absolute=false;
break;
case "c":
for(i=0;i<l;i+=6){
this._updateBBox(this.last.x+n[i],this.last.y+n[i+1],_9);
this._updateBBox(this.last.x+n[i+2],this.last.y+n[i+3],_9);
this._updateBBox(this.last.x+=n[i+4],this.last.y+=n[i+5],_9);
}
this.absolute=false;
break;
case "s":
case "q":
for(i=0;i<l;i+=4){
this._updateBBox(this.last.x+n[i],this.last.y+n[i+1],_9);
this._updateBBox(this.last.x+=n[i+2],this.last.y+=n[i+3],_9);
}
this.absolute=false;
break;
case "A":
for(i=0;i<l;i+=7){
this._updateBBox(n[i+5],n[i+6],_9);
}
this.last.x=n[l-2];
this.last.y=n[l-1];
this.absolute=true;
break;
case "a":
for(i=0;i<l;i+=7){
this._updateBBox(this.last.x+=n[i+5],this.last.y+=n[i+6],_9);
}
this.absolute=false;
break;
}
var _b=[_8.action];
for(i=0;i<l;++i){
_b.push(dojox.gfx.formatNumber(n[i],true));
}
if(typeof this.shape.path=="string"){
this.shape.path+=_b.join("");
}else{
Array.prototype.push.apply(this.shape.path,_b);
}
},_validSegments:{m:2,l:2,h:1,v:1,c:6,s:4,q:4,t:2,a:7,z:0},_pushSegment:function(_c,_d){
this.tbbox=null;
var _e=this._validSegments[_c.toLowerCase()],_f;
if(typeof _e=="number"){
if(_e){
if(_d.length>=_e){
_f={action:_c,args:_d.slice(0,_d.length-_d.length%_e)};
this.segments.push(_f);
this._updateWithSegment(_f);
}
}else{
_f={action:_c,args:[]};
this.segments.push(_f);
this._updateWithSegment(_f);
}
}
},_collectArgs:function(_10,_11){
for(var i=0;i<_11.length;++i){
var t=_11[i];
if(typeof t=="boolean"){
_10.push(t?1:0);
}else{
if(typeof t=="number"){
_10.push(t);
}else{
if(t instanceof Array){
this._collectArgs(_10,t);
}else{
if("x" in t&&"y" in t){
_10.push(t.x,t.y);
}
}
}
}
}
},moveTo:function(){
this._confirmSegmented();
var _12=[];
this._collectArgs(_12,arguments);
this._pushSegment(this.absolute?"M":"m",_12);
return this;
},lineTo:function(){
this._confirmSegmented();
var _13=[];
this._collectArgs(_13,arguments);
this._pushSegment(this.absolute?"L":"l",_13);
return this;
},hLineTo:function(){
this._confirmSegmented();
var _14=[];
this._collectArgs(_14,arguments);
this._pushSegment(this.absolute?"H":"h",_14);
return this;
},vLineTo:function(){
this._confirmSegmented();
var _15=[];
this._collectArgs(_15,arguments);
this._pushSegment(this.absolute?"V":"v",_15);
return this;
},curveTo:function(){
this._confirmSegmented();
var _16=[];
this._collectArgs(_16,arguments);
this._pushSegment(this.absolute?"C":"c",_16);
return this;
},smoothCurveTo:function(){
this._confirmSegmented();
var _17=[];
this._collectArgs(_17,arguments);
this._pushSegment(this.absolute?"S":"s",_17);
return this;
},qCurveTo:function(){
this._confirmSegmented();
var _18=[];
this._collectArgs(_18,arguments);
this._pushSegment(this.absolute?"Q":"q",_18);
return this;
},qSmoothCurveTo:function(){
this._confirmSegmented();
var _19=[];
this._collectArgs(_19,arguments);
this._pushSegment(this.absolute?"T":"t",_19);
return this;
},arcTo:function(){
this._confirmSegmented();
var _1a=[];
this._collectArgs(_1a,arguments);
this._pushSegment(this.absolute?"A":"a",_1a);
return this;
},closePath:function(){
this._confirmSegmented();
this._pushSegment("Z",[]);
return this;
},_confirmSegmented:function(){
if(!this.segmented){
var _1b=this.shape.path;
this.shape.path=[];
this._setPath(_1b);
this.shape.path=this.shape.path.join("");
this.segmented=true;
}
},_setPath:function(_1c){
var p=dojo.isArray(_1c)?_1c:_1c.match(dojox.gfx.pathSvgRegExp);
this.segments=[];
this.absolute=true;
this.bbox={};
this.last={};
if(!p){
return;
}
var _1d="",_1e=[],l=p.length;
for(var i=0;i<l;++i){
var t=p[i],x=parseFloat(t);
if(isNaN(x)){
if(_1d){
this._pushSegment(_1d,_1e);
}
_1e=[];
_1d=t;
}else{
_1e.push(x);
}
}
this._pushSegment(_1d,_1e);
},setShape:function(_1f){
this.inherited(arguments,[typeof _1f=="string"?{path:_1f}:_1f]);
this.segmented=false;
this.segments=[];
if(!dojox.gfx.lazyPathSegmentation){
this._confirmSegmented();
}
return this;
},_2PI:Math.PI*2});
dojo.declare("dojox.gfx.path.TextPath",dojox.gfx.path.Path,{constructor:function(_20){
if(!("text" in this)){
this.text=dojo.clone(dojox.gfx.defaultTextPath);
}
if(!("fontStyle" in this)){
this.fontStyle=dojo.clone(dojox.gfx.defaultFont);
}
},getText:function(){
return this.text;
},setText:function(_21){
this.text=dojox.gfx.makeParameters(this.text,typeof _21=="string"?{text:_21}:_21);
this._setText();
return this;
},getFont:function(){
return this.fontStyle;
},setFont:function(_22){
this.fontStyle=typeof _22=="string"?dojox.gfx.splitFontString(_22):dojox.gfx.makeParameters(dojox.gfx.defaultFont,_22);
this._setFont();
return this;
}});
return {Path:dojox.gfx.path.Path,TextPath:dojox.gfx.path.TextPath};
});
