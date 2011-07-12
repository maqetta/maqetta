/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/MouseZoomAndPan",["dojo/_base/kernel","dojo/_base/html","dojo/_base/declare","dojo/_base/window","dojo/_base/connect","./ChartAction"],function(_1,_2,_3,_4,_5,_6){
var _7=_1.isMozilla?-3:120;
var _8={none:function(_9){
return !_9.ctrlKey&&!_9.altKey&&!_9.shiftKey;
},ctrl:function(_a){
return _a.ctrlKey&&!_a.altKey&&!_a.shiftKey;
},alt:function(_b){
return !_b.ctrlKey&&_b.altKey&&!_b.shiftKey;
},shift:function(_c){
return !_c.ctrlKey&&!_c.altKey&&_c.shiftKey;
}};
return _1.declare("dojox.charting.action2d.MouseZoomAndPan",dojox.charting.action2d.ChartAction,{defaultParams:{axis:"x",scaleFactor:1.2,maxScale:100,enableScroll:true,enableDoubleClickZoom:true,enableKeyZoom:true,keyZoomModifier:"ctrl"},optionalParams:{},constructor:function(_d,_e,_f){
this._listeners=[{eventName:!_1.isMozilla?"onmousewheel":"DOMMouseScroll",methodName:"onMouseWheel"}];
if(!_f){
_f={};
}
this.axis=_f.axis?_f.axis:"x";
this.scaleFactor=_f.scaleFactor?_f.scaleFactor:1.2;
this.maxScale=_f.maxScale?_f.maxScale:100;
this.enableScroll=_f.enableScroll!=undefined?_f.enableScroll:true;
this.enableDoubleClickZoom=_f.enableDoubleClickZoom!=undefined?_f.enableDoubleClickZoom:true;
this.enableKeyZoom=_f.enableKeyZoom!=undefined?_f.enableKeyZoom:true;
this.keyZoomModifier=_f.keyZoomModifier?_f.keyZoomModifier:"ctrl";
if(this.enableScroll){
this._listeners.push({eventName:"onmousedown",methodName:"onMouseDown"});
}
if(this.enableDoubleClickZoom){
this._listeners.push({eventName:"ondblclick",methodName:"onDoubleClick"});
}
if(this.enableKeyZoom){
this._listeners.push({eventName:"keypress",methodName:"onKeyPress"});
}
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
if(this.enableKeyZoom){
_1.attr(this.chart.node,"tabindex","0");
}
},disconnect:function(){
this.inherited(arguments);
if(this.enableKeyZoom){
_1.attr(this.chart.node,"tabindex","-1");
}
this._disconnectHandles();
},onMouseDown:function(_10){
var _11=this.chart,_12=_11.getAxis(this.axis);
if(!_12.vertical){
this._startCoord=_10.pageX;
}else{
this._startCoord=_10.pageY;
}
this._startOffset=_12.getWindowOffset();
this._isPanning=true;
if(_1.isIE){
this._handles.push(_1.connect(this.chart.node,"onmousemove",this,"onMouseMove"));
this._handles.push(_1.connect(this.chart.node,"onmouseup",this,"onMouseUp"));
this.chart.node.setCapture();
}else{
this._handles.push(_1.connect(_1.doc,"onmousemove",this,"onMouseMove"));
this._handles.push(_1.connect(_1.doc,"onmouseup",this,"onMouseUp"));
}
_11.node.focus();
_1.stopEvent(_10);
},onMouseMove:function(_13){
if(this._isPanning){
var _14=this.chart,_15=_14.getAxis(this.axis);
var _16=_15.vertical?(this._startCoord-_13.pageY):(_13.pageX-this._startCoord);
var _17=_15.getScaler().bounds,s=_17.span/(_17.upper-_17.lower);
var _18=_15.getWindowScale();
_14.setAxisWindow(this.axis,_18,this._startOffset-_16/s/_18);
_14.render();
}
},onMouseUp:function(_19){
this._isPanning=false;
this._disconnectHandles();
},onMouseWheel:function(_1a){
var _1b=_1a[(_1.isMozilla?"detail":"wheelDelta")]/_7;
if(_1b>-1&&_1b<0){
_1b=-1;
}else{
if(_1b>0&&_1b<1){
_1b=1;
}
}
this._onZoom(_1b,_1a);
},onKeyPress:function(_1c){
if(_8[this.keyZoomModifier](_1c)){
if(_1c.keyChar=="+"||_1c.keyCode==_1.keys.NUMPAD_PLUS){
this._onZoom(1,_1c);
}else{
if(_1c.keyChar=="-"||_1c.keyCode==_1.keys.NUMPAD_MINUS){
this._onZoom(-1,_1c);
}
}
}
},onDoubleClick:function(_1d){
var _1e=this.chart,_1f=_1e.getAxis(this.axis);
var _20=1/this.scaleFactor;
if(_1f.getWindowScale()==1){
var _21=_1f.getScaler(),_22=_21.bounds.from,end=_21.bounds.to,_23=(_22+end)/2,_24=this.plot.toData({x:_1d.pageX,y:_1d.pageY})[this.axis],_25=_20*(_22-_23)+_24,_26=_20*(end-_23)+_24;
_1e.zoomIn(this.axis,[_25,_26]);
}else{
_1e.setAxisWindow(this.axis,1,0);
_1e.render();
}
_1.stopEvent(_1d);
},_onZoom:function(_27,_28){
var _29=(_27<0?Math.abs(_27)*this.scaleFactor:1/(Math.abs(_27)*this.scaleFactor));
var _2a=this.chart,_2b=_2a.getAxis(this.axis);
var _2c=_2b.getWindowScale();
if(_2c/_29>this.maxScale){
return;
}
var _2d=_2b.getScaler(),_2e=_2d.bounds.from,end=_2d.bounds.to;
var _2f=(_28.type=="keypress")?(_2e+end)/2:this.plot.toData({x:_28.pageX,y:_28.pageY})[this.axis];
var _30=_29*(_2e-_2f)+_2f,_31=_29*(end-_2f)+_2f;
_2a.zoomIn(this.axis,[_30,_31]);
_1.stopEvent(_28);
}});
});
