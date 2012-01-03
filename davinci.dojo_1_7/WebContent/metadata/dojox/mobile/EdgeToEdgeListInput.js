dojo.provide("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dojox", "dojox");

dojo.declare("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeListInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {

	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
	helpText:  "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dojox", "dojox");
		this.helpText = langObj.edgeToEdgeListHelp;
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
			if (this._format === 'html'){
				text = dojox.html.entities.decode(text);
			}
			if (i < children.length) {
				var child = children[i];
				this._attr(child, text);
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
		return widget;
	},
	
	_attr: function(widget, value) {
		var properties = {};
		var command = new davinci.ve.commands.ModifyCommand(widget, properties, value);
		this._addOrExecCommand(command);
	},
	
	_addChildOfTypeWithProperty: function(widget, type, value) {
		var data = {type: type, properties: {}, context: this._getContext()};
		
		var child = undefined;
		dojo.withDoc(this._getContext().getDocument(), function(){
			child = davinci.ve.widget.createWidget(data);
		}, this);
		
		var command = new davinci.ve.commands.AddCommand(child, widget);
		this._addOrExecCommand(command);
		var command = new davinci.ve.commands.ModifyCommand(child, data.properties, value);
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
			var textBoxNode = dojo.query('.mblListItemTextBox', dijitWidget.domNode)[0];
			var text = "";
			for (var j=0; j<textBoxNode.childNodes.length; j++){
				var n = textBoxNode.childNodes[j];
				if(n.nodeType === 1){	// element
					if(dojo.hasClass(n, 'mblListItemLabel')){
						// Don't show the markup around mblListItemLabel nodes
						text += dojo.trim(n.innerHTML);
					}else{
						text += dojo.trim(n.outerHTML);
					}
				}else if(n.nodeType === 3){	//textNode
					text += n.nodeValue;
				}
			}
			// remove extraneous whitespace, particularly newlines
			//FIXME: This should be an option to the model code
			var div = dojo.create('DIV', {innerHTML:text});
			var collapsed = this._collapse(div);
			result.push(collapsed);
		}
		
		result = this.serializeItems(result);
	
		callback(result); 
	}

});
