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

		oldParent.removeChild(  widget);
		newParent.addChild(widget, this._newIndex);
		var context = newParent.getContext();
		if(context){
		    var helper = widget.getHelper();
		    if (helper && helper.reparent){
		        helper.reparent(widget);
		    }
			widget.startup();
			widget.renderWidget();
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

		newParent.removeChild( widget);
		oldParent.addChild( widget, this._oldIndex);
		var context = oldParent.getContext();
		if(context){
		    var helper = widget.getHelper();
            if (helper && helper.reparent){
                helper.reparent(widget);
            }
			widget.startup();
			widget.renderWidget();
		}
		
		// Recompute styling properties in case we aren't in Normal state
		States.resetState(widget.domNode);
	}

});
});