define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/utils/StyleArray"
    	//"davinci/ve/widget", // circular dep
    	//"davinci/ve/States" // circular dep
], function(declare, Widget, StyleArray){


return declare("davinci.ve.commands.StyleCommand", null, {

	name: "style",

	constructor: function(widget, values, applyToWhichStates){
	
		this._newValues = values;
		this._id = widget ? widget.id : undefined;
		// applyToWhichStates controls whether style change is attached to Normal or other states
		//   "current" => apply to currently active state
		//   [...array of strings...] => apply to these states (may not yet be implemented)
		//   any other value (null/undefined/"Normal"/etc) => apply to Normal state
		var veStates = require("davinci/ve/States");
		this._applyToStateIndex = veStates.getApplyToStateIndex(applyToWhichStates);
	},

	add: function(command){
		if(!command || command._id != this._id){
			return;
		}

		if(command._newValues){
			dojo.mixin(this._newValues, command._newValues);
		}
	},
	
	execute: function(){
		if(!this._id || !this._newValues){
			return;
		}
		var widget = require("davinci/ve/widget").byId(this._id);
		if(!widget){
			return;
		}
		
		var veStates = require("davinci/ve/States");
		var styleValuesAllStates = widget.getStyleValuesAllStates();
		this._oldStyleValuesAllStates = dojo.clone(styleValuesAllStates);
		var currentStateIndex = veStates.getCurrentStateIndex();
		if(styleValuesAllStates[this._applyToStateIndex]){
			styleValuesAllStates[this._applyToStateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[this._applyToStateIndex], this._newValues);
		}else{
			styleValuesAllStates[this._applyToStateIndex] = this._newValues;
		}
		
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[currentStateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(styleValuesAllStates['undefined']);
		widget.refresh();
		// Recompute styling properties in case we aren't in Normal state
		veStates.resetState(widget.domNode);
				
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},

	undo: function(){
		if(!this._id || !this._oldStyleValuesAllStates){
			return;
		}
		var widget = require("davinci/ve/widget").byId(this._id);
		if(!widget){
			return;
		}

		var veStates = require("davinci/ve/States");
		var styleValuesAllStates = this._oldStyleValuesAllStates;
		var currentStateIndex = veStates.getCurrentStateIndex();
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[currentStateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(this._oldStyleValuesAllStates['undefined']);
		
		widget.refresh();
		// Recompute styling properties in case we aren't in Normal state
		require("davinci/ve/States").resetState(widget.domNode);
		
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged", [[widget]]);
	}
});
});
