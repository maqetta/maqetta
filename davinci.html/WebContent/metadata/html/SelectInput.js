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
	
	multiLine: "true",
	
	format: "rows",
	
	supportsHTML: "false",
	
	helpText: "",
	
	constructor : function() {
		this.helpText = htmlNls.selectInputHelp;
	},
	
	serialize: function(widget, updateEditBoxValue, value) {

		var data = widget.getData();
		var children = data.children;
		var result = [];
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.type === "html.optgroup") {
				//the OPTGROUP will be represented in the text field with its label
				var text = child.properties.label;
				text = dojox.html.entities.decode(text);
				result.push(text);
				
				//Handle children of OPTGROUP
				var optgroupChildren = child.children;
				for (var j = 0; j < optgroupChildren.length; j++) {
					var optgroupChild = optgroupChildren[j];
					var text = optgroupChild.properties.value;
					text = dojox.html.entities.decode(text);
					var selected = optgroupChild.properties.selected ? "+" : "";
					result.push(">" + selected + text);
				}
			} else if (child.type === "html.option") {
				//the OPTION will be represented with it's value in the text box
				var text = child.properties.value;
				text = dojox.html.entities.decode(text);
				var selected = child.properties.selected ? "+" : "";
				result.push(selected + text);
			}
		}
		
		result = this.serializeItems(result);

		updateEditBoxValue(result); 
	},
	
	parse: function(input) {
		//Need to decode the input so that parseItem gets a chance to look at ">" on a line
		var value = this.parseItems(dojox.html.entities.decode(input));
		for (var x = 0; x < value.length; x++){
			//Encode the results from parsing
			value[x].text = dojox.html.entities.encode(value[x].text);
		}
		return value;
	},
	
	//NOTE: OPTGROUP's cannot be nested inside of other OPTGROUP's, so
	//there's no recursion here
	update: function(widget, values) {
		var children = [];
		
		var currentOptGroup = null;
		for (var i = 0; i < values.length; i++) {
			//Get the current item in the array
			var value = values[i];
			var text = value.text;
			
			//Determine if we need to create an OPTION or an OPTGROUP and create it
			var newChild;
			var childList;
			if (currentOptGroup) {
				//We're processing an OPTGROUP
				if (value.indent) {
					//We a row starting with ">", so create a new OPTION and add it to the OPTGROUP
					newChild = this._createOption(text, text, value.selected);
					childList = currentOptGroup.children;
				} else {
					if (this._doesNextValueHaveIndent(values, i)) {
						//No ">" on this row, but looks like next one does so create a new OPTGROUP and 
						//add to SELECT's children
						newChild = this._createOptGroup(text);
						childList = children;
						currentOptGroup = newChild;
					} else {
						//Done processing OPTGROUP and no new one, so create an OPTION and add to
						//SELECT
						newChild = this._createOption(text, text, value.selected);
						childList = children;
						currentOptGroup = null;
					}
				}
			} else {
				//We're _not_ processing an OPTGROUP and we can assume there's no ">" on the row (or we'd be in
				//first clause of the if-else block)
				if (this._doesNextValueHaveIndent(values, i)) {
					//Looks like next row starts with ">" so need a new OPTGROUP  added to SELECT's children
					newChild = this._createOptGroup(text);
					childList = children;
					currentOptGroup = newChild;
				} else {
					//Next row does _not_ start with ">" so create an OPTION and add to SELECT's children
					newChild = this._createOption(text, text, value.selected);
					childList = children;
					currentOptGroup = null;
				}
			}
			
			//Add the new child
			childList.push(newChild);
		}
		
		var command = new ModifyCommand(widget, null, children);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	_createOptGroup: function(text) {
		return {
			type: "html.optgroup",
			properties: {
				label: text
			},
			children: []
		};
	},
	
	_createOption: function(value, text, selected) {
		
		return {
			type: "html.option",
			properties: {
				value: value,
				selected: selected ? true : null
			},
			children: text || value
		};
	},
	
	_doesNextValueHaveIndent: function (values, i) {
		var hasIndent = false;
		if (i < values.length - 1) {
			var value = values[i + 1];
			hasIndent = (value.indent > 0) ? true : false;
		}
		return hasIndent;
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