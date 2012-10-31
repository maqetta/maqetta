define([
    	"dojo/_base/declare",
    	"dojo/dom-geometry",
    	"davinci/ve/widget",
    	"davinci/ve/States",
    	"davinci/ve/utils/StyleArray",
    	"davinci/ve/utils/GeomUtils"
], function(declare, domGeom, Widget, States, StyleArray, GeomUtils){


return declare("davinci.ve.commands.MoveCommand", null, {
	name: "move",

	constructor: function(widget, left, top, commandForXYDeltas, oldBox, applyToWhichState, disableSnapping){
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
		
		this._oldBox = oldBox;
		
		// applyToWhichState controls whether style change is attached to Normal or other states
		//   (null|undefined|"undefined"|"Normal") => apply to Normal state
		//   other string => apply to that particular state
		this._applyToStateIndex = (!applyToWhichState || applyToWhichState=='Normal' || applyToWhichState=='undefined')
									? 'undefined' : applyToWhichState;
		
		this._disableSnapping = disableSnapping;
	},

	execute: function(){
		if(!this._id){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget || !widget.domNode){
			return;
		}
		var context = this._context;

		if(!this._oldBox){
			var box = widget.getMarginBox();
			this._oldBox = {l: box.l, t: box.t, w:box.w, h:box.h};
		}
		if(!widget.domNode.offsetParent){
			return;
		}
		var offsetParentPageBox = dojo.position(widget.domNode.offsetParent, true);
		if(!offsetParentPageBox){
			return;
		}
		if(this._commandForXYDeltas){
			this._newBox.l = this._oldBox.l + this._commandForXYDeltas._deltaX;
			this._newBox.t = this._oldBox.t + this._commandForXYDeltas._deltaY;
		}else{
			if(!this._disableSnapping && context && context._snapX){
				var w = this._oldBox.w;
				if(context._snapX.typeRefObj=="left"){
					this._newBox.l = context._snapX.x;
				}else if(w && context._snapX.typeRefObj=="right"){
					this._newBox.l = context._snapX.x - w;
				}else if(w && context._snapX.typeRefObj=="center"){
					this._newBox.l = context._snapX.x - w/2;
				}
			}
			if(!this._disableSnapping && context && context._snapY){
				var h = this._oldBox.h;
				if(context._snapY.typeRefObj=="top"){
					this._newBox.t = context._snapY.y;
				}else if(h && context._snapY.typeRefObj=="bottom"){
					this._newBox.t = context._snapY.y - h;
				}else if(h && context._snapY.typeRefObj=="middle"){
					this._newBox.t = context._snapY.y - h/2;
				}
			}
		}
		// These two values might be used by subsequent MoveCommands via this._commandForXYDeltas
		this._deltaX = this._newBox.l - this._oldBox.l;
		this._deltaY = this._newBox.t - this._oldBox.t;

		// this._newBox holds page-relative coordinates.
		// Subtract off offsetParent's borderbox coordinate (in page-relative coords from dojo.position), and
		// subtract off offsetParent's border, because left: and top: are relative to offsetParent's borderbox
		var offsetParentBorderBoxPageCoords = GeomUtils.getBorderBoxPageCoords(widget.domNode.offsetParent);
		var borderExtents = domGeom.getBorderExtents(widget.domNode.offsetParent);
		var newLeft = this._newBox.l - offsetParentBorderBoxPageCoords.l - borderExtents.l;
		var newTop = this._newBox.t - offsetParentBorderBoxPageCoords.t - borderExtents.t;
		var newStyleArray = [{left:newLeft+'px'},{top:newTop+'px'}] ;
        var styleValuesAllStates = widget.getStyleValuesAllStates();
		this._oldStyleValuesAllStates = dojo.clone(styleValuesAllStates);
		if(this._oldBox){
			var oldLeft = this._oldBox.l - offsetParentBorderBoxPageCoords.l - borderExtents.l;
			var oldTop = this._oldBox.t - offsetParentBorderBoxPageCoords.t - borderExtents.t;
			this._oldStyleValuesAllStates[this._applyToStateIndex] = 
					StyleArray.mergeStyleArrays(this._oldStyleValuesAllStates[this._applyToStateIndex], 
								[{left:oldLeft+'px'}, {top:oldTop+'px'}]);
		}
		if(styleValuesAllStates[this._applyToStateIndex]){
			styleValuesAllStates[this._applyToStateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[this._applyToStateIndex], newStyleArray);
		}else{
			styleValuesAllStates[this._applyToStateIndex] = newStyleArray;
		}
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var currentStatesList = States.getStatesListCurrent(widget.domNode);
		var styleValuesCanvas = StyleArray.mergeStyleArrays([], styleValuesAllStates['undefined']);
		for(var i=0; i<currentStatesList.length; i++){
			if(styleValuesAllStates[currentStatesList[i]]){
				styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesCanvas, styleValuesAllStates[currentStatesList[i]]);
			}
		}
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(styleValuesAllStates['undefined']);
		widget.refresh();

		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
		
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

		var styleValuesAllStates = this._oldStyleValuesAllStates;
		var currentStateIndex = this._applyToStateIndex;
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[currentStateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(this._oldStyleValuesAllStates['undefined']);
		
		widget.refresh();
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget.domNode);
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	}
});
});
