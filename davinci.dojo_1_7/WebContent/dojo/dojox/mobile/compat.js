define(["dojo/_base/kernel", "dojo/_base/sniff"], function(dojo, sniff){
	dojo.getObject("mobile.compat", true, dojox);
	if(!sniff.isWebKit){
		require(["dojox/mobile/_compat"]);
	}
	return dojox.mobile.compat;
});
