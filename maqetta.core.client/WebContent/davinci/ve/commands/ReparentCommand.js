define([
    "dojo/_base/declare",
	"davinci/ve/commands/_hierarchyCommand",
    "../widget",
    "../States",
	"davinci/ve/commands/ModifyCommand"
], function(declare, _hierarchyCommand, Widget, States, ModifyCommand) {

return declare("davinci.ve.commands.ReparentCommand", [_hierarchyCommand], {
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
		
		// Some situations require that we recreate an ancestor widget (e.g., RoundRectList) so that we
		// will invoke the widget library creation logic to re-initialize everything properly
		var oldAncestor = this._isRefreshOnDescendantChange(widget);

		if(!this._oldParentId){
			this._oldParentId = oldParent.id;
			this._oldIndex = dojo.indexOf(oldParent.getChildren(), widget);
			if(this._newIndex && this._newIndex.domNode){ // widget
				this._newIndex = newParent.indexOf( this._newIndex);
			}
		}

		oldParent.removeChild(widget);

		var context = newParent.getContext();

		// If moving a widget within same parent, adjust newIndex in case the widget is being moved
		// to a latter point in list of children. If so, the removeChild operation has altered the child list
		// and we substract 1.  This way the index is the correct one in the original child list rather than the
		// index after the widgets have been re-arranged.
		var newIndex = (newParent == oldParent && this._oldIndex < this._newIndex) ? this._newIndex -1 : this._newIndex;
		newParent.addChild(widget, newIndex);

		if(context){
		    var helper = widget.getHelper();
		    if (helper && helper.reparent){
		        helper.reparent(widget);
		    }
			widget.startup();
			widget.renderWidget();

			context.widgetChanged(context.WIDGET_REPARENTED, widget, [oldParent, newParent]);

			// Some situations require that we recreate an ancestor widget (e.g., RoundRectList) so that we
			// will invoke the widget library creation logic to re-initialize everything properly
			var newAncestor = this._isRefreshOnDescendantChange(widget);
			
			// Note we're executing the ModifyCommand directly as opposed to adding to it to the 
			// command stack since we're not really changing anything on the parent and don't
			// need to allow user to undo it.
			if(oldAncestor){
				var command = new ModifyCommand(oldAncestor, null, null, context);
				command.execute();
			}
			if(newAncestor){
				var command = new ModifyCommand(newAncestor, null, null, context);
				command.execute();
			}
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
		
		// Some situations require that we recreate an ancestor widget (e.g., RoundRectList) so that we
		// will invoke the widget library creation logic to re-initialize everything properly
		var newAncestor = this._isRefreshOnDescendantChange(widget);

		var context = oldParent.getContext();

		newParent.removeChild( widget);

		oldParent.addChild( widget, this._oldIndex);
		if(context){
		    var helper = widget.getHelper();
            if (helper && helper.reparent){
                helper.reparent(widget);
            }
			widget.startup();
			widget.renderWidget();

			context.widgetChanged(context.WIDGET_REPARENTED, widget, [oldParent, newParent]);

			// Some situations require that we recreate an ancestor widget (e.g., RoundRectList) so that we
			// will invoke the widget library creation logic to re-initialize everything properly
			var oldAncestor = this._isRefreshOnDescendantChange(widget);
			
			// Note we're executing the ModifyCommand directly as opposed to adding to it to the 
			// command stack since we're not really changing anything on the parent and don't
			// need to allow user to undo it.
			if(newAncestor){
				var command = new ModifyCommand(newAncestor, null, null, context);
				command.execute();
			}
			if(oldAncestor){
				var command = new ModifyCommand(oldAncestor, null, null, context);
				command.execute();
			}
		}
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
	}

});
});