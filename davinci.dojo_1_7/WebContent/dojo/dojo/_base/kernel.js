/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/_base/kernel",["../has","./config","require","module"],function(_1,_2,_3,_4){
var i,p,_5={config:{},global:this,dijit:{},dojox:{}},_6={dojo:_5,dijit:_5.dijit,dojox:_5.dojox},_7={dojo:"dojo",dijit:"dijit",dojox:"dojox"},_8=_4.id.match(/[^\/]+/),_9=_8&&_8[0],_a=_2[_9+"Scope"]||_2.scopeMap||[];
for(i=0;i<_a.length;i++){
_7[_a[i][0]]=_a[i][1];
}
for(p in _6){
_6[p]._scopeName=_7[p];
if(!_2.noGlobals){
_5.global[_7[p]]=_6[p];
}
}
_5.config={};
for(p in _2){
_5.config[p]=_2[p];
_1.add(p,_2[p],0,1);
}
for(p in _2.has){
_1.add(p,_2.has[p],0,1);
}
if(1&&1){
_3.on("config",function(_b){
for(p in _b){
_1.add(p,_b[p]);
}
});
}
_5.baseUrl=_5.config.baseUrl=_3.baseUrl;
var _c="$Rev: 23930 $".match(/\d+/);
_5.version={major:1,minor:7,patch:0,flag:"b1",revision:_c?+_c[0]:NaN,toString:function(){
var v=_5.version;
return v.major+"."+v.minor+"."+v.patch+v.flag+" ("+v.revision+")";
}};
if(_2.modulePaths){
var _d={};
for(p in _2.modulePaths){
_d[p.replace(/\./g,"/")]=_2.modulePaths[p];
}
_3({paths:_d});
}
_2.locale&&(_5.locale=_2.locale);
_5.isAsync=!1||_3.async;
var _e=new Function("__scope","__text","return (__scope.eval || eval)(__text);");
_5.eval=function(_f){
return _e(_5.global,_f);
};
if(!_1("host-rhino")){
_5.exit=function(_10){
quit(_10);
};
}
true||_1.add("dojo-guarantee-console",1);
if(1){
typeof console!="undefined"||(console={});
var cn=["assert","count","debug","dir","dirxml","error","group","groupEnd","info","profile","profileEnd","time","timeEnd","trace","warn","log"];
var i=0,tn;
while((tn=cn[i++])){
if(!console[tn]){
(function(){
var tcn=tn+"";
console[tcn]=("log" in console)?function(){
var a=Array.apply({},arguments);
a.unshift(tcn+":");
console["log"](a.join(" "));
}:function(){
};
console[tcn]._fake=true;
})();
}
}
}
_1.add("bug-for-in-skips-shadowed",function(){
for(var i in {toString:1}){
return 0;
}
return 1;
});
if(_1("bug-for-in-skips-shadowed")){
var _11=_5._extraNames="hasOwnProperty.valueOf.isPrototypeOf.propertyIsEnumerable.toLocaleString.toString.constructor".split("."),_12=_11.length;
}
var _13={};
_5._mixin=function(_14,_15){
var _16,s,i;
for(_16 in _15){
s=_15[_16];
if(!(_16 in _14)||(_14[_16]!==s&&(!(_16 in _13)||_13[_16]!==s))){
_14[_16]=s;
}
}
if(_1("bug-for-in-skips-shadowed")){
if(_15){
for(i=0;i<_12;++i){
_16=_11[i];
s=_15[_16];
if(!(_16 in _14)||(_14[_16]!==s&&(!(_16 in _13)||_13[_16]!==s))){
_14[_16]=s;
}
}
}
}
return _14;
};
_5.mixin=function(obj,_17){
if(!obj){
obj={};
}
for(var i=1,l=arguments.length;i<l;i++){
_5._mixin(obj,arguments[i]);
}
return obj;
};
var _18=function(_19,_1a,_1b){
var p,i=0,_1c=_5.global;
if(!_1b){
if(!_19.length){
return _1c;
}else{
p=_19[i++];
try{
_1b=(_7[p]&&_5.global[_7[p]]);
}
catch(e){
}
_1b=_1b||(p in _1c?_1c[p]:(_1a?_1c[p]={}:undefined));
}
}
while(_1b&&(p=_19[i++])){
_1b=(p in _1b?_1b[p]:(_1a?_1b[p]={}:undefined));
}
return _1b;
};
_5.setObject=function(_1d,_1e,_1f){
var _20=_1d.split("."),p=_20.pop(),obj=_18(_20,true,_1f);
return obj&&p?(obj[p]=_1e):undefined;
};
_5.getObject=function(_21,_22,_23){
return _18(_21.split("."),_22,_23);
};
_5.exists=function(_24,obj){
return _5.getObject(_24,false,obj)!==undefined;
};
false&&_1.add("dojo-debug-messages",1);
if(0){
_5.deprecated=function(_25,_26,_27){
var _28="DEPRECATED: "+_25;
if(_26){
_28+=" "+_26;
}
if(_27){
_28+=" -- will be removed in version: "+_27;
}
console.warn(_28);
};
_5.experimental=function(_29,_2a){
var _2b="EXPERIMENTAL: "+_29+" -- APIs subject to change without notice.";
if(_2a){
_2b+=" "+_2a;
}
console.warn(_2b);
};
}else{
_5.deprecated=_5.experimental=function(){
};
}
_1.add("dojo-moduleUrl",1);
if(_1("dojo-moduleUrl")){
_5.moduleUrl=function(_2c,url){
return _3.toUrl(_2c.replace(/\./g,"/")+(url?("/"+url):"")+"/x.y").match(/(.+)\/x\.\y$/)[1];
};
}
return _5;
});
