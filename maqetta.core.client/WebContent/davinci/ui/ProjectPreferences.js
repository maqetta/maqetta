define([
	"dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"dijit/form/TextBox",
	"dojo/i18n!davinci/ve/nls/common"
], function(declare, ContentPane, TemplatedMixin, TextBox, commonNls) {


/*
 * 
 * FIXME: Big to-do to finish this.  Just copied the HTML editors for now.
 * 
 * 
 */

return declare("davinci.ui.ProjectPreferences", [ContentPane, TemplatedMixin], {

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
	"<tr><td>Web Content:</td><td><div dojoAttachPoint='webContentNode'></div></td></tr>" +
	"<tr><td>Templates Folder:</td><td><div dojoAttachPoint='templatesFolderNode'></div></td></tr>" +
	"<tr><td>Theme Folder:</td><td><div dojoAttachPoint='themeFolderNode'></div></td></tr>" +
	"<tr><td>Widget Folder:</td><td><div dojoAttachPoint='widgetFolderNode'></div></td></tr>" +
	"</tbody></table></div>",

	
	postMixInProperties: function(){
		this._loc = commonNls;
	},	

	postCreate: function(){
		this._webContentNode = new TextBox({}, this.webContentNode);
		this._templatesFolderNode = new TextBox({}, this.templatesFolderNode);
		this._themeFolderNode = new TextBox({}, this.themeFolderNode);
		this._widgetFolderNode = new TextBox({}, this.widgetFolderNode);
		
		
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},

	getDefaults: function () {
	},
	
	setDefaults: function () {
	},
	
	doApply: function () {
	},
	
	setPreferences: function(preferences){
		
		preferences = preferences || {};
		this._webContentNode.set('value', preferences['webContentFolder']);
		this._themeFolderNode.set('value', preferences['themeFolder']);
		this._templatesFolderNode.set('value', preferences['templatesFolder']);
		this._widgetFolderNode.set('value', preferences['widgetFolder']);
	},

	getPreferences: function(){
		
		var themeFolderNode = this._themeFolderNode;
		var templatesFolderNode = this._templatesFolderNode;
		var webContentNode = this._webContentNode;
		var widgetFolderNode = this._widgetFoldertNode;
		
		var preferences = {
			themeFolder: dojo.attr(themeFolderNode, 'value'),
			templatesFolder: dojo.attr(templatesFolderNode, 'value'),
			webContentFolder: dojo.attr(webContentNode, 'value'),
			widgetFolder: dojo.attr(widgetFolderNode, 'value')
		};
		return preferences;
	}
});
});
