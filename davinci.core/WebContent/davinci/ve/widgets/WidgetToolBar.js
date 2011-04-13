dojo.provide("davinci.ve.widgets.WidgetToolBar");

dojo.require("davinci.ve.commands.EventCommand");
dojo.require("davinci.ve.States");
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("davinci.workbench.ViewLite");
dojo.require("davinci.ve.commands.ModifyCommand");


dojo.declare("davinci.ve.widgets.WidgetToolBar", [davinci.workbench.ViewLite], {

	widgetDescStart:"<div class='propertiesWidgetDescription'><span class='propertiesWidgetDescriptionFor'>for: </span>",
	widgetDescUnselectEnd:"(no selection)</div>",
	
	buildRendering: function(){
		this.domNode = dojo.doc.createElement("div");
		this.domNode.className = 'propertiesTitleBar';
		dojo.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, this._widgetReplaced));
		this.inherited(arguments);
	},
	onEditorSelected : function(){
		
		this.domNode.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
		
	},
	
	_widgetReplaced : function(newWidget){
		this._widget = newWidget;
		this.onWidgetSelectionChange();
		
		
	},
	
	onWidgetSelectionChange : function(){
		
		var displayName = "";
		
		if(this._widget || this._subwidget){
			
			displayName = davinci.ve.widget.getLabel(this._widget || this._subwidget); 
		}else{
			this.domNode.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
			dojo.removeClass(this.domNode, "propertiesSelection");
			return;
		}
		
		dojo.addClass(this.domNode, "propertiesSelection");
		this.domNode.innerHTML= this.widgetDescStart + displayName + "</div>";
		// Provide a type-in box for the 'class' attribute
		var srcElement = this._widget._srcElement;
		if(srcElement){
			var classDiv = dojo.doc.createElement("div");
			classDiv.className = "propClassInputRow";
			var labelSpan = dojo.doc.createElement("span");
			var classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName'});
			classLabelElement.innerHTML = "class: ";
			labelSpan.appendChild(classLabelElement);
			var classAttr = srcElement.getAttribute("class");
			var className = (classAttr && dojo.trim(classAttr)) || "";
			var classInputElement = dojo.create("input", {type:'text',value:className,className:'propClassInput'});
			this._classInputElement = classInputElement;
			this._oldClassName = className;
			classInputElement.onchange=dojo.hitch(this,this._onChangeClassAttribute);		
			labelSpan.appendChild(classInputElement);
			labelSpan.className = "propClassInputCell";
			classDiv.appendChild(labelSpan);
			this.domNode.appendChild(classDiv);
		}
	},
	
	_onChangeClassAttribute : function(){
		var inputElement = this._classInputElement;
		if(!inputElement){
			return;
		}
		if(this.context)
			this.context.blockChange(false);
		
		if(inputElement.value != this._oldClassName ){
			this._oldClassName = inputElement.value;
			var valuesObject = {};
			valuesObject['class'] = inputElement.value;
			var command = new davinci.ve.commands.ModifyCommand(this._widget, valuesObject, null);
			dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
		}	
	}

});