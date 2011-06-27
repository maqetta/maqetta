/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/cometd/RestChannels",["dojo","dijit","dojox","dojox/rpc/Client","dojo/_base/url"],function(_1,_2,_3){
_1.getObject("dojox.cometd.RestChannels",1);
_1.requireIf(_3.data&&!!_3.data.JsonRestStore,"dojox.data.restListener");
(function(){
_1.declare("dojox.cometd.RestChannels",null,{constructor:function(_4){
_1.mixin(this,_4);
if(_3.rpc.Rest&&this.autoSubscribeRoot){
var _5=_3.rpc.Rest._get;
var _6=this;
_3.rpc.Rest._get=function(_7,id){
var _8=_1.xhrGet;
_1.xhrGet=function(r){
var _9=_6.autoSubscribeRoot;
return (_9&&r.url.substring(0,_9.length)==_9)?_6.get(r.url,r):_8(r);
};
var _a=_5.apply(this,arguments);
_1.xhrGet=_8;
return _a;
};
}
},absoluteUrl:function(_b,_c){
return new _1._Url(_b,_c)+"";
},acceptType:"application/rest+json,application/http;q=0.9,*/*;q=0.7",subscriptions:{},subCallbacks:{},autoReconnectTime:3000,reloadDataOnReconnect:true,sendAsJson:false,url:"/channels",autoSubscribeRoot:"/",open:function(){
this.started=true;
if(!this.connected){
this.connectionId=_3.rpc.Client.clientId;
var _d=this.createdClientId?"Client-Id":"Create-Client-Id";
this.createdClientId=true;
var _e={Accept:this.acceptType};
_e[_d]=this.connectionId;
var _f=_1.xhrPost({headers:_e,url:this.url,noStatus:true});
var _10=this;
this.lastIndex=0;
var _11,_12=function(_13){
if(typeof _1=="undefined"){
return null;
}
if(xhr&&xhr.status>400){
return _11(true);
}
if(typeof _13=="string"){
_13=_13.substring(_10.lastIndex);
}
var _14=xhr&&(xhr.contentType||xhr.getResponseHeader("Content-Type"))||(typeof _13!="string"&&"already json");
var _15=_10.onprogress(xhr,_13,_14);
if(_15){
if(_11()){
return new Error(_15);
}
}
if(!xhr||xhr.readyState==4){
xhr=null;
if(_10.connected){
_10.connected=false;
_10.open();
}
}
return _13;
};
_11=function(_16){
if(xhr&&xhr.status==409){
_10.disconnected();
return null;
}
_10.createdClientId=false;
_10.disconnected();
return _16;
};
_f.addCallbacks(_12,_11);
var xhr=_f.ioArgs.xhr;
if(xhr){
xhr.onreadystatechange=function(){
var _17;
try{
if(xhr.readyState==3){
_10.readyState=3;
_17=xhr.responseText;
}
}
catch(e){
}
if(typeof _17=="string"){
_12(_17);
}
};
}
if(window.attachEvent){
window.attachEvent("onunload",function(){
_10.connected=false;
if(xhr){
xhr.abort();
}
});
}
this.connected=true;
}
},_send:function(_18,_19,_1a){
if(this.sendAsJson){
_19.postData=_1.toJson({target:_19.url,method:_18,content:_1a,params:_19.content,subscribe:_19.headers["Subscribe"]});
_19.url=this.url;
_18="POST";
}else{
_19.postData=_1.toJson(_1a);
}
return _1.xhr(_18,_19,_19.postData);
},subscribe:function(_1b,_1c){
_1c=_1c||{};
_1c.url=this.absoluteUrl(this.url,_1b);
if(_1c.headers){
delete _1c.headers.Range;
}
var _1d=this.subscriptions[_1b];
var _1e=_1c.method||"HEAD";
var _1f=_1c.since;
var _20=_1c.callback;
var _21=_1c.headers||(_1c.headers={});
this.subscriptions[_1b]=_1f||_1d||0;
var _22=this.subCallbacks[_1b];
if(_20){
this.subCallbacks[_1b]=_22?function(m){
_22(m);
_20(m);
}:_20;
}
if(!this.connected){
this.open();
}
if(_1d===undefined||_1d!=_1f){
_21["Cache-Control"]="max-age=0";
_1f=typeof _1f=="number"?new Date(_1f).toUTCString():_1f;
if(_1f){
_21["Subscribe-Since"]=_1f;
}
_21["Subscribe"]=_1c.unsubscribe?"none":"*";
var dfd=this._send(_1e,_1c);
var _23=this;
dfd.addBoth(function(_24){
var xhr=dfd.ioArgs.xhr;
if(!(_24 instanceof Error)){
if(_1c.confirmation){
_1c.confirmation();
}
}
if(xhr&&xhr.getResponseHeader("Subscribed")=="OK"){
var _25=xhr.getResponseHeader("Last-Modified");
if(xhr.responseText){
_23.subscriptions[_1b]=_25||new Date().toUTCString();
}else{
return null;
}
}else{
if(xhr&&!(_24 instanceof Error)){
delete _23.subscriptions[_1b];
}
}
if(!(_24 instanceof Error)){
var _26={responseText:xhr&&xhr.responseText,channel:_1b,getResponseHeader:function(_27){
return xhr.getResponseHeader(_27);
},getAllResponseHeaders:function(){
return xhr.getAllResponseHeaders();
},result:_24};
if(_23.subCallbacks[_1b]){
_23.subCallbacks[_1b](_26);
}
}else{
if(_23.subCallbacks[_1b]){
_23.subCallbacks[_1b](xhr);
}
}
return _24;
});
return dfd;
}
return null;
},publish:function(_28,_29){
return this._send("POST",{url:_28,contentType:"application/json"},_29);
},_processMessage:function(_2a){
_2a.event=_2a.event||_2a.getResponseHeader("Event");
if(_2a.event=="connection-conflict"){
return "conflict";
}
try{
_2a.result=_2a.result||_1.fromJson(_2a.responseText);
}
catch(e){
}
var _2b=this;
var loc=_2a.channel=new _1._Url(this.url,_2a.source||_2a.getResponseHeader("Content-Location"))+"";
if(loc in this.subscriptions&&_2a.getResponseHeader){
this.subscriptions[loc]=_2a.getResponseHeader("Last-Modified");
}
if(this.subCallbacks[loc]){
setTimeout(function(){
_2b.subCallbacks[loc](_2a);
},0);
}
this.receive(_2a);
return null;
},onprogress:function(xhr,_2c,_2d){
if(!_2d||_2d.match(/application\/rest\+json/)){
var _2e=_2c.length;
_2c=_2c.replace(/^\s*[,\[]?/,"[").replace(/[,\]]?\s*$/,"]");
try{
var _2f=_1.fromJson(_2c);
this.lastIndex+=_2e;
}
catch(e){
}
}else{
if(_3.io&&_3.io.httpParse&&_2d.match(/application\/http/)){
var _30="";
if(xhr&&xhr.getAllResponseHeaders){
_30=xhr.getAllResponseHeaders();
}
_2f=_3.io.httpParse(_2c,_30,xhr.readyState!=4);
}else{
if(typeof _2c=="object"){
_2f=_2c;
}
}
}
if(_2f){
for(var i=0;i<_2f.length;i++){
if(this._processMessage(_2f[i])){
return "conflict";
}
}
return null;
}
if(!xhr){
return "error";
}
if(xhr.readyState!=4){
return null;
}
if(xhr.__proto__){
xhr={channel:"channel",__proto__:xhr};
}
return this._processMessage(xhr);
},get:function(_31,_32){
(_32=_32||{}).method="GET";
return this.subscribe(_31,_32);
},receive:function(_33){
if(_3.data&&_3.data.restListener){
_3.data.restListener(_33);
}
},disconnected:function(){
var _34=this;
if(this.connected){
this.connected=false;
if(this.started){
setTimeout(function(){
var _35=_34.subscriptions;
_34.subscriptions={};
for(var i in _35){
if(_34.reloadDataOnReconnect&&_3.rpc.JsonRest){
delete _3.rpc.Rest._index[i];
_3.rpc.JsonRest.fetch(i);
}else{
_34.subscribe(i,{since:_35[i]});
}
}
_34.open();
},this.autoReconnectTime);
}
}
},unsubscribe:function(_36,_37){
_37=_37||{};
_37.unsubscribe=true;
this.subscribe(_36,_37);
},disconnect:function(){
this.started=false;
this.xhr.abort();
}});
var _38=_3.cometd.RestChannels.defaultInstance=new _3.cometd.RestChannels();
if(_3.cometd.connectionTypes){
_38.startup=function(_39){
_38.open();
this._cometd._deliver({channel:"/meta/connect",successful:true});
};
_38.check=function(_3a,_3b,_3c){
for(var i=0;i<_3a.length;i++){
if(_3a[i]=="rest-channels"){
return !_3c;
}
}
return false;
};
_38.deliver=function(_3d){
};
_1.connect(this,"receive",null,function(_3e){
_3e.data=_3e.result;
this._cometd._deliver(_3e);
});
_38.sendMessages=function(_3f){
for(var i=0;i<_3f.length;i++){
var _40=_3f[i];
var _41=_40.channel;
var _42=this._cometd;
var _43={confirmation:function(){
_42._deliver({channel:_41,successful:true});
}};
if(_41=="/meta/subscribe"){
this.subscribe(_40.subscription,_43);
}else{
if(_41=="/meta/unsubscribe"){
this.unsubscribe(_40.subscription,_43);
}else{
if(_41=="/meta/connect"){
_43.confirmation();
}else{
if(_41=="/meta/disconnect"){
_38.disconnect();
_43.confirmation();
}else{
if(_41.substring(0,6)!="/meta/"){
this.publish(_41,_40.data);
}
}
}
}
}
}
};
_3.cometd.connectionTypes.register("rest-channels",_38.check,_38,false,true);
}
})();
return _1.getObject("dojox.cometd.RestChannels");
});
require(["dojox/cometd/RestChannels"]);
