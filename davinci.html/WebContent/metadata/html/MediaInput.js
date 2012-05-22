define([
	"dojo/_base/declare",
	"davinci/ve/widget",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!./nls/html",
	"davinci/css!../resources/html.css",
], function(
	declare,
	Widget,
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
	},
	
	show: function(widgetId) {
		//Do some init based on type of element
		this._widget = Widget.byId(widgetId);
		if (this._widget.type == "html.embed") {
			this.multiLine= "false";
			this.helpText = htmlNls.embedInputHelp; 
		} else { //AUDIO/VIDEO 
			this.multiLine= "true";
			
			if (this._widget.type == "html.audio") {
				this.helpText = htmlNls.audioInputHelp; 
			} else {
				this.helpText = htmlNls.videoInputHelp;
			}
		}
			
		//Call super
		this.inherited(arguments);
		
		//Update size to make more appropriate for URLs
		if (this._widget.type == "html.embed") {
			dojo.addClass('ieb', "davinciMediaInput"); 
		} else { //AUDIO/VIDEO 
			dojo.addClass('ieb', "davinciMediaInputMulti");
		}
		
		this.resize();
	},
	
	serialize: function(widget, updateEditBoxValue, value) {

		var data = widget.getData();
		var children = data.children;
		var result = [];
		
		if (widget.type === "html.embed") {
			if (data.properties.src) {
				var src = data.properties.src;
				src = dojox.html.entities.decode(src);
				result.push(src);
			}
		} else { //AUDIO/VIDEO
			dojo.forEach(children, function(child) {
				if (child.type === "html.source") {
					//the SOURCE will be represented with it's value in the text box
					var src = child.properties.src;
					src = dojox.html.entities.decode(src);
					result.push(src);
				}
			});
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
	
	update: function(widget, values) {
		var children = [];
		var properties = {};
		
		if (widget.type === "html.embed") {
			if (values.length > 0) {
				var src = values[0].text;
				properties.src = src;
			}
		} else { //AUDIO/VIDEO
			//Create new children
			dojo.forEach(values, function(value) {
				var src = value.text;
				
				//Create new child (SOURCE element
				var newChild = this._createSource(src);
				
				//Add the new child
				children.push(newChild);
			}.bind(this));
		}
		
		//Execute command
		var command = new ModifyCommand(widget, properties, children);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},
	
	_createSource: function(src) {
		return {
			type: "html.source",
			properties: {
				src: src
			}
		};
	},
	
	_getEditor: function() {
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	}

});

});