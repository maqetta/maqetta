dojo.provide("davinci.ve.commands.MoveCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.MoveCommand", null, {

	name: "move",

	constructor: function(widget, left, top, commandForXYDeltas){
		this._id = (widget ? widget.id : undefined);
		this._context = widget.getContext();
		this._newBox = {l: left, t: top};
		// Because snapping will shift the first widget in a hard-to-predict
		// way, MoveCommand will store the actual shift amount on each command
		// object upon computing the actual final shift amount and then store
		// that amount on the command object. This allows multiple selection moves
		// to work with snapping such that selected widgets 2-N are shifted
		// by the same amount as the first widget.
		this._commandForXYDeltas = commandForXYDeltas;
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
		var context = this._context;

		if(!this._oldBox){
			var box = widget.getMarginBox();
			this._oldBox = {l: box.l, t: box.t, w:box.w, h:box.h};
			this._oldPosition = node.style.position;
		}
		
		this._state = davinci.ve.states.getState();
		var isNormalState = davinci.ve.states.isNormalState(this._state);

		if(this._commandForXYDeltas){
			this._newBox.l = this._oldBox.l + this._commandForXYDeltas._deltaX;
			this._newBox.t = this._oldBox.t + this._commandForXYDeltas._deltaY;
		}else{
			if(context && context._snapX){
				var w = this._oldBox.w;
				if(context._snapX.type=="left"){
					this._newBox.l = context._snapX.x;
				}else if(w && context._snapX.type=="right"){
					this._newBox.l = context._snapX.x - w;
				}else if(w && context._snapX.type=="center"){
					this._newBox.l = context._snapX.x - w/2;
				}
			}
			if(context && context._snapY){
				var h = this._oldBox.h;
				if(context._snapY.type=="top"){
					this._newBox.t = context._snapY.y;
				}else if(h && context._snapY.type=="bottom"){
					this._newBox.t = context._snapY.y - h;
				}else if(h && context._snapY.type=="middle"){
					this._newBox.t = context._snapY.y - h/2;
				}
			}
		}
		this._deltaX = this._newBox.l - this._oldBox.l;
		this._deltaY = this._newBox.t - this._oldBox.t;

		var cleanValues = { left: this._newBox.l, top: this._newBox.t, position: "absolute"};
		davinci.ve.states.setStyle(widget, this._state, cleanValues, undefined, isNormalState);	
		
		if (isNormalState) {
			node.style.position = "absolute";
			widget.setMarginBox( this._newBox);
		}
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
		
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
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
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	}

});
