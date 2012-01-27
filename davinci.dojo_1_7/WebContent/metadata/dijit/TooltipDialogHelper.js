define([
    "dojo/_base/connect"
], function(connect){

var handle,
	TooltipDialogHelper = function() {};

TooltipDialogHelper.prototype = {

	destroy: function(widget) {
		if (handle) {
			connect.unsubscribe(handle);
			handle = null;
		}
		widget.dijitWidget.destroyRecursive();
	},

	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 */
	onToggleVisibility: function(widget, on) {
		return false;
	},

	onSelect: function(widget) {
		var owner = widget.dijitWidget.owner;
		if (owner) {
			owner.openDropDown();
		}

		var id = widget.dijitWidget.id,
		context = widget.getContext();
		handle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			for(var w = selected[0]; w && w != widget; w = w.getParent && w.getParent()) {}
			if (!w || w.getContext() != context) { return; }
			if(!w || w.id != id) {
				var owner = context.getDijit().registry.byId(id).owner;
				if (owner) {
					owner.closeDropDown();
				}
				connect.disconnect(handle);
				handle = null;
			}
		});
	}

};

return TooltipDialogHelper;

});