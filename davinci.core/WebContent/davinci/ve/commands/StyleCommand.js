dojo.provide("davinci.ve.commands.StyleCommand");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.States");

dojo.declare("davinci.ve.commands.StyleCommand", null, {

	name: "style",

	constructor: function(widget, values, applyToWhichStates){
		this._newValues = values;
		this._id = (widget ? widget.id : undefined);
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
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		var cleanValues = {};
		dojo.mixin(cleanValues,this._newValues );

		if(this._applyToWhichStates === "current"){
			this._state = davinci.ve.states.getState();
		}else{
			this._state = undefined;
		}
		var isNormalState = davinci.ve.states.isNormalState(this._state);
		davinci.ve.states.setStyle(widget, this._state, cleanValues, undefined, isNormalState);			

		if (isNormalState) {
			if(!this._oldValues){
				this._oldValues = (widget.getStyleValues() || {});
				if(!this._oldValues){
					return;
				}
				this._mergeProperties(cleanValues, this._oldValues);
			}			
			widget.setStyleValues( cleanValues);
			this._refresh(widget);
		}
	},
	
	_mergeProperties: function(set1, set2) {
		for (var a in set2) {
			if (!(a in set1)) {
				set1[a] = (set2[a] == "null" ? null : set2[a]);
			}
		}
	},

	undo: function(){
		if(!this._id || !this._oldValues){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}

		widget.setStyleValues( this._oldValues);
		this._refresh(widget);
	},
	
	_refresh: function(widget){
		/* if the widget is a child of a dijiContainer widget 
		 * we may need to refresh the parent to make it all look correct in page editor
		 * */ 
		var parent = widget.parent; 
		if (!parent && widget.getParent)
			parent = widget.getParent();
		if (/*widget.parent && widget.*/parent.dijitWidget){
			this._refresh(/*widget.*/parent);
		} else if (widget.dijitWidget && widget.dijitWidget.resize){
			widget.dijitWidget.resize();
		}
		
	}

});
