
define(["dojo/_base/declare",
        "davinci/workbench/ViewLite",
        "davinci/ve/commands/ModifyCommand",
        "dijit/form/ComboBox",
        "dojo/store/Memory",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/widget"
],function(declare, ViewLite, ModifyCommand, ComboBox, Memory, veNLS, commonNLS, widgetUtils){
	return declare("davinci.ve.widgets.WidgetToolBar", ViewLite, {
	
		widgetDescStart:"",
		widgetDescUnselectEnd:"",
		
		postMixInProperties : function() {
			this.widgetDescStart =
				"<div class='propertiesWidgetDescription'><span class='propertiesWidgetDescriptionFor'>" + veNLS.toolBarFor + "</span>";
			this.widgetDescUnselectEnd =
				veNLS.noSelection + "</div>";
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
				displayName = widgetUtils.getLabel(this._widget); 
			}else{
				this.domNode.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
				dojo.removeClass(this.domNode, "propertiesSelection");
				return;
			}
			
			dojo.addClass(this.domNode, "propertiesSelection");
			this.domNode.innerHTML= this.widgetDescStart + displayName + "</div>";
			if (this._editor && this._editor.declaredClass === "davinci.ve.PageEditor"){
				// Provide a type-in box for the 'class' and ID attribute
				var srcElement = this._widget._srcElement;
				if(srcElement){
					var classDiv = dojo.doc.createElement("div");
					classDiv.className = "propClassInputRow";
					var labelSpan = dojo.doc.createElement("span");
					var classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName'});
					var langObj = veNLS;
					classLabelElement.innerHTML = langObj.toolBarClass;
					labelSpan.appendChild(classLabelElement);
					var classAttr = srcElement.getAttribute("class");
					var className = (classAttr && dojo.trim(classAttr)) || "";

					var classInputElement = dojo.create("input", {type:'text',value:className,className:'propClassInput', size:8});
					labelSpan.appendChild(classInputElement);

					// collect all classes
					var classes = [];

					var docEl = this._widget.getContext().getModel().getDocumentElement();
					if (docEl) {
						var visitor = {
							visit: function(node) {
								// skip the body/html nodes
								if (node.elementType == "HTMLElement" && node.tag != "body" && node.tag != "html") {
									var c = node.getAttribute("class");
									if (c) {
										var classes = dojo.trim(c).split(" ");
										dojo.forEach(classes, dojo.hitch(this, function(className) {
												// remove dupes
												if (dojo.indexOf(this.classes, className) == -1) {
													this.classes.push(className);
												}
										}));
									}
								}
							},
							classes: []
						}

						docEl.visit(visitor);

						dojo.forEach(visitor.classes, function(className) {
								classes.push({name: className});
						});
					}

					// use a simply memory store
					var memstore = new Memory({
							data: classes
					});

					this._classInputElement = new ComboBox({value: className, searchAttr: "name", store: memstore, style: {width: "100px"}}, classInputElement);
					dojo.connect(this._classInputElement, "onChange", this, "_onChangeClassAttribute");


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
				var command = new ModifyCommand(this._widget, valuesObject, null);
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
			
			var className = inputElement.attr("value");
			if(className != this._oldClassName ){
				this._oldClassName = className;
				var valuesObject = {};
				valuesObject['class'] = className;
				var command = new davinci.ve.commands.ModifyCommand(this._widget, valuesObject, null);
				dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
			}	
		}
	
	});
});