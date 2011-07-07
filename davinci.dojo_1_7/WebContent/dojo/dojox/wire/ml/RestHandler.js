/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/_base","dojox/wire/ml/util"],function(_1,_2,_3){
_1.getObject("dojox.wire.ml.RestHandler",1);
_1.declare("dojox.wire.ml.RestHandler",null,{contentType:"text/plain",handleAs:"text",bind:function(_4,_5,_6,_7){
_4=_4.toUpperCase();
var _8=this;
var _9={url:this._getUrl(_4,_5,_7),contentType:this.contentType,handleAs:this.handleAs,headers:this.headers,preventCache:this.preventCache};
var d=null;
if(_4=="POST"){
_9.postData=this._getContent(_4,_5);
d=_1.rawXhrPost(_9);
}else{
if(_4=="PUT"){
_9.putData=this._getContent(_4,_5);
d=_1.rawXhrPut(_9);
}else{
if(_4=="DELETE"){
d=_1.xhrDelete(_9);
}else{
d=_1.xhrGet(_9);
}
}
}
d.addCallbacks(function(_a){
_6.callback(_8._getResult(_a));
},function(_b){
_6.errback(_b);
});
},_getUrl:function(_c,_d,_e){
var _f;
if(_c=="GET"||_c=="DELETE"){
if(_d.length>0){
_f=_d[0];
}
}else{
if(_d.length>1){
_f=_d[1];
}
}
if(_f){
var _10="";
for(var _11 in _f){
var _12=_f[_11];
if(_12){
_12=encodeURIComponent(_12);
var _13="{"+_11+"}";
var _14=_e.indexOf(_13);
if(_14>=0){
_e=_e.substring(0,_14)+_12+_e.substring(_14+_13.length);
}else{
if(_10){
_10+="&";
}
_10+=(_11+"="+_12);
}
}
}
if(_10){
_e+="?"+_10;
}
}
return _e;
},_getContent:function(_15,_16){
if(_15=="POST"||_15=="PUT"){
return (_16?_16[0]:null);
}else{
return null;
}
},_getResult:function(_17){
return _17;
}});
return _1.getObject("dojox.wire.ml.RestHandler");
});
require(["dojox/wire/ml/RestHandler"]);
