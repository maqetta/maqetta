/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot2d/ClusteredColumns",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","./Columns","./common","dojox/lang/functional","dojox/lang/functional/reversed","dojox/lang/utils"],function(_1,_2,_3,_4,dc,df,_5,du){
var _6=df.lambda("item.purgeGroup()");
return _1.declare("dojox.charting.plot2d.ClusteredColumns",dojox.charting.plot2d.Columns,{render:function(_7,_8){
if(this.zoom&&!this.isDataDirty()){
return this.performZoom(_7,_8);
}
this.resetEvents();
this.dirty=this.isDirty();
if(this.dirty){
_1.forEach(this.series,_6);
this._eventSeries={};
this.cleanGroup();
var s=this.group;
df.forEachRev(this.series,function(_9){
_9.cleanGroup(s);
});
}
var t=this.chart.theme,f,_a,_b,_c,ht=this._hScaler.scaler.getTransformerFromModel(this._hScaler),vt=this._vScaler.scaler.getTransformerFromModel(this._vScaler),_d=Math.max(0,this._vScaler.bounds.lower),_e=vt(_d),_f=this.events();
f=dc.calculateBarSize(this._hScaler.bounds.scale,this.opt,this.series.length);
_a=f.gap;
_b=_c=f.size;
for(var i=0;i<this.series.length;++i){
var run=this.series[i],_10=_c*i;
if(!this.dirty&&!run.dirty){
t.skip();
this._reconnectEvents(run.name);
continue;
}
run.cleanGroup();
var _11=t.next("column",[this.opt,run]),s=run.group,_12=new Array(run.data.length);
for(var j=0;j<run.data.length;++j){
var _13=run.data[j];
if(_13!==null){
var v=typeof _13=="number"?_13:_13.y,vv=vt(v),_14=vv-_e,h=Math.abs(_14),_15=typeof _13!="number"?t.addMixin(_11,"column",_13,true):t.post(_11,"column");
if(_b>=1&&h>=1){
var _16={x:_8.l+ht(j+0.5)+_a+_10,y:_7.height-_8.b-(v>_d?vv:_e),width:_b,height:h};
var _17=this._plotFill(_15.series.fill,_7,_8);
_17=this._shapeFill(_17,_16);
var _18=s.createRect(_16).setFill(_17).setStroke(_15.series.stroke);
run.dyn.fill=_18.getFill();
run.dyn.stroke=_18.getStroke();
if(_f){
var o={element:"column",index:j,run:run,shape:_18,x:j+0.5,y:v};
this._connectEvents(o);
_12[j]=o;
}
if(this.animate){
this._animateColumn(_18,_7.height-_8.b-_e,h);
}
}
}
}
this._eventSeries[run.name]=_12;
run.dirty=false;
}
this.dirty=false;
return this;
}});
});
