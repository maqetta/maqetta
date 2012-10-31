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
	
	shouldShow: function(context, params){
		// For context menus on the page editor canvas and in Outline palette,
		// don't show table commands unless a table cell is selected.
		// For main toolbar's table commands icon, show table commands always
		// (although unless a cell is selected, the toolbar commands will be disabled)
		context = this.fixupContext(context);
		var editor = context ? context.editor : null;
		var retval = (editor && editor.declaredClass == 'davinci.ve.PageEditor');
		if(params && params.menu && params.menu._partID){
			var partID = params.menu._partID;
			if(partID == "davinci.ve.visualEditor" || partID == "davinci.ve.VisualEditorOutline"){
				retval = this._getCell(context);
			}else{
				retval = false;
			}
		}
		return retval;
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
