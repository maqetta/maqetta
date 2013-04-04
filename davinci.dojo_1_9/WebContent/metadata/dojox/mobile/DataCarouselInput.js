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

	refreshStoreView: function(){
		var textArea = Registry.byId("davinciIleb"),
			value ='';
		this._widget.dijitWidget.store.fetch({
			query: this.query, // XXX No `query` func on this obj
			queryOptions:{deep:true}, 
			onComplete: function(items) {
				items.forEach(function(item){	                    
					value += item.value + ", ";
					value += item.headerText + ", ";
					value += item.src;
					value += '\n';
				});
				this._data = value;
				textArea.attr('value', value);
			}.bind(this)
		});
	},

	buildData: function() {
		var textArea = dijit.byId("davinciIleb"),
				value = textArea.attr('value'),
				nodes = value,
				rows = value.split('\n'),
			data = { identifier: 'value', items:[]},
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
			var cols = rows[r].split(',');
			var item = {};
			item.value = cols[0];
			if (cols[1]){
				item.headerText = cols[1];
			}
			if (cols[2]){
				item.src = cols[2];
			}

			items.push(item);
		}

		return data;
	}
});

});