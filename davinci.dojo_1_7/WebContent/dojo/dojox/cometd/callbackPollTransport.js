/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/cometd/callbackPollTransport",["dojo","dijit","dojox","dojox/cometd/_base","dojox/cometd/longPollTransport","dojo/io/script"],function(_1,_2,_3){
_1.getObject("dojox.cometd.callbackPollTransport",1);
_3.cometd.callbackPollTransport=new function(){
this._connectionType="callback-polling";
this._cometd=null;
this.check=function(_4,_5,_6){
return (_1.indexOf(_4,"callback-polling")>=0);
};
this.tunnelInit=function(){
var _7={channel:"/meta/connect",clientId:this._cometd.clientId,connectionType:this._connectionType,id:""+this._cometd.messageId++};
_7=this._cometd._extendOut(_7);
this.openTunnelWith([_7]);
};
this.tunnelCollapse=_3.cometd.longPollTransport.tunnelCollapse;
this._connect=_3.cometd.longPollTransport._connect;
this.deliver=_3.cometd.longPollTransport.deliver;
this.openTunnelWith=function(_8,_9){
this._cometd._polling=true;
var _a={load:_1.hitch(this,function(_b){
this._cometd._polling=false;
this._cometd.deliver(_b);
this._cometd._backon();
this.tunnelCollapse();
}),error:_1.hitch(this,function(_c){
this._cometd._polling=false;
this._cometd._publishMeta("connect",false);
this._cometd._backoff();
this.tunnelCollapse();
}),url:(_9||this._cometd.url),content:{message:_1.toJson(_8)},callbackParamName:"jsonp"};
var _d=this._cometd._connectTimeout();
if(_d>0){
_a.timeout=_d;
}
_1.io.script.get(_a);
};
this.sendMessages=function(_e){
for(var i=0;i<_e.length;i++){
_e[i].clientId=this._cometd.clientId;
_e[i].id=""+this._cometd.messageId++;
_e[i]=this._cometd._extendOut(_e[i]);
}
var _f={url:this._cometd.url||_1.config["cometdRoot"],load:_1.hitch(this._cometd,"deliver"),callbackParamName:"jsonp",content:{message:_1.toJson(_e)},error:_1.hitch(this,function(err){
this._cometd._publishMeta("publish",false,{messages:_e});
}),timeout:this._cometd.expectedNetworkDelay};
return _1.io.script.get(_f);
};
this.startup=function(_10){
if(this._cometd._connected){
return;
}
this.tunnelInit();
};
this.disconnect=_3.cometd.longPollTransport.disconnect;
this.disconnect=function(){
var _11={channel:"/meta/disconnect",clientId:this._cometd.clientId,id:""+this._cometd.messageId++};
_11=this._cometd._extendOut(_11);
_1.io.script.get({url:this._cometd.url||_1.config["cometdRoot"],callbackParamName:"jsonp",content:{message:_1.toJson([_11])}});
};
this.cancelConnect=function(){
};
};
_3.cometd.connectionTypes.register("callback-polling",_3.cometd.callbackPollTransport.check,_3.cometd.callbackPollTransport);
return _1.getObject("dojox.cometd.callbackPollTransport");
});
require(["dojox/cometd/callbackPollTransport"]);
