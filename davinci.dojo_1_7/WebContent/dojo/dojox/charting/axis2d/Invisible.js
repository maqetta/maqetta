/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/axis2d/Invisible",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","./Base","../scaler/linear","dojo/string","dojox/gfx","dojox/lang/utils","dojox/lang/functional"],function(_1,_2,_3,_4,_5,_6,g,du,df){
var _7=du.merge,_8=4,_9=45;
return _1.declare("dojox.charting.axis2d.Invisible",dojox.charting.axis2d.Base,{defaultParams:{vertical:false,fixUpper:"none",fixLower:"none",natural:false,leftBottom:true,includeZero:false,fixed:true,majorLabels:true,minorTicks:true,minorLabels:true,microTicks:false,rotation:0},optionalParams:{min:0,max:1,from:0,to:1,majorTickStep:4,minorTickStep:2,microTickStep:1,labels:[],labelFunc:null,maxLabelSize:0,maxLabelCharCount:0,trailingSymbol:null},constructor:function(_a,_b){
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_b);
du.updateWithPattern(this.opt,_b,this.optionalParams);
},dependOnData:function(){
return !("min" in this.opt)||!("max" in this.opt);
},clear:function(){
delete this.scaler;
delete this.ticks;
this.dirty=true;
return this;
},initialized:function(){
return "scaler" in this&&!(this.dirty&&this.dependOnData());
},setWindow:function(_c,_d){
this.scale=_c;
this.offset=_d;
return this.clear();
},getWindowScale:function(){
return "scale" in this?this.scale:1;
},getWindowOffset:function(){
return "offset" in this?this.offset:0;
},_groupLabelWidth:function(_e,_f,_10){
if(!_e.length){
return 0;
}
if(_1.isObject(_e[0])){
_e=df.map(_e,function(_11){
return _11.text;
});
}
if(_10){
_e=df.map(_e,function(_12){
return _1.trim(_12).length==0?"":_12.substring(0,_10)+this.trailingSymbol;
},this);
}
var s=_e.join("<br>");
return g._base._getTextBox(s,{font:_f}).w||0;
},calculate:function(min,max,_13,_14){
if(this.initialized()){
return this;
}
var o=this.opt;
this.labels="labels" in o?o.labels:_14;
this.scaler=_5.buildScaler(min,max,_13,o);
var tsb=this.scaler.bounds;
if("scale" in this){
o.from=tsb.lower+this.offset;
o.to=(tsb.upper-tsb.lower)/this.scale+o.from;
if(!isFinite(o.from)||isNaN(o.from)||!isFinite(o.to)||isNaN(o.to)||o.to-o.from>=tsb.upper-tsb.lower){
delete o.from;
delete o.to;
delete this.scale;
delete this.offset;
}else{
if(o.from<tsb.lower){
o.to+=tsb.lower-o.from;
o.from=tsb.lower;
}else{
if(o.to>tsb.upper){
o.from+=tsb.upper-o.to;
o.to=tsb.upper;
}
}
this.offset=o.from-tsb.lower;
}
this.scaler=_5.buildScaler(min,max,_13,o);
tsb=this.scaler.bounds;
if(this.scale==1&&this.offset==0){
delete this.scale;
delete this.offset;
}
}
var ta=this.chart.theme.axis,_15=0,_16=o.rotation%360,_17=o.font||(ta.majorTick&&ta.majorTick.font)||(ta.tick&&ta.tick.font),_18=_17?g.normalizedLength(g.splitFontString(_17).size):0,_19=Math.abs(Math.cos(_16*Math.PI/180)),_1a=Math.abs(Math.sin(_16*Math.PI/180));
if(_16<0){
_16+=360;
}
if(_18){
if(this.vertical?_16!=0&&_16!=180:_16!=90&&_16!=270){
if(this.labels){
_15=this._groupLabelWidth(this.labels,_17,o.maxLabelCharCount);
}else{
var _1b=Math.ceil(Math.log(Math.max(Math.abs(tsb.from),Math.abs(tsb.to)))/Math.LN10),t=[];
if(tsb.from<0||tsb.to<0){
t.push("-");
}
t.push(_6.rep("9",_1b));
var _1c=Math.floor(Math.log(tsb.to-tsb.from)/Math.LN10);
if(_1c>0){
t.push(".");
t.push(_6.rep("9",_1c));
}
_15=g._base._getTextBox(t.join(""),{font:_17}).w;
}
_15=o.maxLabelSize?Math.min(o.maxLabelSize,_15):_15;
}else{
_15=_18;
}
switch(_16){
case 0:
case 90:
case 180:
case 270:
break;
default:
var _1d=Math.sqrt(_15*_15+_18*_18),_1e=this.vertical?_18*_19+_15*_1a:_15*_19+_18*_1a;
_15=Math.min(_1d,_1e);
break;
}
}
this.scaler.minMinorStep=_15+_8;
this.ticks=_5.buildTicks(this.scaler,o);
return this;
},getScaler:function(){
return this.scaler;
},getTicks:function(){
return this.ticks;
}});
});
