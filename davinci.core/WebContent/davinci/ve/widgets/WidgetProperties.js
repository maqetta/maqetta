dojo.provide("davinci.ve.widgets.WidgetProperties");
dojo.require("davinci.ve.commands.EventCommand");
dojo.require("davinci.ve.States");
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("davinci.workbench.ViewLite");
dojo.require("davinci.ve.metadata");

dojo.declare("davinci.ve.widgets.WidgetProperties", [davinci.workbench.ViewLite], {
	
	displayName:"Widget-specific", // FIXME: This string is hard-coded in two different places

	buildRendering: function(){
		this.domNode = this.propDom = dojo.doc.createElement("div");
		dojo.addClass(this.domNode, "propGroup");
		dojo.attr(this.domNode, "propGroup", this.displayName)
		this.inherited(arguments);
	},
	
	
	onWidgetSelectionChange: function(){
		
		if(!this._widget){
			this._disconnectAll();
			this._destroyProperties();
			return;
		}

		var metadata = davinci.ve.metadata.query(this._widget);
		/* check to see if this widget is a child of a widget */
		if (this._widget.parent && this._widget.parent.isWidget) {
			var parentMetadata = davinci.ve.metadata.query(this._widget.parent);
			/* check the parent widget for extra props to add if it is a child of that widget */
			if (parentMetadata && parentMetadata.childProperties){
				if (!metadata.property) {
					metadata.property = parentMetadata.childProperties;
				} else {
					for (prop in parentMetadata.childProperties){
						metadata.property[prop] = parentMetadata.childProperties[prop];
					}
				}
			}
		}
		if(!metadata || !metadata.property) {
			return;
		}
		this._disconnectAll();
		this._destroyProperties();

		this.propDom.innerHTML = this._createWidgetRows(metadata.property);
		if(this.propDom.innerHTML.indexOf('dojoType')) {
			dojo.parser.parse(this.propDom);
		}
		this._setValues();
		this._connectAll();
	},

	_createWidgetRows: function (properties){
		this._pageLayout = [];
		for(var name in properties){
			var property = properties[name];
			if(property.hidden){
				continue;
			}
			this._pageLayout.push({display:(property.title || name),
								   type: property.datatype,
								   target:name,
								   hideCascade:true});
			if(property.option){
				this._pageLayout[this._pageLayout.length-1].values = dojo.map(property.option, function(option){ return option.value; });
			}
		}
		return davinci.ve.widgets.HTMLStringUtil.generateTable(this._pageLayout);
	},
	
	
	_destroyProperties: function(){
		var containerNode = (this.propDom);
		dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
			w.destroy();
		});
		while(containerNode.firstChild){
			dojo._destroyElement(containerNode.firstChild);
		}
	},
	
	_connectAll: function(){
		
		function makeOnChange(target){
			return function(){
				return this._onChange({target:target});
			};
		}
		for(var i in this._pageLayout){
			var widget = dijit.byId(this._pageLayout[i].id); 
			if(!widget){
				var box = dojo.byId(this._pageLayout[i].id);
			}
			this._connect(box, "onChange", this, makeOnChange(i));		
		}
	},
	
	_connect: function(target,method,scope,targetFunction,dontFix){
		if(!this._connects)
			this._connects = [];
		
		this._connects.push(dojo.connect(target,method,scope,targetFunction,dontFix));
	},
	_disconnectAll: function(){
		if(!this._connects){ return; }
		this._connects.forEach(dojo.disconnect);
	},
	_onChange: function(a){
	
		var index = a.target;
		var box = dojo.byId(this._pageLayout[index].id);
		var value = null;
		
		if(box){
			if(box.type=='checkbox'){
				value = dojo.attr(box, 'checked');
			}else{
				value = dojo.attr(box, 'value');	
			}
		}else{
			 box = dijit.byId(this._pageLayout[index]['id']);
			 if(box) {
				 value = box.attr('value');
			 }
		}
		if(this._pageLayout[index].value != value ){
			this._pageLayout[index].value = value;
			var valuesObject = {};
			valuesObject[this._pageLayout[index].target] = value;
			var command = new davinci.ve.commands.ModifyCommand(this._widget, valuesObject, null);
			dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
		}	
	},

	_setValues: function() {
		
		for(var i=0;i< this._pageLayout.length;i++){
			var widget = this._widget;
			var targetProp = this._pageLayout[i].target;
			var propValue = null;
			
			if(targetProp=="_children"){
				propValue =   this._widget.getChildrenData();
				if(propValue && propValue.length == 1){
					propValue = propValue[0];
				}else{
					// need to account for this case?
					propValue = this._widget.getPropertyValue(targetProp);
				}
			}else{
				propValue = this._widget.getPropertyValue(targetProp);
			}
			if(this._pageLayout[i].value != propValue){
				this._pageLayout[i].value = propValue;
				if(this._pageLayout[i].type=='boolean')
					dojo.attr( this._pageLayout[i].id, "checked",  this._pageLayout[i].value);
				else
					dojo.attr( this._pageLayout[i].id, "value",  this._pageLayout[i].value);
			}
		}
	}
});