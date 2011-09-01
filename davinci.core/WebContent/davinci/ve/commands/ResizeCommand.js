dojo.provide("davinci.ve.commands.ResizeCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.ResizeCommand", null, {

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
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}

		var node = widget.getStyleNode();
		if(!this._oldBox){
			var box = dojo.contentBox(widget);
			this._oldBox = {w: box.w, h: box.h};
		}
		
		this._state = davinci.ve.states.getState();
		var isNormalState = davinci.ve.states.isNormalState(this._state);

		var cleanValues = { width: this._newBox.w, height: this._newBox.h };
		davinci.ve.states.setStyle(widget, this._state, cleanValues, undefined, isNormalState);

		if (isNormalState) {
			dojo.contentBox(node, this._newBox);
			this._resize(widget);
		}
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
	},
	setContext : function(context){
		this._context = context;
	},
	
	undo: function(){
		if(!this._id){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}

		widget.setMarginBox(this._oldBox);

		this._resize(widget);
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
	},

	_resize: function(widget){
		var parent = widget.getParent();
		if(parent && parent.dijitWidget && parent.dijitWidget.isLayoutContainer){
			parent.resize();
		}else if(widget.dijitWidget && widget.dijitWidget.isLayoutContainer){
			widget.resize();
		}
		widget.renderWidget();
		widget._updateSrcStyle();
	}

});
