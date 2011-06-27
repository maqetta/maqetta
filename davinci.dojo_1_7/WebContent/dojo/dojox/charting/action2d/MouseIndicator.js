/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/MouseIndicator",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/window","./ChartAction","./_IndicatorElement","dojox/lang/utils"],function(_1,_2,_3,_4,_5,_6,_7,du){
return _1.declare("dojox.charting.action2d.MouseIndicator",dojox.charting.action2d.ChartAction,{defaultParams:{series:null,vertical:true,autoScroll:true,fixed:true,precision:0},optionalParams:{lineStroke:{},outlineStroke:{},shadowStroke:{},stroke:{},outline:{},shadow:{},fill:{},fillFunc:null,labelFunc:null,font:"",fontColor:"",markerStroke:{},markerOutline:{},markerShadow:{},markerFill:{},markerSymbol:""},constructor:function(_8,_9,_a){
this._listeners=[{eventName:"onmousedown",methodName:"onMouseDown"}];
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_a);
du.updateWithPattern(this.opt,_a,this.optionalParams);
this.uName="mouseIndicator"+this.opt.series;
this._handles=[];
this.connect();
},_disconnectHandles:function(){
if(_1.isIE){
this.chart.node.releaseCapture();
}
_1.forEach(this._handles,_1.disconnect);
this._handles=[];
},connect:function(){
this.inherited(arguments);
this.chart.addPlot(this.uName,{type:_7,inter:this});
},disconnect:function(){
if(this._isMouseDown){
this.onMouseUp();
}
this.chart.removePlot(this.uName);
this.inherited(arguments);
this._disconnectHandles();
},onMouseDown:function(_b){
this._isMouseDown=true;
if(_1.isIE){
this._handles.push(_1.connect(this.chart.node,"onmousemove",this,"onMouseMove"));
this._handles.push(_1.connect(this.chart.node,"onmouseup",this,"onMouseUp"));
this.chart.node.setCapture();
}else{
this._handles.push(_1.connect(_1.doc,"onmousemove",this,"onMouseMove"));
this._handles.push(_1.connect(_1.doc,"onmouseup",this,"onMouseUp"));
}
this._onMouseSingle(_b);
},onMouseMove:function(_c){
if(this._isMouseDown){
this._onMouseSingle(_c);
}
},_onMouseSingle:function(_d){
var _e=this.chart.getPlot(this.uName);
_e.pageCoord={x:_d.pageX,y:_d.pageY};
_e.dirty=true;
this.chart.render();
_1.stopEvent(_d);
},onMouseUp:function(_f){
var _10=this.chart.getPlot(this.uName);
_10.stopTrack();
this._isMouseDown=false;
this._disconnectHandles();
_10.pageCoord=null;
_10.dirty=true;
this.chart.render();
}});
});
