/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/drawing/Grid",["dojo","../_Plugin","../../util/oo"],function(_1){
_1.getObject("drawing.plugins.drawing",true,dojox);
dojox.drawing.plugins.drawing.Grid=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_2){
if(_2.gap){
this.major=_2.gap;
}
this.majorColor=_2.majorColor||this.majorColor;
this.minorColor=_2.minorColor||this.minorColor;
this.setGrid();
_1.connect(this.canvas,"setZoom",this,"setZoom");
},{type:"dojox.drawing.plugins.drawing.Grid",gap:100,major:100,minor:0,majorColor:"#00ffff",minorColor:"#d7ffff",zoom:1,setZoom:function(_3){
this.zoom=_3;
this.setGrid();
},setGrid:function(_4){
var _5=Math.floor(this.major*this.zoom);
var _6=this.minor?Math.floor(this.minor*this.zoom):_5;
this.grid&&this.grid.removeShape();
var x1,x2,y1,y2,i,_7,_8;
var s=this.canvas.underlay.createGroup();
var w=2000;
var h=1000;
var b=1;
var mj=this.majorColor;
var mn=this.minorColor;
var _9=function(x1,y1,x2,y2,c){
s.createLine({x1:x1,y1:y1,x2:x2,y2:y2}).setStroke({style:"Solid",width:b,cap:"round",color:c});
};
for(i=1,_8=h/_6;i<_8;i++){
x1=0,x2=w;
y1=_6*i,y2=y1;
_7=y1%_5?mn:mj;
_9(x1,y1,x2,y2,_7);
}
for(i=1,_8=w/_6;i<_8;i++){
y1=0,y2=h;
x1=_6*i,x2=x1;
_7=x1%_5?mn:mj;
_9(x1,y1,x2,y2,_7);
}
s.moveToBack();
this.grid=s;
this.util.attr(s,"id","grid");
return s;
}});
return dojox.drawing.plugins.drawing.Grid;
});
