dojo.provide("davinci.ve.commands.MoveCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.MoveCommand", null, {

	name: "move",

	constructor: function(widget, left, top, snapX, snapY){
		this._id = (widget ? widget.id : undefined);
		this._newBox = {l: left, t: top};
		this._snapX = snapX;
		this._snapY = snapY;
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
			this._oldBox = {l: box.l, t: box.t, w:box.w, h:box.h};
			this._oldPosition = node.style.position;
		}
		
		this._state = davinci.ve.states.getState();
		var isNormalState = davinci.ve.states.isNormalState(this._state);

		if(this._snapX){
			var w = this._oldBox.w;
			if(this._snapX.type=="left"){
				this._newBox.l = this._snapX.x;
			}else if(w && this._snapX.type=="right"){
				this._newBox.l = this._snapX.x - w;
			}else if(w && this._snapX.type=="center"){
				this._newBox.l = this._snapX.x - w/2;
			}
		}
		if(this._snapY){
			var h = this._oldBox.h;
			if(this._snapY.type=="top"){
				this._newBox.t = this._snapY.y;
			}else if(h && this._snapY.type=="bottom"){
				this._newBox.t = this._snapY.y - h;
			}else if(h && this._snapY.type=="middle"){
				this._newBox.t = this._snapY.y - h/2;
			}
		}

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
