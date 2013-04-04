define([
	"dojo/_base/array"
], function(array) {
	
var PopupMenuBarItemHelper = function() {};
PopupMenuBarItemHelper.prototype = {

	create: function(widget, srcElement) {
		var popup = widget.dijitWidget.popup;
		if (popup) {
			// this will hide the dijitMenu in designer
			popup.domNode._dvWidget.hidden = true;
		}
	},
	
	getData: function(/*Widget*/ widget, /*Object*/ options) {
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
		var childData = [];
		if (data.properties.popup) {
			//childData = this.dojo.metadata.dijit.MenuHelper.serializePopup(c.properties.popup, widget._edit_context);
			childData = this.serializePopup(data.properties.popup, widget._edit_context);
			if (childData) {
				// clear reference to popup to avoid duplication in the source
				delete data.properties.popup;
				data.children.push(childData);
			}
		}
		return data;
	},
	
	// Moved this from MenuBarHelper to here #1636
	serializePopup: function(widget, context) {
		// summary:
		//		Returns a serialized form of the passed popup, collecting only a minimal set of information about the child widgets.
		//
		if (!widget) {
			return;
		}

		var data = {type: widget.declaredClass.replace(/\./g, "/"), properties: {}},
			pChildNodes = widget.getChildren(), 
			pData,
			popupData = [];
		// search for child widgets
		array.forEach(pChildNodes, function(n) {
		// only interested in menus or menu items
			pData = {type: n.declaredClass.replace(/\./g, "/"), properties: n.label ? {label: n.label} : {}};
			if (pData) {
				if (!popupData) {
					popupData = pData;
				} else {
					popupData.push(pData);
				}
			}
		});
		if (popupData) {
			data.children = popupData;
		}
		return data;
	}

};

return PopupMenuBarItemHelper;

});