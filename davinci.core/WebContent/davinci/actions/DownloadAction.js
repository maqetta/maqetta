dojo.provide("davinci.actions.DownloadAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.model.Resource");

dojo.declare("davinci.actions.DownloadAction", davinci.actions.Action, {
	
	run: function(){
		var files=davinci.model.Resource.getSelectedResources();
		this._files=files;
		var filesDiv="";
		for (var i=0;i<files.length;i++)
			filesDiv+="<div>"+files[i].getPath()+"</div>";
			
		var proposedFileName="download";
		var formHtml = 
	    "<div >" +
	    '<div>Download Resources</div>'
	    +filesDiv+
	    '	<div class="fileNameRow">'+
	    '		<label for="zipFileName"> Downloaded File Name: </label>'+
	    '		<input dojoType="dijit.form.TextBox" type="text" name="zipFileName" id="zipFileName" value="'+proposedFileName+'"></input><span>.zip</span>'+
	    '	</div>'+
	    '<div><button dojoType="dijit.form.Button" type="submit" >Download now</button></div>' +
	    "</div>" ;
		this.dialog = new dijit.Dialog({id: "downloadDialog", title:"Download",
			onCancel:function(){this.destroyRecursive(false);},
		    execute:  dojo.hitch(this,"download")});	
		
		this.dialog.setContent(formHtml);
		this.dialog.show();
		
	},
	isEnabled: function(selection){
		var files=davinci.model.Resource.getSelectedResources();
		return files && files.length>0;
	},
	download : function(value){
		var resources=dojo.map(this._files,function(item){return item.getPath();});
		this.dialog.destroyRecursive(false);
		var path=value.zipFileName;
		
		davinci.model.Resource.download(resources, path + ".zip");	
	
	
	}


});