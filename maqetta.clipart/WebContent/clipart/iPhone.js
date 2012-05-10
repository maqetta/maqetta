define([
		"dojo/_base/declare",
		"clipart/_deviceclipart"
], function(declare, _deviceclipart){

	return declare("clipart.iPhone", [_deviceclipart], {

		// These two values must match width/height attributes on <svg> element for portrait clipart
		defaultWidth:385.5645,
		defaultHeight:747.8577

	});
});
