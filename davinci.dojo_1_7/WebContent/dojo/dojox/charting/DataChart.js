/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/DataChart",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/html","dojo/_base/connect","./Chart2D","./themes/PlotKit/blue"],function(_1,_2,_3,_4,_5,_6,_7){
_1.experimental("dojox.charting.DataChart");
var _8={vertical:true,min:0,max:10,majorTickStep:5,minorTickStep:1,natural:false,stroke:"black",majorTick:{stroke:"black",length:8},minorTick:{stroke:"gray",length:2},majorLabels:true};
var _9={natural:true,majorLabels:true,includeZero:false,majorTickStep:1,majorTick:{stroke:"black",length:8},fixUpper:"major",stroke:"black",htmlLabels:true,from:1};
var _a={markers:true,tension:2,gap:2};
return _1.declare("dojox.charting.DataChart",dojox.charting.Chart2D,{scroll:true,comparative:false,query:"*",queryOptions:"",fieldName:"value",chartTheme:_7,displayRange:0,stretchToFit:true,minWidth:200,minHeight:100,showing:true,label:"name",constructor:function(_b,_c){
this.domNode=_1.byId(_b);
_1.mixin(this,_c);
this.xaxis=_1.mixin(_1.mixin({},_9),_c.xaxis);
if(this.xaxis.labelFunc=="seriesLabels"){
this.xaxis.labelFunc=_1.hitch(this,"seriesLabels");
}
this.yaxis=_1.mixin(_1.mixin({},_8),_c.yaxis);
if(this.yaxis.labelFunc=="seriesLabels"){
this.yaxis.labelFunc=_1.hitch(this,"seriesLabels");
}
this._events=[];
this.convertLabels(this.yaxis);
this.convertLabels(this.xaxis);
this.onSetItems={};
this.onSetInterval=0;
this.dataLength=0;
this.seriesData={};
this.seriesDataBk={};
this.firstRun=true;
this.dataOffset=0;
this.chartTheme.plotarea.stroke={color:"gray",width:3};
this.setTheme(this.chartTheme);
if(this.displayRange){
this.stretchToFit=false;
}
if(!this.stretchToFit){
this.xaxis.to=this.displayRange;
}
this.addAxis("x",this.xaxis);
this.addAxis("y",this.yaxis);
_a.type=_c.type||"Markers";
this.addPlot("default",_1.mixin(_a,_c.chartPlot));
this.addPlot("grid",_1.mixin(_c.grid||{},{type:"Grid",hMinorLines:true}));
if(this.showing){
this.render();
}
if(_c.store){
this.setStore(_c.store,_c.query,_c.fieldName,_c.queryOptions);
}
},destroy:function(){
_1.forEach(this._events,_1.disconnect);
this.inherited(arguments);
},setStore:function(_d,_e,_f,_10){
this.firstRun=true;
this.store=_d||this.store;
this.query=_e||this.query;
this.fieldName=_f||this.fieldName;
this.label=this.store.getLabelAttributes();
this.queryOptions=_10||_10;
_1.forEach(this._events,_1.disconnect);
this._events=[_1.connect(this.store,"onSet",this,"onSet"),_1.connect(this.store,"onError",this,"onError")];
this.fetch();
},show:function(){
if(!this.showing){
_1.style(this.domNode,"display","");
this.showing=true;
this.render();
}
},hide:function(){
if(this.showing){
_1.style(this.domNode,"display","none");
this.showing=false;
}
},onSet:function(_11){
var nm=this.getProperty(_11,this.label);
if(nm in this.runs||this.comparative){
clearTimeout(this.onSetInterval);
if(!this.onSetItems[nm]){
this.onSetItems[nm]=_11;
}
this.onSetInterval=setTimeout(_1.hitch(this,function(){
clearTimeout(this.onSetInterval);
var _12=[];
for(var nm in this.onSetItems){
_12.push(this.onSetItems[nm]);
}
this.onData(_12);
this.onSetItems={};
}),200);
}
},onError:function(err){
console.error("DataChart Error:",err);
},onDataReceived:function(_13){
},getProperty:function(_14,_15){
if(_15==this.label){
return this.store.getLabel(_14);
}
if(_15=="id"){
return this.store.getIdentity(_14);
}
var _16=this.store.getValues(_14,_15);
if(_16.length<2){
_16=this.store.getValue(_14,_15);
}
return _16;
},onData:function(_17){
if(!_17||!_17.length){
return;
}
if(this.items&&this.items.length!=_17.length){
_1.forEach(_17,function(m){
var id=this.getProperty(m,"id");
_1.forEach(this.items,function(m2,i){
if(this.getProperty(m2,"id")==id){
this.items[i]=m2;
}
},this);
},this);
_17=this.items;
}
if(this.stretchToFit){
this.displayRange=_17.length;
}
this.onDataReceived(_17);
this.items=_17;
if(this.comparative){
var nm="default";
this.seriesData[nm]=[];
this.seriesDataBk[nm]=[];
_1.forEach(_17,function(m,i){
var _18=this.getProperty(m,this.fieldName);
this.seriesData[nm].push(_18);
},this);
}else{
_1.forEach(_17,function(m,i){
var nm=this.store.getLabel(m);
if(!this.seriesData[nm]){
this.seriesData[nm]=[];
this.seriesDataBk[nm]=[];
}
var _19=this.getProperty(m,this.fieldName);
if(_1.isArray(_19)){
this.seriesData[nm]=_19;
}else{
if(!this.scroll){
var ar=_1.map(new Array(i+1),function(){
return 0;
});
ar.push(Number(_19));
this.seriesData[nm]=ar;
}else{
if(this.seriesDataBk[nm].length>this.seriesData[nm].length){
this.seriesData[nm]=this.seriesDataBk[nm];
}
this.seriesData[nm].push(Number(_19));
}
this.seriesDataBk[nm].push(Number(_19));
}
},this);
}
var _1a;
if(this.firstRun){
this.firstRun=false;
for(nm in this.seriesData){
this.addSeries(nm,this.seriesData[nm]);
_1a=this.seriesData[nm];
}
}else{
for(nm in this.seriesData){
_1a=this.seriesData[nm];
if(this.scroll&&_1a.length>this.displayRange){
this.dataOffset=_1a.length-this.displayRange-1;
_1a=_1a.slice(_1a.length-this.displayRange,_1a.length);
}
this.updateSeries(nm,_1a);
}
}
this.dataLength=_1a.length;
if(this.showing){
this.render();
}
},fetch:function(){
if(!this.store){
return;
}
this.store.fetch({query:this.query,queryOptions:this.queryOptions,start:this.start,count:this.count,sort:this.sort,onComplete:_1.hitch(this,function(_1b){
setTimeout(_1.hitch(this,function(){
this.onData(_1b);
}),0);
}),onError:_1.hitch(this,"onError")});
},convertLabels:function(_1c){
if(!_1c.labels||_1.isObject(_1c.labels[0])){
return null;
}
_1c.labels=_1.map(_1c.labels,function(ele,i){
return {value:i,text:ele};
});
return null;
},seriesLabels:function(val){
val--;
if(this.series.length<1||(!this.comparative&&val>this.series.length)){
return "-";
}
if(this.comparative){
return this.store.getLabel(this.items[val]);
}else{
for(var i=0;i<this.series.length;i++){
if(this.series[i].data[val]>0){
return this.series[i].name;
}
}
}
return "-";
},resizeChart:function(dim){
var w=Math.max(dim.w,this.minWidth);
var h=Math.max(dim.h,this.minHeight);
this.resize(w,h);
}});
});
