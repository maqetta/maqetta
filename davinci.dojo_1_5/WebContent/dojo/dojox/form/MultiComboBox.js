dojo.provide("dojox.form.MultiComboBox");
dojo.experimental("dojox.form.MultiComboBox"); 
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.ValidationTextBox");

dojo.declare("dojox.form.MultiComboBox",
	[dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin],{
	//
	// summary: A ComboBox that accpets multiple inputs on a single line?
	//
	// delimiter: String
	// 	The character to use to separate items in the ComboBox input
	delimiter: ",",
	_previousMatches: false,

	_setValueAttr: function(value){
		if (this.delimiter && value.length != 0){
			value = value+this.delimiter+" ";
			arguments[0] = this._addPreviousMatches(value);
		}
		this.inherited(arguments);
	},

	_addPreviousMatches: function(/* String */text){
		if(this._previousMatches){
			if(!text.match(new RegExp("^"+this._previousMatches))){
				text = this._previousMatches+text;
			}
			text = this._cleanupDelimiters(text);
		}
		return text; // String
	},

	_cleanupDelimiters: function(/* String */text){
		if(this.delimiter){
			text = text.replace(new RegExp("  +"), " ");
			text = text.replace(new RegExp("^ *"+this.delimiter+"* *"), "");
			text = text.replace(new RegExp(this.delimiter+" *"+this.delimiter), this.delimiter);
		}
		return text;
	},
			
	_autoCompleteText: function(/* String */text){
		arguments[0] = this._addPreviousMatches(text);
		this.inherited(arguments);
	},

	_startSearch: function(/* String */text){
		text = this._cleanupDelimiters(text);
		var re = new RegExp("^.*"+this.delimiter+" *");
		
		if((this._previousMatches = text.match(re))){
			arguments[0] = text.replace(re, "");
		}
		this.inherited(arguments);
	}		
});
