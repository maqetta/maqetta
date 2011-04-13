dojo.provide("davinci.libraries.dojo.dijit.form.DropDownButtonHelper");

dojo.declare("davinci.libraries.dojo.dijit.form.DropDownButtonHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Returns a serialized form of the passed DropDownButton, also serializing the children MenuItems and Menus.
		//
		if(!widget){
			return undefined;
		}
		var data = widget._getData(options);
		if(!data){
			return undefined;
		}
		
		var childData = [];

		if(data.properties.dropDown){
			childData = this.serializedropDown(data.properties.dropDown, widget._edit_context);
			if(childData){
				// clear reference to dropDown to avoid duplication in the source
				data.properties.dropDown = undefined;
				data.children.push(childData);
			}
		}
		return data;
	},
	
	// HACKS: There's probably a better way to do this with the new model, just stopgap measures until Phil takes a look.
	// Calling widget.declaredClass, passing in context instead of using a dvWidget because I couldn't find a handle to one.
	serializedropDown: function(widget, context){
		// summary:
		//		Returns a serialized form of the passed dropDown, collecting only a minimal set of information about the child widgets.
		//
		if(!widget){
			return undefined;
		}
		var data = {type: widget.declaredClass, properties: {}};
		var pChildNodes = widget.containerNode.childNodes;
		var pData = null;
		var dropDownData = [];
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
				// seems like this would keep adding the same dropDown
				if(pData){
					if(!dropDownData){
						dropDownData = pData;
					}
					else{
						dropDownData.push(pData);
					}
				}
				// FIXME: should this really be happening inside the forEach?
				if(dropDownData){
					data.children = dropDownData;
				}
			}
		});
		return data;
	}
});