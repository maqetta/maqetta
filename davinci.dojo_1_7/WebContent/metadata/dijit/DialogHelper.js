define([
        "dojo/_base/connect"
], function(connect) {
return function() {
	this.create = function(widget) {
		var id = widget.dijitWidget.id,
			context = widget.getContext();
		//FIXME: not safe to use 'this' since the helper instance does not correspond to the widget
		widget._helperHandle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			var w = selected[0];
			while (w && w.id != id) {
				if (w._ownerId) {
					w = context.getDijit().registry.byId(w._ownerId);
				} else {
					w = w.getParent && w.getParent();
				}
			}

			var dialog = context.getDijit().registry.byId(id);
			if (!w) {
				dialog.hide();
			} else {
				dialog.show();
			}
		}.bind(this));		
	};

	this.destroy = function(widget) {
		connect.unsubscribe(widget._helperHandle);
		delete widget._helperHandle;

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
};
});
