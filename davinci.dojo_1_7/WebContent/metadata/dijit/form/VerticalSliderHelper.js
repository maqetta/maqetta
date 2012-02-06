define(
[
	"dojo/_base/declare", 
	"./HorizontalSliderHelper", 
],
function(declare, HorizontalSliderHelper) {

return declare("davinci.libraries.dojo.dijit.form.VerticalSliderHelper", HorizontalSliderHelper, {	
	
	_getDecoration: function(dijitWidget) {
		return dijitWidget.leftDecoration;
	}
});
});