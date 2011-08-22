dojo.provide("davinci.ve.commands.ReparentCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.ReparentCommand", null, {

	name: "reparent",

	constructor: function(widget, parent, index){
		this._id = (widget ? widget.id : undefined);
		//FIXME: Code shouldn't depend on BODY having id="myapp". Why not just look for BODY tag?
		this._newParentId = (parent ? parent.id : "myapp");
		this._newIndex = index;
	},

	execute: function(){
		if(!this._id || !this._newParentId){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		var oldParent = widget.getParent();
		if(!oldParent){ oldParent = dojo.byId("myapp"); }
		var newParent = davinci.ve.widget.byId(this._newParentId);
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
			widget.startup();
			widget.renderWidget();
		}
		//FIXME: Probably better to publish a specific reparent event
		//and have things that need to update the list respond to
		//that event and then maybe they update the states list
		dojo.publish("/davinci/states/list/changed", null);
	},

	undo: function(){
		if(!this._id || !this._oldParentId || !this._newParentId){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		var oldParent = davinci.ve.widget.byId(this._oldParentId);
		if(!oldParent){
			return;
		}
		var newParent = davinci.ve.widget.byId(this._newParentId);
		if(!newParent){
			return;
		}

		newParent.removeChild( widget);
		oldParent.addChild( widget, this._oldIndex);
		var context = oldParent.getContext();
		if(context){
			widget.startup();
			widget.renderWidget();
		}
		//FIXME: Probably better to publish a specific reparent event
		//and have things that need to update the list respond to
		//that event and then maybe they update the states list
		dojo.publish("/davinci/states/list/changed", null);
	}

});
