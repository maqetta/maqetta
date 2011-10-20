dojo.provide("davinci.ui.ProjectPreferences");

dojo.require("davinci.workbench.PreferencePane");
dojo.require("dijit.form.CheckBox");


/*
 * 
 * Big to-do to finish this.  Just copied the HTML editors for now.
 * 
 * 
 */


dojo.declare("davinci.ui.ProjectPreferences",davinci.workbench.PreferencePane, {

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
	"<tr><td>Web Content:</td><td><div dojoAttachPoint='webContentNode'></div></td></tr>" +
	"<tr><td>Theme Folder:</td><td><div dojoAttachPoint='themeFolderNode'></div></td></tr>" +
	"<tr><td>Widget Folder:</td><td><div dojoAttachPoint='widgetFolderNode'></div></td></tr>" +
	"</tbody></table></div>",

	
	postMixInProperties: function(){
		this._loc = dojo.i18n.getLocalization("davinci.ve", "common");
	},	

	postCreate: function(){
		this._webContentNode = new dijit.form.TextBox({}, this.webContentNode);
		this._themeFolderNode = new dijit.form.TextBox({}, this.themeFolderNode);
		this._widgetFolderNode = new dijit.form.TextBox({}, this.widgetFolderNode);
		
		
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},

	setPreferences: function(preferences){
		
		preferences = (preferences || {});
		this._webContentNode.set( 'value', preferences['webContentFolder']);
		this._themeFolderNode.set( 'value', preferences['themeFolder']);
		this._widgetFolderNode.set( 'value', preferences['widgetFolder']);
		
	},

	getPreferences: function(){
		
		var themeFolderNode = this._themeFolderNode;
		var webContentNode = this._webContentNode;
		var widgetFoldertNode = this._widgetFoldertNode;
		
		var preferences = {
			'themeFolder': dojo.attr(themeFolderNode, 'value'),
			'webContentFolder': dojo.attr(webContentNode, 'value'),
			'widgetFolder': dojo.attr(widgetFolderNode, 'value'),
		};
		return preferences;
	},

});
