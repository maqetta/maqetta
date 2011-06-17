dojo.provide("davinci.actions.AddLinkAction");
dojo.require("davinci.actions.Action");
dojo.require("dijit.Tree");
dojo.require("dojox.data.FileStore");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.actions", "actionsLang");
var langObj = dojo.i18n.getLocalization("davinci.actions", "actionsLang");

dojo.declare("davinci.actions.AddLinkAction", davinci.actions.Action, {
	
	run: function(selectedResource){
		var formHtml = 
		    "<div class='fileDialog' style='position:relative'>" +
		    "<div><label for=\"parentFolder\">"+langObj.parentFolder+" </label><div id='parentFolder' ></div></div>" +
	    '	<div class="folderContainer">'+
	    "       <div dojoType='dojox.data.FileStore' url='./cmd/systemFileList'" +
	    "             pathAsQueryParam='true' jsId='systemFiles'>" +
	    "       </div>" +
	    "       <div dojoType='dijit.tree.ForestStoreModel' jsId='fileModel' store='systemFiles'" +
	    "          query='{}' rootId='DojoFiles' rootLabel='Local Files' childrenAttrs='children'>" +
	    "        </div>" +
	    '		<div dojoType="dijit.layout.ContentPane">'+
	    '			<div class="fileDialogTreeWidget" dojoType="dijit.Tree" id="localFileTree" model="fileModel"></div>'+
	    '		</div>'+
	    '	</div>'+
	    "<div><label for='localName'>"+langObj.localName+"</label><input dojoType='dijit.form.TextBox' type='text' name='localName' id='localName'></div>" +
	    "<button dojoType='dijit.form.Button' type='submit' >"+langObj.link+"</button>" +
	    "</div>" ;
		this.dialog = new dijit.Dialog({id: "newDialog", title:langObj.selectDirectory,
			onCancel: function(){this.destroyRecursive(false);},
		    execute: dojo.hitch(this,"createLink")
		});	
		
		this.dialog.setContent(formHtml);
		this._input=dijit.byId('localName');
		this.parentFolder=davinci.ui.Resource.getSelectedResource()  || davinci.resource.root;
		this.parentFolder=this.parentFolder.getParentFolder();
		dojo.byId('parentFolder').innerHTML=this.parentFolder.getPath();

	
		this.dialog.show();
	},
	
	createLink: function(value)
	{
		var selectedItem = dijit.byId('localFileTree').get("selectedItem");
		this.dialog.destroyRecursive(false);
		var path=this.parentFolder.getPath()+'/'+value.localName;
		response = davinci.Runtime.serverJSONRequest({
			   url:"./cmd/createLink", handleAs:"text",
			   content:{'path': path, 'localPath': selectedItem.path}, sync:true
		});
		if (response=="OK")
		{
			var linkFile=new davinci.model.Resource.Folder(value.localName, this.parentFolder)
			this.parentFolder.children.push(linkFile);
			linkFile.link=selectedItem.path;
			dojo.publish("/davinci/resource/resourceChanged", ["created", linkFile]);
		}
		else if (response) {
			alert(response); //FIXME
		}
	},
	
	shouldShow: function(selection){
		return davinci.Runtime.isLocalInstall;
	}
});