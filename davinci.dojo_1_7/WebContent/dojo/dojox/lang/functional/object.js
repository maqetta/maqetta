/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/functional/object",["dojo/_base/kernel","./lambda"],function(_1,df){
var d=_1,_2={};
d.mixin(df,{keys:function(_3){
var t=[];
for(var i in _3){
if(!(i in _2)){
t.push(i);
}
}
return t;
},values:function(_4){
var t=[];
for(var i in _4){
if(!(i in _2)){
t.push(_4[i]);
}
}
return t;
},filterIn:function(_5,f,o){
o=o||d.global;
f=df.lambda(f);
var t={},v,i;
for(i in _5){
if(!(i in _2)){
v=_5[i];
if(f.call(o,v,i,_5)){
t[i]=v;
}
}
}
return t;
},forIn:function(_6,f,o){
o=o||d.global;
f=df.lambda(f);
for(var i in _6){
if(!(i in _2)){
f.call(o,_6[i],i,_6);
}
}
return o;
},mapIn:function(_7,f,o){
o=o||d.global;
f=df.lambda(f);
var t={},i;
for(i in _7){
if(!(i in _2)){
t[i]=f.call(o,_7[i],i,_7);
}
}
return t;
}});
return df;
});
