dojo.provide("davinci.libraries.dojo.dojox.grid.DataGridHelper");

dojo.declare("davinci.libraries.dojo.dojox.grid.DataGridHelper", null, {

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
	var columns = undefined;
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

create: function(widget, srcElement){

	var storeId = srcElement.getAttribute("store");
	if(storeId){
		var storeWidget = davinci.ve.widget.byId(storeId);

		if (storeWidget /*&& storeWidget.properties*/ && widget.dijitWidget && widget.dijitWidget.store){  //wdr 3-11
			this.updateStore(widget.dijitWidget.store, storeWidget/*.properties*//*.data*/);
			//this.replaceStoreData(widget.dijitWidget.store, storeWidget.properties.data);
		}
	
	}
	
	this.postCreate(widget); // #79
	

},

updateStore: function(store, /*properties*/ storeWidget) { //wdr 3-11
	var data = storeWidget._srcElement.getAttribute('data'); //wdr 3-11
	var url = storeWidget._srcElement.getAttribute('url'); //wdr 3-11
	if (/*properties.*/data){ //wdr 3-11
		var value = /*properties.*/data; // wdr 3-11
		var storeData = eval('storeData = '+value);
		var data = { identifier: storeData.identifier,  items:[] };
	
		var items = data.items;
		var storeDataItems = storeData.items;
		for (var r = 0; r < storeDataItems.length; r++){
			var item = new Object();
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
		store.close();
		store.fetch({
			query: this.query,
			queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items){
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					console.warn("i=", i, "item=", item);
				}
			})
		});
	}else{ // must be url data store
		// Kludge to force reload of store data
		store.clearOnClose = true;
		store.url = /*properties.*/url; // wdr 3-11
		delete store.data; // wdr remove old url if switching
		store.close();
	}
	
	//return this.replaceDataGridStoreData(data);
	//this.replaceStoreData(store, data);
},

//wdr #79
getChildren: function(widget){
	debugger;
	var children=[];
	var x = widget.dijitWidget.getChildren();
	var y = widget.domNode.children;
	var y = widget.domNode._dvWidget.domNode.children;
	var context = widget.getContext();
	
	// First create the headers
	var rowWidget = davinci.ve.widget.createWidget({type: "html.tr" , properties: {
        "class":"dataGridHeaderRowTest"}, children: [], context: context});
	rowWidget.getHelper = dojo.hitch(this, "getDataGridRowHelper");
	rowWidget.selectChild = dojo.hitch(this, "selectChild");
	widget.addChild(rowWidget);
	children.push(rowWidget);
	rowWidget.dataGridLocation = {row: 0, col: -1};
	var headerRowTable = dojo.query('TH.dojoxGridCell', widget.domNode);
	for (var rh = 0; rh < headerRowTable.length; rh++){
		var cell = davinci.ve.widget.createWidget({type: "html.th" , properties: {"class":"dataGridHeaderCellTest"}, children: [], context: context});
		cell.getHelper = dojo.hitch(this, "getDataGridRowHelper");
		cell.dataGridLocation = {row: 0, col: rh}; 
		rowWidget.addChild(cell);
	}
	// Now create the cells for Data
	var dataGridRows = dojo.query('table.dojoxGridRowTable',widget.domNode);
	for (var tr = 1; tr < dataGridRows.length; tr++){
		rowWidget = davinci.ve.widget.createWidget({type: "html.tr" , properties: {
	        "class":"dataGridRowTest"}, children: [], context: context});
		rowWidget.getHelper = dojo.hitch(this, "getDataGridRowHelper");
		rowWidget.selectChild = dojo.hitch(this, "selectChild");
		rowWidget.dataGridLocation = {row: tr, col: -1};
		widget.addChild(rowWidget);
		children.push(rowWidget);
		var gridCells = dojo.query('TD.dojoxGridCell', dataGridRows[tr]); // get the cells for this row
		for (var td = 0; td < gridCells.length; td++){
			cellWidget = davinci.ve.widget.createWidget({type: "html.td" , properties: {
		        "class":"dataGridCellTest"}, children: [], context: context});
			cellWidget.getHelper = dojo.hitch(this, "getDataGridRowHelper");
			cell.dataGridLocation = {row: tr, col: td};
			rowWidget.addChild(cellWidget);
		}
	}

//	for (var c=0; c < y.length; c++){
//		if (y[c]._dvWidget){
//			children.push(y[c]._dvWidget);
//		} else {
//			y[c]._parentDataGrid = this;
//			//var headerRowTable = dojo.query('.dojoxGridHeader', widget.domNode);
//			var headerRowTable = dojo.query('TH.dojoxGridCell', widget.domNode);
//			var headerGridCell = dojo.query('.dojoxGridCell', widget.domNode); 
//			for (var x=0; x < headerGridCell.length; x++){
//				
//				var node = headerGridCell[x];
//				var box = dojo.position(node, true);
//				var ldojo = widget.getContext().getDojo();
//				var lbox = ldojo.position(node, true);
//				console.log(" w:" + lbox.w+" h:" + lbox.h+ " x:"+lbox.x+" y: "+lbox.y);
//				node = headerRowTable[0];
//				box = dojo.position(node, true);
//				lbox = ldojo.position(node, true);
//				console.log("th w:" + lbox.w+" th h:" + lbox.h+ " x:"+lbox.x+" y: "+lbox.y);
//
//			}
//			var newWidget = davinci.ve.widget.createWidget({type: "html.th" , properties: {
//				                                                   "class":"dataGridTest"}, children: [], context: widget.getContext()});
//			var cell = davinci.ve.widget.createWidget({type: "html.div" , properties: {"style": "height:20px; width:400px; background-color:red;",
//                "class":"dataGridCellTest"}, children: [], context: widget.getContext()});
//			y[c].getContext = dojo.hitch(this, "getContext");
//			newWidget.getHelper = dojo.hitch(this, "getDataGridRowHelper");
//			newWidget._headerRowTable = headerRowTable;
//			cell.getHelper = dojo.hitch(this, "getDataGridRowHelper");
//			cell._headerGridCell = headerGridCell;
//			//children.push(y[c]);
//			children.push(newWidget);
//			widget.addChild(  newWidget/*, this._index*/);
//			newWidget.addChild(cell);
//			//widget._srcElement.parent.addChild(newWidget);
//			
//			var context = widget.getContext();
//			if(context){
//				context.attach(newWidget);
//				newWidget.startup();
//				newWidget.renderWidget();
//			}
//		}
//	}
//
//	dojo.map(widget.dijitWidget.getChildren(), function(widget){
//		debugger;
//		if (!widget){ return; }
//		if (attach && !widget.domNode._dvWidget)
//		{
//			davinci.ve.widget.getWidget(widget.domNode);
//		}
//		var child = widget.domNode && widget.domNode._dvWidget;
//		if (child) {
//			children.push(child);
//		}
//	});
	return children;
},

getContext: function(){
	debugger;
	
},

getDataGridRowHelper: function(){
	debugger; 
	// FIXME I think we should create a helper object for rows and return it here
	return this;
},

getSelectNode: function(context, widget){
	debugger;
	if (widget.type === 'html.th' /*_headerRowTable*/){
		var headerRowTable = dojo.query('TH.dojoxGridCell', widget.parent.parent.domNode);
		return headerRowTable[widget.dataGridLocation.col]; //widget._headerRowTable[0];
	} else if(widget._headerGridCell){
		var headerGridCell = dojo.query('.dojoxGridCell', widget.parent._headerRowTable[0]); 
		var node = headerGridCell[0];
		var box = dojo.position(node, true);
		//return widget._headerGridCell[0];
		return node;
	}
	return widget.getStyleNode();
	
},

postCreate: function(widget){
	debugger;
	var headerRowTable = dojo.query('TH.dojoxGridCell', widget.domNode);
	widget.dijitWidget
	//dojo.connect(widget.dijitWidget, "onCellClick", null, function() {alert("onClick");}); 
	dojo.connect(widget.dijitWidget, "onCellClick", this, "onClick"); 
	//var context = widget.getContext();
	var newWidget = davinci.ve.widget.createWidget({type: "html.div" , properties: {"style": "height:20px; width:400px; background-color:red;",
		                                                            "class":"dataGridTest", id: "myDataGridTest_id"}, children: []/*, context: context*/});
	widget.addChild(  newWidget/*, this._index*/);
	
	var context = widget.getContext();
	if(context){
		context.attach(newWidget);
		newWidget.startup();
		newWidget.renderWidget();
	}
},

getEnclosingWidget: function(node){
	debugger;
	node.getContext = function () {
		debugger;
		var node = this;
		while(node){
			if (node._dvWidget) {
				return node._dvWidget.getContext();
			}
			node = node.parentNode;
		}
		return null;
	};
	return node._dvWidget; //maybe??
	
	
},

onClick : function(e){
	debugger;
	//alert("onClick");
},

selectChild: function(widget){
	debugger;
},

_setContentAttr: function(args){
	debugger; // wdr attempt to override selection
}
//wdr #79


//replaceStoreData: function(store, data) {
//	// Kludge to force reload of store data
//	store.clearOnClose = true;
//	//if (!store.data)
//	store.data = data;
//	store.close();
//	store.fetch({
//		query: this.query,
//		queryOptions:{deep:true}, 
//		onComplete: dojo.hitch(this, function(items){
//			for (var i = 0; i < items.length; i++) {
//				var item = items[i];
//				console.warn("i=", i, "item=", item);
//			}
//		})
//	});
//}
//replaceDataGridStoreData: function(data) {
//	var store = this._widget.dijitWidget.store;
//
//	this.replaceStoreData(store, data);
//
//	store.data = data;
//	// FIXME: How do we set this such that the model recognizes the update?
//	// Berkland: How do we get the corresponding dv widget handle from something like a dojo data store object? Doesn't seem to be any handle attached.
//	//var dvWidget = davinci.ve.widget.getWidget(store.domNode);
//}

});