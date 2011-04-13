dojo.provide("davinci.ve.input.ContainerInput");
dojo.require("davinci.ve.input.SmartInput");

dojo.declare("davinci.ve.input.ContainerInput", davinci.ve.input.SmartInput, {

	propertyName: null,
	
	childType: null,

	property: null,
	
	displayOnCreate: "true",
	
	format: "columns",
	
	serialize: function(widget, callback, value) {
		var result = [];
		var children = widget.getChildren();
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			result.push(child.attr(this.propertyName));
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	parse: function(input) {
		var result = this.parseItems(input);
		return result;
	},
	
	update: function(widget, value) {
		var values = value;
		
		this.command = new davinci.commands.CompoundCommand();

		var children = widget.getChildren();
		for (var i = 0; i < values.length; i++) {
			var text = values[i].text;
			if (i < children.length) {
				var child = children[i];
				this._attr(child, this.propertyName, text);
			} else {
				this._addChildOfTypeWithProperty(widget, this.childType, this.propertyName, text);
			}
		}
		
		if (values.length > 0) {
			for (var i = values.length; i < children.length; i++) {
				var child = children[i];
				this._removeChild(child);
			}
		}

		this._addOrExecCommand();
	},
	
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new davinci.ve.commands.ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_removeChild: function(widget) {
		var command = new davinci.ve.commands.RemoveCommand(widget);
		this._addOrExecCommand(command);
	},
	
	_addChildOfTypeWithProperty: function(widget, type, propertyName, value) {
		var data = {type: type, properties: {}, context: this._getContext()};
		data.properties[propertyName] = value;
		
		var child = undefined;
		dojo.withDoc(this._getContext().getDocument(), function(){
			child = davinci.ve.widget.createWidget(data);
		}, this);
		
		var command = new davinci.ve.commands.AddCommand(child, widget);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},
	
	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
//			debugger;
			widget = davinci.ve.widget.getParent(widget); 
		}
		return undefined;
	},
	
	_getEditor: function() {
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	}

});