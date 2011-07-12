/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/cometd/ack",["dojo","dijit","dojox","dojox/cometd/_base"],function(_1,_2,_3){
_1.getObject("dojox.cometd.ack",1);
_3.cometd._ack=new function(){
var _4=false;
var _5=-1;
this._in=function(_6){
if(_6.channel=="/meta/handshake"){
_4=_6.ext&&_6.ext.ack;
}else{
if(_4&&_6.channel=="/meta/connect"&&_6.ext&&_6.ext.ack&&_6.successful){
var _7=parseInt(_6.ext.ack);
_5=_7;
}
}
return _6;
};
this._out=function(_8){
if(_8.channel=="/meta/handshake"){
if(!_8.ext){
_8.ext={};
}
_8.ext.ack=_3.cometd.ackEnabled;
_5=-1;
}
if(_4&&_8.channel=="/meta/connect"){
if(!_8.ext){
_8.ext={};
}
_8.ext.ack=_5;
}
return _8;
};
};
_3.cometd._extendInList.push(_1.hitch(_3.cometd._ack,"_in"));
_3.cometd._extendOutList.push(_1.hitch(_3.cometd._ack,"_out"));
_3.cometd.ackEnabled=true;
return _1.getObject("dojox.cometd.ack");
});
require(["dojox/cometd/ack"]);
