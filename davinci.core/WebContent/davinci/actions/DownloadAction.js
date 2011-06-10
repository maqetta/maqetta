dojo.provide("davinci.actions.DownloadAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.model.Resource");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.actions", "actionsLang");
var langObj = dojo.i18n.getLocalization("davinci.actions", "actionsLang");

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
    '<div>'+ langObj.downloadResources +'</div>'
    +filesDiv+
    '	<div class="fileNameRow">'+
    '		<label for="zipFileName"> '+ langObj.downloadFileName +' </label>'+
    '		<input dojoType="dijit.form.TextBox" type="text" name="zipFileName" id="zipFileName" value="'+proposedFileName+'"></input><span>.zip</span>'+
    '	</div>'+
    '<div><button dojoType="dijit.form.Button" type="submit" >'+ langObj.downloadNow +'</button></div>' +
    "</div>" ;
	this.dialog = new dijit.Dialog({id: "downloadDialog", title:langObj.titleDownload,
		onCancel:function(){this.destroyRecursive(false);},
	    execute:  dojo.hitch(this,"download")});	
	
	this.dialog.setContent(formHtml);
	this.dialog.show();
	
},
isEnabled: function(selection){
	var files=davinci.model.Resource.getSelectedResources();
	return files && files.length>0;
},
download : function(value)
{
	var resources=dojo.map(this._files,function(item){return item.getPath();});
	this.dialog.destroyRecursive(false);
	var path=value.zipFileName;
	 response = davinci.Runtime.serverJSONRequest({
		   url:"./cmd/download", handleAs:"text",
	          content:{'fileName':path, 'resources' : resources},sync:true  });
	  if (response=="OK")
	  {
		    var loc=window.location.href;
		    if (loc.charAt(loc.length-1)=='/')
		    	loc=loc.substring(0,loc.length-1);

		 loc= loc+'/user/'+davinci.Runtime.userName+'/ws/workspace/.download/'+path+'.zip';

		  window.location.href=loc;
	  }
	  else if (response)
		  alert(response);
}
//,
//shouldShow: function(selection){
//	return davinci.Runtime.isLocalInstall;
//}


});