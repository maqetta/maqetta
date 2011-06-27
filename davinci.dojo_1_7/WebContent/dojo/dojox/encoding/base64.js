/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/base64",["dojo/_base/kernel"],function(_1){
_1.getObject("encoding.base64",true,dojox);
var p="=";
var _2="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var _3=dojox.encoding;
_3.base64.encode=function(ba){
var s=[],l=ba.length;
var rm=l%3;
var x=l-rm;
for(var i=0;i<x;){
var t=ba[i++]<<16|ba[i++]<<8|ba[i++];
s.push(_2.charAt((t>>>18)&63));
s.push(_2.charAt((t>>>12)&63));
s.push(_2.charAt((t>>>6)&63));
s.push(_2.charAt(t&63));
}
switch(rm){
case 2:
var t=ba[i++]<<16|ba[i++]<<8;
s.push(_2.charAt((t>>>18)&63));
s.push(_2.charAt((t>>>12)&63));
s.push(_2.charAt((t>>>6)&63));
s.push(p);
break;
case 1:
var t=ba[i++]<<16;
s.push(_2.charAt((t>>>18)&63));
s.push(_2.charAt((t>>>12)&63));
s.push(p);
s.push(p);
break;
}
return s.join("");
};
_3.base64.decode=function(_4){
var s=_4.split(""),_5=[];
var l=s.length;
while(s[--l]==p){
}
for(var i=0;i<l;){
var t=_2.indexOf(s[i++])<<18;
if(i<=l){
t|=_2.indexOf(s[i++])<<12;
}
if(i<=l){
t|=_2.indexOf(s[i++])<<6;
}
if(i<=l){
t|=_2.indexOf(s[i++]);
}
_5.push((t>>>16)&255);
_5.push((t>>>8)&255);
_5.push(t&255);
}
while(_5[_5.length-1]==0){
_5.pop();
}
return _5;
};
return dojox.encoding.base64;
});
