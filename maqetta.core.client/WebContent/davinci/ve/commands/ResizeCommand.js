define([
		"dojo/_base/declare",
		"dojo/dom-geometry",
		"davinci/ve/widget",
		"davinci/ve/States",
		"davinci/ve/utils/StyleArray"
], function(declare, Geometry, Widget, States, StyleArray){


return declare("davinci.ve.commands.ResizeCommand", null, {


	name: "resize",

	constructor: function(widget, width, height, applyToWhichState){
		this._id = (widget ? widget.id : undefined);
		var number_regex = /^\s*[-+]?[0-9]*\.?[0-9]+\s*$/;
	
		/* make sure these values are numeric */
		if(number_regex.test(width)){
			width = parseFloat(width);
		}
		if(number_regex.test(height)){
			height = parseFloat(height);
		}

		this._newBox = {w: width, h: height};
		
		// applyToWhichState controls whether style change is attached to Normal or other states
		//   (null|undefined|"undefined"|"Normal") => apply to Normal state
		//   other string => apply to that particular state
		this._applyToStateIndex = (!applyToWhichState || applyToWhichState=='Normal' || applyToWhichState=='undefined')
									? 'undefined' : applyToWhichState;
	},

	execute: function(){
		
		if(!this._id || !this._newBox){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget || !widget.domNode){
			return;
		}
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
			if(typeof w == 'number' && w >= 0){
				w += pb.w;
			}
			if(typeof h == 'number' && h >= 0){
				h += pb.h;
			}
		}

		//var newStyleArray = [{width:w+'px'},{height:h+'px'}] ;
		var newStyleArray = [{}] ;
		if(typeof w == 'number'){
			newStyleArray[0].width = w+'px';
		}else if(typeof w == 'string'){
			newStyleArray[0].width = w;
		}
		if(typeof h == 'number'){
			newStyleArray[0].height = h+'px';
		}else if(typeof h == 'string'){
			newStyleArray[0].height = h;
		}
		var styleValuesAllStates = widget.getStyleValuesAllStates();
		this._oldStyleValuesAllStates = dojo.clone(styleValuesAllStates);
		if(this._oldBox){
			//FIXME: Undo will force a width/height values onto inline style
			//that might not have been there before.
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
		var currentStatesList = States.getStatesListCurrent(widget.domNode);
		var styleValuesCanvas = StyleArray.mergeStyleArrays([], styleValuesAllStates['undefined']);
		for(var i=0; i<currentStatesList.length; i++){
			if(styleValuesAllStates[currentStatesList[i]]){
				styleValuesCanvas = StyleArray.mergeStyleArrays(styleValuesCanvas, styleValuesAllStates[currentStatesList[i]]);
			}
		}
		widget.setStyleValuesCanvas(styleValuesCanvas);
		widget.setStyleValuesModel(styleValuesAllStates['undefined']);
		this._resize(widget);
		
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
		var styleValuesAllStates = this._oldStyleValuesAllStates;
		var currentStateIndex = this._applyToStateIndex;
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
	 * Mostly a duplicate of private function found in dojo/dom-geometry.js
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
	}

});
});
