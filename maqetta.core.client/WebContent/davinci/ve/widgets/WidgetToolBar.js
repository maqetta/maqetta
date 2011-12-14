dojo.provide("davinci.ve.widgets.WidgetToolBar");

dojo.require("davinci.ve.commands.EventCommand");
dojo.require("davinci.ve.States");
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("davinci.workbench.ViewLite");
dojo.require("davinci.ve.commands.ModifyCommand");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "ve");

dojo.declare("davinci.ve.widgets.WidgetToolBar", [davinci.workbench.ViewLite], {

	widgetDescStart:"",
	widgetDescUnselectEnd:"",
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		var str1 = "<div class='propertiesWidgetDescription'><span class='propertiesWidgetDescriptionFor'>"+langObj.toolBarFor+"</span>";
		var str2 = langObj.noSelection + "</div>";
		this.widgetDescStart = str1;
		this.widgetDescUnselectEnd = str2;
		this.inherited(arguments);
	},
	
	buildRendering: function(){
		this.domNode = dojo.doc.createElement("div");
		this.domNode.className = 'propertiesTitleBar';
		dojo.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, this._widgetReplaced));
		this.inherited(arguments);
	},
	
	onEditorSelected : function(){
		if(this._editor && this._editor.visualEditor && this._editor.visualEditor.context){
			var selection = this._editor.visualEditor.context.getSelection();
			if(selection.length==0){
				this._widget = null;
			}else{
				this._widget = selection[0];
			}
		}else{
			this._widget = null;
		}
		this.onWidgetSelectionChange();
	},
	
	_widgetReplaced : function(newWidget){
		this._widget = newWidget;
		this.onWidgetSelectionChange();
	},
	
	onWidgetSelectionChange : function(){		
		var displayName = "";
		
		if(this._widget){
			displayName = davinci.ve.widget.getLabel(this._widget); 
		}else{
			this.domNode.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
			dojo.removeClass(this.domNode, "propertiesSelection");
			return;
		}
		
		dojo.addClass(this.domNode, "propertiesSelection");
		this.domNode.innerHTML= this.widgetDescStart + displayName + "</div>";
		// Provide a type-in box for the 'class' and ID attribute
		var srcElement = this._widget._srcElement;
		if(srcElement){
			var classDiv = dojo.doc.createElement("div");
			classDiv.className = "propClassInputRow";
			var labelSpan = dojo.doc.createElement("span");
			var classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName'});
			var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
			classLabelElement.innerHTML = langObj.toolBarClass;
			labelSpan.appendChild(classLabelElement);
			var classAttr = srcElement.getAttribute("class");
			var className = (classAttr && dojo.trim(classAttr)) || "";
			var classInputElement = dojo.create("input", {type:'text',value:className,className:'propClassInput', size:8});
			this._classInputElement = classInputElement;
			this._oldClassName = className;
			classInputElement.onchange=dojo.hitch(this,this._onChangeClassAttribute);		
			labelSpan.appendChild(classInputElement);
			labelSpan.className = "propClassInputCell";
			classDiv.appendChild(labelSpan);
			/* add the ID element */
			labelSpan = dojo.doc.createElement("span");
			classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName'});
			classLabelElement.innerHTML = "ID";
			labelSpan.appendChild(classLabelElement);
			var idAttr = this._widget.getId();
			var idName = (idAttr && dojo.trim(idAttr)) || "";
			var idInputElement = dojo.create("input", {type:'text',value:idName,className:'propClassInput', size:8});
			this._IDInputElement = idInputElement;
			this._oldIDName = idName;
			idInputElement.onchange=dojo.hitch(this,this._onChangeIDAttribute);		
			labelSpan.appendChild(idInputElement);
			labelSpan.className = "propClassInputCell";
			classDiv.appendChild(labelSpan);
			this.domNode.appendChild(classDiv);
			
			
			
		}
	},
	_onChangeIDAttribute : function(){
		var inputElement = this._IDInputElement;
		if(!inputElement){
			return;
		}
		if(this.context)
			this.context.blockChange(false);
		
		if(inputElement.value != this._oldIDName ){
			this._oldIDName = inputElement.value;
			var valuesObject = {};
			valuesObject['id'] = inputElement.value;
			var command = new davinci.ve.commands.ModifyCommand(this._widget, valuesObject, null);
			dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
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