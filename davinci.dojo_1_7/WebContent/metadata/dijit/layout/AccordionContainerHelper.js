define([
	"./LayoutContainerHelper"
], function(LayoutContainerHelper) {

var AccordionContainerHelper = function() {};
AccordionContainerHelper.prototype = {
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	initialSize: function(args) {
		return LayoutContainerHelper.prototype.initialSize(args);
	}
};

return AccordionContainerHelper;

});