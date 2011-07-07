/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel"],function(_1){
_1.getObject("encoding.crypto",true,dojox);
var c=dojox.encoding.crypto;
c.cipherModes={ECB:0,CBC:1,PCBC:2,CFB:3,OFB:4,CTR:5};
c.outputTypes={Base64:0,Hex:1,String:2,Raw:3};
return dojox.encoding.crypto;
});
