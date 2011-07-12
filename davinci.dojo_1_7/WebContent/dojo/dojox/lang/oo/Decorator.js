/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/oo/Decorator",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.lang.oo.Decorator",1);
(function(){
var oo=_3.lang.oo,D=oo.Decorator=function(_4,_5){
this.value=_4;
this.decorator=typeof _5=="object"?function(){
return _5.exec.apply(_5,arguments);
}:_5;
};
oo.makeDecorator=function(_6){
return function(_7){
return new D(_7,_6);
};
};
})();
return _1.getObject("dojox.lang.oo.Decorator");
});
require(["dojox/lang/oo/Decorator"]);
