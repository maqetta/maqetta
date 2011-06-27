/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot2d/_PlotEvents",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect"],function(_1){
return _1.declare("dojox.charting.plot2d._PlotEvents",null,{constructor:function(){
this._shapeEvents=[];
this._eventSeries={};
},destroy:function(){
this.resetEvents();
this.inherited(arguments);
},plotEvent:function(o){
},raiseEvent:function(o){
this.plotEvent(o);
var t=_1.delegate(o);
t.originalEvent=o.type;
t.originalPlot=o.plot;
t.type="onindirect";
_1.forEach(this.chart.stack,function(_2){
if(_2!==this&&_2.plotEvent){
t.plot=_2;
_2.plotEvent(t);
}
},this);
},connect:function(_3,_4){
this.dirty=true;
return _1.connect(this,"plotEvent",_3,_4);
},events:function(){
return !!this.plotEvent.after;
},resetEvents:function(){
if(this._shapeEvents.length){
_1.forEach(this._shapeEvents,function(_5){
_5.shape.disconnect(_5.handle);
});
this._shapeEvents=[];
}
this.raiseEvent({type:"onplotreset",plot:this});
},_connectSingleEvent:function(o,_6){
this._shapeEvents.push({shape:o.eventMask,handle:o.eventMask.connect(_6,this,function(e){
o.type=_6;
o.event=e;
this.raiseEvent(o);
o.event=null;
})});
},_connectEvents:function(o){
if(o){
o.chart=this.chart;
o.plot=this;
o.hAxis=this.hAxis||null;
o.vAxis=this.vAxis||null;
o.eventMask=o.eventMask||o.shape;
this._connectSingleEvent(o,"onmouseover");
this._connectSingleEvent(o,"onmouseout");
this._connectSingleEvent(o,"onclick");
}
},_reconnectEvents:function(_7){
var a=this._eventSeries[_7];
if(a){
_1.forEach(a,this._connectEvents,this);
}
},fireEvent:function(_8,_9,_a,_b){
var s=this._eventSeries[_8];
if(s&&s.length&&_a<s.length){
var o=s[_a];
o.type=_9;
o.event=_b||null;
this.raiseEvent(o);
o.event=null;
}
}});
});
