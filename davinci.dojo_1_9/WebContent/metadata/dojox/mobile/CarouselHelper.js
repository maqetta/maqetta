define([
], function (
) {

var CarouselHelper = function() {};
CarouselHelper.prototype = {
	reparent: function(widget) {
		// FIXME: hack as the items are not being sized correctly
		widget.dijitWidget.resizeItems();
	}
};

return CarouselHelper;

});
