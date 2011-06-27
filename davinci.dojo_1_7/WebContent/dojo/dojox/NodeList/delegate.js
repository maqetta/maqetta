/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/NodeList/delegate",["dojo","dijit","dojox","dojo/NodeList-traverse"],function(_1,_2,_3){
_1.getObject("dojox.NodeList.delegate",1);
_1.extend(_1.NodeList,{delegate:function(_4,_5,fn){
return this.connect(_5,function(_6){
var _7=_1.query(_6.target).closest(_4,this);
if(_7.length){
fn.call(_7[0],_6);
}
});
}});
return _1.getObject("dojox.NodeList.delegate");
});
require(["dojox/NodeList/delegate"]);
