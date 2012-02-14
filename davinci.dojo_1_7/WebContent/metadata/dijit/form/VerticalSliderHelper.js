define(
[
	"dojo/_base/declare", 
	"./HorizontalSliderHelper"
],
function(declare, HorizontalSliderHelper) {

return declare(HorizontalSliderHelper, {	
	
	_getDecoration: function(dijitWidget) {
		return dijitWidget.leftDecoration;
	},
	
	_getDecorationLabel: function() {
		return "leftDecoration";
	}
});
});