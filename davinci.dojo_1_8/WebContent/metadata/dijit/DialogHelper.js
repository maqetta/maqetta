define([
	"dojo/_base/connect",
	"davinci/ve/States",
	"davinci/maqetta/space"		//FIXME: Currently include definition of global davinci.popup
], function(connect, States, space) {

var DialogHelper = function() {};
DialogHelper.prototype = {

	create: function(widget) {
		debugger;
		var context = widget && widget.getContext && widget.getContext();
		if(context){
			var id = widget.getId();
			//FIXME: Need to update statename if user changes the ID of the Dialog widget
			widget._stateName = 'Dialog:'+id;
			States.add(context.rootNode, widget._stateName);
			widget._stateChangeHandle = connect.subscribe("/maqetta/appstates/state/changed", null, function(params) {
				debugger;
				var stateChangeContext = params.stateContainerNode._dvWidget.getContext();
				var oldState = params.oldState;
				var newState = params.newState;
				//FIXME: Shouldn't hardcode "Dialog:"
				if(context == stateChangeContext){
					var id, dialogNode;
					if(oldState && oldState.indexOf('Dialog:') == 0){
						id = oldState.substr(7);
						dialogNode = context.rootNode.ownerDocument.getElementById(id);
						context.deselect(dialogNode._dvWidget);
						//FIXME: Sometimes redundant with deselect
						States.setState(undefined, context.rootNode);
					}
					if(newState && newState.indexOf('Dialog:') == 0){
						id = newState.substr(7);
						dialogNode = context.rootNode.ownerDocument.getElementById(id);
						context.select(dialogNode._dvWidget);
					}
				}
			});
		}

		/*
		var originalContext = widget && widget.getContext();
		widget._helperHandle = connect.subscribe("/davinci/ui/widgetSelected", null, function(selected) {
			var w = selected.length === 1 && selected[0];
			var context = w.getContext && w.getContext();
			if(w && w.dijitWidget){
				var editor = context && context.editor;
				if(context === originalContext &&
						editor.declaredClass === "davinci.ve.PageEditor" && 
						editor === Runtime.currentEditor){
					davinci.popup.show(w.dijitWidget.id);
				}
			}
			// REMOVE ALL BELOW?
			if (!w || w.getContext() != context) { return; }
			while (w && w.id != id) {
				if (w._ownerId) {
					w = context.getDijit().registry.byId(w._ownerId);
				} else {
					w = w.getParent && w.getParent();
				}
			}
			
			var dialog = context.getDijit().registry.byId(id);
			if (w) {
				dialog.show();
			} else {
				dialog.hide();
			}
			// REMOVE ALL ABOVE?
		});	
		*/	
	},

	/*
	destroy: function(widget) {
		connect.unsubscribe(widget._helperHandle);
		delete widget._helperHandle;
		widget.dijitWidget.destroyRecursive();
	},
*/
	onLoad: function(widget,already) {},

	/**
	 * Called by RemoveCommand before removal actions take place.
	 * Allows helper logic to get invoked after a widget has been removed.
	 * @param {davinci.ve._Widget} widget  
	 * @return {function}  Optional function to call after removal actions take place
	 */
	onRemove: function(widget) {
		debugger;
		var context = widget && widget.getContext && widget.getContext();
		if(context){
			States.remove(context.rootNode, widget._stateName);
			connect.unsubscribe(widget._stateChangeHandle);
			delete widget._stateChangeHandle;
		}
	},
		
	/**
	 * Called by Context.js when a widget becomes selected.
	 * @param  {davinci/ve/_Widget} widget
	 */
	onSelect: function(widget) {
		debugger;
		var context = widget.getContext();
		//FIXME: Need to listen to state name changes
		States.setState(widget._stateName, context.rootNode);
		widget.dijitWidget.show();
		//FIXME: Logic below doesn't work. Guess is that it's the wrong doc/registry
		//davinci.popup.show(widget.dijitWidget.id);
	},
	
	/**
	 * Called by Context.js when a widget becomes selected.
	 * @param  {davinci/ve/_Widget} widget
	 */
	onDeselect: function(widget) {
		debugger;
		//FIXME: Restore previous state? Hide the widget?
		//FIXME: Need to listen to state name changes
		var context = widget.getContext();
		States.setState(undefined, context.rootNode);
		widget.dijitWidget.hide();
	} //,

	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 */
/*
	onToggleVisibility: function(widget, on) {
		debugger;
		return false;
	}
*/

};

return DialogHelper;

});
