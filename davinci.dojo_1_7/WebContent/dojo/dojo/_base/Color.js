/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/Color",["./kernel","./array","./lang"],function(_1){
_1.Color=function(_2){
if(_2){
this.setColor(_2);
}
};
_1.Color.named={"black":[0,0,0],"silver":[192,192,192],"gray":[128,128,128],"white":[255,255,255],"maroon":[128,0,0],"red":[255,0,0],"purple":[128,0,128],"fuchsia":[255,0,255],"green":[0,128,0],"lime":[0,255,0],"olive":[128,128,0],"yellow":[255,255,0],"navy":[0,0,128],"blue":[0,0,255],"teal":[0,128,128],"aqua":[0,255,255],"transparent":_1.config.transparentColor||[255,255,255]};
_1.extend(_1.Color,{r:255,g:255,b:255,a:1,_set:function(r,g,b,a){
var t=this;
t.r=r;
t.g=g;
t.b=b;
t.a=a;
},setColor:function(_3){
if(_1.isString(_3)){
_1.colorFromString(_3,this);
}else{
if(_1.isArray(_3)){
_1.colorFromArray(_3,this);
}else{
this._set(_3.r,_3.g,_3.b,_3.a);
if(!(_3 instanceof _1.Color)){
this.sanitize();
}
}
}
return this;
},sanitize:function(){
return this;
},toRgb:function(){
var t=this;
return [t.r,t.g,t.b];
},toRgba:function(){
var t=this;
return [t.r,t.g,t.b,t.a];
},toHex:function(){
var _4=_1.map(["r","g","b"],function(x){
var s=this[x].toString(16);
return s.length<2?"0"+s:s;
},this);
return "#"+_4.join("");
},toCss:function(_5){
var t=this,_6=t.r+", "+t.g+", "+t.b;
return (_5?"rgba("+_6+", "+t.a:"rgb("+_6)+")";
},toString:function(){
return this.toCss(true);
}});
_1.Color.blendColors=_1.blendColors=function(_7,_8,_9,_a){
var t=_a||new _1.Color();
_1.forEach(["r","g","b","a"],function(x){
t[x]=_7[x]+(_8[x]-_7[x])*_9;
if(x!="a"){
t[x]=Math.round(t[x]);
}
});
return t.sanitize();
};
_1.Color.fromRgb=_1.colorFromRgb=function(_b,_c){
var m=_b.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
return m&&_1.colorFromArray(m[1].split(/\s*,\s*/),_c);
};
_1.Color.fromHex=_1.colorFromHex=function(_d,_e){
var t=_e||new _1.Color(),_f=(_d.length==4)?4:8,_10=(1<<_f)-1;
_d=Number("0x"+_d.substr(1));
if(isNaN(_d)){
return null;
}
_1.forEach(["b","g","r"],function(x){
var c=_d&_10;
_d>>=_f;
t[x]=_f==4?17*c:c;
});
t.a=1;
return t;
};
_1.Color.fromArray=_1.colorFromArray=function(a,obj){
var t=obj||new _1.Color();
t._set(Number(a[0]),Number(a[1]),Number(a[2]),Number(a[3]));
if(isNaN(t.a)){
t.a=1;
}
return t.sanitize();
};
_1.Color.fromString=_1.colorFromString=function(str,obj){
var a=_1.Color.named[str];
return a&&_1.colorFromArray(a,obj)||_1.colorFromRgb(str,obj)||_1.colorFromHex(str,obj);
};
return _1.Color;
});
