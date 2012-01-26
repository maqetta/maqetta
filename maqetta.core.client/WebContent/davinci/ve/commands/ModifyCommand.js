define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/utils/ImageUtils",
    	"davinci/ve/States"
], function(declare, Widget,  ImageUtils, States){


return declare("davinci.ve.commands.ModifyCommand", null, {
	name: "modify",

	// XXX Most often only called with first 2 params. SmartInput.js passes in
	//     'context'. DataStoresView.js passes in 'children' and 'context'.
	//     No one passes in 'scripts'.
	constructor: function(widget, properties, children, context, scripts){

		this._oldId = (widget ? widget.id : undefined);
		this._properties = properties = (properties || {});
		this._children = children || properties._children;
		this._context = context || widget.getContext();;
		this._scripts = scripts;
		delete this._properties._children;
		
	},

	setContext : function(context){
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
		
		if(!this._oldId || !this._properties){
			return;
		}
		
		var widget = Widget.byId(this._oldId);
		if(!widget){
			return;
		}

		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
		this._oldData = widget.getData();
		this._oldData.context = this._context;
		
		this._newData = {
			type: this._oldData.type,
			properties: dojo.mixin({}, this._oldData.properties, this._properties),
			children: this._children || this._oldData.children,
			scripts: dojo.mixin({}, this._oldData.scripts, this._scripts),
			states: this._oldData.states,
			context: this._context
		};
		
		// Some properties (such as Dojox Mobile's 'fixed' property) require that
		// we reload the Visual Editor iframe when they are changed, so that the
		// widgets can properly take the new value in to account. Here, we short-
		// circuit the ModifyCommand to update the model with the property changes
		// and then reload the content of the VE.
		if (this._doRefreshFromSource(widget)) {
			// update model
			widget.setProperties(this._newData.properties, true);

			// set new content in Visual Editor
			var ve = this._context.visualEditor;
			ve.setContent(ve.fileName, this._context.model);
			return;
		}

		if(this._context){
			this._context.detach(widget);
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
			ImageUtils.ImageUpdateFocus(newWidget, this._context);
		}

		parentWidget.addChild(newWidget,index);
			
		
		this._newId = newWidget.id;

		//davinci.ve.widget.addChild(parent, widget, index);
		if(this._context){
			this._context.attach(newWidget);
			newWidget.startup();
			newWidget.renderWidget();
		}
		this.newWidget=newWidget;
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(newWidget);
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
		var index = dojo.indexOf(parent.getChildren(), widget);
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
		}
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(newWidget);
	}

});
});
