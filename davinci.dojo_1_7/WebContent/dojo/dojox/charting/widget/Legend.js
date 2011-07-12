/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/widget/Legend",["dojo/_base/kernel","dojo/_base/html","dojo/_base/declare","dijit/_Widget","dojox/gfx","dojox/lang/functional","dojox/lang/functional/array","dojox/lang/functional/fold"],function(_1,_2,_3,_4,_5,df){
var _6=/\.(StackedColumns|StackedAreas|ClusteredBars)$/;
return _1.declare("dojox.charting.widget.Legend",dijit._Widget,{chartRef:"",horizontal:true,swatchSize:18,legendBody:null,postCreate:function(){
if(!this.chart){
if(!this.chartRef){
return;
}
this.chart=dijit.byId(this.chartRef);
if(!this.chart){
var _7=_1.byId(this.chartRef);
if(_7){
this.chart=dijit.byNode(_7);
}else{
return;
}
}
this.series=this.chart.chart.series;
}else{
this.series=this.chart.series;
}
this.refresh();
},buildRendering:function(){
this.domNode=_1.create("table",{role:"group","aria-label":"chart legend","class":"dojoxLegendNode"});
this.legendBody=_1.create("tbody",null,this.domNode);
this.inherited(arguments);
},refresh:function(){
if(this._surfaces){
_1.forEach(this._surfaces,function(_8){
_8.destroy();
});
}
this._surfaces=[];
while(this.legendBody.lastChild){
_1.destroy(this.legendBody.lastChild);
}
if(this.horizontal){
_1.addClass(this.domNode,"dojoxLegendHorizontal");
this._tr=_1.create("tr",null,this.legendBody);
this._inrow=0;
}
var s=this.series;
if(s.length==0){
return;
}
if(s[0].chart.stack[0].declaredClass=="dojox.charting.plot2d.Pie"){
var t=s[0].chart.stack[0];
if(typeof t.run.data[0]=="number"){
var _9=df.map(t.run.data,"Math.max(x, 0)");
if(df.every(_9,"<= 0")){
return;
}
var _a=df.map(_9,"/this",df.foldl(_9,"+",0));
_1.forEach(_a,function(x,i){
this._addLabel(t.dyn[i],t._getLabel(x*100)+"%");
},this);
}else{
_1.forEach(t.run.data,function(x,i){
this._addLabel(t.dyn[i],x.legend||x.text||x.y);
},this);
}
}else{
if(this._isReversal()){
s=s.reverse();
}
_1.forEach(s,function(x){
this._addLabel(x.dyn,x.legend||x.name);
},this);
}
},_addLabel:function(_b,_c){
var _d=_1.create("td"),_e=_1.create("div",null,_d),_f=_1.create("label",null,_d),div=_1.create("div",{style:{"width":this.swatchSize+"px","height":this.swatchSize+"px","float":"left"}},_e);
_1.addClass(_e,"dojoxLegendIcon dijitInline");
_1.addClass(_f,"dojoxLegendText");
if(this._tr){
this._tr.appendChild(_d);
if(++this._inrow===this.horizontal){
this._tr=_1.create("tr",null,this.legendBody);
this._inrow=0;
}
}else{
var tr=_1.create("tr",null,this.legendBody);
tr.appendChild(_d);
}
this._makeIcon(div,_b);
_f.innerHTML=String(_c);
_f.dir=this.getTextDir(_c,_f.dir);
},_makeIcon:function(div,dyn){
var mb={h:this.swatchSize,w:this.swatchSize};
var _10=_5.createSurface(div,mb.w,mb.h);
this._surfaces.push(_10);
if(dyn.fill){
_10.createRect({x:2,y:2,width:mb.w-4,height:mb.h-4}).setFill(dyn.fill).setStroke(dyn.stroke);
}else{
if(dyn.stroke||dyn.marker){
var _11={x1:0,y1:mb.h/2,x2:mb.w,y2:mb.h/2};
if(dyn.stroke){
_10.createLine(_11).setStroke(dyn.stroke);
}
if(dyn.marker){
var c={x:mb.w/2,y:mb.h/2};
if(dyn.stroke){
_10.createPath({path:"M"+c.x+" "+c.y+" "+dyn.marker}).setFill(dyn.stroke.color).setStroke(dyn.stroke);
}else{
_10.createPath({path:"M"+c.x+" "+c.y+" "+dyn.marker}).setFill(dyn.color).setStroke(dyn.color);
}
}
}else{
_10.createRect({x:2,y:2,width:mb.w-4,height:mb.h-4}).setStroke("black");
_10.createLine({x1:2,y1:2,x2:mb.w-2,y2:mb.h-2}).setStroke("black");
_10.createLine({x1:2,y1:mb.h-2,x2:mb.w-2,y2:2}).setStroke("black");
}
}
},_isReversal:function(){
return (!this.horizontal)&&_1.some(this.chart.stack,function(_12){
return _6.test(_12.declaredClass);
});
}});
});
