define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"system/resource",
	"dojo/i18n!davinci.actions/nls/actions"
], function(declare, Action, resource, langObj){

return declare("davinci.actions.DownloadAction", Action, {
	
	run: function() {
		var files = davinci.ui.Resource.getSelectedResources();
		this._files = files;
		var filesDiv = "";
		for ( var i = 0; i < files.length; i++)
			filesDiv += "<div>" + files[i].getPath() + "</div>";
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
		this.dialog = new dijit.Dialog({
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
		var files=davinci.ui.Resource.getSelectedResources();
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