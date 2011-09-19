dojo.provide("dojox.encoding.tests.digests._base");
dojo.require("dojox.encoding.digests._base");

try{
	dojo.require("dojox.encoding.tests.digests.MD5");
	dojo.require("dojox.encoding.tests.digests.SHA1");
}catch(e){
	doh.debug(e);
}
