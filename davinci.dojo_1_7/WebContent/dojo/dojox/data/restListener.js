/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/restListener",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.data.restListener",1);
_3.data.restListener=function(_4){
var _5=_4.channel;
var jr=_3.rpc.JsonRest;
var _6=jr.getServiceAndId(_5).service;
var _7=_3.json.ref.resolveJson(_4.result,{defaultId:_4.event=="put"&&_5,index:_3.rpc.Rest._index,idPrefix:_6.servicePath.replace(/[^\/]*$/,""),idAttribute:jr.getIdAttribute(_6),schemas:jr.schemas,loader:jr._loader,assignAbsoluteIds:true});
var _8=_3.rpc.Rest._index&&_3.rpc.Rest._index[_5];
var _9="on"+_4.event.toLowerCase();
var _a=_6&&_6._store;
if(_8){
if(_8[_9]){
_8[_9](_7);
return;
}
}
if(_a){
switch(_9){
case "onpost":
_a.onNew(_7);
break;
case "ondelete":
_a.onDelete(_8);
break;
}
}
};
return _1.getObject("dojox.data.restListener");
});
require(["dojox/data/restListener"]);
