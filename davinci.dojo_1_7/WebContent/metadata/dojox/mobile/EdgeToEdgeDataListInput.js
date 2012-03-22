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
	
	helpText:  "",
	
	constructor : function() {
		var helpInfo = "<i>" + dojoxNls.edgeToEdgeFormat + "</i>";
		this.helpText = String.substitute(dojoxNls.edgeToEdgeDataListHelp, [helpInfo]);
	},

  updateStore: function() {
		var textArea = dijit.byId("davinciIleb"),
    		value = textArea.attr('value'),
    		nodes = value,
    		rows = value.split('\n'),
			data = { identifier: 'label', items:[]},
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
			var cols = rows[r].split(',');
			var item = {};
			item.label = cols[0];
			if (cols[1]){
				item.moveTo = cols[1];
			} else {
				item.moveTo = 'dummy';
			}

			items.push(item);
		}

		return this.replaceStoreData(data);
	},

  buildData: function() {
		var textArea = dijit.byId("davinciIleb"),
    		value = textArea.attr('value'),
    		nodes = value,
    		rows = value.split('\n'),
			data = { identifier: 'label', items:[]},
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
			var cols = rows[r].split(',');
			var item = {};
			item.label = cols[0];
			if (cols[1]){
				item.moveTo = cols[1];
			} else {
				item.moveTo = 'dummy';
			}

			items.push(item);
		}

		return data;
	},

  updateWidget: function() {
    var context = this._getContext();
    var widget = this._widget;

    var storeId = widget.domNode._dvWidget._srcElement.getAttribute("store");
    var storeWidget = Widget.byId(storeId);

    var compoundCommand = new OrderedCompoundCommand();

    var newStore;
    var newStoreId = "";
    
    if (storeWidget.type != "dojo.data.ItemFileReadStore") {
      // remove the old store (csv)
      var removeCmd = new RemoveCommand(storeWidget);
      compoundCommand.add(removeCmd);
    
      // id for the new store
      var newStoreId = Widget.getUniqueObjectId("dojo.data.ItemFileReadStore", context.getDocument());

      // create the item store
      newStore = new ItemFileReadStore({items: []});
      // hack: pass id around for now, as we are passing an object but string may be expected
      newStore.id = newStoreId;
    
      var data = {
        "type": "dojo.data.ItemFileReadStore",
        "properties": {
          id: newStoreId,
          jsId: newStoreId,
          url: ''
        },
        context: context,
      }

      // add the new store
      var addCmd = new AddCommand(data, widget.getParent(), 0);
      compoundCommand.add(addCmd);
    } else {
      var storeCmd = this.replaceStoreData(this.buildData());
      compoundCommand.add(storeCmd);
    }

    var props = null;

    if (storeWidget.type != "dojo.data.ItemFileReadStore") {
      props = {};
      props.store = newStore;
    }

    var command = new ModifyCommand(widget,
      props,
      null,
      context
    );

    compoundCommand.add(command);

    if (storeWidget.type != "dojo.data.ItemFileReadStore") {
      var mcmd = new ModifyAttributeCommand(widget, {store: newStoreId});
      compoundCommand.add(mcmd);
    }

    context.getCommandStack().execute(compoundCommand);  
    context.select(command.newWidget);
  }
});

});