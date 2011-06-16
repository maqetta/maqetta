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
		onCancel:function(){
			this.destroyRecursive(false);
		}
	});
	var formHTML="<div class='about_container'>"
		+ "<div class='about_title'>Maqetta</div>"
		+ "<div class='about_version'>Version: "+davinci.version+"</div>";
	var ri = davinci.repositoryinfo,
		revision = ri.revision;
	if(revision){
		formHTML += "<div class='about_build'>Build: <a href='https://github.com/maqetta/maqetta/commit/"+revision+"'>"+revision.substr(0,15)+"...</a></div>";
	}
	var bd = ri.buildtime;
    if(bd){
        formHTML += "<div class='about_build'>Date: "+bd+"</div>";
    }
	formHTML += "</div>";
	dialog.setContent(formHTML);
	dialog.show();
}
