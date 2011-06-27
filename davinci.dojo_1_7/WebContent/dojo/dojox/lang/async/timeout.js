/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/async/timeout",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.lang.async.timeout",1);
(function(){
var d=_1,_4=_3.lang.async.timeout;
_4.from=function(ms){
return function(){
var h,_5=function(){
if(h){
clearTimeout(h);
h=null;
}
},x=new d.Deferred(_5);
h=setTimeout(function(){
_5();
x.callback(ms);
},ms);
return x;
};
};
_4.failOn=function(ms){
return function(){
var h,_6=function(){
if(h){
clearTimeout(h);
h=null;
}
},x=new d.Deferred(_6);
h=setTimeout(function(){
_6();
x.errback(ms);
},ms);
return x;
};
};
})();
return _1.getObject("dojox.lang.async.timeout");
});
require(["dojox/lang/async/timeout"]);
