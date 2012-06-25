/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/xhr",["require","../errors/RequestError","./watch","./handlers","./util","../has"],function(_1,_2,_3,_4,_5,_6){
_6.add("native-xhr",function(){
return typeof XMLHttpRequest!=="undefined";
});
_6.add("dojo-force-activex-xhr",function(){
return _6("activex")&&!document.addEventListener&&window.location.protocol==="file:";
});
_6.add("native-xhr2",function(){
if(!_6("native-xhr")){
return;
}
var x=new XMLHttpRequest();
return typeof x["addEventListener"]!=="undefined"&&(typeof opera==="undefined"||typeof x["upload"]!=="undefined");
});
_6.add("native-formdata",function(){
return typeof FormData==="function";
});
function _7(_8,_9){
var _a=_8.xhr;
_8.status=_8.xhr.status;
_8.text=_a.responseText;
if(_8.options.handleAs==="xml"){
_8.data=_a.responseXML;
}
if(!_9){
try{
_4(_8);
}
catch(e){
_9=e;
}
}
if(_9){
this.reject(_9);
}else{
if(_5.checkStatus(_a.status)){
this.resolve(_8);
}else{
_9=new _2("Unable to load "+_8.url+" status: "+_a.status,_8);
this.reject(_9);
}
}
};
var _b,_c,_d,_e;
if(_6("native-xhr2")){
_b=function(_f){
return !this.isFulfilled();
};
_e=function(dfd,_10){
_10.xhr.abort();
};
_d=function(_11,dfd,_12){
function _13(evt){
dfd.handleResponse(_12);
};
function _14(evt){
var _15=evt.target;
var _16=new _2("Unable to load "+_12.url+" status: "+_15.status,_12);
dfd.handleResponse(_12,_16);
};
function _17(evt){
if(evt.lengthComputable){
_12.loaded=evt.loaded;
_12.total=evt.total;
dfd.progress(_12);
}
};
_11.addEventListener("load",_13,false);
_11.addEventListener("error",_14,false);
_11.addEventListener("progress",_17,false);
return function(){
_11.removeEventListener("load",_13,false);
_11.removeEventListener("error",_14,false);
_11.removeEventListener("progress",_17,false);
};
};
}else{
_b=function(_18){
return _18.xhr.readyState;
};
_c=function(_19){
return 4===_19.xhr.readyState;
};
_e=function(dfd,_1a){
var xhr=_1a.xhr;
var _1b=typeof xhr.abort;
if(_1b==="function"||_1b==="object"||_1b==="unknown"){
xhr.abort();
}
};
}
var _1c,_1d={data:null,query:null,sync:false,method:"GET",headers:{"Content-Type":"application/x-www-form-urlencoded"}};
function xhr(url,_1e,_1f){
var _20=_5.parseArgs(url,_5.deepCreate(_1d,_1e),_6("native-formdata")&&_1e.data&&_1e.data instanceof FormData);
url=_20.url;
_1e=_20.options;
var _21,_22=function(){
_21&&_21();
};
var dfd=_5.deferred(_20,_e,_b,_c,_7,_22);
var _23=_20.xhr=xhr._create();
if(!_23){
dfd.cancel(new _2("XHR was not created"));
return _1f?dfd:dfd.promise;
}
_20.getHeader=function(_24){
return this.xhr.getResponseHeader(_24);
};
if(_d){
_21=_d(_23,dfd,_20);
}
var _25=_1e.data,_26=!_1e.sync,_27=_1e.method;
try{
_23.open(_27,url,_26,_1e.user||_1c,_1e.password||_1c);
if(_1e.withCredentials){
_23.withCredentials=_1e.withCredentials;
}
var _28=_1e.headers,_29;
if(_28){
for(var hdr in _28){
if(hdr.toLowerCase()==="content-type"){
_29=_28[hdr];
}else{
if(_28[hdr]){
_23.setRequestHeader(hdr,_28[hdr]);
}
}
}
}
if(_29&&_29!==false){
_23.setRequestHeader("Content-Type",_29);
}
if(!_28||!("X-Requested-With" in _28)){
_23.setRequestHeader("X-Requested-With","XMLHttpRequest");
}
try{
var _2a=_1("./notify");
_2a.send(_20);
}
catch(e){
}
_23.send(_25);
}
catch(e){
dfd.reject(e);
}
_3(dfd);
_23=null;
return _1f?dfd:dfd.promise;
};
xhr._create=function(){
throw new Error("XMLHTTP not available");
};
if(_6("native-xhr")&&!_6("dojo-force-activex-xhr")){
xhr._create=function(){
return new XMLHttpRequest();
};
}else{
if(_6("activex")){
try{
new ActiveXObject("Msxml2.XMLHTTP");
xhr._create=function(){
return new ActiveXObject("Msxml2.XMLHTTP");
};
}
catch(e){
try{
new ActiveXObject("Microsoft.XMLHTTP");
xhr._create=function(){
return new ActiveXObject("Microsoft.XMLHTTP");
};
}
catch(e){
}
}
}
}
_5.addCommonMethods(xhr);
return xhr;
});
