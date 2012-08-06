define([
        "dojo/_base/declare",
    	"./Action",
    	"dojo/i18n!davinci/ui/nls/ui"
], function(declare, Action, uiNls){

return declare("davinci.actions.LogoutAction", Action, {

	run: function() {
		/* call the logout URL then redirect to maqetta login page */
		var migrateRequest = new XMLHttpRequest();
		migrateRequest.onreadystatechange = function() {
			location.href = "/maqetta/";
		};
		var parameters = "";
		migrateRequest.open("POST", "/logout", true);
		migrateRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		migrateRequest.setRequestHeader("Orion-Version", "1");
		migrateRequest.send(parameters);
		
		
		// not yet implemented
		
	},
	
	isEnabled: function(selection){
		return true;
	}
});
});