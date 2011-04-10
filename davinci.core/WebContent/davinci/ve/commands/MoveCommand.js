dojo.provide("davinci.ve.commands.MoveCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.MoveCommand", null, {

	name: "move",

	constructor: function(widget, left, top){
		this._id = (widget ? widget.id : undefined);
		this._newBox = {l: left, t: top};
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
		if(!node){
			return;
		}

		if(!this._oldBox){
			var box = widget.getMarginBox();
			this._oldBox = {l: box.l, t: box.t};
			this._oldPosition = node.style.position;
		}
		
		this._state = davinci.ve.states.getState();
		var isNormalState = davinci.ve.states.isNormalState(this._state);
		
		var cleanValues = { left: this._newBox.l, top: this._newBox.t, position: "absolute"};
		davinci.ve.states.setStyle(widget, this._state, cleanValues, undefined, isNormalState);	
		
		if (isNormalState) {
			node.style.position = "absolute";
			widget.setMarginBox( this._newBox);
		}
	},

	undo: function(){
		if(!this._id){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		var node = widget.getStyleNode();
		if(!node){
			return;
		}

		widget.setMarginBox( this._oldBox);
		node.style.position = this._oldPosition;
	}

});
