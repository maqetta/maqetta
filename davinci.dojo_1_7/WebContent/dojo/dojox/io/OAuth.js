/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/io/OAuth",["dojo/_base/array","dojo/_base/xhr","dojox/encoding/digests/SHA1"],function(_1,_2,_3){
_1.getObject("io.OAuth",true,dojox);
dojox.io.OAuth=new (function(){
var _4=this.encode=function(s){
if(!(""+s).length){
return "";
}
return encodeURIComponent(s).replace(/\!/g,"%21").replace(/\*/g,"%2A").replace(/\'/g,"%27").replace(/\(/g,"%28").replace(/\)/g,"%29");
};
var _5=this.decode=function(_6){
var a=[],_7=_6.split("&");
for(var i=0,l=_7.length;i<l;i++){
var _8=_7[i];
if(_7[i]==""){
continue;
}
if(_7[i].indexOf("=")>-1){
var _9=_7[i].split("=");
a.push([decodeURIComponent(_9[0]),decodeURIComponent(_9[1])]);
}else{
a.push([decodeURIComponent(_7[i]),null]);
}
}
return a;
};
function _a(_b){
var _c=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],_d=/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,_e=_d.exec(_b),_f={},i=_c.length;
while(i--){
_f[_c[i]]=_e[i]||"";
}
var p=_f.protocol.toLowerCase(),a=_f.authority.toLowerCase(),b=(p=="http"&&_f.port==80)||(p=="https"&&_f.port==443);
if(b){
if(a.lastIndexOf(":")>-1){
a=a.substring(0,a.lastIndexOf(":"));
}
}
var _10=_f.path||"/";
_f.url=p+"://"+a+_10;
return _f;
};
var tab="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
function _11(_12){
var s="",tl=tab.length;
for(var i=0;i<_12;i++){
s+=tab.charAt(Math.floor(Math.random()*tl));
}
return s;
};
function _13(){
return Math.floor(new Date().valueOf()/1000)-2;
};
function _14(_15,key,_16){
if(_16&&_16!="PLAINTEXT"&&_16!="HMAC-SHA1"){
throw new Error("dojox.io.OAuth: the only supported signature encodings are PLAINTEXT and HMAC-SHA1.");
}
if(_16=="PLAINTEXT"){
return key;
}else{
return _3._hmac(_15,key);
}
};
function key(_17){
return _4(_17.consumer.secret)+"&"+(_17.token&&_17.token.secret?_4(_17.token.secret):"");
};
function _18(_19,oaa){
var o={oauth_consumer_key:oaa.consumer.key,oauth_nonce:_11(16),oauth_signature_method:oaa.sig_method||"HMAC-SHA1",oauth_timestamp:_13(),oauth_version:"1.0"};
if(oaa.token){
o.oauth_token=oaa.token.key;
}
_19.content=_1.mixin(_19.content||{},o);
};
function _1a(_1b){
var _1c=[{}],_1d;
if(_1b.form){
if(!_1b.content){
_1b.content={};
}
var _1e=_1.byId(_1b.form);
var _1f=_1e.getAttributeNode("action");
_1b.url=_1b.url||(_1f?_1f.value:null);
_1d=_1.formToObject(_1e);
delete _1b.form;
}
if(_1d){
_1c.push(_1d);
}
if(_1b.content){
_1c.push(_1b.content);
}
var map=_a(_1b.url);
if(map.query){
var tmp=_1.queryToObject(map.query);
for(var p in tmp){
tmp[p]=encodeURIComponent(tmp[p]);
}
_1c.push(tmp);
}
_1b._url=map.url;
var a=[];
for(var i=0,l=_1c.length;i<l;i++){
var _20=_1c[i];
for(var p in _20){
if(_1.isArray(_20[p])){
for(var j=0,jl=_20.length;j<jl;j++){
a.push([p,_20[j]]);
}
}else{
a.push([p,_20[p]]);
}
}
}
_1b._parameters=a;
return _1b;
};
function _21(_22,_23,oaa){
_18(_23,oaa);
_1a(_23);
var a=_23._parameters;
a.sort(function(a,b){
if(a[0]>b[0]){
return 1;
}
if(a[0]<b[0]){
return -1;
}
if(a[1]>b[1]){
return 1;
}
if(a[1]<b[1]){
return -1;
}
return 0;
});
var s=_1.map(a,function(_24){
return _4(_24[0])+"="+_4((""+_24[1]).length?_24[1]:"");
}).join("&");
var _25=_22.toUpperCase()+"&"+_4(_23._url)+"&"+_4(s);
return _25;
};
function _26(_27,_28,oaa){
var k=key(oaa),_29=_21(_27,_28,oaa),s=_14(_29,k,oaa.sig_method||"HMAC-SHA1");
_28.content["oauth_signature"]=s;
return _28;
};
this.sign=function(_2a,_2b,oaa){
return _26(_2a,_2b,oaa);
};
this.xhr=function(_2c,_2d,oaa,_2e){
_26(_2c,_2d,oaa);
return _2(_2c,_2d,_2e);
};
this.xhrGet=function(_2f,oaa){
return this.xhr("GET",_2f,oaa);
};
this.xhrPost=this.xhrRawPost=function(_30,oaa){
return this.xhr("POST",_30,oaa,true);
};
this.xhrPut=this.xhrRawPut=function(_31,oaa){
return this.xhr("PUT",_31,oaa,true);
};
this.xhrDelete=function(_32,oaa){
return this.xhr("DELETE",_32,oaa);
};
})();
return dojox.io.OAuth;
});
