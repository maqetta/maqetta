define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/States"
], function(declare, Widget, States){


return declare("davinci.ve.commands.ModifyRuleCommand", null, {

	name: "modify rule",

	constructor: function(cssRule, values){
		this.cssRule = cssRule;
		this.values = values;
		
	},

	execute: function(context){
		if (!this.context){ // redo does not send a context, that is ok we should use the context from the first execute
			this.context = context;
		}
		if(!this.cssRule || !this.values || !this.context){
			return;
		}

		this._oldValues = this.cssRule.getProperties();		
		this.context.modifyRule( this.cssRule, this.values);
		var file = this.cssRule.getCSSFile();
		file.setDirty(true);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(this.context.rootNode);
		if (this.context._selection) {
			// force the style palette to update for redo
			this.context.onSelectionChange(this.context._selection); // force the style palette to update.
		}
	},

	undo: function(){
		if(!this.cssRule || !this.values || !this.context){
			return;
		}

		this.context.ruleSetAllProperties(this.cssRule, this._oldValues);
		
		var file = this.cssRule.getCSSFile();
		file.setDirty(true);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(this.context.rootNode);
		if (this.context._selection) {
			this.context.onSelectionChange(this.context._selection); // force the style palette to update.
		}

	}

});
});
