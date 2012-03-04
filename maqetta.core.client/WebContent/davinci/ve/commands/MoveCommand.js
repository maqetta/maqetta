define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/States"
], function(declare, Widget, States){


return declare("davinci.ve.commands.MoveCommand", null, {
	name: "move",

	constructor: function(widget, left, top, commandForXYDeltas){
		this._id = (widget ? widget.id : undefined);
		this._context = widget.getContext();
		
		this._newBox = {l: left , t: top};
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
		var widget = Widget.byId(this._id);
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
		if(!widget.domNode.offsetParent){
			return;
		}
		var offsetParentPageBox = dojo.position(widget.domNode.offsetParent, true);
		if(!offsetParentPageBox){
			return;
		}
		
		this._state = States.getState();
		var isNormalState = States.isNormalState(this._state);

		if(this._commandForXYDeltas){
			this._newBox.l = this._oldBox.l + this._commandForXYDeltas._deltaX;
			this._newBox.t = this._oldBox.t + this._commandForXYDeltas._deltaY;
		}else{
			if(context && context._snapX){
				var w = this._oldBox.w;
				var snapX_relative = context._snapX.x - offsetParentPageBox.x;
				if(context._snapX.typeRefObj=="left"){
					this._newBox.l = snapX_relative;
				}else if(w && context._snapX.typeRefObj=="right"){
					this._newBox.l = snapX_relative - w;
				}else if(w && context._snapX.typeRefObj=="center"){
					this._newBox.l = snapX_relative - w/2;
				}
			}
			if(context && context._snapY){
				var h = this._oldBox.h;
				var snapY_relative = context._snapY.y - offsetParentPageBox.y;
				if(context._snapY.typeRefObj=="top"){
					this._newBox.t = snapY_relative;
				}else if(h && context._snapY.typeRefObj=="bottom"){
					this._newBox.t = snapY_relative - h;
				}else if(h && context._snapY.typeRefObj=="middle"){
					this._newBox.t = snapY_relative - h/2;
				}
			}
		}
		this._deltaX = this._newBox.l - this._oldBox.l;
		this._deltaY = this._newBox.t - this._oldBox.t;

		// Adjust for parent border width
        var parentBorderLeft = parseInt(dojo.style(widget.domNode.offsetParent, 'borderLeftWidth'));
        var parentBorderTop = parseInt(dojo.style(widget.domNode.offsetParent, 'borderTopWidth'));
		//var cleanValues = { left: this._newBox.l - parentBorderLeft, top: this._newBox.t - parentBorderTop};
        var newLeft = this._newBox.l - parentBorderLeft;
        var newTop = this._newBox.t - parentBorderTop;
		var cleanValues = [{ left: newLeft}, {top: newTop}];
		States.setStyle(widget, this._state, cleanValues, isNormalState);	
		
		if (isNormalState) {
			node.style.position = "absolute";
			var size = { l: newLeft, t: newTop };
			widget.setMarginBox( size);
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

	undo: function(){
		if(!this._id){
			return;
		}
		var widget = Widget.byId(this._id);
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
});
