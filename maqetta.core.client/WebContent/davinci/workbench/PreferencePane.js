dojo.provide("davinci.workbench.PreferencePane");

dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.Panel")

dojo.declare("davinci.workbench.PreferencePane", [dijit.layout.ContentPane, dijit._Templated], {
	
	setDefaults : function ()
	{
	},
	
	doApply : function ()
	{
	},
	
	setPreferences: function(preferences){
	},
	
	getPreferences: function(){
	}
});

davinci.workbench.PreferencePane.getDefaults = function (){};

dojo.declare("davinci.workbench.PanelPreferencePane", davinci.workbench.PreferencePane, {
	templateString: "<div><div dojoAttachPoint='dynamicPanels' id=\"dynamicPanels\"></div></div>" ,

	postCreate: function(){
		this.inherited(arguments);
	    var panel=this.getPanel();
	    var data={};

		this.panel = new davinci.ui.Panel({definition:panel, data:data, immediateSave:true},this.dynamicPanels);

		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},


	setDefaults : function ()
	{
	},
	
	doApply : function ()
	{
	},
	
	getPanel : function()
	{
	},
	setPreferences: function(preferences){
		if (preferences)
			this.panel.setData(preferences);
	},

	getPreferences: function(){
		this.panel.saveData();
		return this.panel.data;
	}
});

