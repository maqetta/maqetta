/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/rpc/Client",["dojo","dojox"],function(_1,_2){
_1.getObject("rpc.Client",true,_2);
_1._defaultXhr=_1.xhr;
_1.xhr=function(_3,_4){
var _5=_4.headers=_4.headers||{};
_5["Client-Id"]=_2.rpc.Client.clientId;
_5["Seq-Id"]=_2._reqSeqId=(_2._reqSeqId||0)+1;
return _1._defaultXhr.apply(_1,arguments);
};
_2.rpc.Client.clientId=(Math.random()+"").substring(2,14)+(new Date().getTime()+"").substring(8,13);
return _2.rpc.Client;
});
