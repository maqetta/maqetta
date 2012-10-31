define([
    	"dojo/_base/declare",
    	"clipart/_deviceclipart"
], function(declare, _deviceclipart){
	
	return declare("clipart.iPad", [_deviceclipart], {

		// These two values must match width/height attributes on <svg> element for portrait clipart
		defaultWidth:1002.6071,
		defaultHeight:1283.1224
		
	});
});
