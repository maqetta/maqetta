define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"../ui/DownloadSelected",
    	"system/resource",
    	"davinci/ui/Resource",
    	"dojo/i18n!davinci/ui/nls/ui",
    	"dojo/i18n!./nls/actions",
    	"dijit/form/ValidationTextBox"
], function(declare, Action, Workbench, DownloadSelected, resource, uiResource, langObj){

return declare("davinci.actions.DownloadAction", Action, {

	run: function() {
		Workbench.showModal(new DownloadSelected(), langObj.downloadFile, {width: "400px"});
	},
	
	isEnabled: function(selection){
		var files = uiResource.getSelectedResources();
		return files && files.length>0;
	}
});
});