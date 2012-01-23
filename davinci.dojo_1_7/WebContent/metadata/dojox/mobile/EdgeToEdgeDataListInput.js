define([
	"dojo/_base/declare",
	"dojo/string",
	"dijit/registry",
	"../../dojo/data/DataStoreBasedWidgetInput",
	"dojo/i18n!../nls/dojox"
], function(
	declare,
	String,
	Registry,
	DataStoreBasedWidgetInput,
	dojoxNls
) {

return declare("davinci.libraries.dojo.dojox.mobile.EdgeToEdgeDataListInput", DataStoreBasedWidgetInput, {

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",

	supportsHTML: "false", 
	
	helpText:  "",
	
	constructor : function() {
		var helpInfo = "<i>" + dojoxNls.edgeToEdgeFormat + "</i>";
		this.helpText = String.substitute(dojoxNls.edgeToEdgeDataListHelp, [helpInfo]);
	},

    updateStore: function() {
		var textArea = Registry.byId("davinciIleb"),
			value = textArea.attr('value'),
			rows = value.split('\n'),
			data = { identifier: 'label', items:[] },
			items = data.items;

		for (var r = 0; r < rows.length; r++) { 
			var cols = rows[r].split(',');
			var item = {};
			item.label = cols[0];
			if (cols[1]){
				item.moveTo = cols[1].trim(); // strip leading trailing white space
			}
			items.push(item);
		}
		
		return this.replaceStoreData(data);
	}

});

});