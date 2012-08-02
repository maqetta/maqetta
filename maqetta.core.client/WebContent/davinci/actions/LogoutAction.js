define([
        "dojo/_base/declare",
    	"./Action",
    	"dojo/i18n!davinci/ui/nls/ui"
], function(declare, Action, uiNls){

return declare("davinci.actions.LogoutAction", Action, {

	run: function() {
		// not yet implemented
	},
	
	isEnabled: function(selection){
		return true;
	}
});
});