define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"../ui/DownloadSelected",
    	"system/resource",
    	"davinci/ui/Resource",
    	"dijit/Dialog",
    	"dojo/i18n!./nls/actions",
    	"dijit/form/ValidationTextBox"
], function(declare, Action, Workbench, DownloadSelected, resource, uiResource, Dialog, langObj){

return declare("davinci.actions.DownloadAction", Action, {

	run: function() {
		Workbench.showModal(new DownloadSelected(), "Download", {width: "400px"});
	},
	
	isEnabled: function(selection){
		var files = uiResource.getSelectedResources();
		return files && files.length>0;
	}
});
});