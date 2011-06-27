/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/ascii85",["dojo/_base/kernel"],function(_1){
_1.getObject("encoding.ascii85",true,dojox);
var c=function(_2,_3,_4){
var i,j,n,b=[0,0,0,0,0];
for(i=0;i<_3;i+=4){
n=((_2[i]*256+_2[i+1])*256+_2[i+2])*256+_2[i+3];
if(!n){
_4.push("z");
}else{
for(j=0;j<5;b[j++]=n%85+33,n=Math.floor(n/85)){
}
}
_4.push(String.fromCharCode(b[4],b[3],b[2],b[1],b[0]));
}
};
dojox.encoding.ascii85.encode=function(_5){
var _6=[],_7=_5.length%4,_8=_5.length-_7;
c(_5,_8,_6);
if(_7){
var t=_5.slice(_8);
while(t.length<4){
t.push(0);
}
c(t,4,_6);
var x=_6.pop();
if(x=="z"){
x="!!!!!";
}
_6.push(x.substr(0,_7+1));
}
return _6.join("");
};
dojox.encoding.ascii85.decode=function(_9){
var n=_9.length,r=[],b=[0,0,0,0,0],i,j,t,x,y,d;
for(i=0;i<n;++i){
if(_9.charAt(i)=="z"){
r.push(0,0,0,0);
continue;
}
for(j=0;j<5;++j){
b[j]=_9.charCodeAt(i+j)-33;
}
d=n-i;
if(d<5){
for(j=d;j<4;b[++j]=0){
}
b[d]=85;
}
t=(((b[0]*85+b[1])*85+b[2])*85+b[3])*85+b[4];
x=t&255;
t>>>=8;
y=t&255;
t>>>=8;
r.push(t>>>8,t&255,y,x);
for(j=d;j<5;++j,r.pop()){
}
i+=4;
}
return r;
};
return dojox.encoding.ascii85;
});
