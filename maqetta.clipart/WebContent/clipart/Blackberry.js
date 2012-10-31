define([
    	"dojo/_base/declare",
    	"clipart/_deviceclipart"
], function(declare, _deviceclipart){
	
	return declare("clipart.Blackberry", [_deviceclipart], {

		// These two values must match width/height attributes on <svg> element for portrait clipart
		defaultWidth:438,
		defaultHeight:794.84832
		
	});
});
