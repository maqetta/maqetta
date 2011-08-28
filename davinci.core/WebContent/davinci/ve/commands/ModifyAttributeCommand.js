dojo.provide("davinci.ve.commands.ModifyAttributeCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.ModifyAttributeCommand", null, {

	name: "ModifyAttributeCommand",

	/*
	 * This command updates HTML attributes on the widget's domNode.
	 * Don't use this command for attributes managed by Maqetta, such as 'id'.
	 * 
	 * FIXME: Need to study Properties palette to make sure we properly distinguish
	 * between setting an attribute to an empty string versus removing an attribute.
	 * This routine assumes a null value indicates removing the attribute.
	 * 
	 * FIXME: May want to integrate attribute settings into the states mechanism.
	 * See StyleCommand as a reference.
	 */
	constructor: function(widget, values){
		this._newValues = values;
		this._id = (widget ? widget.id : undefined);
	},

	add: function(command){
		if(!command || command._id != this._id){
			return;
		}
		if(command._newValues){
			dojo.mixin(this._newValues, command._newValues);
		}
	},

	execute: function(){
		if(!this._id || !this._newValues){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget || !widget.domNode || !widget._srcElement){
			return;
		}
		var domNode = widget.domNode;
		var srcElement = widget._srcElement;
		this._oldValues = {};
		for(var attrName in this._newValues){
			var existingValue = domNode.hasAttribute(attrName);
			this._oldValues[attrName] = existingValue ? domNode.getAttribute(attrName) : null;
			var newValue = this._newValues[attrName];
			if(typeof newValue == "string"){
				domNode.setAttribute(attrName,newValue);
				srcElement.setAttribute(attrName,newValue);
			}else if(newValue === null && existingValue){
				domNode.removeAttribute(attrName);
				srcElement.removeAttribute(attrName);
			}
		}
		this._refresh(widget);
	},

	undo: function(){
		if(!this._id || !this._oldValues){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget || !widget.domNode || !widget._srcElement){
			return;
		}
		var domNode = widget.domNode;
		var srcElement = widget._srcElement;
		for(var attrName in this._oldValues){
			var existingValue = domNode.hasAttribute(attrName);
			var oldValue = this._oldValues[attrName];
			if(typeof oldValue == "string"){
				domNode.setAttribute(attrName,oldValue);
				srcElement.setAttribute(attrName,oldValue);
			}else if(oldValue === null && existingValue){
				domNode.removeAttribute(attrName);
				srcElement.removeAttribute(attrName);
			}
		}
		this._refresh(widget);
	},
	
	_refresh: function(widget){
		/* if the widget is a child of a dijiContainer widget 
		 * we may need to refresh the parent to make it all look correct in page editor
		 * */ 
		var parent = widget.parent; 
		if (!parent && widget.getParent)
			parent = widget.getParent();
		if (/*widget.parent && widget.*/parent.dijitWidget){
			this._refresh(/*widget.*/parent);
		} else if (widget.dijitWidget && widget.dijitWidget.resize){
			widget.dijitWidget.resize();
		}
		
	}

});
