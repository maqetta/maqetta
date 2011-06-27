/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/ui/dom/Zoom",["dojo","../../plugins/_Plugin"],function(_1){
dojox.drawing.ui.dom.Zoom=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_2){
var _3=_2.node.className;
var _4=_2.node.innerHTML;
this.domNode=_1.create("div",{id:"btnZoom","class":"toolCombo"},_2.node,"replace");
this.makeButton("ZoomIn",this.topClass);
this.makeButton("Zoom100",this.midClass);
this.makeButton("ZoomOut",this.botClass);
},{type:"dojox.drawing.ui.dom.Zoom",zoomInc:0.1,maxZoom:10,minZoom:0.1,zoomFactor:1,baseClass:"drawingButton",topClass:"toolComboTop",midClass:"toolComboMid",botClass:"toolComboBot",makeButton:function(_5,_6){
var _7=_1.create("div",{id:"btn"+_5,"class":this.baseClass+" "+_6,innerHTML:"<div title=\"Zoom In\" class=\"icon icon"+_5+"\"></div>"},this.domNode);
_1.connect(document,"mouseup",function(_8){
_1.stopEvent(_8);
_1.removeClass(_7,"active");
});
_1.connect(_7,"mouseup",this,function(_9){
_1.stopEvent(_9);
_1.removeClass(_7,"active");
this["on"+_5]();
});
_1.connect(_7,"mouseover",function(_a){
_1.stopEvent(_a);
_1.addClass(_7,"hover");
});
_1.connect(_7,"mousedown",this,function(_b){
_1.stopEvent(_b);
_1.addClass(_7,"active");
});
_1.connect(_7,"mouseout",this,function(_c){
_1.stopEvent(_c);
_1.removeClass(_7,"hover");
});
},onZoomIn:function(_d){
this.zoomFactor+=this.zoomInc;
this.zoomFactor=Math.min(this.zoomFactor,this.maxZoom);
this.canvas.setZoom(this.zoomFactor);
this.mouse.setZoom(this.zoomFactor);
},onZoom100:function(_e){
this.zoomFactor=1;
this.canvas.setZoom(this.zoomFactor);
this.mouse.setZoom(this.zoomFactor);
},onZoomOut:function(_f){
this.zoomFactor-=this.zoomInc;
this.zoomFactor=Math.max(this.zoomFactor,this.minZoom);
this.canvas.setZoom(this.zoomFactor);
this.mouse.setZoom(this.zoomFactor);
}});
return dojox.drawing.ui.dom.Zoom;
});
