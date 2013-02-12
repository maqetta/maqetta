define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!./nls/html"
], function(
	declare,
	Runtime,
	SmartInput,
	ModifyCommand,
	htmlNls
) {

return declare(SmartInput, {

	property: "value",
	
	displayOnCreate: "true",
	
	multiLine: "false",
	
	format: "rows",
	
	// FIXME: This should be true, but doing so has side effect that data is missing from smart input box 
	// when bring dialog back up after entering some HTML and hitting OK. Need to fix serialize code once
	// we turn on this flag.
	supportsHTML: "false",
	
	helpText: "",
	
	constructor : function() {
		this.helpText = htmlNls.fieldsetInputHelp;
	},
	
	serialize: function(widget, updateEditBoxValue, value) {

		var data = widget.getData();
		var children = data.children;
		var result = "";
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.type === "html.legend") {
				//Need to get the inner HTML of the child
				if (typeof child.children === "string") {
					var text = child.children;
					text = dojox.html.entities.decode(text);
					result = text;	
				}
			}
		}
		
		updateEditBoxValue(result); 
	},
	
	update: function(widget, value) {
		var data = widget.getData();
		var children = data.children;

		//If there's a LEGEND element within the FIELDSET, let's
		//update that one
		var legendUpdated = false;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.type === "html.legend") {
				child.children = value;
				legendUpdated = true;
				break;
			}
		}
		
		if (!legendUpdated) {
			//Need to create a LEGEND and add to FIELDSET's children
			var newLegend = this._createLegend(value);
			if (typeof children === "string") {
				children = [];
			}
			children.push(newLegend);
		}
		
		var command = new ModifyCommand(widget, null, children);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	_createLegend: function(text) {
		return {
			type: "html.legend",
			children: text
		};
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