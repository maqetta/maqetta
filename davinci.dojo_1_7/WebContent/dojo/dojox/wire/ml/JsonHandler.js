/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/wire/ml/JsonHandler",["dojo","dijit","dojox","dojox/wire/ml/RestHandler","dojox/wire/_base","dojox/wire/ml/util"],function(_1,_2,_3){
_1.getObject("dojox.wire.ml.JsonHandler",1);
_1.declare("dojox.wire.ml.JsonHandler",_3.wire.ml.RestHandler,{contentType:"text/json",handleAs:"json",headers:{"Accept":"*/json"},_getContent:function(_4,_5){
var _6=null;
if(_4=="POST"||_4=="PUT"){
var p=(_5?_5[0]:undefined);
if(p){
if(_1.isString(p)){
_6=p;
}else{
_6=_1.toJson(p);
}
}
}
return _6;
}});
return _1.getObject("dojox.wire.ml.JsonHandler");
});
require(["dojox/wire/ml/JsonHandler"]);
