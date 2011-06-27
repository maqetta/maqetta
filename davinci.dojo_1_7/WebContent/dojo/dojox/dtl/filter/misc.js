/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/misc",["dojo/_base/kernel"],function(_1){
_1.getObject("dtl.filter.misc",true,dojox);
_1.mixin(dojox.dtl.filter.misc,{filesizeformat:function(_2){
_2=parseFloat(_2);
if(_2<1024){
return (_2==1)?_2+" byte":_2+" bytes";
}else{
if(_2<1024*1024){
return (_2/1024).toFixed(1)+" KB";
}else{
if(_2<1024*1024*1024){
return (_2/1024/1024).toFixed(1)+" MB";
}
}
}
return (_2/1024/1024/1024).toFixed(1)+" GB";
},pluralize:function(_3,_4){
_4=_4||"s";
if(_4.indexOf(",")==-1){
_4=","+_4;
}
var _5=_4.split(",");
if(_5.length>2){
return "";
}
var _6=_5[0];
var _7=_5[1];
if(parseInt(_3,10)!=1){
return _7;
}
return _6;
},_phone2numeric:{a:2,b:2,c:2,d:3,e:3,f:3,g:4,h:4,i:4,j:5,k:5,l:5,m:6,n:6,o:6,p:7,r:7,s:7,t:8,u:8,v:8,w:9,x:9,y:9},phone2numeric:function(_8){
var dm=dojox.dtl.filter.misc;
_8=_8+"";
var _9="";
for(var i=0;i<_8.length;i++){
var _a=_8.charAt(i).toLowerCase();
(dm._phone2numeric[_a])?_9+=dm._phone2numeric[_a]:_9+=_8.charAt(i);
}
return _9;
},pprint:function(_b){
return _1.toJson(_b);
}});
return dojox.dtl.filter.misc;
});
