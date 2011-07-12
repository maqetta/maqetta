/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/text",["./_base/kernel","require","./has","./_base/xhr"],function(_1,_2,_3,_4){
var _5;
if(1){
_5=function(_6,_7,_8){
_4("GET",{url:_6,sync:_7,load:_8});
};
}else{
if(_2.getText){
_5=_2.getText;
}else{
console.error("dojo/text plugin failed to load because loader does not support getText");
}
}
var _9={},_a=1?function(id,_b){
var _c=_b.toAbsMid(id+"/x");
return _c.substring(0,_c.length-2);
}:function(id,_d){
return _d.toUrl(id);
},_e=function(_f){
if(_f){
_f=_f.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _10=_f.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_10){
_f=_10[1];
}
}else{
_f="";
}
return _f;
},_11={},_12={load:function(id,_13,_14){
var _15=id.split("!"),_16=_15.length>1,_17=_a(_15[0],_13),url=_13.toUrl(_15[0]),_18=_11,_19=function(_1a){
_9[_17]=_9[url]=_1a;
_14(_16?_e(_1a):_1a);
};
if(_17 in _9){
_18=_9[_17];
}else{
if(_17 in _13.cache){
_18=_13.cache[_17];
}else{
if(url in _9){
_18=_9[url];
}
}
}
if(_18===_11){
_5(url,!_13.async,_19);
}else{
_19(_18);
}
}};
_1.cache=function(_1b,url,_1c){
var key;
if(typeof _1b=="string"){
if(/\//.test(_1b)){
key=_1b;
_1c=url;
}else{
key=_2.toUrl(_1b.replace(/\./g,"/")+(url?("/"+url):""));
}
}else{
key=_1b+"";
_1c=url;
}
var val=(_1c!=undefined&&typeof _1c!="string")?_1c.value:_1c,_1d=_1c&&_1c.sanitize;
if(typeof val=="string"){
_9[key]=val;
return _1d?_e(val):val;
}else{
if(val===null){
delete _9[key];
return null;
}else{
if(!(key in _9)){
_5(key,true,function(_1e){
_9[key]=_1e;
});
}
return _1d?_e(_9[key]):_9[key];
}
}
};
return _12;
});
