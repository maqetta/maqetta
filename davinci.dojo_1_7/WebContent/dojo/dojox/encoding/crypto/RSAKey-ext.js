/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/crypto/RSAKey-ext",["dojo/_base/kernel","dojox/encoding/crypto/RSAKey","dojox/math/BigInteger-ext"],function(_1,_2,_3){
_1.experimental("dojox.encoding.crypto.RSAKey-ext");
function _4(d,n){
var b=d.toByteArray();
for(var i=0,_5=b.length;i<_5&&!b[i];++i){
}
if(b.length-i!==n-1||b[i]!==2){
return null;
}
for(++i;b[i];){
if(++i>=_5){
return null;
}
}
var _6="";
while(++i<_5){
_6+=String.fromCharCode(b[i]);
}
return _6;
};
_1.extend(_2,{setPrivate:function(N,E,D){
if(N&&E&&N.length&&E.length){
this.n=new _3(N,16);
this.e=parseInt(E,16);
this.d=new _3(D,16);
}else{
throw new Error("Invalid RSA private key");
}
},setPrivateEx:function(N,E,D,P,Q,DP,DQ,C){
if(N&&E&&N.length&&E.length){
this.n=new _3(N,16);
this.e=parseInt(E,16);
this.d=new _3(D,16);
this.p=new _3(P,16);
this.q=new _3(Q,16);
this.dmp1=new _3(DP,16);
this.dmq1=new _3(DQ,16);
this.coeff=new _3(C,16);
}else{
throw new Error("Invalid RSA private key");
}
},generate:function(B,E){
var _7=this.rngf(),qs=B>>1;
this.e=parseInt(E,16);
var ee=new _3(E,16);
for(;;){
for(;;){
this.p=new _3(B-qs,1,_7);
if(!this.p.subtract(_3.ONE).gcd(ee).compareTo(_3.ONE)&&this.p.isProbablePrime(10)){
break;
}
}
for(;;){
this.q=new _3(qs,1,_7);
if(!this.q.subtract(_3.ONE).gcd(ee).compareTo(_3.ONE)&&this.q.isProbablePrime(10)){
break;
}
}
if(this.p.compareTo(this.q)<=0){
var t=this.p;
this.p=this.q;
this.q=t;
}
var p1=this.p.subtract(_3.ONE);
var q1=this.q.subtract(_3.ONE);
var _8=p1.multiply(q1);
if(!_8.gcd(ee).compareTo(_3.ONE)){
this.n=this.p.multiply(this.q);
this.d=ee.modInverse(_8);
this.dmp1=this.d.mod(p1);
this.dmq1=this.d.mod(q1);
this.coeff=this.q.modInverse(this.p);
break;
}
}
_7.destroy();
},decrypt:function(_9){
var c=new _3(_9,16),m;
if(!this.p||!this.q){
m=c.modPow(this.d,this.n);
}else{
var cp=c.mod(this.p).modPow(this.dmp1,this.p),cq=c.mod(this.q).modPow(this.dmq1,this.q);
while(cp.compareTo(cq)<0){
cp=cp.add(this.p);
}
m=cp.subtract(cq).multiply(this.coeff).mod(this.p).multiply(this.q).add(cq);
}
if(!m){
return null;
}
return _4(m,(this.n.bitLength()+7)>>3);
}});
return _2;
});
