define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/States",
    	"davinci/ve/utils/StyleArray"
], function(declare, Widget, States, StyleArray){


return declare("davinci.ve.commands.ResizeCommand", null, {


	name: "resize",

	constructor: function(widget, width, height, applyToWhichStates){
		this._id = (widget ? widget.id : undefined);
	
		/* make sure these values are numeric */
		if(dojo.isString(width)){
			width = parseFloat(width);
		}
		
		if(dojo.isString(height)){
			height = parseFloat(height);
		}

		this._newBox = {w: width, h: height};
		
		// applyToWhichStates controls whether style change is attached to Normal or other states
		//   "current" => apply to currently active state
		//   [...array of strings...] => apply to these states (may not yet be implemented)
		//   any other value (null/undefined/"Normal"/etc) => apply to Normal state
		this._applyToWhichStates = applyToWhichStates;
	},

	execute: function(){
		
		if(!this._id || !this._newBox){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}

		var box = widget.getMarginBox();
		this._oldBox = {w:box.w, h:box.h};
		
		var newStyleArray = [{width:this._newBox.w+'px'},{height:this._newBox.h+'px'}] ;
        var styleValuesAllStates = widget.getStyleValuesAllStates();
		this._oldStyleValuesAllStates = dojo.clone(styleValuesAllStates);
		var stateIndex = this._getCurrentStateIndex();
		if(this._oldBox){
			this._oldStyleValuesAllStates[stateIndex] = 
					StyleArray.mergeStyleArrays(this._oldStyleValuesAllStates[stateIndex], 
								[{width:this._oldBox.w+'px'}, {height:this._oldBox.h+'px'}]);
		}
		if(styleValuesAllStates[stateIndex]){
			styleValuesAllStates[stateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[stateIndex], newStyleArray);
		}else{
			styleValuesAllStates[stateIndex] = newStyleArray;
		}
		
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[stateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(styleValuesAllStates['undefined']);
		this._resize(widget);

/*
		this._state = States.getState();
		var isNormalState = States.isNormalState(this._state);

		//var cleanValues = { width: this._newBox.w, height: this._newBox.h };
		var cleanValues = [{ width: this._newBox.w}, {height: this._newBox.h }];
		States.setStyle(widget.domNode, this._state, cleanValues, isNormalState);

		if (isNormalState) {
			dojo.contentBox(node, this._newBox);
			this._resize(widget);
		}
*/
		
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
/*
		widget.setMarginBox(this._oldBox);
*/
		var styleValuesAllStates = this._oldStyleValuesAllStates;
		var stateIndex = this._getCurrentStateIndex();
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[stateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(this._oldStyleValuesAllStates['undefined']);

		this._resize(widget);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
		
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
	},

	//FIXME: Right now we duplicate versions of this function in multiple commands
	_getCurrentStateIndex:function(){
		var veStates = require("davinci/ve/States");
		var currentState = veStates.getState();
		var temp;
		if(this._applyToWhichStates === "current"){
			temp = currentState;
		}else{
			temp = undefined;
		}
		var stateIndex;
		if(!temp || temp === 'Normal'){
			//FIXME: we are using 'undefined' as name of Normal state due to accidental programming
			stateIndex = 'undefined';
		}else{
			stateIndex = temp;
		}
		return stateIndex;
	}

});
});
