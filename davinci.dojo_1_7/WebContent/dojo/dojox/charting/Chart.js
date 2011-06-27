/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/Chart",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/Color","./Element","./Theme","./Series","./axis2d/common","dojox/gfx","dojox/lang/functional","dojox/lang/functional/fold","dojox/lang/functional/reversed"],function(_1,_2,_3,_4,_5,_6,_7,_8,g,df){
var dc=dojox.charting,_9=df.lambda("item.clear()"),_a=df.lambda("item.purgeGroup()"),_b=df.lambda("item.destroy()"),_c=df.lambda("item.dirty = false"),_d=df.lambda("item.dirty = true"),_e=df.lambda("item.name");
_1.declare("dojox.charting.Chart",null,{constructor:function(_f,_10){
if(!_10){
_10={};
}
this.margins=_10.margins?_10.margins:{l:10,t:10,r:10,b:10};
this.stroke=_10.stroke;
this.fill=_10.fill;
this.delayInMs=_10.delayInMs||200;
this.title=_10.title;
this.titleGap=_10.titleGap;
this.titlePos=_10.titlePos;
this.titleFont=_10.titleFont;
this.titleFontColor=_10.titleFontColor;
this.chartTitle=null;
this.theme=null;
this.axes={};
this.stack=[];
this.plots={};
this.series=[];
this.runs={};
this.dirty=true;
this.coords=null;
this.node=_1.byId(_f);
var box=_1.marginBox(_f);
this.surface=g.createSurface(this.node,box.w||400,box.h||300);
},destroy:function(){
_1.forEach(this.series,_b);
_1.forEach(this.stack,_b);
df.forIn(this.axes,_b);
if(this.chartTitle&&this.chartTitle.tagName){
_1.destroy(this.chartTitle);
}
this.surface.destroy();
},getCoords:function(){
if(!this.coords){
this.coords=_1.coords(this.node,true);
}
return this.coords;
},setTheme:function(_11){
this.theme=_11.clone();
this.dirty=true;
return this;
},addAxis:function(_12,_13){
var _14,_15=_13&&_13.type||"Default";
if(typeof _15=="string"){
if(!dc.axis2d||!dc.axis2d[_15]){
throw Error("Can't find axis: "+_15+" - didn't you forget to dojo"+".require() it?");
}
_14=new dc.axis2d[_15](this,_13);
}else{
_14=new _15(this,_13);
}
_14.name=_12;
_14.dirty=true;
if(_12 in this.axes){
this.axes[_12].destroy();
}
this.axes[_12]=_14;
this.dirty=true;
return this;
},getAxis:function(_16){
return this.axes[_16];
},removeAxis:function(_17){
if(_17 in this.axes){
this.axes[_17].destroy();
delete this.axes[_17];
this.dirty=true;
}
return this;
},addPlot:function(_18,_19){
var _1a,_1b=_19&&_19.type||"Default";
if(typeof _1b=="string"){
if(!dc.plot2d||!dc.plot2d[_1b]){
throw Error("Can't find plot: "+_1b+" - didn't you forget to dojo"+".require() it?");
}
_1a=new dc.plot2d[_1b](this,_19);
}else{
_1a=new _1b(this,_19);
}
_1a.name=_18;
_1a.dirty=true;
if(_18 in this.plots){
this.stack[this.plots[_18]].destroy();
this.stack[this.plots[_18]]=_1a;
}else{
this.plots[_18]=this.stack.length;
this.stack.push(_1a);
}
this.dirty=true;
return this;
},getPlot:function(_1c){
return this.stack[this.plots[_1c]];
},removePlot:function(_1d){
if(_1d in this.plots){
var _1e=this.plots[_1d];
delete this.plots[_1d];
this.stack[_1e].destroy();
this.stack.splice(_1e,1);
df.forIn(this.plots,function(idx,_1f,_20){
if(idx>_1e){
_20[_1f]=idx-1;
}
});
var ns=_1.filter(this.series,function(run){
return run.plot!=_1d;
});
if(ns.length<this.series.length){
_1.forEach(this.series,function(run){
if(run.plot==_1d){
run.destroy();
}
});
this.runs={};
_1.forEach(ns,function(run,_21){
this.runs[run.plot]=_21;
},this);
this.series=ns;
}
this.dirty=true;
}
return this;
},getPlotOrder:function(){
return df.map(this.stack,_e);
},setPlotOrder:function(_22){
var _23={},_24=df.filter(_22,function(_25){
if(!(_25 in this.plots)||(_25 in _23)){
return false;
}
_23[_25]=1;
return true;
},this);
if(_24.length<this.stack.length){
df.forEach(this.stack,function(_26){
var _27=_26.name;
if(!(_27 in _23)){
_24.push(_27);
}
});
}
var _28=df.map(_24,function(_29){
return this.stack[this.plots[_29]];
},this);
df.forEach(_28,function(_2a,i){
this.plots[_2a.name]=i;
},this);
this.stack=_28;
this.dirty=true;
return this;
},movePlotToFront:function(_2b){
if(_2b in this.plots){
var _2c=this.plots[_2b];
if(_2c){
var _2d=this.getPlotOrder();
_2d.splice(_2c,1);
_2d.unshift(_2b);
return this.setPlotOrder(_2d);
}
}
return this;
},movePlotToBack:function(_2e){
if(_2e in this.plots){
var _2f=this.plots[_2e];
if(_2f<this.stack.length-1){
var _30=this.getPlotOrder();
_30.splice(_2f,1);
_30.push(_2e);
return this.setPlotOrder(_30);
}
}
return this;
},addSeries:function(_31,_32,_33){
var run=new _7(this,_32,_33);
run.name=_31;
if(_31 in this.runs){
this.series[this.runs[_31]].destroy();
this.series[this.runs[_31]]=run;
}else{
this.runs[_31]=this.series.length;
this.series.push(run);
}
this.dirty=true;
if(!("ymin" in run)&&"min" in run){
run.ymin=run.min;
}
if(!("ymax" in run)&&"max" in run){
run.ymax=run.max;
}
return this;
},getSeries:function(_34){
return this.series[this.runs[_34]];
},removeSeries:function(_35){
if(_35 in this.runs){
var _36=this.runs[_35];
delete this.runs[_35];
this.series[_36].destroy();
this.series.splice(_36,1);
df.forIn(this.runs,function(idx,_37,_38){
if(idx>_36){
_38[_37]=idx-1;
}
});
this.dirty=true;
}
return this;
},updateSeries:function(_39,_3a){
if(_39 in this.runs){
var run=this.series[this.runs[_39]];
run.update(_3a);
this._invalidateDependentPlots(run.plot,false);
this._invalidateDependentPlots(run.plot,true);
}
return this;
},getSeriesOrder:function(_3b){
return df.map(df.filter(this.series,function(run){
return run.plot==_3b;
}),_e);
},setSeriesOrder:function(_3c){
var _3d,_3e={},_3f=df.filter(_3c,function(_40){
if(!(_40 in this.runs)||(_40 in _3e)){
return false;
}
var run=this.series[this.runs[_40]];
if(_3d){
if(run.plot!=_3d){
return false;
}
}else{
_3d=run.plot;
}
_3e[_40]=1;
return true;
},this);
df.forEach(this.series,function(run){
var _41=run.name;
if(!(_41 in _3e)&&run.plot==_3d){
_3f.push(_41);
}
});
var _42=df.map(_3f,function(_43){
return this.series[this.runs[_43]];
},this);
this.series=_42.concat(df.filter(this.series,function(run){
return run.plot!=_3d;
}));
df.forEach(this.series,function(run,i){
this.runs[run.name]=i;
},this);
this.dirty=true;
return this;
},moveSeriesToFront:function(_44){
if(_44 in this.runs){
var _45=this.runs[_44],_46=this.getSeriesOrder(this.series[_45].plot);
if(_44!=_46[0]){
_46.splice(_45,1);
_46.unshift(_44);
return this.setSeriesOrder(_46);
}
}
return this;
},moveSeriesToBack:function(_47){
if(_47 in this.runs){
var _48=this.runs[_47],_49=this.getSeriesOrder(this.series[_48].plot);
if(_47!=_49[_49.length-1]){
_49.splice(_48,1);
_49.push(_47);
return this.setSeriesOrder(_49);
}
}
return this;
},resize:function(_4a,_4b){
var box;
switch(arguments.length){
case 1:
box=_1.mixin({},_4a);
_1.marginBox(this.node,box);
break;
case 2:
box={w:_4a,h:_4b};
_1.marginBox(this.node,box);
break;
}
box=_1.marginBox(this.node);
var d=this.surface.getDimensions();
if(d.width!=box.w||d.height!=box.h){
this.surface.setDimensions(box.w,box.h);
this.dirty=true;
this.coords=null;
return this.render();
}else{
return this;
}
},getGeometry:function(){
var ret={};
df.forIn(this.axes,function(_4c){
if(_4c.initialized()){
ret[_4c.name]={name:_4c.name,vertical:_4c.vertical,scaler:_4c.scaler,ticks:_4c.ticks};
}
});
return ret;
},setAxisWindow:function(_4d,_4e,_4f,_50){
var _51=this.axes[_4d];
if(_51){
_51.setWindow(_4e,_4f);
_1.forEach(this.stack,function(_52){
if(_52.hAxis==_4d||_52.vAxis==_4d){
_52.zoom=_50;
}
});
}
return this;
},setWindow:function(sx,sy,dx,dy,_53){
if(!("plotArea" in this)){
this.calculateGeometry();
}
df.forIn(this.axes,function(_54){
var _55,_56,_57=_54.getScaler().bounds,s=_57.span/(_57.upper-_57.lower);
if(_54.vertical){
_55=sy;
_56=dy/s/_55;
}else{
_55=sx;
_56=dx/s/_55;
}
_54.setWindow(_55,_56);
});
_1.forEach(this.stack,function(_58){
_58.zoom=_53;
});
return this;
},zoomIn:function(_59,_5a){
var _5b=this.axes[_59];
if(_5b){
var _5c,_5d,_5e=_5b.getScaler().bounds;
var _5f=Math.min(_5a[0],_5a[1]);
var _60=Math.max(_5a[0],_5a[1]);
_5f=_5a[0]<_5e.lower?_5e.lower:_5f;
_60=_5a[1]>_5e.upper?_5e.upper:_60;
_5c=(_5e.upper-_5e.lower)/(_60-_5f);
_5d=_5f-_5e.lower;
this.setAxisWindow(_59,_5c,_5d);
this.render();
}
},calculateGeometry:function(){
if(this.dirty){
return this.fullGeometry();
}
var _61=_1.filter(this.stack,function(_62){
return _62.dirty||(_62.hAxis&&this.axes[_62.hAxis].dirty)||(_62.vAxis&&this.axes[_62.vAxis].dirty);
},this);
_63(_61,this.plotArea);
return this;
},fullGeometry:function(){
this._makeDirty();
_1.forEach(this.stack,_9);
if(!this.theme){
this.setTheme(new _6(dojox.charting._def));
}
_1.forEach(this.series,function(run){
if(!(run.plot in this.plots)){
if(!dc.plot2d||!dc.plot2d.Default){
throw Error("Can't find plot: Default - didn't you forget to dojo"+".require() it?");
}
var _64=new dc.plot2d.Default(this,{});
_64.name=run.plot;
this.plots[run.plot]=this.stack.length;
this.stack.push(_64);
}
this.stack[this.plots[run.plot]].addSeries(run);
},this);
_1.forEach(this.stack,function(_65){
if(_65.hAxis){
_65.setAxis(this.axes[_65.hAxis]);
}
if(_65.vAxis){
_65.setAxis(this.axes[_65.vAxis]);
}
},this);
var dim=this.dim=this.surface.getDimensions();
dim.width=g.normalizedLength(dim.width);
dim.height=g.normalizedLength(dim.height);
df.forIn(this.axes,_9);
_63(this.stack,dim);
var _66=this.offsets={l:0,r:0,t:0,b:0};
df.forIn(this.axes,function(_67){
df.forIn(_67.getOffsets(),function(o,i){
_66[i]+=o;
});
});
if(this.title){
this.titleGap=(this.titleGap==0)?0:this.titleGap||this.theme.chart.titleGap||20;
this.titlePos=this.titlePos||this.theme.chart.titlePos||"top";
this.titleFont=this.titleFont||this.theme.chart.titleFont;
this.titleFontColor=this.titleFontColor||this.theme.chart.titleFontColor||"black";
var _68=g.normalizedLength(g.splitFontString(this.titleFont).size);
_66[this.titlePos=="top"?"t":"b"]+=(_68+this.titleGap);
}
df.forIn(this.margins,function(o,i){
_66[i]+=o;
});
this.plotArea={width:dim.width-_66.l-_66.r,height:dim.height-_66.t-_66.b};
df.forIn(this.axes,_9);
_63(this.stack,this.plotArea);
return this;
},render:function(){
if(this.theme){
this.theme.clear();
}
if(this.dirty){
return this.fullRender();
}
this.calculateGeometry();
df.forEachRev(this.stack,function(_69){
_69.render(this.dim,this.offsets);
},this);
df.forIn(this.axes,function(_6a){
_6a.render(this.dim,this.offsets);
},this);
this._makeClean();
if(this.surface.render){
this.surface.render();
}
return this;
},fullRender:function(){
this.fullGeometry();
var _6b=this.offsets,dim=this.dim,_6c;
_1.forEach(this.series,_a);
df.forIn(this.axes,_a);
_1.forEach(this.stack,_a);
if(this.chartTitle&&this.chartTitle.tagName){
_1.destroy(this.chartTitle);
}
this.surface.clear();
this.chartTitle=null;
var t=this.theme,_6d=t.plotarea&&t.plotarea.fill,_6e=t.plotarea&&t.plotarea.stroke,w=Math.max(0,dim.width-_6b.l-_6b.r),h=Math.max(0,dim.height-_6b.t-_6b.b),_6c={x:_6b.l-1,y:_6b.t-1,width:w+2,height:h+2};
if(_6d){
_6d=_5.prototype._shapeFill(_5.prototype._plotFill(_6d,dim,_6b),_6c);
this.surface.createRect(_6c).setFill(_6d);
}
if(_6e){
this.surface.createRect({x:_6b.l,y:_6b.t,width:w+1,height:h+1}).setStroke(_6e);
}
df.foldr(this.stack,function(z,_6f){
return _6f.render(dim,_6b),0;
},0);
_6d=this.fill!==undefined?this.fill:(t.chart&&t.chart.fill);
_6e=this.stroke!==undefined?this.stroke:(t.chart&&t.chart.stroke);
if(_6d=="inherit"){
var _70=this.node,_6d=new _1.Color(_1.style(_70,"backgroundColor"));
while(_6d.a==0&&_70!=document.documentElement){
_6d=new _1.Color(_1.style(_70,"backgroundColor"));
_70=_70.parentNode;
}
}
if(_6d){
_6d=_5.prototype._plotFill(_6d,dim,_6b);
if(_6b.l){
_6c={width:_6b.l,height:dim.height+1};
this.surface.createRect(_6c).setFill(_5.prototype._shapeFill(_6d,_6c));
}
if(_6b.r){
_6c={x:dim.width-_6b.r,width:_6b.r+1,height:dim.height+2};
this.surface.createRect(_6c).setFill(_5.prototype._shapeFill(_6d,_6c));
}
if(_6b.t){
_6c={width:dim.width+1,height:_6b.t};
this.surface.createRect(_6c).setFill(_5.prototype._shapeFill(_6d,_6c));
}
if(_6b.b){
_6c={y:dim.height-_6b.b,width:dim.width+1,height:_6b.b+2};
this.surface.createRect(_6c).setFill(_5.prototype._shapeFill(_6d,_6c));
}
}
if(_6e){
this.surface.createRect({width:dim.width-1,height:dim.height-1}).setStroke(_6e);
}
if(this.title){
var _71=(g.renderer=="canvas"),_72=_71||!_1.isIE&&!_1.isOpera?"html":"gfx",_73=g.normalizedLength(g.splitFontString(this.titleFont).size);
this.chartTitle=_8.createText[_72](this,this.surface,dim.width/2,this.titlePos=="top"?_73+this.margins.t:dim.height-this.margins.b,"middle",this.title,this.titleFont,this.titleFontColor);
}
df.forIn(this.axes,function(_74){
_74.render(dim,_6b);
});
this._makeClean();
if(this.surface.render){
this.surface.render();
}
return this;
},delayedRender:function(){
if(!this._delayedRenderHandle){
this._delayedRenderHandle=setTimeout(_1.hitch(this,function(){
clearTimeout(this._delayedRenderHandle);
this._delayedRenderHandle=null;
this.render();
}),this.delayInMs);
}
return this;
},connectToPlot:function(_75,_76,_77){
return _75 in this.plots?this.stack[this.plots[_75]].connect(_76,_77):null;
},fireEvent:function(_78,_79,_7a){
if(_78 in this.runs){
var _7b=this.series[this.runs[_78]].plot;
if(_7b in this.plots){
var _7c=this.stack[this.plots[_7b]];
if(_7c){
_7c.fireEvent(_78,_79,_7a);
}
}
}
return this;
},_makeClean:function(){
_1.forEach(this.axes,_c);
_1.forEach(this.stack,_c);
_1.forEach(this.series,_c);
this.dirty=false;
},_makeDirty:function(){
_1.forEach(this.axes,_d);
_1.forEach(this.stack,_d);
_1.forEach(this.series,_d);
this.dirty=true;
},_invalidateDependentPlots:function(_7d,_7e){
if(_7d in this.plots){
var _7f=this.stack[this.plots[_7d]],_80,_81=_7e?"vAxis":"hAxis";
if(_7f[_81]){
_80=this.axes[_7f[_81]];
if(_80&&_80.dependOnData()){
_80.dirty=true;
_1.forEach(this.stack,function(p){
if(p[_81]&&p[_81]==_7f[_81]){
p.dirty=true;
}
});
}
}else{
_7f.dirty=true;
}
}
}});
function _82(_83){
return {min:_83.hmin,max:_83.hmax};
};
function _84(_85){
return {min:_85.vmin,max:_85.vmax};
};
function _86(_87,h){
_87.hmin=h.min;
_87.hmax=h.max;
};
function _88(_89,v){
_89.vmin=v.min;
_89.vmax=v.max;
};
function _8a(_8b,_8c){
if(_8b&&_8c){
_8b.min=Math.min(_8b.min,_8c.min);
_8b.max=Math.max(_8b.max,_8c.max);
}
return _8b||_8c;
};
function _63(_8d,_8e){
var _8f={},_90={};
_1.forEach(_8d,function(_91){
var _92=_8f[_91.name]=_91.getSeriesStats();
if(_91.hAxis){
_90[_91.hAxis]=_8a(_90[_91.hAxis],_82(_92));
}
if(_91.vAxis){
_90[_91.vAxis]=_8a(_90[_91.vAxis],_84(_92));
}
});
_1.forEach(_8d,function(_93){
var _94=_8f[_93.name];
if(_93.hAxis){
_86(_94,_90[_93.hAxis]);
}
if(_93.vAxis){
_88(_94,_90[_93.vAxis]);
}
_93.initializeScalers(_8e,_94);
});
};
return dojox.charting.Chart;
});
