define([
        "dojo/_base/declare",
    	"./Action",
    	"system/resource",
    	"davinci/ui/Resource",
    	"dijit/Dialog",
    	"dojo/i18n!./nls/actions"
], function(declare, Action, resource, uiResource, Dialog, langObj){

return declare("davinci.actions.DownloadAction", Action, {

	run: function() {
		var files = uiResource.getSelectedResources();
		this._files = files;
		var filesDiv = "";
		for ( var i = 0; i < files.length; i++) {
			filesDiv += "<div>" + files[i].getPath() + "</div>";
		}
		var proposedFileName = "download";
		var formHtml =
			"<div >" +
		    '<div>'+ langObj.downloadResources +'</div>'
		    +filesDiv+
		    '	<div class="fileNameRow">'+
		    '		<label for="zipFileName"> '+ langObj.downloadFileName +' </label>'+
		    '		<input dojoType="dijit.form.TextBox" type="text" name="zipFileName" id="zipFileName" value="'+proposedFileName+'"></input><span>.zip</span>'+
		    '	</div>'+
		    '<div><button dojoType="dijit.form.Button" type="submit" >'+ langObj.downloadNow +'</button></div>' +
		    "</div>" ;
		this.dialog = new Dialog({
			id: "downloadDialog",
			title: langObj.titleDownload,
			onCancel: function() {
				this.destroyRecursive(false);
			},
			execute: dojo.hitch(this, "download")
		});

		this.dialog.setContent(formHtml);
		this.dialog.show();

	},
	
	isEnabled: function(selection){
		var files = uiResource.getSelectedResources();
		return files && files.length>0;
	},
	
	download : function(value){
		var resources=dojo.map(this._files,function(item){return item.getPath();});
		this.dialog.destroyRecursive(false);
		var path=value.zipFileName;
			
		system.resource.download(resources, path + ".zip", davinci.Runtime.getProject());
	}
});
});