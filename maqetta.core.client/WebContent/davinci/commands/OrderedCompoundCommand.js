define([
	    "dojo/_base/declare",
	    "davinci/commands/CompoundCommand"
], function(declare, CompoundCommand){
	
return declare("davinci.commands.OrderedCompoundCommand", CompoundCommand, {
	// summary:
//	Represents a command that consists of multiple subcommands, 
//	but undo's are done in the same order as the executes.

	undo: function(){
		// summary:
		//		Undoes each of the child commands (in same order they were executed in).
		if(!this._commands){
			return;
		}

		for(var i = 0; i < this._commands.length; i++){
			this._commands[i].undo();
		}
	}

});
});
