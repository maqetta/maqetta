define([
    	"dojo/_base/declare",
    	//"davinci/ve/widget", // circular dep
    	//"davinci/ve/States" // circular dep
], function(declare){


return declare("davinci.ve.commands.StyleCommand", null, {

	name: "style",

	constructor: function(widget, values, applyToWhichStates){
	
		this._newValues = values;
		this._id = widget ? widget.id : undefined;
		// applyToWhichStates controls whether style change is attached to Normal or other states
		//   "current" => apply to currently active state
		//   [...array of strings...] => apply to these states (may not yet be implemented)
		//   any other value (null/undefined/"Normal"/etc) => apply to Normal state
		this._applyToWhichStates = applyToWhichStates; 
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
		var cleanValues = dojo.clone(this._newValues);
		
		var veStates = require("davinci/ve/States");
		var currentState = veStates.getState();
		if(this._applyToWhichStates === "current"){
			this._state = currentState;
		}else{
			this._state = undefined;
		}
		var isNormalState = veStates.isNormalState(this._state);

		if (isNormalState) {
			//FIXME: what about oldValue when not normal state?
			if(!this._oldValues){
				this._oldValues = (widget.getStyleValues() || []);
				if(!this._oldValues){
					return;
				}
			}
		}
		// /* may need to trickle down duplicate background properties for a state into the state code. */
		//for(var i=0;i<cleanValues.length;i++){
			//veStates.setStyle(widget, this._state, cleanValues[i], isNormalState);			
		//}
		veStates.setStyle(widget.domNode, this._state, cleanValues, isNormalState);			

		if (isNormalState) {
			cleanValues = this._mergeProperties(cleanValues, this._oldValues);			
			widget.setStyleValues( cleanValues);
			this._refresh(widget);
			
			// Recompute styling properties in case we aren't in Normal state
			veStates.resetState(widget.domNode);
		}else{
			this._refresh(widget);
		}
		
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},
	
	_mergeProperties: function(set1, set2) {
		var oldValues = dojo.clone(set2);
		// Remove properties from oldValues that are in set1
		for(var i=0;i<set1.length;i++){
			for(var name1 in set1[i]){	// should only have one property
				for(j=oldValues.length-1; j>=0; j--){
					var oldItem = oldValues[j];
					for(var name2 in oldItem){	// should only have one property
						if(name1==name2){
							oldValues.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		var newValues = set1.concat(oldValues);
		return newValues;
	},

	undo: function(){
		if(!this._id || !this._oldValues){
			return;
		}
		var widget = require("davinci/ve/widget").byId(this._id);
		if(!widget){
			return;
		}

		widget.setStyleValues( this._oldValues);
		this._refresh(widget);
		
		// Recompute styling properties in case we aren't in Normal state
		require("davinci/ve/States").resetState(widget.domNode);
		
		//FIXME: Various widget changed events (/davinci/ui/widget*Changed) need to be cleaned up.
		// I defined yet another one here (widgetPropertiesChanged) just before Preview3
		// rather than re-use or alter one of the existing widget*Changed events just before
		// the Preview 3 release to minimize risk of bad side effects, with idea we would clean up later.
		// For time being, I made payload compatible with /davinci/ui/widgetSelectionChanged. 
		// Double array is necessary because dojo.publish strips out the outer array.
		dojo.publish("/davinci/ui/widgetPropertiesChanged", [[widget]]);
	},
	
	_refresh: function(widget){
		/* if the widget is a child of a dijiContainer widget 
		 * we may need to refresh the parent to make it all look correct in page editor
		 * */ 
		var parent = widget.getParent();
		if (parent.dijitWidget){
			this._refresh(parent);
		} else if (widget && widget.resize){
			widget.resize();
		}
		
	}

});
});
