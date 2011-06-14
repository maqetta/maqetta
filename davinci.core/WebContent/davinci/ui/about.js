dojo.provide("davinci.ui.about");
dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
// Shows "About daVinci" dialog
davinci.ui.about=function(){
	var	dialog = new dijit.Dialog({
		id: "aboutMaqetta",
		title:"About Maqetta",
		style: "width: 200px", //TODO: move to stylesheet
		onCancel:function(){
			this.destroyRecursive(false);
		}
	});
	var formHTML="<div class='about_container'>"
		+ "<div class='about_title'>Maqetta</div>"
		+ "<div class='about_version'>Version: "+davinci.version+"</div>";
	var ri = davinci.repositoryinfo;
	if(ri){
		var barindex = ri.indexOf('|');
		var revnum = barindex>=0 ? ri.substr(0, barindex) : ri;
		formHTML += "<div class='about_build'>Build: "+revnum+"</div>";
	}
	formHTML += "</div>";
	dialog.setContent(formHTML);
	dialog.show();
}
