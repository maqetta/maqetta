define([
	"dojo/_base/connect", "dojo/dom-class"
], function(connect, domClass) {
return function() {
	this.create = function(widget) {
		var id = widget.dijitWidget.id,
			context = widget.getContext();
<<<<<<< HEAD
		domClass.add(widget.domNode, "dvHidden");
		widget._helperHandle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			if (!widget.properties.contextMenuForWindow) { return; }
=======
		if (widget.properties && widget.properties.contextMenuForWindow) {
			domClass.add(widget.domNode, "dvHidden");			
		}
		//FIXME: widget is not be a great place to stash things... gets regenerated on modify events
		widget._helperHandle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			var menu = context.getDijit().registry.byId(id);
//			if (!menu) { this.destroy(widget); }
			if (!menu.properties || !menu.properties.contextMenuForWindow) { return; }
>>>>>>> master
			var w = selected[0];
			while (w && w.id != id) {
				if (w._ownerId) {
					w = context.getDijit().registry.byId(w._ownerId);
				} else {
					w = w.getParent && w.getParent();
				}
			}
	
<<<<<<< HEAD
			var menu = context.getDijit().registry.byId(id); // use widget?
=======
>>>>>>> master
			if (w) {
				domClass.remove(menu.domNode, "maqHidden");
				domClass.add(menu.domNode, "maqShown");
			} else {
				domClass.add(menu.domNode, "maqHidden");
				domClass.remove(menu.domNode, "maqShown");
			}
		}.bind(this));
	};

	this.destroy = function(widget) {
		connect.unsubscribe(widget._helperHandle);
		delete widget._helperHandle;

		widget.dijitWidget.destroyRecursive();
	};

	this.getData = function(/*Widget*/ widget, /*Object*/ options) {
		// summary:
		//		Returns a serialized form of the passed Menu/MenuBar, also serializing the children MenuItems and Menus.
		//
		if (!widget) {
			return;
		}
		var data = widget._getData(options);
		if (!data) {
			return;
		}
		var childNodes = data.children;
		if (childNodes) {
			dojo.forEach(childNodes, function(c) {
				// only interested in menus or menu items
				// FIXME: should this also check for length like in serializePopup?
				if (dojo.isString(c)) {
				} else {
					var childData = [];
					if (c.properties.popup) {
						//childData = this.dojo.metadata.dijit.MenuHelper.serializePopup(c.properties.popup, widget._edit_context);
						childData = this.serializePopup(c.properties.popup, widget._edit_context);
						if (childData) {
							// clear reference to popup to avoid duplication in the source
							delete c.properties.popup;
							c.children.push(childData);
						}
					}
				}
			}, this);
		}
		return data;
	};
	
	// HACKS: There's probably a better way to do this with the new model, just stopgap measures until Phil takes a look.
	// Calling widget.declaredClass, passing in context instead of using a dvWidget because I couldn't find a handle to one.
	this.serializePopup = function(widget, context) {
		// summary:
		//		Returns a serialized form of the passed popup, collecting only a minimal set of information about the child widgets.
		//
		if (!widget) {
			return;
		}
		var data = {type: widget.declaredClass, properties: {}},
			pChildNodes = widget.containerNode.childNodes,
			pData,
			popupData = [];
		// search for child widgets
		dojo.forEach(pChildNodes, function(n) {
				// only interested in menus or menu items
				if ((typeof n == "object" && n.nodeType != 1 /*ELEMENT*/) || dojo.isString(n) || n.length) {
					
				} else {
					// get the widget from the node
					var pWidget = context.getDijit().byNode(n);
					pData = {type: pWidget.declaredClass, properties: pWidget.label ? {label: pWidget.label} : {}};

					// FIXME: when is pData reset?
					// seems like this would keep adding the same popup
					if (pData) {
						if (!popupData) {
							popupData = pData;
						} else {
							popupData.push(pData);
						}
					}
					// FIXME: should this really be happening inside the forEach?
					if (popupData) {
						data.children = popupData;
					}
				}
		});
		return data;
	};

	this.getWidgetTextExtra = function(widget) {
		return widget.properties && widget.properties.contextMenuForWindow ? "(context)" : "";
	};
};
});
