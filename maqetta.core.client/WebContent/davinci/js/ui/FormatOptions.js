define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/js/JSFile",
	"davinci/js/Format",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"davinci/workbench/Preferences",
	"dojo/i18n!../nls/js"
], function(declare, Runtime, Workbench, JSFile, Format, ContentPane, TemplatedMixin, Preferences, jsNls) {
 
return declare("davinci.js.ui.FormatOptions", [ContentPane, TemplatedMixin], {
	templateString: "<div><div dojoAttachPoint='dynamicPanels' id=\"dynamicPanels\"></div></div>",

	// NOTE: The goal of #1638 was to remove all dependencies on davinci/ui/Panel. To achieve that goal here, we 
	// merged the now defunct davinci/workbench/PanelPreferencePane module with FormatOptions. In addition, we commented
	// out any remaining references to Panel.
	//
	// Also, since our JS formatter support is broken and the plan is to leverage Orion for JS formatting at some point, 
	// no attempt was made to re-create the UI in a template. Instead, a generic message has been added to convey
	// that we don't have any JS formatting options.

	postCreate: function(){
		this.inherited(arguments);
		/*
	    var panel = this.getPanel();
	    var data = {};

		this.panel = new Panel({definition: panel, data: data, immediateSave: true}, this.dynamicPanels);

		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
		*/
		
		// NOTE: Since all of this will eventually be going away, not pulling 
		// message string from a resource bundle.
		this.dynamicPanels.innerHTML = "No JavaScript formatting options are currently available.";
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
		/*
		this.panel.saveData();
		return this.panel.data;
		*/
		return null;
	},

	setPreferences: function(preferences){
		/*
		if (preferences) {
			this.panel.setData(preferences);
		}
		*/
	},
	
	getPanel: function() {
		/*
		var panel1 =
			[{
				type:"layout",
				left:[{
					type: "checkBox",
					label: jsNls.newLineForBlocks,
					data: "blockNewLine",
					defaultValue:true
				},
				{
					type: "numberTextBox",
					label: jsNls.blockIndention,
					data: "blockIndent",
					defaultValue:3,
					min:0, max:32
				},
				{
					type: "checkBox",
					label: jsNls.newLineForFuncBodies,
					data: "functionNewLine",
					defaultValue:true
				},
				{
					type: "numberTextBox",
					label: jsNls.functionIndention,
					data: "functionIndent",
					defaultValue:5,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.funcParameterListSpacing,
					data: "functionParamSpaceing",
					defaultValue:1,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.labelSpacing,
					data: "labelSpace",
					defaultValue:1,
					min:0, max:32
				},
				{
					type: "checkBox",
					label: jsNls.newLineAfterLabel,
					data: "breakOnLabel",
					defaultValue:true
				},
				{
					type: "numberTextBox",
					label: jsNls.forStatementSpacing,
					data: "forParamSpacing",
					defaultValue:1,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.ifStatementSpacing,
					data: "ifStmtSpacing",
					defaultValue:1,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.varAssignmentSpacing,
					data: "varAssignmentSpaceing",
					defaultValue:1,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.switchSpacing,
					data: "switchSpacing",
					defaultValue:3,
					min:0, max:32
				},
				{
					type: "numberTextBox",
					label: jsNls.objectLiteralFieldSpacing,
					data: "objectLitFieldSpace",
					defaultValue:1,
					min:0, max:32
				}],
				right: [{
					type: "dynamic",
					createNode: function(fieldData,parentNode, panel) {
						var options = Preferences.getPreferences("davinci.js.format", Workbench.getProject());
						var div = dojo.doc.createElement("div");
						dojo.connect(panel,"onChange", function() {
							panel.saveData();
							updateExample(panel.data);
						});
						function updateExample(options) {
							var exampleJS = "function abc(def,jhk){ var a=1; var obj={a:2,b:'33'}; label: if (true) { return;} for (i;i<2;i++){} switch (a){case 1: a=1; case 2:a=2;}}";
							var jsFile = new JSFile();
							jsFile.setText(exampleJS);
							var formatted_text = Format.format(jsFile, options);
							div.innerHTML="<div border=\"3\"><pre>" + formatted_text + "</pre></div>";
						}
						updateExample(options);
						return div;              
					}
				}]
			}];
		return panel1;
		*/
	}
});
});



