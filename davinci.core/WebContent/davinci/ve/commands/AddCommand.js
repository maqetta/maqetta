dojo.provide("davinci.ve.commands.AddCommand");

dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.AddCommand", null, {

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

		var parent = davinci.ve.widget.byId(this._parentId); 
		if(!parent){
			return;
		}
		var widget = undefined;
		if(this._data){
			//this.undo(); // try to remove old widget first, mostly for redo
			if (this._id && this._data.properties)
				this._data.properties.id= this._id;
			widget = davinci.ve.widget.createWidget(this._data);
		}else if(this._id){
			widget = davinci.ve.widget.byId(this._id,parent.getContext());
		}
		if(!widget){
			return;
		}
		//if(!this._data){ // save for redo -- wdr
		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
			this._data = widget.getData();
			this._data.properties.id= this._id;
			this._data.context = widget.getContext();
		//}
		


		// TODO: this._index is typically a number... when is it passed in as a widget?
		if(this._index && typeof this._index != "number") {
			if (this._index.domNode){ // widget
				this._index = parent.indexOf(  this._index);
			} else {
				// _index is no longer valid since it was replaced, lets find it
				var w = davinci.ve.widget.byId(this._index.id,parent.getContext())
				this._index = parent.indexOf(w);
			}
		}

		parent.addChild(  widget, this._index);
				
		var context = parent.getContext();
		if(context){
			context.attach(widget);
			widget.startup();
			widget.renderWidget();
		}

//		if(!this._data){
//			this._data = davinci.ve.widget.getData(widget);
//		}else if(!this._id){
//			this._id = widget.id;
//			// hold auto-assigned ID in data
//			if(!this._data.properties){
//				this._data.properties = {id: widget.id};
//			}else{
//				this._data.properties.id = widget.id;
//			}
//		}
	},

	undo: function(){
	
		if(!this._id || !this._parentId){
			return;
		}
		var widget = davinci.ve.widget.byId(this._id);
		if(!widget){
			return;
		}
		
		var parent = davinci.ve.widget.byId(this._parentId);
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
	}

});
