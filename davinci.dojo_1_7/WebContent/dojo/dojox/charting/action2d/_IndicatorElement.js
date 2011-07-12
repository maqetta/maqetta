/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/_IndicatorElement",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","../Element","../plot2d/common","../axis2d/common","dojox/gfx"],function(_1,_2,_3,_4,_5,_6,_7){
var _8=function(_9){
return _a(_9,_9.getShape().text);
};
var _a=function(s,t){
var c=s.declaredClass;
if(c.indexOf("svg")!=-1){
try{
return s.rawNode.getBBox();
}
catch(e){
return null;
}
}else{
if(c.indexOf("vml")!=-1){
var _b=s.rawNode,_c=_b.style.display;
_b.style.display="inline";
var w=_7.pt2px(parseFloat(_b.currentStyle.width));
var h=_7.pt2px(parseFloat(_b.currentStyle.height));
var sz={x:0,y:0,width:w,height:h};
_d(s,sz);
_b.style.display=_c;
return sz;
}else{
if(c.indexOf("silverlight")!=-1){
var bb={width:s.rawNode.actualWidth,height:s.rawNode.actualHeight};
return _d(s,bb,0.75);
}else{
if(s.getTextWidth){
var w=s.getTextWidth();
var _e=s.getFont();
var fz=_e?_e.size:_7.defaultFont.size;
var h=_7.normalizedLength(fz);
sz={width:w,height:h};
_d(s,sz,0.75);
return sz;
}
}
}
}
};
var _d=function(s,sz,_f){
var _10=sz.width,_11=sz.height,sh=s.getShape(),_12=sh.align;
switch(_12){
case "end":
sz.x=sh.x-_10;
break;
case "middle":
sz.x=sh.x-_10/2;
break;
case "start":
default:
sz.x=sh.x;
break;
}
_f=_f||1;
sz.y=sh.y-_11*_f;
return sz;
};
return _1.declare(_4,{constructor:function(_13,_14){
if(!_14){
_14={};
}
this.inter=_14.inter;
},_updateVisibility:function(cp,_15,_16){
var _17=_16=="x"?this.inter.plot._hAxis:this.inter.plot._vAxis;
var _18=_17.getWindowScale();
this.chart.setAxisWindow(_17.name,_18,_17.getWindowOffset()+(cp[_16]-_15[_16])/_18);
this._noDirty=true;
this.chart.render();
this._noDirty=false;
if(!this._tracker){
this.initTrack();
}
},_trackMove:function(){
this._updateIndicator(this.pageCoord);
if(this._initTrackPhase){
this._initTrackPhase=false;
this._tracker=setInterval(_1.hitch(this,this._trackMove),100);
}
},initTrack:function(){
this._initTrackPhase=true;
this._tracker=setTimeout(_1.hitch(this,this._trackMove),500);
},stopTrack:function(){
if(this._tracker){
if(this._initTrackPhase){
clearTimeout(this._tracker);
}else{
clearInterval(this._tracker);
}
this._tracker=null;
}
},render:function(){
if(!this.isDirty()){
return;
}
this.cleanGroup();
if(!this.pageCoord){
return;
}
this._updateIndicator(this.pageCoord,this.secondCoord);
},_updateIndicator:function(cp1,cp2){
var _19=this.inter,_1a=_19.plot,v=_19.opt.vertical;
var _1b=this.chart.getAxis(_1a.hAxis),_1c=this.chart.getAxis(_1a.vAxis);
var hn=_1b.name,vn=_1c.name,hb=_1b.getScaler().bounds,vb=_1c.getScaler().bounds;
var _1d=v?"x":"y",n=v?hn:vn,_1e=v?hb:vb;
if(cp2){
var tmp;
if(v){
if(cp1.x>cp2.x){
tmp=cp2;
cp2=cp1;
cp1=tmp;
}
}else{
if(cp1.y>cp2.y){
tmp=cp2;
cp2=cp1;
cp1=tmp;
}
}
}
var cd1=_1a.toData(cp1),cd2;
if(cp2){
cd2=_1a.toData(cp2);
}
var o={};
o[hn]=hb.from;
o[vn]=vb.from;
var min=_1a.toPage(o);
o[hn]=hb.to;
o[vn]=vb.to;
var max=_1a.toPage(o);
if(cd1[n]<_1e.from){
if(!cd2&&_19.opt.autoScroll){
this._updateVisibility(cp1,min,_1d);
return;
}else{
cp1[_1d]=min[_1d];
}
cd1=_1a.toData(cp1);
}else{
if(cd1[n]>_1e.to){
if(!cd2&&_19.opt.autoScroll){
this._updateVisibility(cp1,max,_1d);
return;
}else{
cp1[_1d]=max[_1d];
}
cd1=_1a.toData(cp1);
}
}
var c1=this._getData(cd1,_1d,v),c2;
if(cp2){
if(cd2[n]<_1e.from){
cp2[_1d]=min[_1d];
cd2=_1a.toData(cp2);
}else{
if(cd2[n]>_1e.to){
cp2[_1d]=max[_1d];
cd2=_1a.toData(cp2);
}
}
c2=this._getData(cd2,_1d,v);
}
var t1=this._renderIndicator(c1,cp2?1:0,hn,vn,min,max);
if(cp2){
var t2=this._renderIndicator(c2,2,hn,vn,min,max);
var _1f=v?c2.y-c1.y:c2.x-c1.y;
var _20=_19.opt.labelFunc?_19.opt.labelFunc(c1,c2,_19.opt.fixed,_19.opt.precision):(_5.getLabel(_1f,_19.opt.fixed,_19.opt.precision)+" ("+_5.getLabel(100*_1f/(v?c1.y:c1.x),true,2)+"%)");
this._renderText(_20,_19,this.chart.theme,v?(t1.x+t2.x)/2:t1.x,v?t1.y:(t1.y+t2.y)/2,c1,c2);
}
},_renderIndicator:function(_21,_22,hn,vn,min,max){
var t=this.chart.theme,c=this.chart.getCoords(),_23=this.inter,_24=_23.plot,v=_23.opt.vertical;
var _25={};
_25[hn]=_21.x;
_25[vn]=_21.y;
_25=_24.toPage(_25);
var cx=_25.x-c.x,cy=_25.y-c.y;
var x1=v?cx:min.x-c.x,y1=v?min.y-c.y:cy,x2=v?x1:max.x-c.x,y2=v?max.y-c.y:y1;
var sh=_23.opt.lineShadow?_23.opt.lineShadow:t.indicator.lineShadow,ls=_23.opt.lineStroke?_23.opt.lineStroke:t.indicator.lineStroke,ol=_23.opt.lineOutline?_23.opt.lineOutline:t.indicator.lineOutline;
if(sh){
this.group.createLine({x1:x1+sh.dx,y1:y1+sh.dy,x2:x2+sh.dx,y2:y2+sh.dy}).setStroke(sh);
}
if(ol){
ol=_5.makeStroke(ol);
ol.width=2*ol.width+ls.width;
this.group.createLine({x1:x1,y1:y1,x2:x2,y2:y2}).setStroke(ol);
}
this.group.createLine({x1:x1,y1:y1,x2:x2,y2:y2}).setStroke(ls);
var ms=_23.opt.markerSymbol?_23.opt.markerSymbol:t.indicator.markerSymbol,_26="M"+cx+" "+cy+" "+ms;
sh=_23.opt.markerShadow?_23.opt.markerShadow:t.indicator.markerShadow;
ls=_23.opt.markerStroke?_23.opt.markerStroke:t.indicator.markerStroke;
ol=_23.opt.markerOutline?_23.opt.markerOutline:t.indicator.markerOutline;
if(sh){
var sp="M"+(cx+sh.dx)+" "+(cy+sh.dy)+" "+ms;
this.group.createPath(sp).setFill(sh.color).setStroke(sh);
}
if(ol){
ol=_5.makeStroke(ol);
ol.width=2*ol.width+ls.width;
this.group.createPath(_26).setStroke(ol);
}
var _27=this.group.createPath(_26);
var sf=this._shapeFill(_23.opt.markerFill?_23.opt.markerFill:t.indicator.markerFill,_27.getBoundingBox());
_27.setFill(sf).setStroke(ls);
if(_22==0){
var _28=_23.opt.labelFunc?_23.opt.labelFunc(_21,null,_23.opt.fixed,_23.opt.precision):_5.getLabel(v?_21.y:_21.x,_23.opt.fixed,_23.opt.precision);
this._renderText(_28,_23,t,v?x1:x2+5,v?y2+5:y1,_21);
}else{
return v?{x:x1,y:y2+5}:{x:x2+5,y:y1};
}
},_renderText:function(_29,_2a,t,x,y,c1,c2){
var _2b=_6.createText.gfx(this.chart,this.group,x,y,"middle",_29,_2a.opt.font?_2a.opt.font:t.indicator.font,_2a.opt.fontColor?_2a.opt.fontColor:t.indicator.fontColor);
var b=_8(_2b);
b.x-=2;
b.y-=1;
b.width+=4;
b.height+=2;
b.r=_2a.opt.radius?_2a.opt.radius:t.indicator.radius;
sh=_2a.opt.shadow?_2a.opt.shadow:t.indicator.shadow;
ls=_2a.opt.stroke?_2a.opt.stroke:t.indicator.stroke;
ol=_2a.opt.outline?_2a.opt.outline:t.indicator.outline;
if(sh){
this.group.createRect(b).setFill(sh.color).setStroke(sh);
}
if(ol){
ol=_5.makeStroke(ol);
ol.width=2*ol.width+ls.width;
this.group.createRect(b).setStroke(ol);
}
var f=_2a.opt.fillFunc?_2a.opt.fillFunc(c1,c2):(_2a.opt.fill?_2a.opt.fill:t.indicator.fill);
this.group.createRect(b).setFill(this._shapeFill(f,b)).setStroke(ls);
_2b.moveToFront();
},_getData:function(cd,_2c,v){
var _2d=this.chart.getSeries(this.inter.opt.series).data;
var i,r,l=_2d.length;
for(i=0;i<l;++i){
r=_2d[i];
if(typeof r=="number"){
if(i+1>cd[_2c]){
break;
}
}else{
if(r[_2c]>cd[_2c]){
break;
}
}
}
var x,y,px,py;
if(typeof r=="number"){
x=i+1;
y=r;
if(i>0){
px=i;
py=_2d[i-1];
}
}else{
x=r.x;
y=r.y;
if(i>0){
px=_2d[i-1].x;
py=_2d[i-1].y;
}
}
if(i>0){
var m=v?(x+px)/2:(y+py)/2;
if(cd[_2c]<=m){
x=px;
y=py;
}
}
return {x:x,y:y};
},cleanGroup:function(_2e){
this.inherited(arguments);
this.group.moveToFront();
return this;
},clear:function(){
this.dirty=true;
return this;
},getSeriesStats:function(){
return _1.delegate(_5.defaultStats);
},initializeScalers:function(){
return this;
},isDirty:function(){
return !this._noDirty&&(this.dirty||this.inter.plot.isDirty());
}});
});
