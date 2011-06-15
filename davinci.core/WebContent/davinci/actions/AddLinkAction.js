dojo.provide("davinci.actions.AddLinkAction");
dojo.require("davinci.actions.Action");
dojo.require("dijit.Tree");
dojo.require("dojox.data.FileStore");

dojo.declare("davinci.actions.AddLinkAction", davinci.actions.Action, {
	
	run: function(selectedResource){
		var formHtml = 
		    "<div class='fileDialog' style='position:relative'>" +
		    "<div><label for=\"parentFolder\">Parent Folder: </label><div id='parentFolder' ></div></div>" +
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
	    "<div><label for='localName'>Local Name</label><input dojoType='dijit.form.TextBox' type='text' name='localName' id='localName'></div>" +
	    "<button dojoType='dijit.form.Button' type='submit' >Link</button>" +
	    "</div>" ;
		this.dialog = new dijit.Dialog({id: "newDialog", title:"Select Directory to link to",
			onCancel:function(){this.destroyRecursive(false);},
		    execute:  dojo.hitch(this,"createLink")});	
		
		this.dialog.setContent(formHtml);
	 	dijit.byId('localFileTree').notifySelect=dojo.hitch(this,function(item){this.selectedItem=item; });
		this._input=dijit.byId('localName');
		this.parentFolder=davinci.model.Resource.getSelectedResource()  || davinci.model.Resource.root;
		this.parentFolder=this.parentFolder.getParentFolder();
		dojo.byId('parentFolder').innerHTML=this.parentFolder.getPath();
	
		this.dialog.show();
	},
	
	createLink: function(value)
	{
		
		this.dialog.destroyRecursive(false);
		var path=this.parentFolder.getPath()+'/'+value.localName;
		response = davinci.Runtime.serverJSONRequest({
			   url:"./cmd/createLink", handleAs:"text",
		          content:{'path': path, 'localPath': this.selectedItem.path}, sync:true  });
		if (response=="OK")
		{
			var linkFile=new davinci.model.Resource.Folder(value.localName, this.parentFolder)
			this.parentFolder.children.push(linkFile);
			linkFile.link=this.selectedItem.path;
			dojo.publish("/davinci/resource/resourceChanged", ["created", linkFile]);
		}
		else if (response) {
			alert(response);
		}
	},
	
	shouldShow: function(selection){
		return davinci.Runtime.isLocalInstall;
	}
});