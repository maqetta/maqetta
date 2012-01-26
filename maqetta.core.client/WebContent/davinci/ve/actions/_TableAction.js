define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction"
], function(declare, ContextAction){


return declare("davinci.ve.actions._TableAction", [ContextAction], {

	isEnabled: function(context){
		context = this.fixupContext(context);
		return !!(context && this._getCell(context));
	},
	
	shouldShow: function(context){
		context = this.fixupContext(context);
		return !!(context && this._getCell(context));
	},
	
	_getCell: function(context){
		context = this.fixupContext(context);
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(!widget.isHtmlWidget){
			return undefined;
		}
		var tagName = widget.getTagName();
		if(tagName == "td" || tagName == "th"){
			if(selection.length > 1){
				context.select(widget);
			}
			return widget.domNode;
		}
		return undefined;
	}
});
});
