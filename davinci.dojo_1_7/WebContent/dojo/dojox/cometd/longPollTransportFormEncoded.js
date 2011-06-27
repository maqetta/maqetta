/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/cometd/longPollTransportFormEncoded",["dojo","dijit","dojox","dojox/cometd/_base"],function(_1,_2,_3){
_1.getObject("dojox.cometd.longPollTransportFormEncoded",1);
_3.cometd.longPollTransportFormEncoded=new function(){
this._connectionType="long-polling";
this._cometd=null;
this.check=function(_4,_5,_6){
return ((!_6)&&(_1.indexOf(_4,"long-polling")>=0));
};
this.tunnelInit=function(){
var _7={channel:"/meta/connect",clientId:this._cometd.clientId,connectionType:this._connectionType,id:""+this._cometd.messageId++};
_7=this._cometd._extendOut(_7);
this.openTunnelWith({message:_1.toJson([_7])});
};
this.tunnelCollapse=function(){
if(!this._cometd._initialized){
return;
}
if(this._cometd._advice&&this._cometd._advice["reconnect"]=="none"){
return;
}
var _8=this._cometd._interval();
if(this._cometd._status=="connected"){
setTimeout(_1.hitch(this,"_connect"),_8);
}else{
setTimeout(_1.hitch(this._cometd,function(){
this.init(this.url,this._props);
}),_8);
}
};
this._connect=function(){
if(!this._cometd._initialized){
return;
}
if(this._cometd._polling){
return;
}
if((this._cometd._advice)&&(this._cometd._advice["reconnect"]=="handshake")){
this._cometd._status="unconnected";
this._initialized=false;
this._cometd.init(this._cometd.url,this._cometd._props);
}else{
if(this._cometd._status=="connected"){
var _9={channel:"/meta/connect",connectionType:this._connectionType,clientId:this._cometd.clientId,id:""+this._cometd.messageId++};
if(this._cometd.connectTimeout>=this._cometd.expectedNetworkDelay){
_9.advice={timeout:this._cometd.connectTimeout-this._cometd.expectedNetworkDelay};
}
_9=this._cometd._extendOut(_9);
this.openTunnelWith({message:_1.toJson([_9])});
}
}
};
this.deliver=function(_a){
};
this.openTunnelWith=function(_b,_c){
this._cometd._polling=true;
var _d={url:(_c||this._cometd.url),content:_b,handleAs:this._cometd.handleAs,load:_1.hitch(this,function(_e){
this._cometd._polling=false;
this._cometd.deliver(_e);
this._cometd._backon();
this.tunnelCollapse();
}),error:_1.hitch(this,function(_f){
var _10={failure:true,error:_f,advice:this._cometd._advice};
this._cometd._polling=false;
this._cometd._publishMeta("connect",false,_10);
this._cometd._backoff();
this.tunnelCollapse();
})};
var _11=this._cometd._connectTimeout();
if(_11>0){
_d.timeout=_11;
}
this._poll=_1.xhrPost(_d);
};
this.sendMessages=function(_12){
for(var i=0;i<_12.length;i++){
_12[i].clientId=this._cometd.clientId;
_12[i].id=""+this._cometd.messageId++;
_12[i]=this._cometd._extendOut(_12[i]);
}
return _1.xhrPost({url:this._cometd.url||_1.config["cometdRoot"],handleAs:this._cometd.handleAs,load:_1.hitch(this._cometd,"deliver"),content:{message:_1.toJson(_12)},error:_1.hitch(this,function(err){
this._cometd._publishMeta("publish",false,{messages:_12});
}),timeout:this._cometd.expectedNetworkDelay});
};
this.startup=function(_13){
if(this._cometd._status=="connected"){
return;
}
this.tunnelInit();
};
this.disconnect=function(){
var _14={channel:"/meta/disconnect",clientId:this._cometd.clientId,id:""+this._cometd.messageId++};
_14=this._cometd._extendOut(_14);
_1.xhrPost({url:this._cometd.url||_1.config["cometdRoot"],handleAs:this._cometd.handleAs,content:{message:_1.toJson([_14])}});
};
this.cancelConnect=function(){
if(this._poll){
this._poll.cancel();
this._cometd._polling=false;
this._cometd._publishMeta("connect",false,{cancel:true});
this._cometd._backoff();
this.disconnect();
this.tunnelCollapse();
}
};
};
_3.cometd.longPollTransport=_3.cometd.longPollTransportFormEncoded;
_3.cometd.connectionTypes.register("long-polling",_3.cometd.longPollTransport.check,_3.cometd.longPollTransportFormEncoded);
_3.cometd.connectionTypes.register("long-polling-form-encoded",_3.cometd.longPollTransport.check,_3.cometd.longPollTransportFormEncoded);
return _1.getObject("dojox.cometd.longPollTransportFormEncoded");
});
require(["dojox/cometd/longPollTransportFormEncoded"]);
