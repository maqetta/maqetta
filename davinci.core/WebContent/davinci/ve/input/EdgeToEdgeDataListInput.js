dojo.provide("davinci.ve.input.EdgeToEdgeDataListInput");
dojo.require("davinci.ve.input.DataStoreBasedWidgetInput");
//dojo.require("davinci.ve.commands.ModifyFileItemStoreCommand");
dojo.require("davinci.commands.OrderedCompoundCommand");
dojo.require("dojox.grid.cells");
dojo.require("dojox.form.DropDownSelect");

dojo.declare("davinci.ve.input.EdgeToEdgeDataListInput", davinci.ve.input.DataStoreBasedWidgetInput, {

	
	childType: null,

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "false", 

	helpText:  'If the CSV data format is selected enter text in the format: <i>list label, transition_view_name</i> the transition view name is optional'+
    		   ' If data file from workspace is selected chose a json item file using the file explore folder.',


    updateStore: function() {
 
		textArea = dijit.byId("davinciIleb"),
		value = textArea.attr('value'),
		nodes = value,
		rows = value.split('\n'),
		cols = rows[0].split(',');

		var data = { identifier: 'label', items:[]},
			rows = value.split('\n'),
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
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