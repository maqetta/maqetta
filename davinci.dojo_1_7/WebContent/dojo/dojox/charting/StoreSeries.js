/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/StoreSeries",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","dojo/_base/Deferred"],function(_1){
return _1.declare("dojox.charting.StoreSeries",null,{constructor:function(_2,_3,_4){
this.store=_2;
this.kwArgs=_3;
if(_4){
if(typeof _4=="function"){
this.value=_4;
}else{
if(typeof _4=="object"){
this.value=function(_5){
var o={};
for(var _6 in _4){
o[_6]=_5[_4[_6]];
}
return o;
};
}else{
this.value=function(_7){
return _7[_4];
};
}
}
}else{
this.value=function(_8){
return _8.value;
};
}
this.data=[];
this.fetch();
},destroy:function(){
if(this.observeHandle){
this.observeHandle.dismiss();
}
},setSeriesObject:function(_9){
this.series=_9;
},fetch:function(){
var _a=this.objects=[];
var _b=this;
if(this.observeHandle){
this.observeHandle.dismiss();
}
var _c=this.store.query(this.kwArgs.query,this.kwArgs);
_1.when(_c,function(_d){
_b.objects=_d;
_e();
});
if(_c.observe){
this.observeHandle=_c.observe(_e,true);
}
function _e(){
_b.data=_1.map(_b.objects,function(_f){
return _b.value(_f,_b.store);
});
_b._pushDataChanges();
};
},_pushDataChanges:function(){
if(this.series){
this.series.chart.updateSeries(this.series.name,this);
this.series.chart.delayedRender();
}
}});
});
