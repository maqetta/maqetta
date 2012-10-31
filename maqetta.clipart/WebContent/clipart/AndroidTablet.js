define([
    	"dojo/_base/declare",
    	"clipart/_deviceclipart"
], function(declare, _deviceclipart){
	
	return declare("clipart.AndroidTablet", [_deviceclipart], {

		// These two values must match width/height attributes on <svg> element for portrait clipart
		defaultWidth:1094.3127,
		defaultHeight:1522.9786
		
	});
});
