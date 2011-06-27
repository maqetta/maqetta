/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/fx/ext-dojo/complex",["dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/Color","dojo/_base/fx"],function(_1){
_1.getObject("fx.ext-dojo.complex",true,dojox);
var da=_1.animateProperty;
_1.animateProperty=function(_2){
var d=_1;
var _3=da(_2);
_1.connect(_3,"beforeBegin",function(){
_3.curve.getValue=function(r){
var _4={};
for(var p in this._properties){
var _5=this._properties[p],_6=_5.start;
if(_6 instanceof d.Color){
_4[p]=d.blendColors(_6,_5.end,r,_5.tempColor).toCss();
}else{
if(_6 instanceof dojox.fx._Complex){
_4[p]=_6.getValue(r);
}else{
if(!d.isArray(_6)){
_4[p]=((_5.end-_6)*r)+_6+(p!="opacity"?_5.units||"px":0);
}
}
}
}
return _4;
};
var pm={};
for(var p in this.properties){
var o=this.properties[p];
if(typeof (o.start)=="string"&&/\(/.test(o.start)){
this.curve._properties[p].start=new dojox.fx._Complex(o);
}
}
});
return _3;
};
return _1.declare("dojox.fx._Complex",null,{PROP:/\([\w|,|+|\-|#|\.|\s]*\)/g,constructor:function(_7){
var _8=_7.start.match(this.PROP);
var _9=_7.end.match(this.PROP);
var _a=_1.map(_8,this.getProps,this);
var _b=_1.map(_9,this.getProps,this);
this._properties={};
this.strProp=_7.start;
_1.forEach(_a,function(_c,i){
_1.forEach(_c,function(p,j){
this.strProp=this.strProp.replace(p,"PROP_"+i+""+j);
this._properties["PROP_"+i+""+j]=this.makePropObject(p,_b[i][j]);
},this);
},this);
},getValue:function(r){
var _d=this.strProp,u;
for(var nm in this._properties){
var v,o=this._properties[nm];
if(o.units=="isColor"){
v=_1.blendColors(o.beg,o.end,r).toCss(false);
u="";
}else{
v=((o.end-o.beg)*r)+o.beg;
u=o.units;
}
_d=_d.replace(nm,v+u);
}
return _d;
},makePropObject:function(_e,_f){
var b=this.getNumAndUnits(_e);
var e=this.getNumAndUnits(_f);
return {beg:b.num,end:e.num,units:b.units};
},getProps:function(str){
str=str.substring(1,str.length-1);
var s;
if(/,/.test(str)){
str=str.replace(/\s/g,"");
s=str.split(",");
}else{
str=str.replace(/\s{2,}/g," ");
s=str.split(" ");
}
return s;
},getNumAndUnits:function(_10){
if(!_10){
return {};
}
if(/#/.test(_10)){
return {num:new _1.Color(_10),units:"isColor"};
}
var o={num:parseFloat(/-*[\d\.\d|\d]{1,}/.exec(_10).join(""))};
o.units=/[a-z]{1,}/.exec(_10);
o.units=o.units&&o.units.length?o.units.join(""):"";
return o;
}});
return dojox.fx;
});
