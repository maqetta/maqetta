/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/xhr",["./kernel","../has","require","../on","./sniff","./Deferred","./json","./lang"],function(_1,_2,_3,on){
_2.add("native-xhr",function(){
return typeof XMLHttpRequest!=="undefined";
});
if(1){
_1._xhrObj=_3.getXhr;
}else{
if(_2("native-xhr")){
_1._xhrObj=function(){
try{
return new XMLHttpRequest();
}
catch(e){
throw new Error("XMLHTTP not available: "+e);
}
};
}else{
for(var _4=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],_5,i=0;i<3;){
try{
_5=_4[i++];
if(new ActiveXObject(_5)){
break;
}
}
catch(e){
}
}
_1._xhrObj=function(){
try{
return new ActiveXObject(_5);
}
catch(e){
throw new Error("XMLHTTP not available: "+e);
}
};
}
}
var _6=_1,_7=_6.config;
function _8(_9,_a,_b){
if(_b===null){
return;
}
var _c=_9[_a];
if(typeof _c=="string"){
_9[_a]=[_c,_b];
}else{
if(_6.isArray(_c)){
_c.push(_b);
}else{
_9[_a]=_b;
}
}
};
_1.fieldToObject=function(_d){
var _e=null;
var _f=_6.byId(_d);
if(_f){
var _10=_f.name;
var _11=(_f.type||"").toLowerCase();
if(_10&&_11&&!_f.disabled){
if(_11=="radio"||_11=="checkbox"){
if(_f.checked){
_e=_f.value;
}
}else{
if(_f.multiple){
_e=[];
var _12=_f.getElementsByTagName("option");
for(var i=0;i<_12.length;i++){
var opt=_12[i];
if(opt.selected){
_e.push(opt.value);
}
}
}else{
_e=_f.value;
}
}
}
}
return _e;
};
_1.formToObject=function(_13){
var ret={};
var _14="file|submit|image|reset|button|";
_6.forEach(_1.byId(_13).elements,function(_15){
var _16=_15.name;
var _17=(_15.type||"").toLowerCase();
if(_16&&_17&&_14.indexOf(_17)==-1&&!_15.disabled){
_8(ret,_16,_6.fieldToObject(_15));
if(_17=="image"){
ret[_16+".x"]=ret[_16+".y"]=ret[_16].x=ret[_16].y=0;
}
}
});
return ret;
};
_1.objectToQuery=function(map){
var enc=encodeURIComponent;
var _18=[];
var _19={};
for(var _1a in map){
var _1b=map[_1a];
if(_1b!=_19[_1a]){
var _1c=enc(_1a)+"=";
if(_6.isArray(_1b)){
for(var i=0;i<_1b.length;i++){
_18.push(_1c+enc(_1b[i]));
}
}else{
_18.push(_1c+enc(_1b));
}
}
}
return _18.join("&");
};
_1.formToQuery=function(_1d){
return _6.objectToQuery(_6.formToObject(_1d));
};
_1.formToJson=function(_1e,_1f){
return _6.toJson(_6.formToObject(_1e),_1f);
};
_1.queryToObject=function(str){
var ret={};
var qp=str.split("&");
var dec=decodeURIComponent;
_6.forEach(qp,function(_20){
if(_20.length){
var _21=_20.split("=");
var _22=dec(_21.shift());
var val=dec(_21.join("="));
if(typeof ret[_22]=="string"){
ret[_22]=[ret[_22]];
}
if(_6.isArray(ret[_22])){
ret[_22].push(val);
}else{
ret[_22]=val;
}
}
});
return ret;
};
_1._blockAsync=false;
var _23=_6._contentHandlers=_1.contentHandlers={"text":function(xhr){
return xhr.responseText;
},"json":function(xhr){
return _6.fromJson(xhr.responseText||null);
},"json-comment-filtered":function(xhr){
if(!_1.config.useCommentedJson){
console.warn("Consider using the standard mimetype:application/json."+" json-commenting can introduce security issues. To"+" decrease the chances of hijacking, use the standard the 'json' handler and"+" prefix your json with: {}&&\n"+"Use djConfig.useCommentedJson=true to turn off this message.");
}
var _24=xhr.responseText;
var _25=_24.indexOf("/*");
var _26=_24.lastIndexOf("*/");
if(_25==-1||_26==-1){
throw new Error("JSON was not comment filtered");
}
return _6.fromJson(_24.substring(_25+2,_26));
},"javascript":function(xhr){
return _6.eval(xhr.responseText);
},"xml":function(xhr){
var _27=xhr.responseXML;
if(_2("ie")){
if((!_27||!_27.documentElement)){
var ms=function(n){
return "MSXML"+n+".DOMDocument";
};
var dp=["Microsoft.XMLDOM",ms(6),ms(4),ms(3),ms(2)];
_6.some(dp,function(p){
try{
var dom=new ActiveXObject(p);
dom.async=false;
dom.loadXML(xhr.responseText);
_27=dom;
}
catch(e){
return false;
}
return true;
});
}
}
return _27;
},"json-comment-optional":function(xhr){
if(xhr.responseText&&/^[^{\[]*\/\*/.test(xhr.responseText)){
return _23["json-comment-filtered"](xhr);
}else{
return _23["json"](xhr);
}
}};
_1._ioSetArgs=function(_28,_29,_2a,_2b){
var _2c={args:_28,url:_28.url};
var _2d=null;
if(_28.form){
var _2e=_6.byId(_28.form);
var _2f=_2e.getAttributeNode("action");
_2c.url=_2c.url||(_2f?_2f.value:null);
_2d=_6.formToObject(_2e);
}
var _30=[{}];
if(_2d){
_30.push(_2d);
}
if(_28.content){
_30.push(_28.content);
}
if(_28.preventCache){
_30.push({"dojo.preventCache":new Date().valueOf()});
}
_2c.query=_6.objectToQuery(_6.mixin.apply(null,_30));
_2c.handleAs=_28.handleAs||"text";
var d=new _6.Deferred(_29);
d.addCallbacks(_2a,function(_31){
return _2b(_31,d);
});
var ld=_28.load;
if(ld&&_6.isFunction(ld)){
d.addCallback(function(_32){
return ld.call(_28,_32,_2c);
});
}
var err=_28.error;
if(err&&_6.isFunction(err)){
d.addErrback(function(_33){
return err.call(_28,_33,_2c);
});
}
var _34=_28.handle;
if(_34&&_6.isFunction(_34)){
d.addBoth(function(_35){
return _34.call(_28,_35,_2c);
});
}
if(_7.ioPublish&&_6.publish&&_2c.args.ioPublish!==false){
d.addCallbacks(function(res){
_6.publish("/dojo/io/load",[d,res]);
return res;
},function(res){
_6.publish("/dojo/io/error",[d,res]);
return res;
});
d.addBoth(function(res){
_6.publish("/dojo/io/done",[d,res]);
return res;
});
}
d.ioArgs=_2c;
return d;
};
var _36=function(dfd){
dfd.canceled=true;
var xhr=dfd.ioArgs.xhr;
var _37=typeof xhr.abort;
if(_37=="function"||_37=="object"||_37=="unknown"){
xhr.abort();
}
var err=dfd.ioArgs.error;
if(!err){
err=new Error("xhr cancelled");
err.dojoType="cancel";
}
return err;
};
var _38=function(dfd){
var ret=_23[dfd.ioArgs.handleAs](dfd.ioArgs.xhr);
return ret===undefined?null:ret;
};
var _39=function(_3a,dfd){
if(!dfd.ioArgs.args.failOk){
console.error(_3a);
}
return _3a;
};
var _3b=null;
var _3c=[];
var _3d=0;
var _3e=function(dfd){
if(_3d<=0){
_3d=0;
if(_7.ioPublish&&_6.publish&&(!dfd||dfd&&dfd.ioArgs.args.ioPublish!==false)){
_6.publish("/dojo/io/stop");
}
}
};
var _3f=function(){
var now=(new Date()).getTime();
if(!_6._blockAsync){
for(var i=0,tif;i<_3c.length&&(tif=_3c[i]);i++){
var dfd=tif.dfd;
var _40=function(){
if(!dfd||dfd.canceled||!tif.validCheck(dfd)){
_3c.splice(i--,1);
_3d-=1;
}else{
if(tif.ioCheck(dfd)){
_3c.splice(i--,1);
tif.resHandle(dfd);
_3d-=1;
}else{
if(dfd.startTime){
if(dfd.startTime+(dfd.ioArgs.args.timeout||0)<now){
_3c.splice(i--,1);
var err=new Error("timeout exceeded");
err.dojoType="timeout";
dfd.errback(err);
dfd.cancel();
_3d-=1;
}
}
}
}
};
if(_1.config.debugAtAllCosts){
_40.call(this);
}else{
try{
_40.call(this);
}
catch(e){
dfd.errback(e);
}
}
}
}
_3e(dfd);
if(!_3c.length){
clearInterval(_3b);
_3b=null;
}
};
_1._ioCancelAll=function(){
try{
_6.forEach(_3c,function(i){
try{
i.dfd.cancel();
}
catch(e){
}
});
}
catch(e){
}
};
if(_2("ie")){
on(window,"unload",_6._ioCancelAll);
}
_6._ioNotifyStart=function(dfd){
if(_7.ioPublish&&_6.publish&&dfd.ioArgs.args.ioPublish!==false){
if(!_3d){
_6.publish("/dojo/io/start");
}
_3d+=1;
_6.publish("/dojo/io/send",[dfd]);
}
};
_6._ioWatch=function(dfd,_41,_42,_43){
var _44=dfd.ioArgs.args;
if(_44.timeout){
dfd.startTime=(new Date()).getTime();
}
_3c.push({dfd:dfd,validCheck:_41,ioCheck:_42,resHandle:_43});
if(!_3b){
_3b=setInterval(_3f,50);
}
if(_44.sync){
_3f();
}
};
var _45="application/x-www-form-urlencoded";
var _46=function(dfd){
return dfd.ioArgs.xhr.readyState;
};
var _47=function(dfd){
return 4==dfd.ioArgs.xhr.readyState;
};
var _48=function(dfd){
var xhr=dfd.ioArgs.xhr;
if(_6._isDocumentOk(xhr)){
dfd.callback(dfd);
}else{
var err=new Error("Unable to load "+dfd.ioArgs.url+" status:"+xhr.status);
err.status=xhr.status;
err.responseText=xhr.responseText;
err.xhr=xhr;
dfd.errback(err);
}
};
_1._ioAddQueryToUrl=function(_49){
if(_49.query.length){
_49.url+=(_49.url.indexOf("?")==-1?"?":"&")+_49.query;
_49.query=null;
}
};
_1.xhr=function(_4a,_4b,_4c){
var dfd=_6._ioSetArgs(_4b,_36,_38,_39);
var _4d=dfd.ioArgs;
var xhr=_4d.xhr=_6._xhrObj(_4d.args);
if(!xhr){
dfd.cancel();
return dfd;
}
if("postData" in _4b){
_4d.query=_4b.postData;
}else{
if("putData" in _4b){
_4d.query=_4b.putData;
}else{
if("rawBody" in _4b){
_4d.query=_4b.rawBody;
}else{
if((arguments.length>2&&!_4c)||"POST|PUT".indexOf(_4a.toUpperCase())==-1){
_6._ioAddQueryToUrl(_4d);
}
}
}
}
xhr.open(_4a,_4d.url,_4b.sync!==true,_4b.user||undefined,_4b.password||undefined);
if(_4b.headers){
for(var hdr in _4b.headers){
if(hdr.toLowerCase()==="content-type"&&!_4b.contentType){
_4b.contentType=_4b.headers[hdr];
}else{
if(_4b.headers[hdr]){
xhr.setRequestHeader(hdr,_4b.headers[hdr]);
}
}
}
}
if(_4b.contentType!==false){
xhr.setRequestHeader("Content-Type",_4b.contentType||_45);
}
if(!_4b.headers||!("X-Requested-With" in _4b.headers)){
xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
}
_6._ioNotifyStart(dfd);
if(_1.config.debugAtAllCosts){
xhr.send(_4d.query);
}else{
try{
xhr.send(_4d.query);
}
catch(e){
_4d.error=e;
dfd.cancel();
}
}
_6._ioWatch(dfd,_46,_47,_48);
xhr=null;
return dfd;
};
_1.xhrGet=function(_4e){
return _6.xhr("GET",_4e);
};
_1.rawXhrPost=_1.xhrPost=function(_4f){
return _6.xhr("POST",_4f,true);
};
_1.rawXhrPut=_1.xhrPut=function(_50){
return _6.xhr("PUT",_50,true);
};
_1.xhrDelete=function(_51){
return _6.xhr("DELETE",_51);
};
_1.mixin(_1.xhr,{_xhrObj:_1._xhrObj,fieldToObject:_1.fieldToObject,formToObject:_1.formToObject,objectToQuery:_1.objectToQuery,formToQuery:_1.formToQuery,formToJson:_1.formToJson,queryToObject:_1.queryToObject,contentHandlers:_23,_ioSetArgs:_1._ioSetArgs,_ioCancelAll:_1._ioCancelAll,_ioNotifyStart:_1._ioNotifyStart,_ioWatch:_1._ioWatch,_ioAddQueryToUrl:_1._ioAddQueryToUrl,get:_1.xhrGet,post:_1.xhrPost,put:_1.xhrPut,del:_1.xhrDelete});
return _1.xhr;
});
