define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/query",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/html/entities",
	"../../dijit/layout/ContainerInput",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!../nls/dojox"
], function (
	declare,
	lang,
	window,
	query,
	domClass,
	construct,
	entities,
	ContainerInput,
	Widget,
	CompoundCommand,
	AddCommand,
	ModifyCommand,
	dojoxNls
) {

return declare(ContainerInput, {

	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
	helpText:  "",
	
	constructor : function() {
		this.helpText = dojoxNls.edgeToEdgeListHelp;
	},

	parse: function(input) {
		var result = this.parseItems(input);
		return result;
	},
	
	update: function(widget, value) {
		var values = value;
		
		var id=widget.id;
		this.command = new CompoundCommand();

		var children = widget.getChildren();
		for (var i = 0; i < values.length; i++) {
			var text = values[i].text;
			if (this._format === 'html'){
				text = entities.decode(text);
			}
			if (i < children.length) {
				var child = children[i];
				// Massage the data object
				var data = child.getData();
				var dataChildren = data.children;
				var found = false;
				for(var j=dataChildren.length-1; j>=0; j--){
					var dataChild = dataChildren[j];
					if(typeof dataChild == 'string'){
						// Remove any content that isn't a Maqetta widget
						dataChildren.splice(j, 1);
					}else{
						var className = dataChild.properties && dataChild.properties['class'];
						if(typeof className == 'string'){
							var classes = className.split(' ');
							if(!found && classes.indexOf('mblListItemLabel') >=0){
								dataChild.children = text;
								found = true;
							}
						}
					}
				}
				if(!found){
					// If there isn't an mblListItemLabel, add it now
					dataChildren.push({
                		"type": "html.label",
                		"properties":{
                   			"class": "mblListItemLabel",
                		},
                		"children": text,
                		tagName: "label"
                	});
				}
				this._attr(child, dataChildren);
			} else {
				this._addChildOfTypeWithProperty(widget, this.getChildType(widget.type), text);
			}
		}
		
		if (values.length > 0) {
			for (var i = values.length; i < children.length; i++) {
				var child = children[i];
				this._removeChild(child);
			}
		}

		this._addOrExecCommand();
		widget = Widget.byId(id);
		return widget;
	},
	
	_attr: function(widget, value) {
		var properties = {};
		var command = new ModifyCommand(widget, properties, value);
		this._addOrExecCommand(command);
	},
	
	_addChildOfTypeWithProperty: function(widget, type, value) {
		var data = {type: type, properties: {}, context: this._getContext()};
		
		var child;
		window.withDoc(this._getContext().getDocument(), function(){
			child = Widget.createWidget(data);
		}, this);
		
		var command = new AddCommand(child, widget);
		this._addOrExecCommand(command);
		command = new ModifyCommand(child, data.properties, value);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},

	_collapse: function(element) {
		for (var i = 0; i < element.childNodes.length; i++){
			var cn = element.childNodes[i];
			if (cn.nodeType == 3){    // Text node
				cn.nodeValue = cn.data.replace(/^\s*$/, '');	// only whitespace
				cn.nodeValue = cn.nodeValue.replace(/^\s*([^\s])\s*$/, '$1');	// single char that isn't whitespace
				cn.nodeValue = cn.nodeValue.replace(/^\s*([^\s].*[^\s])\s*$/, '$1');	// at least 2 chars that aren't whitespace
				cn.nodeValue = cn.nodeValue.replace(/\n/g, ' ');	// replace embedded newlines with spaces
			}else if (cn.nodeType == 1){ // Element node
				this._collapse(cn);
			}
		}
		return element.innerHTML;
	},

	serialize: function(widget, callback, value) {
		var result = [];
		var children = widget.getChildren();
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var dijitWidget = child.dijitWidget;
			var listItemLabelNodes = query('.mblListItemLabel', dijitWidget.domNode);
			var childNodes = dijitWidget.domNode.childNodes;
			var text = '';
			for(var j=0; j<childNodes.length; j++){
				var innerChild = childNodes[j];
				if(innerChild.nodeType == 3){
					text += innerChild.textContent;
				}else if(innerChild.nodeType == 1){
					if(domClass.contains(innerChild, 'mblListItemLabel')){
						text += lang.trim(innerChild.innerHTML);
					}
				}
			}
			// remove extraneous whitespace, particularly newlines
			//FIXME: This should be an option to the model code
			var div = construct.create('DIV', {innerHTML:text});
			var collapsed = this._collapse(div);
			result.push(collapsed);
		}
		
		result = this.serializeItems(result);
	
		callback(result); 
	}

});

});