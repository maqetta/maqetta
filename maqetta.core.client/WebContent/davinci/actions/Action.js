define([
	"dojo/_base/declare"
], function(declare){

return declare("davinci.actions.Action", null, {
	item:null,

	run: function(selection){
	},
	
	isEnabled: function(selection){
		return true;
	},
	
	getName: function(){
		return this.item.label;
	}

});
});
