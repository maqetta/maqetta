/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/socket",["dojo","dojo/on","dojo/cookie","dojo/_base/url"],function(_1,on){
var _2=window.WebSocket;
function _3(_4){
if(typeof _4=="string"){
_4={url:_4};
}
return _2?dojox.socket.WebSocket(_4,true):dojox.socket.LongPoll(_4);
};
dojox.socket=_3;
_3.WebSocket=function(_5,_6){
var ws=new _2(new _1._Url(document.baseURI.replace(/^http/i,"ws"),_5.url));
ws.on=function(_7,_8){
ws.addEventListener(_7,_8,true);
};
var _9;
_1.connect(ws,"onopen",function(_a){
_9=true;
});
_1.connect(ws,"onclose",function(_b){
if(_9){
return;
}
if(_6){
_3.replace(ws,dojox.socket.LongPoll(_5),true);
}
});
return ws;
};
_3.replace=function(_c,_d,_e){
_c.send=_1.hitch(_d,"send");
_c.close=_1.hitch(_d,"close");
if(_e){
_f("open");
}
_1.forEach(["message","close","error"],_f);
function _f(_10){
(_d.addEventListener||_d.on).call(_d,_10,function(_11){
var _12=document.createEvent("MessageEvent");
_12.initMessageEvent(_11.type,false,false,_11.data,_11.origin,_11.lastEventId,_11.source);
_c.dispatchEvent(_12);
},true);
};
};
_3.LongPoll=function(_13){
var _14=false,_15=true,_16,_17=[];
var _18={send:function(_19){
var _1a=_1.delegate(_13);
_1a.rawBody=_19;
clearTimeout(_16);
var _1b=_15?(_15=false)||_18.firstRequest(_1a):_18.transport(_1a);
_17.push(_1b);
_1b.then(function(_1c){
_18.readyState=1;
_17.splice(_1.indexOf(_17,_1b),1);
if(!_17.length){
_16=setTimeout(_22,_13.interval);
}
if(_1c){
_1e("message",{data:_1c},_1b);
}
},function(_1d){
_17.splice(_1.indexOf(_17,_1b),1);
if(!_14){
_1e("error",{error:_1d},_1b);
if(!_17.length){
_18.readyState=3;
_1e("close",{wasClean:false},_1b);
}
}
});
return _1b;
},close:function(){
_18.readyState=2;
_14=true;
for(var i=0;i<_17.length;i++){
_17[i].cancel();
}
_18.readyState=3;
_1e("close",{wasClean:true});
},transport:_13.transport||_1.xhrPost,args:_13,url:_13.url,readyState:0,CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3,dispatchEvent:function(_1f){
_1e(_1f.type,_1f);
},on:on.Evented.prototype.on,firstRequest:function(_20){
var _21=(_20.headers||(_20.headers={}));
_21.Pragma="start-long-poll";
try{
return this.transport(_20);
}
finally{
delete _21.Pragma;
}
}};
function _22(){
if(_18.readyState==0){
_1e("open",{});
}
if(!_17.length){
_18.send();
}
};
function _1e(_23,_24,_25){
if(_18["on"+_23]){
var _26=document.createEvent("HTMLEvents");
_26.initEvent(_23,false,false);
_1.mixin(_26,_24);
_26.ioArgs=_25&&_25.ioArgs;
_18["on"+_23](_26);
}
};
_18.connect=_18.on;
setTimeout(_22);
return _18;
};
return _3;
});
