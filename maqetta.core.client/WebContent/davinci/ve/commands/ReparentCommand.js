define([
    "dojo/_base/declare",
    "../widget",
    "../States"
], function(declare, Widget, States) {

return declare("davinci.ve.commands.ReparentCommand", null, {
	name: "reparent",

	constructor: function(widget, parent, index){
		this._id = (widget ? widget.id : undefined);
		this._newParentId = (parent ? parent.id : "myapp");
		this._newIndex = index;
	},

	execute: function(){
		if(!this._id || !this._newParentId){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}
		var oldParent = widget.getParent();
		if(!oldParent){ oldParent = dojo.byId("myapp"); }
		var newParent = Widget.byId(this._newParentId);
		if(!newParent){ newParent = dojo.byId("myapp"); }


		if(!this._oldParentId){
			this._oldParentId = oldParent.id;
			this._oldIndex = dojo.indexOf(oldParent.getChildren(), widget);
			if(this._newIndex && this._newIndex.domNode){ // widget
				this._newIndex = newParent.indexOf( this._newIndex);
			}
		}

		oldParent.removeChild(widget);

		var context = newParent.getContext();

		if (context) {
			context.widgetChanged(context.WIDGET_REMOVED, widget);
		}

		// If moving a widget within same parent, adjust newIndex in case the widget is being moved
		// to a latter point in list of children. If so, the removeChild operation has altered the child list
		var newIndex = (newParent == oldParent && this._oldIndex < this._newIndex) ? this._newIndex -1 : this._newIndex;
		newParent.addChild(widget, newIndex);

		if(context){
		    var helper = widget.getHelper();
		    if (helper && helper.reparent){
		        helper.reparent(widget);
		    }
			widget.startup();
			widget.renderWidget();

			context.widgetChanged(context.WIDGET_ADDED, widget);
			context.widgetChanged(context.WIDGET_REPARENTED, widget);
		}
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
	},

	undo: function(){
		if(!this._id || !this._oldParentId || !this._newParentId){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}
		var oldParent = Widget.byId(this._oldParentId);
		if(!oldParent){
			return;
		}
		var newParent = Widget.byId(this._newParentId);
		if(!newParent){
			return;
		}

		var context = oldParent.getContext();

		newParent.removeChild( widget);

		if (context) {
			context.widgetChanged(context.WIDGET_REMOVED, widget);
		}

		oldParent.addChild( widget, this._oldIndex);
		if(context){
		    var helper = widget.getHelper();
            if (helper && helper.reparent){
                helper.reparent(widget);
            }
			widget.startup();
			widget.renderWidget();

			context.widgetChanged(context.WIDGET_ADDED, widget);
			context.widgetChanged(context.WIDGET_REPARENTED, widget);
		}
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
	}

});
});