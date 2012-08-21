define([
	"dojo/_base/declare",
	"davinci/ve/widget",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/commands/ReparentCommand",
	"davinci/commands/CompoundCommand"
], function(
	declare,
	Widget,
	RemoveCommand,
	ReparentCommand,
	CompoundCommand
) {

return declare(null, {
	create: function(widget, srcElement) {
		this.updateDataListWidget(widget);
		widget.domNode.style.display = '';

		// move the datasource
		this.reparent(widget);
	},

	updateDataListWidget: function(widget) {
		var storeId;
		var value;
		
		var dojoProps = this._getProps(widget);
		var values = this.getStoreValues(dojoProps);

		if (widget._edit_context) {
			var ldijit = widget._edit_context.getDijit();
      var storeWidget = ldijit.byId(values.storeId);
      if (storeWidget) { // only replace the store if we find a new one.
      	widget.dijitWidget.store = storeWidget;
      }
    }
		
		widget.domNode.value = values.value;
	},

	_getProps: function(widget) {
		var dojoProps;

		if (widget._params['data-dojo-props']){
			dojoProps = widget._params['data-dojo-props'].split(',');
		} else if(widget._params.properties['data-dojo-props']){
			dojoProps = widget._params.properties['data-dojo-props'].split(',');
		} else {
			throw('ComboBoxHelper: Error missing data-dojo-props');
		}

		return dojoProps;
	},

	getStoreValues: function(dojoProps){
		var values = {};
		//"value:"Item 1", list:"DataList_1""
		var re = new RegExp('"', "g");
		for (var i = 0; i < dojoProps.length; i++){
			var prop = dojoProps[i].split(':'),
				result = prop[0].trim();
			if(result === 'list'){ 
				values.storeId =  prop[1].replace(re,'');
				values.storeId = values.storeId.trim();
			}else if(result === 'value'){
				values.value = prop[1].replace(re,'');
				values.value = values.value.trim();
			}
		}
		
		return values;
	},
	
	getData: function(widget, options) {
		var data = widget._getData(options);

		if (widget.dijitWidget.params['data-dojo-props']){
			data.properties['data-dojo-props'] = widget.dijitWidget.params['data-dojo-props'];
		} else {
			data.properties['data-dojo-props'] = 'value: "' + widget.dijitWidget.params.value +
					'", list: "' + widget.dijitWidget.params.list + '"';
		}

	    return data;
	},

	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget  Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget) {		
		var command = new CompoundCommand();

		// Remove the main widget first as we need to add it first for undo
		command.add(new RemoveCommand(widget));

		// handle the store
		var dojoProps = this._getProps(widget);
		var values = this.getStoreValues(dojoProps);

		var storeWidget = Widget.byId(values.storeId);
		command.add(new RemoveCommand(storeWidget));

		return command;
	},

	/*
	 * Called by Reparent command when widget is reparented.
	 * @param {davinci.ve._Widget} widget  Widget that is being reparentted
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be reparented also.
	 */
	reparent: function(widget){ 
		// handle the store
		var dojoProps = this._getProps(widget);
		var values = this.getStoreValues(dojoProps);
	
		if (values.storeId) {
			var storeWidget = Widget.byId(values.storeId);

			if (storeWidget) {
				var parent = widget.getParent();
				var newIndex = parent.indexOf(widget);

				var command = new ReparentCommand(storeWidget, parent, newIndex);
				command.execute();
			}
		}
	}
});
});