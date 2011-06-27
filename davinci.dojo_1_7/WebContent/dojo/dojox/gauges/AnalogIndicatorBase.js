/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogIndicatorBase",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/fx","dojox/gfx","./_Indicator"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.gauges.AnalogIndicatorBase",[_7],{draw:function(_8,_9){
if(this.shape){
this._move(_9);
}else{
if(this.text){
this.text.parent.remove(this.text);
this.text=null;
}
var a=this._gauge._getAngle(Math.min(Math.max(this.value,this._gauge.min),this._gauge.max));
this.color=this.color||"#000000";
this.length=this.length||this._gauge.radius;
this.width=this.width||1;
this.offset=this.offset||0;
this.highlight=this.highlight||"#D0D0D0";
var _a=this._getShapes(_8,this._gauge,this);
if(_a){
if(_a.length>1){
this.shape=_8.createGroup();
for(var s=0;s<_a.length;s++){
this.shape.add(_a[s]);
}
}else{
this.shape=_a[0];
}
this.shape.setTransform([{dx:this._gauge.cx,dy:this._gauge.cy},_6.matrix.rotateg(a)]);
this.shape.connect("onmouseover",this,this.handleMouseOver);
this.shape.connect("onmouseout",this,this.handleMouseOut);
this.shape.connect("onmousedown",this,this.handleMouseDown);
this.shape.connect("touchstart",this,this.handleTouchStart);
}
if(this.label){
var _b=this.direction;
if(!_b){
_b="outside";
}
var _c;
if(_b=="inside"){
_c=-this.length+this.offset-5;
}else{
_c=this.length+this.offset+5;
}
var _d=this._gauge._getRadians(90-a);
this._layoutLabel(_8,this.label+"",this._gauge.cx,this._gauge.cy,_c,_d,_b);
}
this.currentValue=this.value;
}
},_layoutLabel:function(_e,_f,ox,oy,_10,_11,_12){
var _13=this.font?this.font:_6.defaultFont;
var box=_6._base._getTextBox(_f,{font:_6.makeFontString(_6.makeParameters(_6.defaultFont,_13))});
var tw=box.w;
var fz=_13.size;
var th=_6.normalizedLength(fz);
var tfx=ox+Math.cos(_11)*_10-tw/2;
var tfy=oy-Math.sin(_11)*_10-th/2;
var _14;
var _15=[];
_14=tfx;
var ipx=_14;
var ipy=-Math.tan(_11)*_14+oy+Math.tan(_11)*ox;
if(ipy>=tfy&&ipy<=tfy+th){
_15.push({x:ipx,y:ipy});
}
_14=tfx+tw;
ipx=_14;
ipy=-Math.tan(_11)*_14+oy+Math.tan(_11)*ox;
if(ipy>=tfy&&ipy<=tfy+th){
_15.push({x:ipx,y:ipy});
}
_14=tfy;
ipx=-1/Math.tan(_11)*_14+ox+1/Math.tan(_11)*oy;
ipy=_14;
if(ipx>=tfx&&ipx<=tfx+tw){
_15.push({x:ipx,y:ipy});
}
_14=tfy+th;
ipx=-1/Math.tan(_11)*_14+ox+1/Math.tan(_11)*oy;
ipy=_14;
if(ipx>=tfx&&ipx<=tfx+tw){
_15.push({x:ipx,y:ipy});
}
var dif;
if(_12=="inside"){
for(var it=0;it<_15.length;it++){
var ip=_15[it];
dif=this._distance(ip.x,ip.y,ox,oy)-_10;
if(dif>=0){
tfx=ox+Math.cos(_11)*(_10-dif)-tw/2;
tfy=oy-Math.sin(_11)*(_10-dif)-th/2;
break;
}
}
}else{
for(it=0;it<_15.length;it++){
ip=_15[it];
dif=this._distance(ip.x,ip.y,ox,oy)-_10;
if(dif<=0){
tfx=ox+Math.cos(_11)*(_10-dif)-tw/2;
tfy=oy-Math.sin(_11)*(_10-dif)-th/2;
break;
}
}
}
this.text=this._gauge.drawText(_e,_f,tfx+tw/2,tfy+th,"middle",this.color,this.font);
},_distance:function(x1,y1,x2,y2){
return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
},_move:function(_16){
var v=Math.min(Math.max(this.value,this._gauge.min),this._gauge.max),c=this.currentValue;
if(_16){
var _17=this._gauge._getAngle(v);
this.shape.setTransform([{dx:this._gauge.cx,dy:this._gauge.cy},_6.matrix.rotateg(_17)]);
this.currentValue=v;
}else{
if(c!=v){
var _18=new _1.Animation({curve:[c,v],duration:this.duration,easing:this.easing});
_1.connect(_18,"onAnimate",_1.hitch(this,function(_19){
this.shape.setTransform([{dx:this._gauge.cx,dy:this._gauge.cy},_6.matrix.rotateg(this._gauge._getAngle(_19))]);
this.currentValue=_19;
}));
_18.play();
}
}
}});
});
