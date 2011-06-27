/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

//>>built
require({cache:{}});define("dojox/mobile/compat",["dojo/_base/kernel","dojo/_base/sniff"],function(_1,_2){_1.getObject("mobile.compat",true,dojox);if(!_2.isWebKit){require(["dojox/mobile/_compat"]);}return dojox.mobile.compat;});