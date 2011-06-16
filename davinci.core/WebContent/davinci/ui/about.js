dojo.provide("davinci.ui.about");
dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "uiLang");

// Shows "About daVinci" dialog
davinci.ui.about=function(){
	var langObj = dojo.i18n.getLocalization("davinci.ui", "uiLang");
	var	dialog = new dijit.Dialog({
		id: "aboutMaqetta",
		title:langObj.aboutMaqetta,
		style: "width: 365px", //TODO: move to stylesheet
		onCancel:function(){
			this.destroyRecursive(false);
		}
	});
	var formHTML="<div class='about_container'>"
		+ "<div class='about_title'>Maqetta</div>"
		+ "<div class='about_version'>"+dojo.string.substitute(langObj.productVersion,[davinci.version])+"</div>";
	var ri = davinci.repositoryinfo;
	if(ri){
		formHTML += "<div class='about_build'>Build: <a href='https://github.com/maqetta/maqetta/commit/"+ri+"'>"+ri+"</a></div>";
	}
	var bd = davinci.build.date;
	var lidx = bd.lastIndexOf('-');
	bd = bd.slice(0,lidx-1) + 'T' + bd.slice(lidx+1);
    if(bd){
        formHTML += "<div class='about_build'>Built: "+bd+"</div>";
    }
	formHTML += "</div>";
	dialog.setContent(formHTML);
	dialog.show();
}
