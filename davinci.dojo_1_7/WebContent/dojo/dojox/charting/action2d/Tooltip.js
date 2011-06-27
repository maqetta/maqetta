/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/Tooltip",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","./PlotAction","dijit/Tooltip","dojox/gfx/matrix","dojox/lang/functional","dojox/lang/functional/scan","dojox/lang/functional/fold"],function(_1,_2,_3,_4,_5,m,df){
var _6=function(o){
var t=o.run&&o.run.data&&o.run.data[o.index];
if(t&&typeof t!="number"&&(t.tooltip||t.text)){
return t.tooltip||t.text;
}
if(o.element=="candlestick"){
return "<table cellpadding=\"1\" cellspacing=\"0\" border=\"0\" style=\"font-size:0.9em;\">"+"<tr><td>Open:</td><td align=\"right\"><strong>"+o.data.open+"</strong></td></tr>"+"<tr><td>High:</td><td align=\"right\"><strong>"+o.data.high+"</strong></td></tr>"+"<tr><td>Low:</td><td align=\"right\"><strong>"+o.data.low+"</strong></td></tr>"+"<tr><td>Close:</td><td align=\"right\"><strong>"+o.data.close+"</strong></td></tr>"+(o.data.mid!==undefined?"<tr><td>Mid:</td><td align=\"right\"><strong>"+o.data.mid+"</strong></td></tr>":"")+"</table>";
}
return o.element=="bar"?o.x:o.y;
};
var _7=Math.PI/4,_8=Math.PI/2;
return _1.declare("dojox.charting.action2d.Tooltip",dojox.charting.action2d.PlotAction,{defaultParams:{text:_6},optionalParams:{},constructor:function(_9,_a,_b){
this.text=_b&&_b.text?_b.text:_6;
this.connect();
},process:function(o){
if(o.type==="onplotreset"||o.type==="onmouseout"){
dijit.hideTooltip(this.aroundRect);
this.aroundRect=null;
if(o.type==="onplotreset"){
delete this.angles;
}
return;
}
if(!o.shape||o.type!=="onmouseover"){
return;
}
var _c={type:"rect"},_d=["after","before"];
switch(o.element){
case "marker":
_c.x=o.cx;
_c.y=o.cy;
_c.width=_c.height=1;
break;
case "circle":
_c.x=o.cx-o.cr;
_c.y=o.cy-o.cr;
_c.width=_c.height=2*o.cr;
break;
case "column":
_d=["above","below"];
case "bar":
_c=_1.clone(o.shape.getShape());
break;
case "candlestick":
_c.x=o.x;
_c.y=o.y;
_c.width=o.width;
_c.height=o.height;
break;
default:
if(!this.angles){
if(typeof o.run.data[0]=="number"){
this.angles=df.map(df.scanl(o.run.data,"+",0),"* 2 * Math.PI / this",df.foldl(o.run.data,"+",0));
}else{
this.angles=df.map(df.scanl(o.run.data,"a + b.y",0),"* 2 * Math.PI / this",df.foldl(o.run.data,"a + b.y",0));
}
}
var _e=m._degToRad(o.plot.opt.startAngle),_f=(this.angles[o.index]+this.angles[o.index+1])/2+_e;
_c.x=o.cx+o.cr*Math.cos(_f);
_c.y=o.cy+o.cr*Math.sin(_f);
_c.width=_c.height=1;
if(_f<_7){
}else{
if(_f<_8+_7){
_d=["below","above"];
}else{
if(_f<Math.PI+_7){
_d=["before","after"];
}else{
if(_f<2*Math.PI-_7){
_d=["above","below"];
}
}
}
}
break;
}
var lt=this.chart.getCoords();
_c.x+=lt.x;
_c.y+=lt.y;
_c.x=Math.round(_c.x);
_c.y=Math.round(_c.y);
_c.width=Math.ceil(_c.width);
_c.height=Math.ceil(_c.height);
this.aroundRect=_c;
var _10=this.text(o);
if(this.chart.getTextDir){
var _11=(_1.style(this.chart.node,"direction")=="rtl");
var _12=(this.chart.getTextDir(_10)=="rtl");
}
if(_10){
if(_12&&!_11){
dijit.showTooltip("<span dir = 'rtl'>"+_10+"</span>",this.aroundRect,_d);
}else{
if(!_12&&_11){
dijit.showTooltip("<span dir = 'ltr'>"+_10+"</span>",this.aroundRect,_d);
}else{
dijit.showTooltip(_10,this.aroundRect,_d);
}
}
}
}});
});
