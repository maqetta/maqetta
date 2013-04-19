define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/widget"
], function(
	declare,
	Runtime,
	SmartInput,
	ModifyCommand,
	RemoveCommand,
	Widget
) {

return declare(SmartInput, {

	property: "value",
	
	displayOnCreate: "true",
	
	multiLine: "true",
	
	format: "rows",
	
	serialize: function(widget, updateEditBoxValue, value) {
		
		//var data = widget.getData();
		//console.log(widget, data); // no children in the data!
	
		var data = widget.getData();
		var children = data.children;// this.getChildren(widget);
		var result = [];
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			//result.push(child.innerHTML);
			var text = child.properties.value;
			text = dojox.html.entities.decode(text);
			var selected = (child.properties.selected || data.properties.value == text) ? "+" : "";
			result.push(selected + text);
		}
		
		result = this.serializeItems(result);

		updateEditBoxValue(result); 
	},
	
	parse: function(input) {
		var value = this.parseItems(input);
		for (var x = 0; x < value.length; x++){
			value[x].text = dojox.html.entities.encode(value[x].text);
		}
		return value;
	},
	
	getProperties: function(widget, values) {
		return null;
	},
	
	update: function(widget, values) {
	
		var data = widget.getData();
		var children = data.children;// this.getChildren(widget);
		
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			var text = value.text;
			var selected = value.selected ?  true : null;
			if (i < children.length) {
				var child = children[i];
				//this.updateChild(child, text);
				child.children = text;
				child.properties.value = text;
				child.properties.selected = selected
			} else {
				//this.addChild(children, text);
				children.push(this.createChildData(text, text, selected));
			}
			if (!this.isHtmlSupported()){
				// dojo expects the text to be decoded for widgets that do not support HTML ie.ComboBox - wdr
				values[i].text = dojox.html.entities.decode(text);
			}
		}
		
		if (values.length > 0) {
			var length = children.length;
			for (var i = values.length; i < length; i++) {
				var child = children[i];
				//this.removeChild(children, child);
				children.pop();
			}
		}
		
		var command = new ModifyCommand(widget, this.getProperties(widget, values), children);
		this._getContext().getCommandStack().execute(command);
		return command.newWidget;
	},

	getChildren: function(widget) {
		// FIXME: How do we query decendent elements of a dv widget so that we get back dv wrapped elements?
		// Berkland: Can you provide an example? And/or provide a query function in widget.js that returns properly wrapped elements?
	    var childNodes = dojo.query("option",this.node(widget));
		var children = [];
		
		for (var i = 0; i < childNodes.length; i++) {
			var childNode = childNodes[i];
			var text = childNode.innerHTML;
			var value = dojo.attr(childNode, "value");
			var child = this.createChildData(value, text);
			children.push(child);
		}
	    return children;
		
		//return widget.getChildren(); // Does not currently return the nodes/wrapped nodes
	},
	
	createChildData: function(value, text, selected) {
		return {type: "html.option", properties: {value: value, selected: selected}, children: text || value};
	},

	addChild: function(widget, text) {
		// FIXME: How do we set this such that the model recognizes the update?
		// Berkland: Can you provide an example of how to add a new element to a widget in the new ve?
	    var child = dojo.doc.createElement('option');
	    child.innerHTML = text;
	    dojo.attr(child, "value", text);
	    this.node(widget).appendChild(child);
		// These changes didn't even show up in the visual editor, let alone source
		//child = davinci.ve.widget.getWidget(child);
	    //widget.addChild(child);
		
		//this._addChildOfTypeWithProperty(widget, "html.option", "value", text);
	},

	updateChild: function(child, text) {
		// FIXME: How do we set this such that the model recognizes the update?
		// Berkland: Can you provide an example of how to update a raw element of a widget in the new ve?
		// Or maybe there's a way to query decendant nodes on the dv widget and get back wrapped elements?
	    child.innerHTML = text;
	    dojo.attr(child, "value", text);
		
		//this._attr(child, "value", text);
		//this._attr(child, "innerHTML", text);
	},

	removeChild: function(widget, child) {
		// FIXME: How do we remove this such that the model recognizes the update?
		// Berkland: Can you provide an example of how to remove a raw decendent element from a widget in the new ve?
	    this.node(widget).removeChild(child);
		
		//this._removeChild(child);
	},

	node: function(widget) {
		return widget.containerNode || widget.domNode;
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
	

//	_addChildOfTypeWithProperty: function(widget, type, propertyName, value) {
//		var data = {type: type, properties: {innerHTML:value}, context: this._getContext()};
//		data.properties[propertyName] = value;
//		
//		var child = undefined;
//		dojo.withDoc(this._getContext().getDocument(), function(){
//			child = davinci.ve.widget.createWidget(data);
//		}, this);
//		
//		var command = new davinci.ve.commands.AddCommand(child, widget);
//		this._addOrExecCommand(command);
//	},
	
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