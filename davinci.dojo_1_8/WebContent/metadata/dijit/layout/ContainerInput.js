define([
    "dojo/_base/declare",
    "dojox/html/entities",
    "davinci/Runtime",
    "davinci/ve/input/SmartInput",
    "davinci/ve/metadata",
    "davinci/ve/widget",
    "davinci/commands/CompoundCommand",
    "davinci/ve/commands/ModifyCommand",
    "davinci/ve/commands/RemoveCommand",
    "davinci/ve/commands/AddCommand"
], function(
	declare,
	Entities,
	Runtime,
	SmartInput,
	Metadata,
	Widget,
	CompoundCommand,
	ModifyCommand,
	RemoveCommand,
	AddCommand
) {

return declare(SmartInput, {

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
			var dijitWidget = child.dijitWidget;
			if(dijitWidget){
				var djprop = (this.propertyName==="textContent") ? "innerHTML" : this.propertyName;
				result.push(child.attr(djprop));
			}else{
				result.push("");
			}
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	parse: function(input) {
		var result = this.parseItems(input);
		return result;
	},
	
	getChildType: function(parentType){
		if (!this.childType){
			var allowedChild = Metadata.getAllowedChild(parentType);
			this.childType = allowedChild[0];
		}
		return this.childType;
	},
	
	update: function(widget, value) {		
		var values = value;
		
		this.command = new CompoundCommand();

		var children = widget.getChildren();
		for (var i = 0; i < values.length; i++) {
			var text = values[i].text;
			// added to support dijit.TextBox that does not support html markup in the value and should not be encoded. wdr
			if (this.isHtmlSupported() && (this.getFormat() === 'html')) {
				text = Entities.encode(text);
			}
			if (i < children.length) {
				var child = children[i];
				this._attr(child, this.propertyName, text);
			} else {
				this._addChildOfTypeWithProperty(widget, this.getChildType(widget.type), this.propertyName, text);
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
		
		var command = new ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_removeChild: function(widget) {
		var command = new RemoveCommand(widget);
		this._addOrExecCommand(command);
	},
	
	_addChildOfTypeWithProperty: function(widget, type, propertyName, value) {
		var data = {type: type, properties: {}, context: this._getContext()};
		data.properties[propertyName] = value;
		
		var child;
		dojo.withDoc(this._getContext().getDocument(), function(){
			child = Widget.createWidget(data);
		}, this);
		
		var command = new AddCommand(child, widget);
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
			widget = Widget.getParent(widget); 
		}
		return undefined;
	},
	
	_getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	}
});

});