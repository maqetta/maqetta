define([
	"davinci/ve/widget"
], function(Widget) {

var TreeGridHelper = function() {};
TreeGridHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Serialize the passed DataGrid.
		//		Writes a dojo/method script tag as a child to the DataGrid to set the structure, if one doesn't already exist.
		//

		if(!widget){
			return undefined;
		}

		// call the old _getData
		var data = widget._getData(options);
		// only write the script tag if this call is for serializing and there is a structure to serialize
		if(data && options && options.serialize && widget.structure){
			// the JS that sets the structure, this=the DataGrid
			var value = "this.setStructure(" + this._serializeStructure(widget.structure) + ");";
			// if there is already a script tag, try to find a dojo/method script tag and append the JS to it
			if(data.scripts){
				if(!dojo.some(data.scripts, function(s){
					if(s.type == "dojo/method" && !s.name && s.value &&
						s.value.substring(0, 18) == "this.setStructure("){
						s.value = value;
						return true;
					}
					return false;
				})){ // not found
					data.scripts.push({type: "dojo/method", value: value});
				}
			}else{
				// make a new set of scripts with this setStructure call
				data.scripts = [{type: "dojo/method", value: value}];
			}
		}
		if (widget.dijitWidget.store){
			data.properties.store = widget.dijitWidget.store; // add the data old store if it has one.
		}
		return data;
	},

	_serializeStructure: function(/*Object*/ structure){
		// summary:
		//		Serialize the passed DataGrid's structure.
		//		DataGrid does additional parsing to a structure once the DataGrid loads it, so undo that work and return the JSON.
		//

		if(!structure){
			return undefined;
		}
		var columns;
		try{
			columns = structure.cells;
		}catch(e){
		}
		if(!columns){
			return undefined;
		}

		// returned string
		var s = "";
		// serialize each column of the structure
		// assumption: there is only one row declaration
		dojo.forEach(columns, function(c){
			var cs = "";
			// parameters to serialize: field, name, width, editor
			var field = c.field;
			if(field || field === 0){
				cs += "field: " + (dojo.isString(field) ? "\"" + field + "\"" : field);  
			}
			var name = c.name;
			if(name){
				if(cs){
					cs += ", ";
				}
				cs += "name: \"" + name + "\"";
			}
			var width = c.width;
			if(width){
				if(cs){
					cs += ", ";
				}
				cs += "width: " + (dojo.isString(width) ? "\"" + width + "\"" : width);
			}
			var editor = c.editor;
			if(editor){
				// supported editors: Input, Bool, Select
				if(cs){
					cs += ", ";
				}
				if(editor == dojox.grid.editors.Input){
					cs += "editor: dojox.grid.editors.Input";
				}else if(editor == dojox.grid.editors.Bool){
					cs += "editor: dojox.grid.editors.Bool";
				}else if(editor == dojox.grid.editors.Select){
					cs += "editor: dojox.grid.editors.Select";
					var options = c.options;
					if(options){
						cs += ", options: " + dojo.toJson(options);
					}
				}
			}
			if(s){
				s += ", ";
			}
			s += "{" + cs + "}";
		});
		return "{cells: [" + s + "]}";
	},

// XXX This function doesn't do anything, since the important bits were already
//   commented out.
	// create: function(widget, srcElement) {
	// 	var storeId = srcElement.getAttribute("store");
	// 	if(storeId){
	// 		var storeWidget = Widget.byId(storeId);

	// 		if (storeWidget /*&& storeWidget.properties*/ && widget.dijitWidget && widget.dijitWidget.store){  
	// 		//	this.updateStore(widget, storeWidget);
	// 		}
	// 	}
	// },

	updateStore: function(widget,  storeWidget, w) { 
		var store = widget.dijitWidget.store;
		var data = storeWidget._srcElement.getAttribute('data'); 
		var url = storeWidget._srcElement.getAttribute('url'); 
		//var callback = storeWidget._srcElement.getAttribute('jsonpcallback');
		if (data){ 
			var value = data; 
			var storeData = eval('storeData = '+value);
			data = {
				identifier: storeData.identifier,
				items:[]
			};
		
			var items = data.items;
			var storeDataItems = storeData.items;
			for (var r = 0; r < storeDataItems.length; r++){
				var item = {};
				var dataStoreItem = storeDataItems[r];
				for (var name in dataStoreItem){
					//item[name] = dataStoreItem[name][0];
					item[name] = dataStoreItem[name];
				}
				items.push(item);
			}
			
			// Kludge to force reload of store data
			store.clearOnClose = true;
			//if (!store.data)
			store.data = data;
			delete store.url; // wdr remove old url if switching
		//	delete store._jsonpCallback; // remove old callback if switching
			store.close();
			widget.dijitWidget.setStore(store);
	//		store.fetch({
	//			query: this.query,
	//			queryOptions:{deep:true}, 
	//			onComplete: dojo.hitch(this, function(items){
	//				for (var i = 0; i < items.length; i++) {
	//					var item = items[i];
	//					console.warn("i=", i, "item=", item);
	//				}
	//				//widget.dijitWidget.setStore(store,this.query,{deep:true});
	//				//widget.dijitWidget._refresh(true);
	//			})
	//		});
		}else{ // must be url data store
			// Kludge to force reload of store data
			store.clearOnClose = true;
			store.url = url; 
			//store._jsonpCallback = callback;
			delete store.data; // wdr remove old url if switching
			store.close();
		}
	}

};

return TreeGridHelper;

});