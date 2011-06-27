/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/openlayers/JsonImport",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/xhr","dojo/_base/lang","dojox/geo/openlayers/LineString","dojox/geo/openlayers/Collection","dojo/data/ItemFileReadStore","dojox/geo/openlayers/GeometryFeature"],function(_1,_2,_3,_4,_5,_6,_7,_8){
return _1.declare("dojox.geo.openlayers.JsonImport",null,{constructor:function(_9){
this._params=_9;
},loadData:function(){
var p=this._params;
_1.xhrGet({url:p.url,handleAs:"json",sync:true,load:_1.hitch(this,this._gotData),error:_1.hitch(this,this._loadError)});
},_gotData:function(_a){
var nf=this._params.nextFeature;
if(!_1.isFunction(nf)){
return;
}
var _b=_a.layerExtent;
var _c=_b[0];
var _d=_b[1];
var _e=_c+_b[2];
var _f=_d+_b[3];
var _10=_a.layerExtentLL;
var x1=_10[0];
var y1=_10[1];
var x2=x1+_10[2];
var y2=y1+_10[3];
var _11=x1;
var _12=y2;
var _13=x2;
var _14=y1;
var _15=_a.features;
for(var f in _15){
var o=_15[f];
var s=o["shape"];
var gf=null;
if(_1.isArray(s[0])){
var a=[];
_1.forEach(s,function(_16){
var ls=this._makeGeometry(_16,_c,_d,_e,_f,_11,_12,_13,_14);
a.push(ls);
},this);
var g=new _6(a);
gf=new _8(g);
nf.call(this,gf);
}else{
gf=this._makeFeature(s,_c,_d,_e,_f,_11,_12,_13,_14);
nf.call(this,gf);
}
}
var _17=this._params.complete;
if(_1.isFunction(_17)){
_17.call(this,_17);
}
},_makeGeometry:function(s,ulx,uly,lrx,lry,_18,_19,_1a,_1b){
var a=[];
var k=0;
for(var i=0;i<s.length-1;i+=2){
var x=s[i];
var y=s[i+1];
k=(x-ulx)/(lrx-ulx);
var px=k*(_1a-_18)+_18;
k=(y-uly)/(lry-uly);
var py=k*(_1b-_19)+_19;
a.push({x:px,y:py});
}
var ls=new _5(a);
return ls;
},_makeFeature:function(s,ulx,uly,lrx,lry,_1c,_1d,_1e,_1f){
var ls=this._makeGeometry(s,ulx,uly,lrx,lry,_1c,_1d,_1e,_1f);
var gf=new _8(ls);
return gf;
},_loadError:function(){
var f=this._params.error;
if(_1.isFunction(f)){
f.apply(this,parameters);
}
}});
});
