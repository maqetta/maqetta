/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/BarIndicator",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/fx","dojo/_base/connect","dojo/_base/lang","./BarLineIndicator"],function(_1,_2,_3,_4,_5,_6){
_1.experimental("dojox.gauges.BarIndicator");
return _1.declare("dojox.gauges.BarIndicator",[_6],{_getShapes:function(_7){
if(!this._gauge){
return null;
}
var v=this.value;
if(v<this._gauge.min){
v=this._gauge.min;
}
if(v>this._gauge.max){
v=this._gauge.max;
}
var _8=this._gauge._getPosition(v);
if(_8==this.dataX){
_8=this.dataX+1;
}
var y=this._gauge.dataY+Math.floor((this._gauge.dataHeight-this.width)/2)+this.offset;
var _9=[];
_9[0]=_7.createRect({x:this._gauge.dataX,y:y,width:_8-this._gauge.dataX,height:this.width});
_9[0].setStroke({color:this.color});
_9[0].setFill(this.color);
_9[1]=_7.createLine({x1:this._gauge.dataX,y1:y,x2:_8,y2:y});
_9[1].setStroke({color:this.highlight});
if(this.highlight2){
y--;
_9[2]=_7.createLine({x1:this._gauge.dataX,y1:y,x2:_8,y2:y});
_9[2].setStroke({color:this.highlight2});
}
return _9;
},_createShapes:function(_a){
for(var i in this.shape.children){
i=this.shape.children[i];
var _b={};
for(var j in i){
_b[j]=i[j];
}
if(i.shape.type=="line"){
_b.shape.x2=_a+_b.shape.x1;
}else{
if(i.shape.type=="rect"){
_b.width=_a;
}
}
i.setShape(_b);
}
},_move:function(_c){
var _d=false;
var c;
var v=this.value;
if(v<this.min){
v=this.min;
}
if(v>this.max){
v=this.max;
}
c=this._gauge._getPosition(this.currentValue);
this.currentValue=v;
v=this._gauge._getPosition(v)-this._gauge.dataX;
if(_c){
this._createShapes(v);
}else{
if(c!=v){
var _e=new _1.Animation({curve:[c,v],duration:this.duration,easing:this.easing});
_1.connect(_e,"onAnimate",_1.hitch(this,this._createShapes));
_e.play();
}
}
}});
});
