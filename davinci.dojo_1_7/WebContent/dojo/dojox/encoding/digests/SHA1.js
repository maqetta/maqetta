/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/digests/SHA1",["dojo/_base/kernel","dojox/encoding/digests/_base"],function(_1,_2){
_1.getObject("encoding.digests.SHA1",true,dojox);
var _3=8,_4=(1<<_3)-1;
function R(n,c){
return (n<<c)|(n>>>(32-c));
};
function FT(t,b,c,d){
if(t<20){
return (b&c)|((~b)&d);
}
if(t<40){
return b^c^d;
}
if(t<60){
return (b&c)|(b&d)|(c&d);
}
return b^c^d;
};
function KT(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
function _5(x,_6){
x[_6>>5]|=128<<(24-_6%32);
x[((_6+64>>9)<<4)+15]=_6;
var w=new Array(80),a=1732584193,b=-271733879,c=-1732584194,d=271733878,e=-1009589776;
for(var i=0;i<x.length;i+=16){
var _7=a,_8=b,_9=c,_a=d,_b=e;
for(var j=0;j<80;j++){
if(j<16){
w[j]=x[i+j];
}else{
w[j]=R(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
}
var t=_2.addWords(_2.addWords(R(a,5),FT(j,b,c,d)),_2.addWords(_2.addWords(e,w[j]),KT(j)));
e=d;
d=c;
c=R(b,30);
b=a;
a=t;
}
a=_2.addWords(a,_7);
b=_2.addWords(b,_8);
c=_2.addWords(c,_9);
d=_2.addWords(d,_a);
e=_2.addWords(e,_b);
}
return [a,b,c,d,e];
};
function _c(_d,_e){
var wa=_f(_e);
if(wa.length>16){
wa=_5(wa,_e.length*_3);
}
var _10=new Array(16),_11=new Array(16);
for(var i=0;i<16;i++){
_10[i]=wa[i]^909522486;
_11[i]=wa[i]^1549556828;
}
var _12=_5(_10.concat(_f(_d)),512+_d.length*_3);
return _5(_11.concat(_12),512+160);
};
function _f(s){
var wa=[];
for(var i=0,l=s.length*_3;i<l;i+=_3){
wa[i>>5]|=(s.charCodeAt(i/_3)&_4)<<(32-_3-i%32);
}
return wa;
};
function _13(wa){
var h="0123456789abcdef",s=[];
for(var i=0,l=wa.length*4;i<l;i++){
s.push(h.charAt((wa[i>>2]>>((3-i%4)*8+4))&15),h.charAt((wa[i>>2]>>((3-i%4)*8))&15));
}
return s.join("");
};
function _14(wa){
var s=[];
for(var i=0,l=wa.length*32;i<l;i+=_3){
s.push(String.fromCharCode((wa[i>>5]>>>(32-_3-i%32))&_4));
}
return s.join("");
};
function _15(wa){
var p="=",tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s=[];
for(var i=0,l=wa.length*4;i<l;i+=3){
var t=(((wa[i>>2]>>8*(3-i%4))&255)<<16)|(((wa[i+1>>2]>>8*(3-(i+1)%4))&255)<<8)|((wa[i+2>>2]>>8*(3-(i+2)%4))&255);
for(var j=0;j<4;j++){
if(i*8+j*6>wa.length*32){
s.push(p);
}else{
s.push(tab.charAt((t>>6*(3-j))&63));
}
}
}
return s.join("");
};
_2.SHA1=function(_16,_17){
var out=_17||_2.outputTypes.Base64;
var wa=_5(_f(_16),_16.length*_3);
switch(out){
case _2.outputTypes.Raw:
return wa;
case _2.outputTypes.Hex:
return _13(wa);
case _2.outputTypes.String:
return _14(wa);
default:
return _15(wa);
}
};
_2.SHA1._hmac=function(_18,key,_19){
var out=_19||_2.outputTypes.Base64;
var wa=_c(_18,key);
switch(out){
case _2.outputTypes.Raw:
return wa;
case _2.outputTypes.Hex:
return _13(wa);
case _2.outputTypes.String:
return _14(wa);
default:
return _15(wa);
}
};
return dojox.encoding.digests.SHA1;
});
