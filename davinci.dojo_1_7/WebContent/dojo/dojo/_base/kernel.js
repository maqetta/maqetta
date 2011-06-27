/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/kernel",["../has","./config","require","module"],function(_1,_2,_3,_4){
var i,p,_5={},_6={},_7={config:{},global:this,dijit:_5,dojox:_6},_8={dojo:["dojo",_7],dijit:["dijit",_5],dojox:["dojox",_6]},_9=_4.id.match(/[^\/]+/)[0],_a=_2[_9+"Scope"]||_2.scopeMap||[],_b=(new Date).getTime(),_c,_d,_e,_f;
for(i=0;i<_a.length;i++){
_c=_a[i],_d=_c[0],_e=_c[1]||(_d+"_"+i+_b),_f={dojo:_7,dijit:_5,dojox:_6}[_d]||_c[2]||{};
_8[_c]=[_e,_f];
}
for(p in _8){
_c=_8[p];
_c[1]._scopeName=_c[0];
if(!_2.noGlobals){
this[_c[0]]=_c[1];
}
}
_7.scopeMap=_8;
_7.config={};
for(p in _2){
_7.config[p]=_2[p];
_1.add("config-"+p,_2[p],0,1);
}
for(p in _2.has){
_1.add(p,_2.has[p],0,1);
}
if(1&&1){
_3.on("config",function(_10){
for(p in _10){
_1.add("config-"+p,_10[p]);
}
});
}
_7.baseUrl=_7.config.baseUrl=_3.baseUrl;
var rev="$Rev: 23930 $".match(/\d+/);
_7.version={major:1,minor:7,patch:0,flag:"b3",revision:rev?+rev[0]:NaN,toString:function(){
var v=_7.version;
return v.major+"."+v.minor+"."+v.patch+v.flag+" ("+v.revision+")";
}};
if(_2.modulePaths){
var _11={};
for(p in _2.modulePaths){
_11[p.replace(/\./g,"/")]=_2.modulePaths[p];
}
_3({paths:_11});
}
_2.locale&&(_7.locale=_2.locale);
_7.isAsync=!1||_3.async;
var _12=new Function("__scope","__text","return (__scope.eval || eval)(__text);");
_7.eval=function(_13){
return _12(_7.global,_13);
};
if(!_1("host-rhino")){
_7.exit=function(_14){
quit(_14);
};
}
true||_1.add("dojo-guarantee-console",1);
if(1){
typeof console!="undefined"||(console={});
var cn=["assert","count","debug","dir","dirxml","error","group","groupEnd","info","profile","profileEnd","time","timeEnd","trace","warn","log"];
var tn;
i=0;
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
var _15=_7._extraNames="hasOwnProperty.valueOf.isPrototypeOf.propertyIsEnumerable.toLocaleString.toString.constructor".split("."),_16=_15.length;
}
var _17={};
_7._mixin=function(_18,_19){
var _1a,s,i;
for(_1a in _19){
s=_19[_1a];
if(!(_1a in _18)||(_18[_1a]!==s&&(!(_1a in _17)||_17[_1a]!==s))){
_18[_1a]=s;
}
}
if(_1("bug-for-in-skips-shadowed")){
if(_19){
for(i=0;i<_16;++i){
_1a=_15[i];
s=_19[_1a];
if(!(_1a in _18)||(_18[_1a]!==s&&(!(_1a in _17)||_17[_1a]!==s))){
_18[_1a]=s;
}
}
}
}
return _18;
};
_7.mixin=function(obj,_1b){
if(!obj){
obj={};
}
for(var i=1,l=arguments.length;i<l;i++){
_7._mixin(obj,arguments[i]);
}
return obj;
};
var _1c=function(_1d,_1e,_1f){
var p,i=0,_20=_7.global;
if(!_1f){
if(!_1d.length){
return _20;
}else{
p=_1d[i++];
try{
_1f=(_8[p]&&_7.global[_8[p]]);
}
catch(e){
}
_1f=_1f||(p in _20?_20[p]:(_1e?_20[p]={}:undefined));
}
}
while(_1f&&(p=_1d[i++])){
_1f=(p in _1f?_1f[p]:(_1e?_1f[p]={}:undefined));
}
return _1f;
};
_7.setObject=function(_21,_22,_23){
var _24=_21.split("."),p=_24.pop(),obj=_1c(_24,true,_23);
return obj&&p?(obj[p]=_22):undefined;
};
_7.getObject=function(_25,_26,_27){
return _1c(_25.split("."),_26,_27);
};
_7.exists=function(_28,obj){
return _7.getObject(_28,false,obj)!==undefined;
};
false&&_1.add("dojo-debug-messages",1);
if(0){
_7.deprecated=function(_29,_2a,_2b){
var _2c="DEPRECATED: "+_29;
if(_2a){
_2c+=" "+_2a;
}
if(_2b){
_2c+=" -- will be removed in version: "+_2b;
}
console.warn(_2c);
};
_7.experimental=function(_2d,_2e){
var _2f="EXPERIMENTAL: "+_2d+" -- APIs subject to change without notice.";
if(_2e){
_2f+=" "+_2e;
}
console.warn(_2f);
};
}else{
_7.deprecated=_7.experimental=function(){
};
}
_1.add("dojo-moduleUrl",1);
if(_1("dojo-moduleUrl")){
_7.moduleUrl=function(_30,url){
_7.deprecated("dojo.moduleUrl()","use require.toUrl","2.0");
var _31=null;
if(_30){
_31=_3.toUrl(_30.replace(/\./g,"/")+(url?("/"+url):"")+"/*.*").match(/(.+)\/\*\.\*$/)[1]+(url?"":"/");
}
return _31;
};
}
return _7;
});
