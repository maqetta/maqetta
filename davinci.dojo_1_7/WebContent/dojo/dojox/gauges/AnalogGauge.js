/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/AnalogGauge",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/_base/html","dojo/_base/event","./_Gauge","dojox/gfx","./AnalogLineIndicator"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
_1.experimental("dojox.gauges.AnalogGauge");
return _1.declare("dojox.gauges.AnalogGauge",_7,{startAngle:-90,endAngle:90,cx:0,cy:0,radius:0,orientation:"clockwise",_defaultIndicator:_9,startup:function(){
if(this.getChildren){
_1.forEach(this.getChildren(),function(_a){
_a.startup();
});
}
this.startAngle=Number(this.startAngle);
this.endAngle=Number(this.endAngle);
this.cx=Number(this.cx);
if(!this.cx){
this.cx=this.width/2;
}
this.cy=Number(this.cy);
if(!this.cy){
this.cy=this.height/2;
}
this.radius=Number(this.radius);
if(!this.radius){
this.radius=Math.min(this.cx,this.cy)-25;
}
this.inherited(arguments);
},_getAngle:function(_b){
var v=Number(_b);
var _c;
if(_b==null||isNaN(v)||v<=this.min){
_c=this._mod360(this.startAngle);
}else{
if(v>=this.max){
_c=this._mod360(this.endAngle);
}else{
var _d=this._mod360(this.startAngle);
var _e=(v-this.min);
if(this.orientation!="clockwise"){
_e=-_e;
}
_c=this._mod360(_d+this._getAngleRange()*_e/Math.abs(this.min-this.max));
}
}
return _c;
},_getValueForAngle:function(_f){
var _10=this._mod360(this.startAngle);
var _11=this._mod360(this.endAngle);
if(!this._angleInRange(_f)){
var _12=this._mod360(_10-_f);
var _13=360-_12;
var _14=this._mod360(_11-_f);
var _15=360-_14;
if(Math.min(_12,_13)<Math.min(_14,_15)){
return this.min;
}else{
return this.max;
}
}else{
var _16=Math.abs(this.max-this.min);
var _17=this._mod360(this.orientation=="clockwise"?(_f-_10):(-_f+_10));
return this.min+_16*_17/this._getAngleRange();
}
},_getAngleRange:function(){
var _18;
var _19=this._mod360(this.startAngle);
var _1a=this._mod360(this.endAngle);
if(_19==_1a){
return 360;
}
if(this.orientation=="clockwise"){
if(_1a<_19){
_18=360-(_19-_1a);
}else{
_18=_1a-_19;
}
}else{
if(_1a<_19){
_18=_19-_1a;
}else{
_18=360-(_1a-_19);
}
}
return _18;
},_angleInRange:function(_1b){
var _1c=this._mod360(this.startAngle);
var _1d=this._mod360(this.endAngle);
if(_1c==_1d){
return true;
}
_1b=this._mod360(_1b);
if(this.orientation=="clockwise"){
if(_1c<_1d){
return _1b>=_1c&&_1b<=_1d;
}else{
return !(_1b>_1d&&_1b<_1c);
}
}else{
if(_1c<_1d){
return !(_1b>_1c&&_1b<_1d);
}else{
return _1b>=_1d&&_1b<=_1c;
}
}
},_isScaleCircular:function(){
return (this._mod360(this.startAngle)==this._mod360(this.endAngle));
},_mod360:function(v){
while(v>360){
v=v-360;
}
while(v<0){
v=v+360;
}
return v;
},_getRadians:function(_1e){
return _1e*Math.PI/180;
},_getDegrees:function(_1f){
return _1f*180/Math.PI;
},drawRange:function(_20,_21){
var _22;
if(_21.shape){
_21.shape.parent.remove(_21.shape);
_21.shape=null;
}
var a1,a2;
if((_21.low==this.min)&&(_21.high==this.max)&&((this._mod360(this.endAngle)==this._mod360(this.startAngle)))){
_22=_20.createCircle({cx:this.cx,cy:this.cy,r:this.radius});
}else{
a1=this._getRadians(this._getAngle(_21.low));
a2=this._getRadians(this._getAngle(_21.high));
if(this.orientation=="cclockwise"){
var a=a2;
a2=a1;
a1=a;
}
var x1=this.cx+this.radius*Math.sin(a1),y1=this.cy-this.radius*Math.cos(a1),x2=this.cx+this.radius*Math.sin(a2),y2=this.cy-this.radius*Math.cos(a2),big=0;
var _23;
if(a1<=a2){
_23=a2-a1;
}else{
_23=2*Math.PI-a1+a2;
}
if(_23>Math.PI){
big=1;
}
_22=_20.createPath();
if(_21.size){
_22.moveTo(this.cx+(this.radius-_21.size)*Math.sin(a1),this.cy-(this.radius-_21.size)*Math.cos(a1));
}else{
_22.moveTo(this.cx,this.cy);
}
_22.lineTo(x1,y1);
_22.arcTo(this.radius,this.radius,0,big,1,x2,y2);
if(_21.size){
_22.lineTo(this.cx+(this.radius-_21.size)*Math.sin(a2),this.cy-(this.radius-_21.size)*Math.cos(a2));
_22.arcTo((this.radius-_21.size),(this.radius-_21.size),0,big,0,this.cx+(this.radius-_21.size)*Math.sin(a1),this.cy-(this.radius-_21.size)*Math.cos(a1));
}
_22.closePath();
}
if(_1.isArray(_21.color)||_1.isString(_21.color)){
_22.setStroke({color:_21.color});
_22.setFill(_21.color);
}else{
if(_21.color.type){
a1=this._getRadians(this._getAngle(_21.low));
a2=this._getRadians(this._getAngle(_21.high));
_21.color.x1=this.cx+(this.radius*Math.sin(a1))/2;
_21.color.x2=this.cx+(this.radius*Math.sin(a2))/2;
_21.color.y1=this.cy-(this.radius*Math.cos(a1))/2;
_21.color.y2=this.cy-(this.radius*Math.cos(a2))/2;
_22.setFill(_21.color);
_22.setStroke({color:_21.color.colors[0].color});
}else{
if(_8.svg){
_22.setStroke({color:"green"});
_22.setFill("green");
_22.getEventSource().setAttribute("class",_21.color.style);
}
}
}
_22.connect("onmouseover",_1.hitch(this,this._handleMouseOverRange,_21));
_22.connect("onmouseout",_1.hitch(this,this._handleMouseOutRange,_21));
_21.shape=_22;
},getRangeUnderMouse:function(_24){
var _25=null,pos=_1.coords(this.gaugeContent),x=_24.clientX-pos.x,y=_24.clientY-pos.y,r=Math.sqrt((y-this.cy)*(y-this.cy)+(x-this.cx)*(x-this.cx));
if(r<this.radius){
var _26=this._getDegrees(Math.atan2(y-this.cy,x-this.cx)+Math.PI/2),_27=this._getValueForAngle(_26);
if(this._rangeData){
for(var i=0;(i<this._rangeData.length)&&!_25;i++){
if((Number(this._rangeData[i].low)<=_27)&&(Number(this._rangeData[i].high)>=_27)){
_25=this._rangeData[i];
}
}
}
}
return _25;
},_dragIndicator:function(_28,_29){
this._dragIndicatorAt(_28,_29.pageX,_29.pageY);
_1.stopEvent(_29);
},_dragIndicatorAt:function(_2a,x,y){
var pos=_1.position(_2a.gaugeContent,true),xf=x-pos.x,yf=y-pos.y,_2b=_2a._getDegrees(Math.atan2(yf-_2a.cy,xf-_2a.cx)+Math.PI/2);
value=_2a._getValueForAngle(_2b);
value=Math.min(Math.max(value,_2a.min),_2a.max);
_2a._drag.value=_2a._drag.currentValue=value;
_2a._drag.onDragMove(_2a._drag);
_2a._drag.draw(this._indicatorsGroup,true);
_2a._drag.valueChanged();
}});
});
