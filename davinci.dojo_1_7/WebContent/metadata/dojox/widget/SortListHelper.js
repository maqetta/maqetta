dojo.provide("davinci.libraries.dojo.dojox.widget.SortListHelper");

dojo.declare("davinci.libraries.dojo.dojox.widget.SortListHelper", null, {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Overrides default _getData behavior to serialize the widget's store with the store's id.
		//
		if(!widget){
			return undefined;
		}

		var data = davinci.ve.widget._getData(widget, options);
		if(data && data.properties && data.properties.store){
			// "store" property must be object ID "string"
			data.properties.store = davinci.ve.widget.getObjectId(data.properties.store);
		}
		return data;
	},

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Serializes the widget's li nodes so they appear as direct children of the widget in the source.
		//
		if(!widget){
			return undefined;
		}

		if(widget.store){
			return undefined;
		}
		var childrenData = [];
		var nodes = dojo.query("li", widget.containerNode);
		dojo.forEach(nodes, function(n){
			childrenData.push({type: "html.li", children: n.innerHTML});
		});
		if(childrenData.length === 0){
			return undefined;
		}
		return childrenData;
	}

});
