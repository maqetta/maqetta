define([
	    "dojo/_base/declare"
], function(declare){
	
return declare("davinci.commands.CompoundCommand", null, {
	// summary:
//	Represents a command that consists of multiple subcommands.

	name: "compound",
	_commands :[],
	
	constructor: function(command){
		this._commands = [];
		if(command){
			this._commands = [command];
		}
	},

	add: function(command){
		// summary:
		//		Adds the command to this command's list of commands to execute.
		if(!command){
			return;
		}

		if(!this._commands){
			if(command.name == "compound"){
				this._commands = command._commands;
			}else{
				this._commands = [command];
			}
		}else{
			if(command.name == "compound"){
				// merge commands
				dojo.forEach(command._commands, function(c){
					this.add(c);
				}, this);
				return;
			}else if(command.name == "modify"){
				// merge modify command
				var id = command._oldId;
				for(var i = 0; i < this._commands.length; i++){
					var c = this._commands[i];
					if(c.name == "modify" && c._oldId == id){
						c.add(command);
						return;
					}
				}
			}
			this._commands.push(command);
		}
	},


	setContext : function(context){
		for(var i = 0;i<this._commands.length;i++)
			if(this._commands[i].setContext) 
				this._commands[i].setContext(context);
		
		
	},
	isEmpty: function(){
		// summary:
		//		Returns whether this command has any subcommands to execute.
		return (!this._commands || this._commands.length === 0);
	},

	execute: function(){
		// summary:
		//		Executes this command, which in turn executes each child command in the order they were added.
		if(!this._commands){
			return;
		}

		for(var i = 0; i < this._commands.length; i++){
			this._commands[i].execute();
			if(this._commands[i]._oldId && this._commands[i]._newId){
				this._oldId = this._commands[i]._oldId;
				this._newId = this._commands[i]._newId;
			}
		}
	},

	undo: function(){
		// summary:
		//		Undoes each of the child commands (in reverse order).
		if(!this._commands){
			return;
		}

		for(var i = this._commands.length - 1; i >= 0; i--){
			this._commands[i].undo();
		}
	}

});
});
