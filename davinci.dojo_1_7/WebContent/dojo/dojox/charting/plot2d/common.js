/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot2d/common",["dojo/_base/kernel","../../main","dojo/_base/lang","dojo/_base/array","dojo/_base/Color","dojox/gfx","dojox/lang/functional"],function(_1,_2,_3,_4,_5,g,df){
var _6=_1.getObject("charting.plot2.common",true,_2);
return _1.mixin(_6,{makeStroke:function(_7){
if(!_7){
return _7;
}
if(typeof _7=="string"||_7 instanceof _1.Color){
_7={color:_7};
}
return g.makeParameters(g.defaultStroke,_7);
},augmentColor:function(_8,_9){
var t=new _1.Color(_8),c=new _1.Color(_9);
c.a=t.a;
return c;
},augmentStroke:function(_a,_b){
var s=_6.makeStroke(_a);
if(s){
s.color=_6.augmentColor(s.color,_b);
}
return s;
},augmentFill:function(_c,_d){
var fc,c=new _1.Color(_d);
if(typeof _c=="string"||_c instanceof _1.Color){
return _6.augmentColor(_c,_d);
}
return _c;
},defaultStats:{vmin:Number.POSITIVE_INFINITY,vmax:Number.NEGATIVE_INFINITY,hmin:Number.POSITIVE_INFINITY,hmax:Number.NEGATIVE_INFINITY},collectSimpleStats:function(_e){
var _f=_1.delegate(_6.defaultStats);
for(var i=0;i<_e.length;++i){
var run=_e[i];
for(var j=0;j<run.data.length;j++){
if(run.data[j]!==null){
if(typeof run.data[j]=="number"){
var _10=_f.vmin,_11=_f.vmax;
if(!("ymin" in run)||!("ymax" in run)){
_1.forEach(run.data,function(val,i){
if(val!==null){
var x=i+1,y=val;
if(isNaN(y)){
y=0;
}
_f.hmin=Math.min(_f.hmin,x);
_f.hmax=Math.max(_f.hmax,x);
_f.vmin=Math.min(_f.vmin,y);
_f.vmax=Math.max(_f.vmax,y);
}
});
}
if("ymin" in run){
_f.vmin=Math.min(_10,run.ymin);
}
if("ymax" in run){
_f.vmax=Math.max(_11,run.ymax);
}
}else{
var _12=_f.hmin,_13=_f.hmax,_10=_f.vmin,_11=_f.vmax;
if(!("xmin" in run)||!("xmax" in run)||!("ymin" in run)||!("ymax" in run)){
_1.forEach(run.data,function(val,i){
if(val!==null){
var x="x" in val?val.x:i+1,y=val.y;
if(isNaN(x)){
x=0;
}
if(isNaN(y)){
y=0;
}
_f.hmin=Math.min(_f.hmin,x);
_f.hmax=Math.max(_f.hmax,x);
_f.vmin=Math.min(_f.vmin,y);
_f.vmax=Math.max(_f.vmax,y);
}
});
}
if("xmin" in run){
_f.hmin=Math.min(_12,run.xmin);
}
if("xmax" in run){
_f.hmax=Math.max(_13,run.xmax);
}
if("ymin" in run){
_f.vmin=Math.min(_10,run.ymin);
}
if("ymax" in run){
_f.vmax=Math.max(_11,run.ymax);
}
}
break;
}
}
}
return _f;
},calculateBarSize:function(_14,opt,_15){
if(!_15){
_15=1;
}
var gap=opt.gap,_16=(_14-2*gap)/_15;
if("minBarSize" in opt){
_16=Math.max(_16,opt.minBarSize);
}
if("maxBarSize" in opt){
_16=Math.min(_16,opt.maxBarSize);
}
_16=Math.max(_16,1);
gap=(_14-_16*_15)/2;
return {size:_16,gap:gap};
},collectStackedStats:function(_17){
var _18=_1.clone(_6.defaultStats);
if(_17.length){
_18.hmin=Math.min(_18.hmin,1);
_18.hmax=df.foldl(_17,"seed, run -> Math.max(seed, run.data.length)",_18.hmax);
for(var i=0;i<_18.hmax;++i){
var v=_17[0].data[i];
v=v&&(typeof v=="number"?v:v.y);
if(isNaN(v)){
v=0;
}
_18.vmin=Math.min(_18.vmin,v);
for(var j=1;j<_17.length;++j){
var t=_17[j].data[i];
t=t&&(typeof t=="number"?t:t.y);
if(isNaN(t)){
t=0;
}
v+=t;
}
_18.vmax=Math.max(_18.vmax,v);
}
}
return _18;
},curve:function(a,_19){
var arr=a.slice(0);
if(_19=="x"){
arr[arr.length]=arr[0];
}
var p=_1.map(arr,function(_1a,i){
if(i==0){
return "M"+_1a.x+","+_1a.y;
}
if(!isNaN(_19)){
var dx=_1a.x-arr[i-1].x,dy=arr[i-1].y;
return "C"+(_1a.x-(_19-1)*(dx/_19))+","+dy+" "+(_1a.x-(dx/_19))+","+_1a.y+" "+_1a.x+","+_1a.y;
}else{
if(_19=="X"||_19=="x"||_19=="S"){
var p0,p1=arr[i-1],p2=arr[i],p3;
var _1b,_1c,_1d,_1e;
var f=1/6;
if(i==1){
if(_19=="x"){
p0=arr[arr.length-2];
}else{
p0=p1;
}
f=1/3;
}else{
p0=arr[i-2];
}
if(i==(arr.length-1)){
if(_19=="x"){
p3=arr[1];
}else{
p3=p2;
}
f=1/3;
}else{
p3=arr[i+1];
}
var _1f=Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
var _20=Math.sqrt((p2.x-p0.x)*(p2.x-p0.x)+(p2.y-p0.y)*(p2.y-p0.y));
var _21=Math.sqrt((p3.x-p1.x)*(p3.x-p1.x)+(p3.y-p1.y)*(p3.y-p1.y));
var _22=_20*f;
var _23=_21*f;
if(_22>_1f/2&&_23>_1f/2){
_22=_1f/2;
_23=_1f/2;
}else{
if(_22>_1f/2){
_22=_1f/2;
_23=_1f/2*_21/_20;
}else{
if(_23>_1f/2){
_23=_1f/2;
_22=_1f/2*_20/_21;
}
}
}
if(_19=="S"){
if(p0==p1){
_22=0;
}
if(p2==p3){
_23=0;
}
}
_1b=p1.x+_22*(p2.x-p0.x)/_20;
_1c=p1.y+_22*(p2.y-p0.y)/_20;
_1d=p2.x-_23*(p3.x-p1.x)/_21;
_1e=p2.y-_23*(p3.y-p1.y)/_21;
}
}
return "C"+(_1b+","+_1c+" "+_1d+","+_1e+" "+p2.x+","+p2.y);
});
return p.join(" ");
},getLabel:function(_24,_25,_26){
if(_1.number){
return (_25?_1.number.format(_24,{places:_26}):_1.number.format(_24))||"";
}
return _25?_24.toFixed(_26):_24.toString();
}});
});
