/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/Element",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","dojox/gfx"],function(_1,_2,_3,_4){
return _1.declare("dojox.charting.Element",null,{chart:null,group:null,htmlElements:null,dirty:true,constructor:function(_5){
this.chart=_5;
this.group=null;
this.htmlElements=[];
this.dirty=true;
this.trailingSymbol="...";
this._events=[];
},createGroup:function(_6){
if(!_6){
_6=this.chart.surface;
}
if(!this.group){
this.group=_6.createGroup();
}
return this;
},purgeGroup:function(){
this.destroyHtmlElements();
if(this.group){
this.group.clear();
this.group.removeShape();
this.group=null;
}
this.dirty=true;
if(this._events.length){
_1.forEach(this._events,function(_7){
_7.shape.disconnect(_7.handle);
});
this._events=[];
}
return this;
},cleanGroup:function(_8){
this.destroyHtmlElements();
if(!_8){
_8=this.chart.surface;
}
if(this.group){
this.group.clear();
}else{
this.group=_8.createGroup();
}
this.dirty=true;
return this;
},destroyHtmlElements:function(){
if(this.htmlElements.length){
_1.forEach(this.htmlElements,_1.destroy);
this.htmlElements=[];
}
},destroy:function(){
this.purgeGroup();
},getTextWidth:function(s,_9){
return _4._base._getTextBox(s,{font:_9}).w||0;
},getTextWithLimitLength:function(s,_a,_b,_c){
if(!s||s.length<=0){
return {text:"",truncated:_c||false};
}
if(!_b||_b<=0){
return {text:s,truncated:_c||false};
}
var _d=2,_e=0.618,_f=s.substring(0,1)+this.trailingSymbol,_10=this.getTextWidth(_f,_a);
if(_b<=_10){
return {text:_f,truncated:true};
}
var _11=this.getTextWidth(s,_a);
if(_11<=_b){
return {text:s,truncated:_c||false};
}else{
var _12=0,end=s.length;
while(_12<end){
if(end-_12<=_d){
while(this.getTextWidth(s.substring(0,_12)+this.trailingSymbol,_a)>_b){
_12-=1;
}
return {text:(s.substring(0,_12)+this.trailingSymbol),truncated:true};
}
var _13=_12+Math.round((end-_12)*_e),_14=this.getTextWidth(s.substring(0,_13),_a);
if(_14<_b){
_12=_13;
end=end;
}else{
_12=_12;
end=_13;
}
}
}
},getTextWithLimitCharCount:function(s,_15,_16,_17){
if(!s||s.length<=0){
return {text:"",truncated:_17||false};
}
if(!_16||_16<=0||s.length<=_16){
return {text:s,truncated:_17||false};
}
return {text:s.substring(0,_16)+this.trailingSymbol,truncated:true};
},_plotFill:function(_18,dim,_19){
if(!_18||!_18.type||!_18.space){
return _18;
}
var _1a=_18.space;
switch(_18.type){
case "linear":
if(_1a==="plot"||_1a==="shapeX"||_1a==="shapeY"){
_18=_4.makeParameters(_4.defaultLinearGradient,_18);
_18.space=_1a;
if(_1a==="plot"||_1a==="shapeX"){
var _1b=dim.height-_19.t-_19.b;
_18.y1=_19.t+_1b*_18.y1/100;
_18.y2=_19.t+_1b*_18.y2/100;
}
if(_1a==="plot"||_1a==="shapeY"){
var _1b=dim.width-_19.l-_19.r;
_18.x1=_19.l+_1b*_18.x1/100;
_18.x2=_19.l+_1b*_18.x2/100;
}
}
break;
case "radial":
if(_1a==="plot"){
_18=_4.makeParameters(_4.defaultRadialGradient,_18);
_18.space=_1a;
var _1c=dim.width-_19.l-_19.r,_1d=dim.height-_19.t-_19.b;
_18.cx=_19.l+_1c*_18.cx/100;
_18.cy=_19.t+_1d*_18.cy/100;
_18.r=_18.r*Math.sqrt(_1c*_1c+_1d*_1d)/200;
}
break;
case "pattern":
if(_1a==="plot"||_1a==="shapeX"||_1a==="shapeY"){
_18=_4.makeParameters(_4.defaultPattern,_18);
_18.space=_1a;
if(_1a==="plot"||_1a==="shapeX"){
var _1b=dim.height-_19.t-_19.b;
_18.y=_19.t+_1b*_18.y/100;
_18.height=_1b*_18.height/100;
}
if(_1a==="plot"||_1a==="shapeY"){
var _1b=dim.width-_19.l-_19.r;
_18.x=_19.l+_1b*_18.x/100;
_18.width=_1b*_18.width/100;
}
}
break;
}
return _18;
},_shapeFill:function(_1e,_1f){
if(!_1e||!_1e.space){
return _1e;
}
var _20=_1e.space;
switch(_1e.type){
case "linear":
if(_20==="shape"||_20==="shapeX"||_20==="shapeY"){
_1e=_4.makeParameters(_4.defaultLinearGradient,_1e);
_1e.space=_20;
if(_20==="shape"||_20==="shapeX"){
var _21=_1f.width;
_1e.x1=_1f.x+_21*_1e.x1/100;
_1e.x2=_1f.x+_21*_1e.x2/100;
}
if(_20==="shape"||_20==="shapeY"){
var _21=_1f.height;
_1e.y1=_1f.y+_21*_1e.y1/100;
_1e.y2=_1f.y+_21*_1e.y2/100;
}
}
break;
case "radial":
if(_20==="shape"){
_1e=_4.makeParameters(_4.defaultRadialGradient,_1e);
_1e.space=_20;
_1e.cx=_1f.x+_1f.width/2;
_1e.cy=_1f.y+_1f.height/2;
_1e.r=_1e.r*_1f.width/200;
}
break;
case "pattern":
if(_20==="shape"||_20==="shapeX"||_20==="shapeY"){
_1e=_4.makeParameters(_4.defaultPattern,_1e);
_1e.space=_20;
if(_20==="shape"||_20==="shapeX"){
var _21=_1f.width;
_1e.x=_1f.x+_21*_1e.x/100;
_1e.width=_21*_1e.width/100;
}
if(_20==="shape"||_20==="shapeY"){
var _21=_1f.height;
_1e.y=_1f.y+_21*_1e.y/100;
_1e.height=_21*_1e.height/100;
}
}
break;
}
return _1e;
},_pseudoRadialFill:function(_22,_23,_24,_25,end){
if(!_22||_22.type!=="radial"||_22.space!=="shape"){
return _22;
}
var _26=_22.space;
_22=_4.makeParameters(_4.defaultRadialGradient,_22);
_22.space=_26;
if(arguments.length<4){
_22.cx=_23.x;
_22.cy=_23.y;
_22.r=_22.r*_24/100;
return _22;
}
var _27=arguments.length<5?_25:(end+_25)/2;
return {type:"linear",x1:_23.x,y1:_23.y,x2:_23.x+_22.r*_24*Math.cos(_27)/100,y2:_23.y+_22.r*_24*Math.sin(_27)/100,colors:_22.colors};
return _22;
}});
});
