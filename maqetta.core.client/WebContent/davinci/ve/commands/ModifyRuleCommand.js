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
		if(!this.cssRule || !this.values || !this.context)
			return;

		this._oldValues = [];
		for(var i=0;i<this.values.length;i++){
			
			for(var name in this.values[i]){
				this._oldValues.concat( this.cssRule.getProperties(name));
			}
		}
		
		this.context.modifyRule( this.cssRule, this.values);
		var file = this.cssRule.getCSSFile();
		file.setDirty(true);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(this.context.rootWidget);
		
	},

	undo: function(){
		if(!this.cssRule || !this.values || !this.context)
			return;

		this.context.modifyRule( this.cssRule, this._oldValues);
		
		var file = this.cssRule.getCSSFile();
		file.setDirty(true);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(this.context.rootWidget);

	}

});
});
