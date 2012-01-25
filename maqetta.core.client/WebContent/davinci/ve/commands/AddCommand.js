define([
    	"dojo/_base/declare",
    	"davinci/ve/widget",
    	"davinci/ve/utils/ImageUtils",
    	"davinci/ve/States"
], function(declare, Widget,  ImageUtils, States){


return declare("davinci.ve.commands.AddCommand", null, {

	name: "add",

	constructor: function(widget, parent, index){
		if(widget){
			if(widget.domNode){ // widget
				this._id = widget.id;
			}else{ // data
				this._data = widget;
			}
		}
		this._parentId =  parent.id;
		this._index = index;
	},

	execute: function(){

		var parent = Widget.byId(this._parentId); 
		if(!parent){
			return;
		}
		var context = parent.getContext();
		var widget = undefined;
		if(this._data){
			//this.undo(); // try to remove old widget first, mostly for redo
			if (this._id && this._data.properties)
				this._data.properties.id= this._id;
			widget = Widget.createWidget(this._data);
		}else if(this._id){
			widget = Widget.byId(this._id, context);
		}
		if(!widget){
			return;
		}
		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
		this._data = widget.getData();
		this._data.properties.id= this._id;
		this._data.context = context;
		


		// TODO: this._index is typically a number... when is it passed in as a widget?
		if(this._index && typeof this._index != "number") {
			if (this._index.domNode){ // widget
				this._index = parent.indexOf(  this._index);
			} else {
				// _index is no longer valid since it was replaced, lets find it
				var w = Widget.byId(this._index.id, context);
				this._index = parent.indexOf(w);
			}
		}

		// IMG elements don't have a size until they are actually loaded
		// so selection/focus box will be wrong upon creation.
		// To fix, register an onload handler which calls updateFocus()
		if(widget.domNode.tagName === 'IMG'){
			ImageUtils.ImageUpdateFocus(widget, context);
		}
		
		parent.addChild(  widget, this._index);
				
		if(context){
			context.attach(widget);
			widget.startup();
			widget.renderWidget();
		}


		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
	},

	undo: function(){
	
		if(!this._id || !this._parentId){
			return;
		}
		var widget = Widget.byId(this._id);
		if(!widget){
			return;
		}
		
		var parent = Widget.byId(this._parentId);
		if(!parent){
			return;
		}

		var context = widget.getContext();
		if(context){
			context.detach(widget);
			context.deselect(widget);
		}
		parent.removeChild(widget);
		widget.destroyWidget();  
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(widget);
	}

});
});
