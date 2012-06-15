define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction"
], function(declare, ContextAction){


return declare(ContextAction, {
	constructor: function() {
		this._tableRelatedTags = ["td", "th", "tr", "col"];
	},
	
	isEnabled: function(context){
		context = this.fixupContext(context);
		if (context) {
			var cell = this._getCell(context);
			if (cell) {
				return this._isEnabled(cell);
			}
		}
		return false;;
	},
	
	//subclass can override
	_isEnabled: function(cell) {
		return true;
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
		if (this._isTableRelatedElement(widget)) {
			if(selection.length > 1){
				context.select(widget);
			}
			return widget.domNode;
		}
		return undefined;
	},
	
	_isTableRelatedElement: function(widget) {
		var isTableRelated = false;
		var widgetTagName = widget.getTagName();
		dojo.some(this._tableRelatedTags, function(tag) {
			if (tag == widgetTagName) {
				isTableRelated = true;
				return true;
			}
		});
		return isTableRelated;
	}
});
});
