/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/TouchIndicator",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/event","./ChartAction","./_IndicatorElement","dojox/lang/utils"],function(_1,_2,_3,_4,_5,_6,du){
return _1.declare("dojox.charting.action2d.TouchIndicator",dojox.charting.action2d.ChartAction,{defaultParams:{series:null,dualIndicator:false,vertical:true,autoScroll:true,fixed:true,precision:0},optionalParams:{lineStroke:{},outlineStroke:{},shadowStroke:{},stroke:{},outline:{},shadow:{},fill:{},fillFunc:null,labelFunc:null,font:"",fontColor:"",markerStroke:{},markerOutline:{},markerShadow:{},markerFill:{},markerSymbol:""},constructor:function(_7,_8,_9){
this._listeners=[{eventName:"ontouchstart",methodName:"onTouchStart"},{eventName:"ontouchmove",methodName:"onTouchMove"},{eventName:"ontouchend",methodName:"onTouchEnd"},{eventName:"ontouchcancel",methodName:"onTouchEnd"}];
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_9);
du.updateWithPattern(this.opt,_9,this.optionalParams);
this.uName="touchIndicator"+this.opt.series;
this._handles=[];
this.connect();
},connect:function(){
this.inherited(arguments);
this.chart.addPlot(this.uName,{type:_6,inter:this});
},disconnect:function(){
var _a=this.chart.getPlot(this.uName);
if(_a.pageCoord){
this.onTouchEnd();
}
this.chart.removePlot(this.uName);
this.inherited(arguments);
},onTouchStart:function(_b){
if(_b.touches.length==1){
this._onTouchSingle(_b,true);
}else{
if(this.opt.dualIndicator&&_b.touches.length==2){
this._onTouchDual(_b);
}
}
},onTouchMove:function(_c){
if(_c.touches.length==1){
this._onTouchSingle(_c);
}else{
if(this.opt.dualIndicator&&_c.touches.length==2){
this._onTouchDual(_c);
}
}
},_onTouchSingle:function(_d,_e){
if(this.chart._delayedRenderHandle&&!_e){
clearTimeout(this.chart._delayedRenderHandle);
this.chart._delayedRenderHandle=null;
this.chart.render();
}
var _f=this.chart.getPlot(this.uName);
_f.pageCoord={x:_d.touches[0].pageX,y:_d.touches[0].pageY};
_f.dirty=true;
if(_e){
this.chart.delayedRender();
}else{
this.chart.render();
}
_1.stopEvent(_d);
},_onTouchDual:function(_10){
var _11=this.chart.getPlot(this.uName);
_11.pageCoord={x:_10.touches[0].pageX,y:_10.touches[0].pageY};
_11.secondCoord={x:_10.touches[1].pageX,y:_10.touches[1].pageY};
_11.dirty=true;
this.chart.render();
_1.stopEvent(_10);
},onTouchEnd:function(_12){
var _13=this.chart.getPlot(this.uName);
_13.stopTrack();
_13.pageCoord=null;
_13.secondCoord=null;
_13.dirty=true;
this.chart.delayedRender();
}});
});
