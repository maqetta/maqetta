define([
        "dojo/_base/declare",
    	"./Action",
    	"dojo/i18n!davinci/ui/nls/ui"
], function(declare, Action, uiNls){

return declare("davinci.actions.LogoutAction", Action, {

	run: function() {
		
		/* call the logout URL then redirect to maqetta login page */

		var logoutRequest = new XMLHttpRequest();
		logoutRequest.onreadystatechange = function() {
			location.href = location.href; // "/maqetta/"; wrong place in war war or if context changes #3704
		};
		var parameters = "";
		logoutRequest.open("POST", "../logout", false);
		logoutRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		logoutRequest.setRequestHeader("Orion-Version", "1");
		logoutRequest.send(parameters);
		
		
		// not yet implemented
		
	},
	
	isEnabled: function(selection){
		return true;
	}
});
});