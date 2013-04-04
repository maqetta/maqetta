define([
	"dojo/_base/connect",
	"dojo/_base/array",
	"dojo/dom-class"
], function(
	connect,
	array,
	domClass
) {

var MenuHelper = function() {};
MenuHelper.prototype = {

	create: function(widget) {
		var id = widget.dijitWidget.id,
			context = widget.getContext();
		if (widget.properties && widget.properties.contextMenuForWindow) {
			domClass.add(widget.domNode, "dvHidden");			
		}
		//FIXME: widget is not be a great place to stash things... gets regenerated on modify events
		widget._helperHandle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			var menu = context.getDijit().registry.byId(id);
//			if (!menu) { this.destroy(widget); }
//			if (!menu) { console.log("MenuHelper: menu is null"); return; }
			if (!menu || !menu.properties || !menu.properties.contextMenuForWindow) { return; }
			var w = selected[0];
			while (w && w.id != id) {
				if (w._ownerId) {
					w = context.getDijit().registry.byId(w._ownerId);
				} else {
					w = w.getParent && w.getParent();
				}
			}

			if (w) {
				domClass.remove(menu.domNode, "maqHidden");
				domClass.add(menu.domNode, "maqShown");
			} else {
				domClass.add(menu.domNode, "maqHidden");
				domClass.remove(menu.domNode, "maqShown");
			}
		});
	},

	destroy: function(widget) {
		connect.unsubscribe(widget._helperHandle);
		delete widget._helperHandle;

		widget.dijitWidget.destroyRecursive();
	},

	getData: function(/*Widget*/ widget, /*Object*/ options) {
		// summary:
		//		Returns a serialized form of the passed Menu/MenuBar, also serializing the children MenuItems and Menus.
		//
		if (!widget) {
			return;
		}
		var data = widget._getData(options);
		return data;
	},
	
	getWidgetTextExtra: function(widget) {
		return widget.properties && widget.properties.contextMenuForWindow ? "(context)" : "";
	}
};

return MenuHelper;

});