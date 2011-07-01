dojo.provide("davinci.libraries.dojo.dijit.form.DataListHelper");

dojo.declare("davinci.libraries.dojo.dijit.form.DataListHelper", null, {

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		debugger;
		// summary:
		//		If a dojo.data store is specified on the passed widget, returns [].
		//		Otherwise, returns the passed select widget's option tags, recreating them if no longer available in the source.
		//
		//veWidget = widget;
		//widget = veWidget && veWidget.dijitWidget;
		if(!widget){
			return undefined;
		}
		
		var children = [];
		
		if(widget.dijitWidget && widget.dijitWidget.data){
			var store = widget.dijitWidget.data;
			for (var i=0; i < store.length; i++){
					var name = store[i].name; //store.getValue(items[i], "name");
					var value = store[i].value; //store.getValue(items[i], "value");
					children.push({type: "html.option", properties: {value: value}, children: name});
					
				}

			// If the passed ComboBox uses a store other than the internal store _ComboBoxDataStore, return [].
		}else{
			// If the passed select widget is not a ComboBox (DropDownSelect, CheckedMultiSelect, MultiSelect), return the widget's option tags.
			if(widget.domNode.options){
				dojo.forEach(widget.domNode.options, function(o){
					debugger;
					var p = {value: o.value};
					var c = o.innerHTML;
//					if(dojo.indexOf(values, (p.value || c)) >= 0){
//						p.selected = true;
//					}
					children.push({type: "html.option", properties: p, children: c});
				});
			}
		}
		return children;
	},
	
	getData: function(widget, options){
		debugger;
		var data = widget._getData(options);
		/*var data = {};
		data.children = this.getChildrenData(widget, options);
		data.properties = {};
		data.properties.id = widget.id; //"DataList_3"
*/		data.properties['data-dojo-props'] =  'id: "' + widget.id+'"';
		data.properties.dojotype = "dijit.form.DataList";
	    return data;
		
	},
	
	getChildren: function(widget, options){
		debugger;
		var children = [];
		return children;
	},
	
	startup: function(widget, options){
		debugger;
		
	},
	
	create: function(widget, srcElement){
		
		debugger;
		widget.dijitWidget.getChildren = dojo.hitch(this, 'getChildren');
		widget.dijitWidget.startup = dojo.hitch(this, 'startup');
		widget.domNode.style.display = 'none';
	},
	
	destroyWidget: function(widget){
		debugger;
		var localDijit = widget.getContext().getDijit();
		//remove all registered widgets, some may be partly constructed.
		var w= localDijit.byId(widget.id); 
		w.destroy();
/*		localDijit.registry.forEach(function(w){
			//  w.destroy();	
			debugger;
		});*/
	}

	
});