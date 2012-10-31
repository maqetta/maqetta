define(function() {

var SelectHelper = function() {};
SelectHelper.prototype = {

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		If a dojo.data store is specified on the passed widget, returns [].
		//		Otherwise, returns the passed select widget's option tags, recreating them if no longer available in the source.
		//
		var veWidget = widget;
		widget = veWidget && veWidget.dijitWidget;
		if(!widget){
			return undefined;
		}
		
		var children = [];
		var store = widget.store;
		if(store){
			// If the passed ComboBox uses the _ComboBoxDataStore, fetch all of its items and return them as option tags (ComboBox constructs the store internally from them).
			if(!veWidget.getObjectId(store) &&
				store.declaredClass == "dijit.form.DataList" ){ // internal store
				var items = store.query(function(){return true;},{ignoreCase: true} );
				for (var i=0; i < items.length; i++){
					var name = store.getValue(items[i], "name");
					var value = store.getValue(items[i], "value");
					children.push({type: "html.option", properties: {value: value}, children: name});
					
				}

			}
			// If the passed ComboBox uses a store other than the internal store _ComboBoxDataStore, return [].
		} else {
			// If the passed select widget is not a ComboBox (DropDownSelect, CheckedMultiSelect, MultiSelect), return the widget's option tags.
			var values = (widget.getValue() || []);
			if (widget.options) {
				dojo.forEach(widget.options, function(o){
					var p = {value: o.value};
					var c = o.label;
					if(dojo.indexOf(values, (p.value || c)) >= 0){
						p.selected = true;
					}
					children.push({type: "html.option", properties: p, children: c});
				});
			}else if(widget.containerNode){ // MultiSelect
				dojo.query("option", widget.containerNode).forEach(function(n){
					var p = {value: n.value};
					var c = n.innerHTML;
					if(dojo.indexOf(values, (p.value || c)) >= 0){
						p.selected = true;
					}
					children.push({type: "html.option", properties: p, children: c});
				});
			}
		}
		return children;
	}

};

return SelectHelper;

});