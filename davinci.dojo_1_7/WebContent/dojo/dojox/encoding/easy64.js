/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/easy64",["dojo/_base/kernel"],function(_1){
_1.getObject("encoding.easy64",true,dojox);
var c=function(_2,_3,_4){
for(var i=0;i<_3;i+=3){
_4.push(String.fromCharCode((_2[i]>>>2)+33),String.fromCharCode(((_2[i]&3)<<4)+(_2[i+1]>>>4)+33),String.fromCharCode(((_2[i+1]&15)<<2)+(_2[i+2]>>>6)+33),String.fromCharCode((_2[i+2]&63)+33));
}
};
dojox.encoding.easy64.encode=function(_5){
var _6=[],_7=_5.length%3,_8=_5.length-_7;
c(_5,_8,_6);
if(_7){
var t=_5.slice(_8);
while(t.length<3){
t.push(0);
}
c(t,3,_6);
for(var i=3;i>_7;_6.pop(),--i){
}
}
return _6.join("");
};
dojox.encoding.easy64.decode=function(_9){
var n=_9.length,r=[],b=[0,0,0,0],i,j,d;
for(i=0;i<n;i+=4){
for(j=0;j<4;++j){
b[j]=_9.charCodeAt(i+j)-33;
}
d=n-i;
for(j=d;j<4;b[++j]=0){
}
r.push((b[0]<<2)+(b[1]>>>4),((b[1]&15)<<4)+(b[2]>>>2),((b[2]&3)<<6)+b[3]);
for(j=d;j<4;++j,r.pop()){
}
}
return r;
};
return dojox.encoding.easy64;
});
