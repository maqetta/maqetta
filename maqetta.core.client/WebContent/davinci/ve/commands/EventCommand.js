define([
    	"dojo/_base/declare",
    	"davinci/ve/widget"
], function(declare, Widget){


return declare("davinci.ve.commands.EventCommand", null, {
	name: "EventCommand",

	constructor: function(widget, properties){
		this._oldId = (widget ? widget.id : undefined);
		this._properties = (properties || {});
	},

	setContext : function(context){
		this._context = context;
	},
	
	execute: function(){
		if(!this._oldId || !this._properties){
			return;
		}
		var widget = Widget.byId(this._oldId);
		this._oldProps = widget.properties || {};
		
		widget.setProperties(this._properties, /*modelOnly*/ true);
		
		// WEV: this breaks encapsulation. HTMLWidget.setProperties() should implement
		//      the correct behavior.
		if(widget.isHtmlWidget){
			
			var node = widget.domNode;
			
			for(var name in this._properties){
				if(!this._properties[name]) {
					node.removeAttribute(name) ;
				}// else {
					//node.setAttribute(name, this._properties[name]);
				//}
				
			}
		}
		
		this._newId = this._oldId;

		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},

	undo: function(){
		if(!this._newId ){
			return;
		}

		var widget = Widget.byId(this._newId);
		var domNode = widget.domNode;
		var srcElement = widget._srcElement;

		// remove attributes that no longer exist
		for (var attrName in this._properties) {
		  if (!this._oldProps[attrName]) {
		    domNode.removeAttribute(attrName);
		    srcElement.removeAttribute(attrName);
		  }
		}
	
		widget.setProperties(this._oldProps);

		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	}

});
});