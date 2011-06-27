/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/calc/toFrac",["dojo"],function(_1){
var a=[];
var _2=[2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,30,31,33,34,35,37,38,39,41,42,43,46,47,51,53,55,57,58,59,61,62,65,66,67,69,70,71,73,74,77,78,79,82,83,85,86,87,89,91,93,94,95,97];
var _3=false;
var i=-3;
var d=2;
var _4=1e-15/9;
function _5(_6){
var m,mt;
while(i<_2.length){
switch(i){
case -3:
m=1;
mt="";
break;
case -2:
m=Math.PI;
mt="pi";
break;
case -1:
m=Math.sqrt(Math.PI);
mt="√(pi)";
break;
default:
m=Math.sqrt(_2[i]);
mt="√("+_2[i]+")";
}
while(d<=100){
for(n=1;n<(m==1?d:100);n++){
var r=m*n/d;
var f=dojox.calc.approx(r);
if(!(f in a)){
if(n==d){
n=1;
d=1;
}
a[f]={n:n,d:d,m:m,mt:mt};
if(f==_6){
_6=undefined;
}
}
}
d++;
if(_6==undefined){
setTimeout(function(){
_5();
},1);
return;
}
}
d=2;
i++;
}
_3=true;
};
function _7(n){
return Math.floor(n)==n;
};
_5();
function _8(_9){
function _a(){
_5(_9);
return _8(_9);
};
_9=Math.abs(_9);
var f=a[dojox.calc.approx(_9)];
if(!f&&!_3){
return _a();
}
if(!f){
var i=Math.floor(_9);
if(i==0){
return _3?null:_a();
}
var n=_9%1;
if(n==0){
return {m:1,mt:1,n:_9,d:1};
}
f=a[dojox.calc.approx(n)];
if(!f||f.m!=1){
var _b=dojox.calc.approx(1/n);
return _7(_b)?{m:1,mt:1,n:1,d:_b}:(_3?null:_a());
}else{
return {m:1,mt:1,n:(i*f.d+f.n),d:f.d};
}
}
return f;
};
_1.mixin(dojox.calc,{toFrac:function(_c){
var f=_8(_c);
return f?((_c<0?"-":"")+(f.m==1?"":(f.n==1?"":(f.n+"*")))+(f.m==1?f.n:f.mt)+((f.d==1?"":"/"+f.d))):_c;
},pow:function(_d,_e){
if(_d>0||_7(_e)){
return Math.pow(_d,_e);
}else{
var f=_8(_e);
if(_d>=0){
return (f&&f.m==1)?Math.pow(Math.pow(_d,1/f.d),_e<0?-f.n:f.n):Math.pow(_d,_e);
}else{
return (f&&f.d&1)?Math.pow(Math.pow(-Math.pow(-_d,1/f.d),_e<0?-f.n:f.n),f.m):NaN;
}
}
}});
return dojox.calc.toFrac;
});
