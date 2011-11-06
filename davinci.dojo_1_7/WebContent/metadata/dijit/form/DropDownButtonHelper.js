define(["dojo/_base/array", "dojo/_base/connect"], function(array, connect) {
	return function() {
		this.create = function(widget, srcElement) {
			var dw = widget.dijitWidget,
				setup = function() {
					if (dw.dropDown) {
						dw.dropDown._popupWrapper._dvWidget.hidden = true; // this will hide the dijitMenu in designer
						dw.dropDown.owner = dw; // leave a path to make it possible to get from the popup back to the dropdown instance
					}
				},
				handle = connect.connect(dw, 'startup', function() {
					if (handle) {
						connect.disconnect(handle);
					}
					setup();
				});
			setup();
		};

		this.getData = function(/*Widget*/ widget, /*Object*/ options) {

			// summary:
			//		Returns a serialized form of the passed DropDownButton, also serializing the children MenuItems and Menus.
			//
			if (!widget) {
				return undefined;
			}
			var data = widget._getData(options);
			if (!data) {
				return undefined;
			}
			
			var childData = [];
	
			if (data.properties.dropDown) {
				childData = serializeDropDown(data.properties.dropDown, widget._edit_context);
				if (childData) {
					// clear reference to dropDown to avoid duplication in the source
					delete data.properties.dropDown;
					data.children.push(childData);
				}
			}
			return data;
		};

		this.getChildren = function(widget) {
			var dropDown = widget.dijitWidget.dropDown;
			return dropDown ? [davinci.ve.widget.getWidget(dropDown.domNode)] : [];
		};

		// HACKS: There's probably a better way to do this with the new model, just stopgap measures until Phil takes a look.
		// Calling widget.declaredClass, passing in context instead of using a dvWidget because I couldn't find a handle to one.
		var serializeDropDown = function(widget, context) {
			// summary:
			//		Returns a serialized form of the passed dropDown, collecting only a minimal set of information about the child widgets.
			//
			if (!widget) {
				return undefined;
			}
			var data = {type: widget.declaredClass, properties: {}},
				pChildNodes = widget.containerNode.childNodes,
				dropDownData = [];

			// search for child widgets
			array.forEach(pChildNodes, function(n){
				// only interested in menus or menu items
				if((typeof n == "object" && n.nodeType != 1 /*ELEMENT*/) || typeof n == "string" || n.length){
					
				} else {
					// get the widget from the node
					var pWidget = context.getDijit().byNode(n),
						pData = {type: pWidget.declaredClass, properties: {}};

					if (pWidget.label) {
						pData.properties.label = pWidget.label;
					}
					// FIXME: when is pData reset?
					// seems like this would keep adding the same dropDown
					if (pData) {
						if (!dropDownData) {
							dropDownData = pData;
						} else {
							dropDownData.push(pData);
						}
					}
					// FIXME: should this really be happening inside the forEach?
					if (dropDownData) {
						data.children = dropDownData;
					}
				}
			});
			return data;
		};
	};
});