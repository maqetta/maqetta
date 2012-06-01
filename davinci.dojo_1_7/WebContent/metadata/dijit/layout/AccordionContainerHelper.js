define([
	"dojo/_base/declare",
	"./LayoutContainerHelper"
], function(
	declare,
	LayoutContainerHelper
) {

return declare(LayoutContainerHelper, {
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	initialSize: function(args) {
		return this.inherited(arguments);
	}
});

});