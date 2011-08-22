dojo.provide("davinci.ve.commands.RemoveCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.RemoveCommand", null, {

	name: "remove",

	constructor: function(widget){
		this._id = (widget ? widget.id : undefined);
	},

	execute: function(){
		if(!this._id){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		var context = widget.getContext(),
			parent = widget.getParent() || context.getContainerNode();

		if(!this._data){
			this._index = dojo.indexOf(parent.getChildren(), widget);
			if(this._index < 0){
				return;
			}
			this._data = widget.getData();
			this._parentId = parent.id;
		}
		this._data.context=context;

		if(context){
			context.detach(widget);
		}
		parent.removeChild( widget);
		widget.destroyWidget();
		//FIXME: Probably better to publish a specific reparent event
		//and have things that need to update the list respond to
		//that event and then maybe they update the states list
		dojo.publish("/davinci/states/list/changed", null);
	},

	undo: function(){
		if(!this._data || !this._parentId){
			return;
		}
		var parent = davinci.ve.widget.byId(this._parentId);
		if(!parent){
			return;
		}
		var widget = davinci.ve.widget.createWidget(this._data);
		if(!widget){
			return;
		}

		parent.addChild(  widget, this._index);
		var context = parent.getContext();
		if(context){
			context.attach(widget);
			widget.startup();
			widget.renderWidget();
		}
		//FIXME: Probably better to publish a specific reparent event
		//and have things that need to update the list respond to
		//that event and then maybe they update the states list
		dojo.publish("/davinci/states/list/changed", null);
	}

});
