/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/io/xhrWindowNamePlugin",["dojo/_base/json","dojox/io/xhrPlugins","dojox/io/windowName","dojox/io/httpParse","dojox/secure/capability","dojo/_base/xhr"],function(_1,_2,_3,_4,_5){
_1.getObject("io.xhrWindowNamePlugin",true,dojox);
dojox.io.xhrWindowNamePlugin=function(_6,_7,_8){
_2.register("windowName",function(_9,_a){
return _a.sync!==true&&(_9=="GET"||_9=="POST"||_7)&&(_a.url.substring(0,_6.length)==_6);
},function(_b,_c,_d){
var _e=_3.send;
var _f=_c.load;
_c.load=undefined;
var dfd=(_7?_7(_e,true):_e)(_b,_c,_d);
dfd.addCallback(function(_10){
var _11=dfd.ioArgs;
_11.xhr={getResponseHeader:function(_12){
return _1.queryToObject(_11.hash.match(/[^#]*$/)[0])[_12];
}};
if(_11.handleAs=="json"){
if(!_8){
_5.validate(_10,["Date"],{});
}
return _1.fromJson(_10);
}
return _1._contentHandlers[_11.handleAs||"text"]({responseText:_10});
});
_c.load=_f;
if(_f){
dfd.addCallback(_f);
}
return dfd;
});
};
return dojox.io.xhrWindowNamePlugin;
});
