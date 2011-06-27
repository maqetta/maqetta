/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/string",["./_base/kernel","./_base/lang"],function(_1){
_1.getObject("string",true,_1);
_1.string.rep=function(_2,_3){
if(_3<=0||!_2){
return "";
}
var _4=[];
for(;;){
if(_3&1){
_4.push(_2);
}
if(!(_3>>=1)){
break;
}
_2+=_2;
}
return _4.join("");
};
_1.string.pad=function(_5,_6,ch,_7){
if(!ch){
ch="0";
}
var _8=String(_5),_9=_1.string.rep(ch,Math.ceil((_6-_8.length)/ch.length));
return _7?_8+_9:_9+_8;
};
_1.string.substitute=function(_a,_b,_c,_d){
_d=_d||_1.global;
_c=_c?_1.hitch(_d,_c):function(v){
return v;
};
return _a.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_e,_f,_10){
var _11=_1.getObject(_f,false,_b);
if(_10){
_11=_1.getObject(_10,false,_d).call(_d,_11,_f);
}
return _c(_11,_f).toString();
});
};
_1.string.trim=String.prototype.trim?_1.trim:function(str){
str=str.replace(/^\s+/,"");
for(var i=str.length-1;i>=0;i--){
if(/\S/.test(str.charAt(i))){
str=str.substring(0,i+1);
break;
}
}
return str;
};
return _1.string;
});
