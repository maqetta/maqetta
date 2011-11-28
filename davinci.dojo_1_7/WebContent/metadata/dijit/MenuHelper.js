define([
], function() {
return function() {
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

	this.onSelect = function(widget) {
		// use listener logic like dialog to trigger this code when child widgets are selected
		widget._visibility = widget.domNode.style.visibility;
		widget.domNode.style.visibility = "visible";
	};

	this.onDeselect = function(widget) {
		widget.domNode.style.visibility = widget._visibility;
		delete widget._visibility;
		return true;
	};

	this.getWidgetTextExtra = function(widget) {
		return widget.properties && widget.properties.contextMenuForWindow ? "(context)" : "";
	};
};
});
