define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/States"
], function(declare, Widget, States){


return declare("davinci.ve.commands.ResizeCommand", null, {


	name: "resize",

	constructor: function(widget, width, height){
		this._id = (widget ? widget.id : undefined);
	
		/* make sure these values are numeric */
		if(dojo.isString(width)){
			width = parseFloat(width);
		}
		
		if(dojo.isString(height)){
			height = parseFloat(height);
		}

		this._newBox = {w: width, h: height};
	},

	execute: function(){
		
		if(!this._id){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}

		var node = widget.getStyleNode();
		if(!this._oldBox){
			var box = dojo.contentBox(widget);
			this._oldBox = {w: box.w, h: box.h};
		}
		
		this._state = States.getState();
		var isNormalState = States.isNormalState(this._state);

		var cleanValues = { width: this._newBox.w, height: this._newBox.h };
		States.setStyle(widget, this._state, cleanValues, undefined, isNormalState);

		if (isNormalState) {
			dojo.contentBox(node, this._newBox);
			this._resize(widget);
		}
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget);
		
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},
	setContext : function(context){
		this._context = context;
	},
	
	undo: function(){
		if(!this._id){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}

		widget.setMarginBox(this._oldBox);

		this._resize(widget);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget);
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},

	_resize: function(widget){
		var parent = widget.getParent();
		if(parent && parent.dijitWidget && parent.dijitWidget.isLayoutContainer){
			parent.resize();
		}else if(widget.resize){
			widget.resize();
		}
		widget.renderWidget();
		widget._updateSrcStyle();
	}

});
});
