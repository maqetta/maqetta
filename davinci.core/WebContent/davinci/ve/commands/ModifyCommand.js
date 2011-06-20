dojo.provide("davinci.ve.commands.ModifyCommand");


dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.ModifyCommand", null, {

	name: "modify",

	constructor: function(widget, properties, children, context){

		this._oldId = (widget ? widget.id : undefined);
		this._properties = properties = (properties || {});
//		if (properties.richText) {// wdr richtext
//			this._children = properties.richText; //wdr richtext
//			delete properties.richText; //wdr richtext
//		}
//		else 
			this._children = children || properties._children;
		this._context = context || widget.getContext();;
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
		
		var widget = davinci.ve.widget.byId(this._oldId);
		if(!widget){
			return;
		}
		//if(!this._oldData ){
		// after creating the widget we need to refresh the data, the createWidget function removes the id's of the widgets and 
		// children. We need the id's to be consistent for undo/redo to work -- wdr
			this._oldData = widget.getData();
			this._oldData.context = this._context;
			
			this._newData = {type: this._oldData.type,
				properties: dojo.mixin({}, this._oldData.properties, this._properties),
				children: (this._children==null?this._oldData.children:this._children),
				scripts: this._oldData.scripts,
				states: this._oldData.states,
				context:this._context
				};
		//}
		
		if(this._context){
			this._context.detach(widget);
		}	
		
		if(!this._oldData.properties.isTempID || this._properties.id){ // most likely are  permanent id
			delete this._newData.properties.isTempID;
		}

		var parentWidget = widget.getParent();
		var newWidget = null;
		/* make sure the parent widget supports our re-childrening commands */
//		if(parentWidget && parentWidget.getIndexOfChild && parentWidget.removeChild && parentWidget.addChild ){
			var index = parentWidget.indexOf(widget);
			parentWidget.removeChild(widget);
			widget.destroyWidget(); 
			newWidget = davinci.ve.widget.createWidget(this._newData);
			
			if(!newWidget){
				return;
			}
			
			parentWidget.addChild(newWidget,index);
			
//		}else{
//			var tempDiv = dojo.doc.createElement("div");
//			var domNode = widget.domNode?widget.domNode:widget;
//		
//			var parent = domNode.parentNode;
//			
//			parent.replaceChild(tempDiv, domNode);
//			widget.destroyWidget();
//			newWidget = davinci.ve.widget.createWidget(this._newData);
//			
//			if(!newWidget){
//				return;
//			}
//			var domNode = null;
//			if(newWidget.domNode)
//				domNode = newWidget.domNode;
//			else
//				domNode = newWidget;
//
//			// add new
//			parent.replaceChild(  domNode, tempDiv);
//			if(!this._newId){
//				this._newId = newWidget.id;
//			}
//		}
		
		this._newId = newWidget.id;

		//davinci.ve.widget.addChild(parent, widget, index);
		if(this._context){
			this._context.attach(newWidget);
			newWidget.startup();
			newWidget.renderWidget();
		}
		this.newWidget=newWidget;
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
	},

	undo: function(){

		if(!this._newId || !this._oldData){
			return;
		}
		var widget = davinci.ve.widget.byId(this._newId);
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
		newWidget = davinci.ve.widget.createWidget(this._oldData);
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
	}

});
