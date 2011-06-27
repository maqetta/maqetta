/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
function rhinoDojoConfig(_1,_2,_3){
var _4=function(_5,_6){
print((_5?_5+":":"")+_6[0]);
for(var i=1;i<_6.length;i++){
print(", "+_6[i]);
}
};
console={log:function(){
_4(0,arguments);
},error:function(){
_4("ERROR",arguments);
},warn:function(){
_4("WARN",arguments);
}};
for(var _7=[],i=0;i<_3.length;i++){
var _8=(_3[i]+"").split("=");
if(_8[0]=="load"){
_7.push(_8[1]);
}
}
if(typeof setTimeout=="undefined"||typeof clearTimeout=="undefined"){
var _9=[];
clearTimeout=function(_a){
if(!_9[_a]){
return;
}
_9[_a].stop();
};
setTimeout=function(_b,_c){
var _d={sleepTime:_c,hasSlept:false,run:function(){
if(!this.hasSlept){
this.hasSlept=true;
java.lang.Thread.currentThread().sleep(this.sleepTime);
}
try{
_b();
}
catch(e){
}
}};
var _e=new java.lang.Runnable(_d);
var _f=new java.lang.Thread(_e);
_f.start();
return _9.push(_f)-1;
};
}
var _10=function(url){
return (new java.io.File(url)).exists();
};
var _11={"host-rhino":1,"host-browser":0,"dom":0,"dojo-has-api":1,"dojo-xhr-factory":0,"dojo-inject-api":1,"dojo-timeout-api":0,"dojo-trace-api":1,"dojo-loader-catches":1,"dojo-dom-ready-api":0,"dojo-dom-ready-plugin":0,"dojo-ready-api":1,"dojo-error-api":1,"dojo-publish-privates":1,"dojo-gettext-api":1,"dojo-sniff":0,"dojo-loader":1,"dojo-test-xd":0,"dojo-test-sniff":0};
for(var p in _11){
_1.hasCache[p]=_11[p];
}
var _12={baseUrl:_2,commandLineArgs:_3,deps:_7,timeout:0,locale:String(java.util.Locale.getDefault().toString().replace("_","-").toLowerCase()),injectUrl:function(url,_13){
try{
if(_10(url)){
load(url);
}else{
require.eval(readUrl(url,"UTF-8"));
}
_13();
}
catch(e){
}
},getText:function(url,_14,_15){
_15(_10(url)?readFile(url,"UTF-8"):readUrl(url,"UTF-8"));
}};
for(p in _12){
_1[p]=_12[p];
}
};
