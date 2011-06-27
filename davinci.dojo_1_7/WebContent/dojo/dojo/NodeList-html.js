/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/NodeList-html",[".","./html"],function(_1){
_1.extend(_1.NodeList,{html:function(_2,_3){
var _4=new _1.html._ContentSetter(_3||{});
this.forEach(function(_5){
_4.node=_5;
_4.set(_2);
_4.tearDown();
});
return this;
}});
return _1.NodeList;
});
