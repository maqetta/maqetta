dojo.provide("davinci.ve.commands.ModifyRichTextCommand");


dojo.require("davinci.ve.widget");

dojo.declare("davinci.ve.commands.ModifyRichTextCommand", null, {

	name: "modify",

	constructor: function(widget, properties, children, context){

		this._oldId = (widget ? widget.id : undefined);
		
		this._properties = properties = (properties || {});
		if (properties.richText) {// wdr richtext
			this._richText = true;
			this._newText = properties.richText;
			this._children = properties.richText; //wdr richtext
			delete properties.richText; //wdr richtext
		}
		else 
			this._children = properties._children;
		this._context = context || widget.getContext();;
		
		
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
		this._parentWidget = widget.getParent();
		if (!this._parentWidget)
			this._parentWidget = widget.getParent();
		if (!this._parentWidget)
			this._parentWidget = widget.parent; // maybe this
		if (!this._oldText){
			this._oldText = widget._srcElement.getElementText(this._context);
			if (this._oldText && (typeof this._oldText == 'string')){
				this._oldText = this._oldText.replace(/\n/g, ''); // new lines breaks create widget richtext
			}
		}
		if(!this._oldData ){
			this._oldData = widget.getData();
			this._oldData.context = this._context;
			
			this._newData = {type: this._oldData.type,
				properties: dojo.mixin({}, this._oldData.properties, this._properties),
				//properties: {id: this._oldId},
				children: this._newText,
				//scripts: this._oldData.scripts,
				//scripts: this._oldData.scripts,
				states: this._oldData.states,
				context:this._context
				};
			this._oldData = {type: this._oldData.type,
					properties: dojo.mixin({}, this._oldData.properties, this._properties),
					//properties: {id: this._oldId },
					children: this._oldText,
					//scripts: this._oldData.scripts,
					states: this._oldData.states,
					context:this._context
					};
		}
		
		if(this._context){
			this._context.detach(widget);
		}	

		if(this._properties.id){
			delete this._newData.properties.isTempID;
		}
		if (!this._newId_isTempID){
			this._newId_isTempID = this._newData.properties.isTempID;
		}
		if (!this._oldId_isTempID){
			this._oldId_isTempID = this._oldData.properties.isTempID;
		}
		var newWidget = null;
		/* make sure the parent widget supports our re-childrening commands */
//		if(parentWidget && parentWidget.getIndexOfChild && parentWidget.removeChild && parentWidget.addChild ){
			var index = this._parentWidget.indexOf(widget);
			this._parentWidget.removeChild(widget);
			widget.destroyWidget(); 
			if (this._newId)
				this._newData.properties.id = this._newId; // make sure the id is restored
			if (this._newId_isTempID)
				this._newData.properties.isTempID = this._newId_isTempID; 
			newWidget = davinci.ve.widget.createWidget(this._newData);
			
			if(!newWidget){
				return;
			}
			
			this._parentWidget.addChild(newWidget,index);
			

		
			this._newId = newWidget.id;

		//davinci.ve.widget.addChild(parent, widget, index);
		if(this._context){
			this._refresh(newWidget);
		
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
			debugger;
			return;
		}
		var index = dojo.indexOf(this._parentWidget.getChildren(), widget);
		if(index < 0){
			return;
		}

		// remove new
		var context = this._parentWidget.getContext();
		if(context){
			context.detach(widget);
		}
		this._parentWidget.removeChild( widget);
		widget.destroyWidget(); 

		// add old
		this._oldData.children = this._oldText;
		this._oldData.properties.id = this._oldId; // make sure the id is restored
		var newWidget = davinci.ve.widget.createWidget(this._oldData);
		if(!widget){
			debugger;
			return;
		}


		parent.addChild(newWidget, index);
		if(context){
			this._refresh(newWidget);

		}
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
	},
	
	_refresh: function(widget){
		// refresh the page designer, sometimes the widgets are not redrawn for children
		// we need the timer to let the model catch up to prevent corruption.
		
		// this is from davinci.ve.Context. _processWidgets line 584
		var dj = this._context.getDojo(),
			containerNode = widget.getContainerNode();
        dj["require"]("dojo.parser");
        dj.parser.parse(containerNode);
        this._context.attach(widget);
        widget.startup();
        widget.renderWidget();
		this._context._attachChildren(containerNode);
	}
});
