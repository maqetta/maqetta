define([
        "dojo/_base/declare",
    	"./Action",
    	"dojo/i18n!davinci/ui/nls/ui"
], function(declare, Action, uiNls){

return declare("davinci.actions.LogoutAction", Action, {

	run: function() {
		
		/* call the logout URL then redirect to maqetta login page */
		  dojo.xhrPost({
              url: "../logout",
              handleAs: "text",
              headers: { "Content-Type": "application/x-www-form-urlencoded", "Orion-Version": "1"},
              postData: "",
              load: function(response, ioArgs){
            	  location.href = 'welcome'; // relative path #3704
              }.bind(this),
          });
		  
	
	},
	
	isEnabled: function(selection){
		return true;
	}
});
});