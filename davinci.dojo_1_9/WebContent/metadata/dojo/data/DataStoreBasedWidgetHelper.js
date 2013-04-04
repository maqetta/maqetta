define([
	"dojo/_base/declare",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/commands/ReparentCommand",
	"./DataStoreBasedWidgetInput"
], function (
	declare,
	Widget,
	CompoundCommand,
	RemoveCommand,
	ReparentCommand,
	DataStoreBasedWidgetInput
) {

return declare(null, {
	_useDataDojoProps: false,

	getData : function(/* Widget */widget, /* Object */options) {
		if (!widget) {
			return undefined;
		}

		// call the old _getData
		var data = widget._getData(options);

		if (widget.dijitWidget.store) {
			// add the data old store if it has one.
			data.properties.store = widget.dijitWidget.store; 
			data.properties.query = widget.dijitWidget.query;
		}
		return data;
	},

	preProcessData : function(data) {
		var store = data.properties.store;
		var storeId = store.id ? store.id : store._edit_object_id;
		if (storeId) {
			var store = data.context.getDojo().getObject(storeId);
			if (store) {
				data.properties.store = store;
			}
		}

		return data;
	},

	/*
	 * Called by DeleteAction when widget is deleted. @param
	 * {davinci.ve._Widget} widget Widget that is being deleted @return
	 * {davinci.commands.CompoundCommand} command that is to be added to the
	 * command stack.
	 * 
	 * This widget has a data store widget that is associated with it and
	 * must be deleted also.
	 */
	getRemoveCommand : function(widget) {
		var command = new CompoundCommand();
		var storeId = DataStoreBasedWidgetInput.getStoreId(widget);
		var storeWidget = Widget.byId(storeId);
		// order is important for undo...
		command.add(new RemoveCommand(widget));
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
		try{
			var storeId = DataStoreBasedWidgetInput.getStoreId(widget);
			var storeWidget = Widget.byId(storeId);
              
			if (storeWidget) {
				dojo.withDoc(widget.getContext().getDocument(), function(){
						this._reparentWidget(widget, storeWidget);
				}.bind(this));
			}
			
		} catch (e) {
			console.error('DataStoreBasedWidgetHelper.Reparent error processing:', e);
		}
	},

	/*
	 * Called  to reparent the widget
	 * @param {davinci.ve._Widget} widget  Widget that is being created
	 * @param {davinci.ve._Widget} widget associated with parm 1 eg. ForestModel or store
	 * @param {} 
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be created before the Tree.
	 */
	_reparentWidget: function(widget, assocatedWidget) {
		var parent = widget.getParent();
		var assocatedParent = assocatedWidget.getParent();
		var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
		var i = parent.indexOf(widget);
		var x = assocatedParent.indexOf(assocatedWidget);
		if ((parent === assocatedParent) && (i < x )){ // same parent
			newIndex = parent.indexOf(widget);
		} else if (parent != assocatedParent) {
			newIndex = i;
		}
		var command = new ReparentCommand(assocatedWidget, parent, newIndex);
		command.execute();
	}, 

	/*
	 * In same cases we are handling certain attributes within data-dojo-props 
	 * or via child HTML elements, and we do not want to allow those attributes 
	 * to be written out into the final HTML. So, here, we clean out those
	 * attributes.
	*/
	cleanSrcElement: function(srcElement) {
		if (this._useDataDojoProps) {
			srcElement.removeAttribute("store");
			srcElement.removeAttribute("structure");
		} else {
			//The actual store object sometimes finds it's way into the source 
			//element, and we really need the id to be written out to the HTML source
			//instead of the string "[Object]"
			var store = srcElement.getAttribute("store");
			if (store && store.id) {
				srcElement.setAttribute("store", store.id);
			}
		}
	}

});

});