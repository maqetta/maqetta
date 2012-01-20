define([
    "dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"davinci/ui/Panel"
], function(declare, ContentPane, TemplatedMixin, Panel) {

//NOTE: This module is used only by davinc/js/ui/FormatOptions?  Consider folding this code into FormatOptions?

return declare("davinci.workbench.PanelPreferencePane", [ContentPane, TemplatedMixin], {
	templateString: "<div><div dojoAttachPoint='dynamicPanels' id=\"dynamicPanels\"></div></div>" ,

	postCreate: function(){
		this.inherited(arguments);
	    var panel = this.getPanel();
	    var data = {};

		this.panel = new Panel({definition: panel, data: data, immediateSave: true}, this.dynamicPanels);

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
	
	getPanel: function() {
	},

	getPreferences: function(){
		this.panel.saveData();
		return this.panel.data;
	},

	setPreferences: function(preferences){
		if (preferences) {
			this.panel.setData(preferences);
		}
	}
});

});
