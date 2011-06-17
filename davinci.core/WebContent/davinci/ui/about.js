dojo.provide("davinci.ui.about");
dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

// Shows "About daVinci" dialog
davinci.ui.about=function(){
	var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
	var	dialog = new dijit.Dialog({
		id: "aboutMaqetta",
		title:langObj.aboutMaqetta,
		onCancel:function(){
			this.destroyRecursive(false);
		}
	});
	var formHTML="<div class='about_container'>"
		+ "<div class='about_title'>Maqetta</div>"
		+ "<div class='about_version'>"+dojo.string.substitute(langObj.productVersion,[davinci.version])+"</div>";
	var ri = davinci.repositoryinfo,
		revision = ri.revision;
	if(revision){
		formHTML += "<div class='about_build'>"+dojo.string.substitute(langObj.build, [revision, revision.substr(0,15)])+"</div>";
	}
	var bd = ri.buildtime;
    if(bd){
        formHTML += "<div class='about_build'>Date: "+bd+"</div>";
    }
	formHTML += "</div>";
	dialog.setContent(formHTML);
	dialog.show();
}
