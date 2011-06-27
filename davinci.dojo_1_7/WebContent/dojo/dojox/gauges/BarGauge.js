/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/BarGauge",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/html","dojo/_base/event","dojox/gfx","./_Gauge","./BarLineIndicator"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
_1.experimental("dojox.gauges.BarGauge");
return _1.declare("dojox.gauges.BarGauge",_8,{dataX:5,dataY:5,dataWidth:0,dataHeight:0,_defaultIndicator:_9,startup:function(){
if(this.getChildren){
_1.forEach(this.getChildren(),function(_a){
_a.startup();
});
}
if(!this.dataWidth){
this.dataWidth=this.gaugeWidth-10;
}
if(!this.dataHeight){
this.dataHeight=this.gaugeHeight-10;
}
this.inherited(arguments);
},_getPosition:function(_b){
return this.dataX+Math.floor((_b-this.min)/(this.max-this.min)*this.dataWidth);
},_getValueForPosition:function(_c){
return (_c-this.dataX)*(this.max-this.min)/this.dataWidth+this.min;
},drawRange:function(_d,_e){
if(_e.shape){
_e.shape.parent.remove(_e.shape);
_e.shape=null;
}
var x1=this._getPosition(_e.low);
var x2=this._getPosition(_e.high);
var _f=_d.createRect({x:x1,y:this.dataY,width:x2-x1,height:this.dataHeight});
if(_1.isArray(_e.color)||_1.isString(_e.color)){
_f.setStroke({color:_e.color});
_f.setFill(_e.color);
}else{
if(_e.color.type){
var y=this.dataY+this.dataHeight/2;
_e.color.x1=x1;
_e.color.x2=x2;
_e.color.y1=y;
_e.color.y2=y;
_f.setFill(_e.color);
_f.setStroke({color:_e.color.colors[0].color});
}else{
if(_7.svg){
_f.setStroke({color:"green"});
_f.setFill("green");
_f.getEventSource().setAttribute("class",_e.color.style);
}
}
}
_f.connect("onmouseover",_1.hitch(this,this._handleMouseOverRange,_e));
_f.connect("onmouseout",_1.hitch(this,this._handleMouseOutRange,_e));
_e.shape=_f;
},getRangeUnderMouse:function(_10){
var _11=null;
var pos=_1.coords(this.gaugeContent);
var x=_10.clientX-pos.x;
var _12=this._getValueForPosition(x);
if(this._rangeData){
for(var i=0;(i<this._rangeData.length)&&!_11;i++){
if((Number(this._rangeData[i].low)<=_12)&&(Number(this._rangeData[i].high)>=_12)){
_11=this._rangeData[i];
}
}
}
return _11;
},_dragIndicator:function(_13,_14){
this._dragIndicatorAt(_13,_14.pageX,_14.pageY);
_1.stopEvent(_14);
},_dragIndicatorAt:function(_15,x,y){
var pos=_1.position(_15.gaugeContent,true);
var xl=x-pos.x;
var _16=_15._getValueForPosition(xl);
if(_16<_15.min){
_16=_15.min;
}
if(_16>_15.max){
_16=_15.max;
}
_15._drag.value=_16;
_15._drag.onDragMove(_15._drag);
_15._drag.draw(this._indicatorsGroup,true);
_15._drag.valueChanged();
}});
});
