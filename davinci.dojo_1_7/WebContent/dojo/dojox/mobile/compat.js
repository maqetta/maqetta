define([".","dojo/_base/kernel", "dojo/_base/sniff"], function(mcompat,dojo, sniff){
	dojo.getObject("mobile.compat", true, dojox);
	if(!sniff.isWebKit){
		require([
			"dojox/mobile/_compat",
			"dojo/fx",
			"dojo/fx/easing"
		]);
	}
	return dojox.mobile.compat;
});
