define([
		"dojo/_base/declare",
		"dojo/dom-geometry",
		"davinci/ve/widget",
		"davinci/ve/States",
		"davinci/ve/utils/StyleArray"
], function(declare, Geometry, Widget, States, StyleArray){


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
		this._applyToStateIndex = this._getApplyToStateIndex(applyToWhichStates);
	},

	execute: function(){
		
		if(!this._id || !this._newBox){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}

/*
		var box = widget.getMarginBox();
*/
		var node = widget.domNode;
		
		// Adjustments for widgets whose root tag has special CSS treatment
		// where width/height specify border-box instead of content-box
		//FIXME: This logic doesn't take into account the possibility that
		//uses have set borders and padding to different values for different states
		//Unlikely combination, but nevertheless not dealt with here properly
		var cs = node.ownerDocument.defaultView.getComputedStyle(node);
		var oldBox = Geometry.getContentBox(node, cs);
		this._oldBox = {w:oldBox.w, h:oldBox.h};
		var w = this._newBox.w;
		var h = this._newBox.h;
		if(this._usesBorderBox(node)){
			var pb = Geometry.getPadBorderExtents(node, cs);
			if(w >= 0){
				w += pb.w;
			}
			if(h >= 0){
				h += pb.h;
			}
		}

		var newStyleArray = [{width:w+'px'},{height:h+'px'}] ;
        var styleValuesAllStates = widget.getStyleValuesAllStates();
		this._oldStyleValuesAllStates = dojo.clone(styleValuesAllStates);
		var currentStateIndex = this._getCurrentStateIndex();
		if(this._oldBox){
			this._oldStyleValuesAllStates[this._applyToStateIndex] = 
					StyleArray.mergeStyleArrays(this._oldStyleValuesAllStates[this._applyToStateIndex], 
								[{width:this._oldBox.w+'px'}, {height:this._oldBox.h+'px'}]);
		}
		if(styleValuesAllStates[this._applyToStateIndex]){
			styleValuesAllStates[this._applyToStateIndex] = StyleArray.mergeStyleArrays(styleValuesAllStates[this._applyToStateIndex], newStyleArray);
		}else{
			styleValuesAllStates[this._applyToStateIndex] = newStyleArray;
		}
		
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[currentStateIndex]);
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
		var currentStateIndex = this._getCurrentStateIndex();
		widget.setStyleValuesAllStates(styleValuesAllStates);
		var styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesAllStates['undefined'], styleValuesAllStates[currentStateIndex]);
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(this._oldStyleValuesAllStates['undefined']);

		this._resize(widget);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged",[[widget]]);
	},
	
	/**
	 * Most a duplicate of private function found in dojo/dom-geometry.js
	 * Returns true if node uses border-box layout
	 * TABLE and BUTTON (and INPUT type=button) are always border-box by default.
	 */
	_usesBorderBox:function (/*DomNode*/node){
		var tagName = node.tagName.toLowerCase();
		var type = node.getAttribute('type');
		if(type){
			type = type.toLowerCase(type);
		}
		return tagName == "table" || tagName == "button" || (tagName == 'input' && type == 'button'); // boolean
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

	/**
	 * Returns array index into states object for given state
	 * Mostly used so that a null or undefined or 'Normal' state will get converted to string 'undefined'
	 * to compensate for screwy way that States.js is currently implemented
	 * @param {string|null|undefined} state  Current state
	 * @returns {string}  Returns either original state string or 'undefined'
	 */
	//FIXME: Right now we duplicate versions of this function in multiple commands
	_getStateIndex:function(state){
		var stateIndex;
		if(!state || state == 'Normal' || state == 'undefined'){
			//FIXME: we are using 'undefined' as name of Normal state due to accidental programming
			stateIndex = 'undefined';
		}else{
			stateIndex = state;
		}
		return stateIndex;
	},

	//FIXME: Right now we duplicate versions of this function in multiple commands
	_getCurrentStateIndex:function(){
		var veStates = require("davinci/ve/States");
		return this._getStateIndex(veStates.getState());
	},

	//FIXME: Right now we duplicate versions of this function in multiple commands
	_getApplyToStateIndex:function(applyToWhichStates){
		var veStates = require("davinci/ve/States");
		var currentState = veStates.getState();
		var state;
		if(applyToWhichStates === "current" && currentState && currentState != 'Normal' && currentState != 'undefined'){
			state = currentState;
		}else{
			state = undefined;
		}
		return this._getStateIndex(state);
	}

});
});
