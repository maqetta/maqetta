/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/tools/Zoom",["dojo","../../util/oo","../_Plugin","../../manager/_registry"],function(_1){
var _2=Math.pow(2,0.25),_3=10,_4=0.1,_5=1,dt=dojox.drawing.plugins.tools;
dt.ZoomIn=dojox.drawing.util.oo.declare(function(_6){
},{});
dt.ZoomIn=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_7){
},{type:"dojox.drawing.plugins.tools.ZoomIn",onZoomIn:function(){
_5*=_2;
_5=Math.min(_5,_3);
this.canvas.setZoom(_5);
this.mouse.setZoom(_5);
},onClick:function(){
this.onZoomIn();
}});
dt.Zoom100=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_8){
},{type:"dojox.drawing.plugins.tools.Zoom100",onZoom100:function(){
_5=1;
this.canvas.setZoom(_5);
this.mouse.setZoom(_5);
},onClick:function(){
this.onZoom100();
}});
dt.ZoomOut=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_9){
},{type:"dojox.drawing.plugins.tools.ZoomOut",onZoomOut:function(){
_5/=_2;
_5=Math.max(_5,_4);
this.canvas.setZoom(_5);
this.mouse.setZoom(_5);
},onClick:function(){
this.onZoomOut();
}});
dt.ZoomIn.setup={name:"dojox.drawing.plugins.tools.ZoomIn",tooltip:"Zoom In"};
dojox.drawing.register(dt.ZoomIn.setup,"plugin");
dt.Zoom100.setup={name:"dojox.drawing.plugins.tools.Zoom100",tooltip:"Zoom to 100%"};
dojox.drawing.register(dt.Zoom100.setup,"plugin");
dt.ZoomOut.setup={name:"dojox.drawing.plugins.tools.ZoomOut",tooltip:"Zoom In"};
dojox.drawing.register(dt.ZoomOut.setup,"plugin");
});
