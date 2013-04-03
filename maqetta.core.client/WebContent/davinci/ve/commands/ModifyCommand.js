define([
    	"dojo/_base/declare",
    	"davinci/ve/commands/_hierarchyCommand",
    	"../widget",
    	"../utils/ImageUtils",
    	"../States"
], function(declare, _hierarchyCommand, Widget, ImageUtils, States){

return declare("davinci.ve.commands.ModifyCommand", [_hierarchyCommand], {
	name: "modify",

	// XXX Most often only called with first 2 params. SmartInput.js passes in
	//     'context'. DataStoresView.js passes in 'children' and 'context'.
	//     No one passes in 'scripts'.
	constructor: function(widget, properties, children, context, scripts){
		this._oldId = (widget ? widget.id : undefined);
		this._properties = properties = (properties || {});
		this._children = (children || typeof children == 'string') ? children : properties._children;
		this._context = context || widget.getContext();
		this._scripts = scripts;
		delete this._properties._children;
	},

	setContext: function(context){
		this._context = context;
	},

	add: function(command){
		
		if(!command || command._oldId != this._oldId){
			return;
		}

		if(command._properties){
			dojo.mixin(this._properties, command._properties);
		}
		if(command._children){
			this._children = command._children; // only one command can provide children
		}
	},

	execute: function(){
		
		if (!this._oldId || !this._properties) {
			return;
		}
		
		var widget = Widget.byId(this._oldId),
			context = this._context;
		if (!widget) {
			return;
		}

		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
		this._oldData = widget.getData();
		this._oldData.context = context;
		
		this._newData = {
			type: this._oldData.type,
			properties: dojo.mixin({}, this._oldData.properties, this._properties),
			children: (this._children || typeof this._children == 'string') ? this._children : this._oldData.children,
			scripts: dojo.mixin({}, this._oldData.scripts, this._scripts),
			maqAppStates: this._oldData.maqAppStates,
			maqDeltas: this._oldData.maqDeltas,
			context: context
		};
		for(var prop in this._newData.properties){
			var value = this._newData.properties[prop];
			//FIXME: We don't have a good way now to distinguish between setting a property
			// to empty string versus deleting this property. I invented this special flag
			// to address the requirements of #3425 just before 7.0.1 release.
			// Better to add an additional "propertiesToDelete" argument to ModifyCommand.
			if(value === '$MAQ_MODIFYCOMMAND_DELETE_PROPERTY$'){
				delete this._newData.properties[prop];
			}
		}
		
		// Some properties (such as Dojox Mobile's 'fixed' property) require that
		// we reload the Visual Editor iframe when they are changed, so that the
		// widgets can properly take the new value in to account. Here, we short-
		// circuit the ModifyCommand to update the model with the property changes
		// and then reload the content of the VE.
		if (this._doRefreshFromSource(widget)) {
			// update model
			widget.setProperties(this._newData.properties, true);
			// refresh VE iframe
			// XXX ModifyCommand is called from CommandStack from within a
			//    `dojo.withDoc`, which means that Dojo calls are working within
			//    the context of the VE iframe. This causes issues when calling
			//    refresh(), which expects to run within the app context. For
			//    now, using a setTimeout, which will allow the stack to unroll
			//    and finish the `withDoc` (restoring the document used by dojo).
			//    See issue #1821 for more details.
			setTimeout(function() {
				context.visualEditor.refresh();
			}, 0);
			return;
		}

		if (context) {
			context.detach(widget);
		}	
		
		if(!this._oldData.properties.isTempID || this._properties.id){ // most likely are  permanent id
			delete this._newData.properties.isTempID;
		}

		var parentWidget = widget.getParent();
		var newWidget = null;
		/* make sure the parent widget supports our re-childrening commands */

		var index = parentWidget.indexOf(widget);
		parentWidget.removeChild(widget);
		widget.destroyWidget(); 
		newWidget = Widget.createWidget(this._newData);
		
		if(!newWidget){
			return;
		}

		// IMG elements don't have a size until they are actually loaded
		// so selection/focus box will be wrong upon creation.
		// To fix, register an onload handler which calls updateFocus()
		if(newWidget.domNode.tagName === 'IMG'){
			ImageUtils.ImageUpdateFocus(newWidget, context);
		}

		parentWidget.addChild(newWidget,index);
			
		
		this._newId = newWidget.id;

		//davinci.ve.widget.addChild(parent, widget, index);
		if (context) {
			context.attach(newWidget);
			newWidget.startup();
			newWidget.renderWidget();
			context.widgetAddedOrDeleted();

			if (this._oldId != this._newId) {
				context.widgetChanged(context.WIDGET_ID_CHANGED, newWidget, this._oldId);
			}

			context.widgetChanged(context.WIDGET_MODIFIED, newWidget);
		}
		this.newWidget=newWidget;
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(newWidget.domNode);
		
		// Some properties (such as HorizontalSliderRule's 'container' property) require that
		// we redraw the parent widget (e.g., HorizontalSlider) so that it can properly take 
		// the new value in to account. Here, we execute a ModifyCommand (with no actual
		// modifications) to cause the parent to refresh itself.
		var ancestor;
				
		var refreshParent = this._isRefreshParentOnPropChange(newWidget);
		if (refreshParent) {
			// Note we're executing the ModifyCommand directly as opposed to adding to it to the 
			// command stack since we're not really changing anything on the parent and don't
			// need to allow user to undo it.
			if(typeof refreshParent == 'string'){
				// If refreshParentOnPropChange is a string, then it represents a widget type name
				// Search through ancestors until finding that type
				ancestor = parentWidget;
				while(ancestor && ancestor.domNode && ancestor.type != refreshParent && ancestor.domNode.tagName != "BODY"){
					if(!ancestor.domNode || ancestor.domNode.tagName == "BODY"){
						ancestor = null;
						break;
					}
					ancestor = ancestor.getParent();
				}
			}else{
				ancestor = parentWidget;
			}
		}
		
		// refreshAncestorDownwards is based on the "refreshOnDescendantChange" metadata property
		// where the ancestor widget says "if any descendants are changed, the refresh me"
		var refreshAncestorDownwards = this._isRefreshOnDescendantChange(newWidget);
		if (refreshAncestorDownwards) {
			// if not undefined, refreshAncestorDownwards will hold the ancestor widget that needs to be refreshed
			ancestor = refreshAncestorDownwards;
		}
		
		// Note we're executing the ModifyCommand directly as opposed to adding to it to the 
		// command stack since we're not really changing anything on the parent and don't
		// need to allow user to undo it.
		if(ancestor){
			var command =
				new davinci.ve.commands.ModifyCommand(ancestor,
						null, null, parentWidget._edit_context);
			command.execute();
		}
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged", [[newWidget]]);
	},

	/**
	 * Check if any of the modified properties has 'refreshFromSource' set.
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * 				The widget instance whose properties are being modified.
	 * @return {boolean} 'true'
	 * 				if one of the modified properties has the 'refreshFromSource'
	 * 				attribute set.
	 */
	_doRefreshFromSource: function(widget) {
		var props = this._properties,
			name,
			p,
			refresh = false;
		for (name in props) {
			if (props.hasOwnProperty(name)) {
				p = widget.metadata.property[name];
				if (p && p.refreshFromSource) {
					refresh = true;
					break;
				}
			}
		}
		return refresh;
	},
	
	/**
	 * Check if an ancestor widget needs to be refreshed after a property 
	 * has changed based on "refreshParentOnPropChange" property in widgets.json file.
	 * 
	 * @param  {davinci.ve._Widget} widget
	 * 				The widget instance whose properties are being modified.
	 * @return {String|boolean} 
	 * 				if widget has the 'refreshParentOnPropChange' attribute set
	 * 				in its metadata, returns that value
	 */
	_isRefreshParentOnPropChange: function(widget) {
		return davinci.ve.metadata.queryDescriptor(widget.type, "refreshParentOnPropChange");
	},
	
	undo: function(){

		if(!this._newId || !this._oldData){
			return;
		}
		var widget = Widget.byId(this._newId);
		if(!widget){
			return;
		}
		var parent = widget.getParent();
		if(!parent){
			return;
		}
		var index = parent.indexOf(widget);//dojo.indexOf(parent.getChildren(), widget);
		if(index < 0){
			return;
		}

		// remove new
		var context = parent.getContext();
		if(context){
			context.detach(widget);
		}
		parent.removeChild( widget);
		widget.destroyWidget(); 

		// add old
		newWidget = Widget.createWidget(this._oldData);
		if(!newWidget){
			return;
		}
		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
		this._oldData = newWidget.getData();
		this._oldData.context = this._context;

		parent.addChild(newWidget, index);
		if(context){
			context.attach(newWidget);
			newWidget.startup();
			newWidget.renderWidget();
			context.widgetAddedOrDeleted();
			context.widgetChanged(context.WIDGET_MODIFIED, newWidget);
		}
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(newWidget.domNode);
	
		// Some properties (such as HorizontalSliderRule's 'container' property) require that
		// we redraw the parent widget (e.g., HorizontalSlider) so that it can properly take 
		// the new value in to account. Here, we execute a ModifyCommand (with no actual
		// modifications) to cause the parent to refresh itself.
		var ancestor;
		
		// refreshAncestorUpwards is based on the "refreshParentOnPropChange" metadata property
		// where the child widget says "if I am changed, the refresh my parent (or ancestor)"
		var refreshAncestorUpwards = this._isRefreshParentOnPropChange(widget);
		if (refreshAncestorUpwards) {
			if(typeof refreshParent == 'string'){
				// If refreshParentOnPropChange is a string, then it represents a widget type name
				// Search through ancestors until finding that type
				ancestor = parent;
				while(ancestor && ancestor.domNode && ancestor.type != refreshParent && ancestor.domNode.tagName != "BODY"){
					if(!ancestor.domNode || ancestor.domNode.tagName == "BODY"){
						ancestor = null;
						break;
					}
					ancestor = ancestor.getParent();
				}
			}else{
				ancestor = parent;
			}
		}
		
		// refreshAncestorDownwards is based on the "refreshOnDescendantChange" metadata property
		// where the ancestor widget says "if any descendants are changed, the refresh me"
		var refreshAncestorDownwards = this._isRefreshOnDescendantChange(newWidget);
		if (refreshAncestorDownwards) {
			// if not undefined, refreshAncestorDownwards will hold the ancestor widget that needs to be refreshed
			ancestor = refreshAncestorDownwards;
		}
		
		// Note we're executing the ModifyCommand directly as opposed to adding to it to the 
		// command stack since we're not really changing anything on the parent and don't
		// need to allow user to undo it.
		if(ancestor){
			var command =
				new davinci.ve.commands.ModifyCommand(ancestor,
						null, null, parent._edit_context);
			command.execute();
		}
		
		dojo.publish("/davinci/ui/widgetPropertiesChanged", [[newWidget]]);
	}

});
});
