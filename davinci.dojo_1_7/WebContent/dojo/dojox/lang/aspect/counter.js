/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/aspect/counter",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.lang.aspect.counter",1);
(function(){
var _4=_3.lang.aspect;
var _5=function(){
this.reset();
};
_1.extend(_5,{before:function(){
++this.calls;
},afterThrowing:function(){
++this.errors;
},reset:function(){
this.calls=this.errors=0;
}});
_4.counter=function(){
return new _5;
};
})();
return _1.getObject("dojox.lang.aspect.counter");
});
require(["dojox/lang/aspect/counter"]);
