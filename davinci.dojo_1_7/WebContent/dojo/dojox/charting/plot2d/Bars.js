/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot2d/Bars",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","./Base","./common","dojox/gfx/fx","dojox/lang/utils","dojox/lang/functional","dojox/lang/functional/reversed"],function(_1,_2,_3,_4,dc,fx,du,df,_5){
var _6=df.lambda("item.purgeGroup()");
return _1.declare("dojox.charting.plot2d.Bars",dojox.charting.plot2d.Base,{defaultParams:{hAxis:"x",vAxis:"y",gap:0,animate:null,enableCache:false},optionalParams:{minBarSize:1,maxBarSize:1,stroke:{},outline:{},shadow:{},fill:{},font:"",fontColor:""},constructor:function(_7,_8){
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_8);
du.updateWithPattern(this.opt,_8,this.optionalParams);
this.series=[];
this.hAxis=this.opt.hAxis;
this.vAxis=this.opt.vAxis;
this.animate=this.opt.animate;
},getSeriesStats:function(){
var _9=dc.collectSimpleStats(this.series),t;
_9.hmin-=0.5;
_9.hmax+=0.5;
t=_9.hmin,_9.hmin=_9.vmin,_9.vmin=t;
t=_9.hmax,_9.hmax=_9.vmax,_9.vmax=t;
return _9;
},createRect:function(_a,_b,_c){
var _d;
if(this.opt.enableCache&&_a._rectFreePool.length>0){
_d=_a._rectFreePool.pop();
_d.setShape(_c);
_b.add(_d);
}else{
_d=_b.createRect(_c);
}
if(this.opt.enableCache){
_a._rectUsePool.push(_d);
}
return _d;
},render:function(_e,_f){
if(this.zoom&&!this.isDataDirty()){
return this.performZoom(_e,_f);
}
this.dirty=this.isDirty();
this.resetEvents();
if(this.dirty){
_1.forEach(this.series,_6);
this._eventSeries={};
this.cleanGroup();
var s=this.group;
df.forEachRev(this.series,function(_10){
_10.cleanGroup(s);
});
}
var t=this.chart.theme,f,gap,_11,ht=this._hScaler.scaler.getTransformerFromModel(this._hScaler),vt=this._vScaler.scaler.getTransformerFromModel(this._vScaler),_12=Math.max(0,this._hScaler.bounds.lower),_13=ht(_12),_14=this.events();
f=dc.calculateBarSize(this._vScaler.bounds.scale,this.opt);
gap=f.gap;
_11=f.size;
for(var i=this.series.length-1;i>=0;--i){
var run=this.series[i];
if(!this.dirty&&!run.dirty){
t.skip();
this._reconnectEvents(run.name);
continue;
}
run.cleanGroup();
if(this.opt.enableCache){
run._rectFreePool=(run._rectFreePool?run._rectFreePool:[]).concat(run._rectUsePool?run._rectUsePool:[]);
run._rectUsePool=[];
}
var _15=t.next("bar",[this.opt,run]),s=run.group,_16=new Array(run.data.length);
for(var j=0;j<run.data.length;++j){
var _17=run.data[j];
if(_17!==null){
var v=typeof _17=="number"?_17:_17.y,hv=ht(v),_18=hv-_13,w=Math.abs(_18),_19=typeof _17!="number"?t.addMixin(_15,"bar",_17,true):t.post(_15,"bar");
if(w>=1&&_11>=1){
var _1a={x:_f.l+(v<_12?hv:_13),y:_e.height-_f.b-vt(j+1.5)+gap,width:w,height:_11};
var _1b=this._plotFill(_19.series.fill,_e,_f);
_1b=this._shapeFill(_1b,_1a);
var _1c=this.createRect(run,s,_1a).setFill(_1b).setStroke(_19.series.stroke);
run.dyn.fill=_1c.getFill();
run.dyn.stroke=_1c.getStroke();
if(_14){
var o={element:"bar",index:j,run:run,shape:_1c,x:v,y:j+1.5};
this._connectEvents(o);
_16[j]=o;
}
if(this.animate){
this._animateBar(_1c,_f.l+_13,-w);
}
}
}
}
this._eventSeries[run.name]=_16;
run.dirty=false;
}
this.dirty=false;
return this;
},_animateBar:function(_1d,_1e,_1f){
fx.animateTransform(_1.delegate({shape:_1d,duration:1200,transform:[{name:"translate",start:[_1e-(_1e/_1f),0],end:[0,0]},{name:"scale",start:[1/_1f,1],end:[1,1]},{name:"original"}]},this.animate)).play();
}});
});
