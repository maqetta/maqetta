define([
        "dojo/_base/declare",
        "davinci/Runtime",
    	"./Action",
    	"dojo/i18n!davinci/ui/nls/ui"
], function(declare, Runtime, Action, uiNls){

return declare("davinci.actions.UserNameAction", Action, {

	run: function() {
		// do nothing
	},
	
	getName: function(){
		var name = '';
		var result = Runtime.getUser();
        if (result) {
            name = result.email;
        }       
		return '<i>'+name+'</i>';
	}
});
});