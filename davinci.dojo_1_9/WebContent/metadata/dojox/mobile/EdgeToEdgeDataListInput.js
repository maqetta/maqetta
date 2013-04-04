define([
	"dojo/_base/declare",
	"dojo/string",
	"dijit/registry",
	"davinci/ve/commands/ModifyCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/ve/commands/ModifyAttributeCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/widget",
	"dojo/data/ItemFileReadStore",
	"../../dojo/data/DataStoreBasedWidgetInput",
	"dojo/i18n!../nls/dojox"
], function(
	declare,
	String,
	Registry,
	ModifyCommand,
	OrderedCompoundCommand,
	ModifyAttributeCommand,
	AddCommand,
	RemoveCommand,
	Widget,
	ItemFileReadStore,
	DataStoreBasedWidgetInput,
	dojoxNls
) {

return declare(DataStoreBasedWidgetInput, {

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",

	supportsHTML: "false", 
	
	helpText: "",
	
	constructor : function() {
		var helpInfo = "<i>" + dojoxNls.edgeToEdgeFormat + "</i>";
		this.helpText = String.substitute(dojoxNls.edgeToEdgeDataListHelp, [helpInfo]);
	},

	buildData: function() {
		var textArea = dijit.byId("davinciIleb"),
				value = textArea.attr('value'),
				nodes = value,
				rows = value.split('\n'),
			data = {items:[]}, //Do not include identifier: 'label' with EdgeToEdgeDataList
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
			var cols = rows[r].split(',');
			var item = {};
			item.label = cols[0];
			if (cols[1]){
				item.moveTo = cols[1].trim();
			} else {
				item.moveTo = 'dummy';
			}

			items.push(item);
		}

		return data;
	}
});

});