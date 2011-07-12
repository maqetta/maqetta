/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/cometd/timestamp",["dojo","dijit","dojox","dojox/cometd/_base"],function(_1,_2,_3){
_1.getObject("dojox.cometd.timestamp",1);
_3.cometd._extendOutList.push(function(_4){
_4.timestamp=new Date().toUTCString();
return _4;
});
return _1.getObject("dojox.cometd.timestamp");
});
require(["dojox/cometd/timestamp"]);
