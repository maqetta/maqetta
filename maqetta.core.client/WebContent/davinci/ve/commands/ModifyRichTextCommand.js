define([
    	"dojo/_base/declare"
    	//"davinci/ve/widget",// circular dep
    	//"davinci/ve/States"// circular dep
], function(declare/*, Widget, States*/){


return declare("davinci.ve.commands.ModifyRichTextCommand", null, {
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
		else {
			this._children = properties._children;
		}
		this._context = context || widget.getContext();
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
				children: this._newText,
				states: this._oldData.states,
				context:this._context
				};
			this._oldData = {type: this._oldData.type,
					properties: dojo.mixin({}, this._oldData.properties, this._properties),
					children: this._oldText,
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
		if(this._context){
			this._refresh(newWidget);
		
		}
		this.newWidget=newWidget;
		dojo.publish("/davinci/ui/widget/replaced", [newWidget, widget]);
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(newWidget);
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
		
		// Recompute styling properties in case we aren't in Normal state
		davinci.ve.states.resetState(newWidget);
	},
	
	_refresh: function(widget){
		// refresh the page designer, sometimes the widgets are not redrawn for children
		// we need the timer to let the model catch up to prevent corruption.
		
		var containerNode = widget.getContainerNode();
		// this is from davinci.ve.Context. _processWidgets line 584
		if (containerNode) {
			var dj = this._context.getDojo();
	        dj["require"]("dojo.parser");
	        dj.parser.parse(containerNode);
	    }
        this._context.attach(widget);
        widget.startup();
        widget.renderWidget();
        if (containerNode) {
			this._context._attachChildren(containerNode);
		}
	}
});
});