define([
        "dojo/_base/connect"
], function(connect) {
return function() {
	this.destroy = function(widget) {
		if (this.handle) {
			connect.unsubscribe(this.handle);
			delete this.handle;
		}
		widget.dijitWidget.destroyRecursive();
	};

	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 */
	this.onToggleVisibility = function(widget, on) {
		return false;
	};

	this.onSelect = function(widget) {
		widget.dijitWidget.show();

		var id = widget.dijitWidget.id,
		context = widget.getContext();
		//FIXME: not safe to use 'this' since the helper instance does not correspond to the widget
		this.handle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			var w = selected[0];
			while (w && w.id != id) {
				if (w._ownerId) {
					w = context.getDijit().registry.byId(w._ownerId);
				} else {
					w = w.getParent && w.getParent();
				}
			}

			if (!w || w.id != id) {
				context.getDijit().registry.byId(id).hide();
				connect.disconnect(this.handle);
				delete this.handle;
			}
		}.bind(this));
	};
};
});
