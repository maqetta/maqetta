define([
    	"dojo/_base/declare",
    	"clipart/_deviceclipart"
], function(declare, _deviceclipart){
	
	return declare("clipart.Android_480x800", [_deviceclipart], {

		// These two values must match width/height attributes on <svg> element for portrait clipart
		defaultWidth:592.6489,
		defaultHeight:1167.8705
		
	});
});
