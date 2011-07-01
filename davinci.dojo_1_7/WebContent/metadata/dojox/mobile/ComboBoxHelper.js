dojo.provide("davinci.libraries.dojo.dojox.mobile.ComboBoxHelper");
dojo.require("davinci.ve.tools.CreateTool");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ComboBoxHelper", null, {

/*	getChildrenData: function(Widget widget, Object options){
		debugger;
		// summary:
		//		If a dojo.data store is specified on the passed widget, returns [].
		//		Otherwise, returns the passed select widget's option tags, recreating them if no longer available in the source.
		//
		veWidget = widget;
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
					var name = items[i].name; //store.getValue(items[i], "name");
					var value = items[i].value; //store.getValue(items[i], "value");
					children.push({type: "html.option", properties: {value: value}, children: name});
					
				}

			}
			// If the passed ComboBox uses a store other than the internal store _ComboBoxDataStore, return [].
		}else{
			// If the passed select widget is not a ComboBox (DropDownSelect, CheckedMultiSelect, MultiSelect), return the widget's option tags.
			if(widget.options){
				var values = widget.getValue();
				if(!dojo.isArray(values)){
					values = [];
				}
				dojo.forEach(widget.options, function(o){
					var p = {value: o.value};
					var c = o.label;
					if(dojo.indexOf(values, (p.value || c)) >= 0){
						p.selected = true;
					}
					children.push({type: "html.option", properties: p, children: c});
				});
			}else if(widget.containerNode){ // MultiSelect
				var values = (widget.getValue() || []);
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
	},*/
	
	create: function(widget, srcElement){
		debugger;
		/*if(!this._context.loadRequires(dataList.type,true) ||
				!this._context.loadRequires(comboBox.type,true)){
				return;
			}
		var combo = new dojox.mobile.ComboBox({value: "Item 1", list:"DataList_1", id:"mobile_mine2"},widget.domNode);
		try {
			var dj = this.getDojo();
			dj["require"]("dojo.parser");
			dj.parser.parse(containerNode);
		} catch(e){
			// When loading large files on FF 3.6 if the editor is not the active editor (this can happen at start up
			// the dojo parser will throw an exception trying to compute style on hidden containers
			// so to fix this we catch the exception here and add a subscription to be notified when this editor is seleected by the user
			// then we will reprocess the content when we have focus -- wdr
			
			// remove all registered widgets, some may be partly constructed.
			var localDijit = this.getDijit();
			localDijit.registry.forEach(function(w){
				  w.destroy();			 
			});
			this._editorSelectConnection = dojo.subscribe("/davinci/ui/editorSelected",  dojo.hitch(this, this._editorSelectionChange));
		}
		*/
		//var dj = this._context.getDojo(),
	//	containerNode = widget.getContainerNode();
  //  dj["require"]("dojo.parser");
   // dojo.parser.parse(widget.domNode);
//		var id = this.getDataListId(widget)
//		var dataListWidget = dijit.byId(id); 
//		var storeWidget = davinci.ve.widget.byId(id);
		this.updateDataListWidget(widget);
		
		widget.domNode.style.display = '';
		debugger;
	},

	updateDataListWidget: function(widget){
		
		var storeId;
		var value;
		
		debugger;
		var dojoProps;
		if (widget._params['data-dojo-props']){
			dojoProps = widget._params['data-dojo-props'].split(',');
		} else if(widget._params.properties['data-dojo-props']){
			dojoProps = widget._params.properties['data-dojo-props'].split(',');
		} else {
			throw('ComboBoxHelper: Error missing data-dojo-props')
			
		}
		//"value:"Item 1", list:"DataList_1""
		var patt= new RegExp('^[ \s]+|[ \s]+$', "g");
		var re = new RegExp('"', "g");
		for (var i = 0; i < dojoProps.length; i++){
			var prop = dojoProps[i].split(':');
			var result = prop[0].replace(patt, '');
			if(result === 'list'){ 
				storeId =  prop[1].replace(re,'');
				storeId = storeId.replace(patt, '');
			}else if(result === 'value'){
				value = prop[1].replace(re,'');
				value = value.replace(patt, '');
			}
		}
		var storeWidget = davinci.ve.widget.byId(storeId);
		if(storeWidget.dijitWidget){ // only replace the store if we find a new one. 
			widget.dijitWidget.store = storeWidget.dijitWidget;
		}
		widget.domNode.value = value;

		
	},
	
	getData: function(widget, options){
/*		
		children: Array[0]
	length: 0
	__proto__: Array[0]
	properties: Object
	id: "input_0"
	isTempID: true
	__proto__: Object*/
		debugger;
		var data = widget._getData(options);

		if (widget.dijitWidget.params['data-dojo-props']){
			data.properties['data-dojo-props'] = widget.dijitWidget.params['data-dojo-props'];
		} else {
			data.properties['data-dojo-props'] ='value: "'+widget.dijitWidget.params.value+'", list: "'+widget.dijitWidget.params.list+'"';
		}
	
//		var data = {};
//		data.children = this.getChildrenData(widget, options);
//		data.properties = {};
//		data.properties.id = widget.id; 
		//data.properties.isTempID = widget.isTempID;
		//data.properties.dojotype = widget.declaredClass;
		//data.properties['data-dojo-props'] =  'id: ' + widget.id;
		//data.properties.dojotype = "dijit.form.DataList";
	    return data;
		
	}

});