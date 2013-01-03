define([
    	"dojo/_base/declare",
    	"../States",
    	"../../html/CSSModel", // shorthands
], function(declare, States, CSSModel){

var ruleSetAllProperties = function(rule, values){
	rule.removeAllProperties();
	values.forEach(function(value){
		rule.addProperty(value.name, value.value); // #23 all we want to put back is the values
	});
};

var modifyRule = function(rule, values){
	var i,
		p,
		prop,
		existingProps = [],
		removedProp = [];

	// Remove any properties within rule that are listed in the "values" parameter 
	for(i = 0; i < values.length; i++){
		for(var name in values[i]){
			prop = rule.getProperty(name);
			if (prop) {
				removedProp.push(prop); //#2166
			}
			rule.removeProperty(name);
		}
	}

	// Create a merged list of properties from existing rule and "values" parameter
	for(p = 0; p < rule.properties.length; p++){
		prop = rule.properties[p];
		var o = {};
		o[prop.name] = prop.value;
		existingProps.push(o);
	}

	var cleaned = existingProps.concat(dojo.clone(values));

	// return a sorted array of sorted style values.
	var indexOf = function(value){
		for(var i=0;i<cleaned.length;i++){
			if(cleaned[i].hasOwnProperty(value)){
				return i;
			}
		}
		return -1;
	};

	var shorthands = CSSModel.shorthand;
	var lastSplice = 0;
	// re-order the elements putting short hands first
	for(i = 0; i < shorthands.length; i++) {
		var index = indexOf(shorthands[i][0]);
		if(index > -1) {
			var element = cleaned[index];
			cleaned.splice(index, 1);
			cleaned.splice(lastSplice, 0, element);
			lastSplice++;
		}
	}

	// Clear out all remaining prop declarations in the rule
	for(p = rule.properties.length - 1; p >= 0; p--){
		prop = rule.properties[p];
		if(prop){
			removedProp.push(rule.getProperty(prop.name)); //#2166
			rule.removeProperty(prop.name);
		}
	}

	// Add all prop declarations back in, in proper order
	for(i = 0; i < cleaned.length; i++){
		for(var name in cleaned[i]){
			if (cleaned[i][name] && cleaned[i][name] !== '') { 
				rule.addProperty(name, cleaned[i][name]);
				//#2166 find the old prop to grab comments if any
				for (var x = 0; x < removedProp.length; x++) {
					if (removedProp[x].name === name) {
						var newProp = rule.getProperty(name, cleaned[i][name]);
						if (removedProp[x].comment) { 
							// add back the comments before this prop from the old CSS file
							newProp.comment = removedProp[x].comment; 
						}
						if (removedProp[x].postComment) { 
							// add back the comments after this prop from the old CSS file
							newProp.postComment = removedProp[x].postComment; 
						}
						removedProp.splice(x,1); // trim out the prop so we don't process this more than once
						break;
					}
				}
				//#2166 find the old prop to grab comments if any
			}
		}
	}
};

return declare("davinci.ve.commands.ModifyRuleCommand", null, {

	name: "modify rule",

	constructor: function(cssRule, values, context) {
		this.cssRule = cssRule;
		this.values = values;
		this.context = context;
	},

	execute: function(context) {
		if (!this.context){ // redo does not send a context, that is ok we should use the context from the first execute
			this.context = context;
		}

		if (!this.cssRule || !this.values || !this.context) {
			return;
		}

		this._oldValues = this.cssRule.getProperties();		
		modifyRule(this.cssRule, this.values);
		this._setDirty();
	},

	undo: function() {
		if (!this.cssRule || !this._oldValues || !this.context) {
			return;
		}

		ruleSetAllProperties(this.cssRule, this._oldValues);
		this._setDirty();
	},

	_setDirty: function() {
		var file = this.cssRule.getCSSFile();
		file.setDirty(true);
		this.context.editor.setDirty(true);
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(this.context.rootNode);
		if (this.context._selection) {
			// force the style palette to update
			this.context._forceSelectionChange = true;
		}
	}
});
});
