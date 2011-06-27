/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/GlossyHorizontalGaugeMarker",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/Color","./BarLineIndicator"],function(_1,_2,_3,_4){
return _1.declare("dojox.gauges.GlossyHorizontalGaugeMarker",[_4],{interactionMode:"gauge",color:"black",_getShapes:function(_5){
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
var _6=this._gauge._getPosition(v);
var _7=[];
var _8=new _1.Color(this.color);
_8.a=0.67;
var _9=_1.blendColors(_8,new _1.Color("white"),0.4);
var _a=_7[0]=_5.createGroup();
var _b=this._gauge.height/100;
_b=Math.max(_b,0.5);
_b=Math.min(_b,1);
_a.setTransform({xx:1,xy:0,yx:0,yy:1,dx:_6,dy:0});
var _c=_a.createGroup().setTransform({xx:1,xy:0,yx:0,yy:1,dx:-_b*10,dy:this._gauge.dataY+this.offset});
var _d=_c.createGroup().setTransform({xx:_b,xy:0,yx:0,yy:_b,dx:0,dy:0});
_d.createRect({x:0.5,y:0,width:20,height:47,r:6}).setFill(_8).setStroke(_9);
_d.createPath({path:"M 10.106 41 L 10.106 6 C 10.106 2.687 7.419 0 4.106 0 L 0.372 0 C -0.738 6.567 1.022 15.113 1.022 23.917 C 1.022 32.721 2.022 40.667 0.372 47 L 4.106 47 C 7.419 47 10.106 44.314 10.106 41 Z"}).setFill(_9).setTransform({xx:1,xy:0,yx:0,yy:1,dx:10.306,dy:0.009});
_d.createRect({x:9.5,y:1.5,width:2,height:34,r:0.833717}).setFill(_8).setStroke(this.color);
_d.createRect({x:9,y:0,width:3,height:34,r:6}).setFill({type:"linear",x1:9,y1:0,x2:9,y2:34,colors:[{offset:0,color:"white"},{offset:1,color:this.color}]});
return _7;
}});
});
