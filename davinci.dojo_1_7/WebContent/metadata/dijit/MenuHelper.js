dojo.provide("davinci.libraries.dojo.dijit.MenuHelper");

dojo.declare("davinci.libraries.dojo.dijit.MenuHelper", null, {

		getData: function(/*Widget*/ widget, /*Object*/ options){
			// summary:
			//		Returns a serialized form of the passed Menu/MenuBar, also serializing the children MenuItems and Menus.
			//
				if(!widget){
					return undefined;
				}
				var data = widget._getData(options);
				if(!data){
					return undefined;
				}
				var childNodes = data.children;
					if(childNodes){
						var self = this;
						dojo.forEach(childNodes, function(c){
								// only interested in menus or menu items
								// FIXME: should this also check for length like in serializePopup?
								if(dojo.isString(c)){
								}
								else{
									var childData = [];
									if(c.properties.popup){
										//childData = this.dojo.metadata.dijit.MenuHelper.serializePopup(c.properties.popup, widget._edit_context);
										childData = self.serializePopup(c.properties.popup, widget._edit_context);
										if(childData){
											// clear reference to popup to avoid duplication in the source
											c.properties.popup = undefined;
											c.children.push(childData);
										}
									}
								}
						});
					}
			return data;
		},
		
		// HACKS: There's probably a better way to do this with the new model, just stopgap measures until Phil takes a look.
		// Calling widget.declaredClass, passing in context instead of using a dvWidget because I couldn't find a handle to one.
		serializePopup: function(widget, context){
			// summary:
			//		Returns a serialized form of the passed popup, collecting only a minimal set of information about the child widgets.
			//
			if(!widget){
				return undefined;
			}
			var data = {type: widget.declaredClass, properties: {}};
			var pChildNodes = widget.containerNode.childNodes;
			var pData = null;
			var popupData = [];
			// search for child widgets
			dojo.forEach(pChildNodes, function(n){
					// only interested in menus or menu items
					if((typeof n == "object" && n.nodeType != 1 /*ELEMENT*/) || (dojo.isString(n) || n.length)){
						
					}
					else {
						// get the widget from the node
						var pWidget = context.getDijit().byNode(n);
						if(pWidget.label){
							pData = {type:pWidget.declaredClass, properties: {label:pWidget.label}};
						}else{
							pData = {type:pWidget.declaredClass, properties:{}};
						}
						// FIXME: when is pData reset?
						// seems like this would keep adding the same popup
						if(pData){
							if(!popupData){
								popupData = pData;
							}
							else{
								popupData.push(pData);
							}
						}
						// FIXME: should this really be happening inside the forEach?
						if(popupData){
							data.children = popupData;
						}
					}
			});
			return data;
		}
		
});