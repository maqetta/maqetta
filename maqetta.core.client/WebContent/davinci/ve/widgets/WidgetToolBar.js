
define(["dojo/_base/declare",
        "davinci/workbench/ViewLite",
        "davinci/ve/commands/ModifyCommand",
        "dijit/form/ComboBox",
        "dijit/form/TextBox",
        "dojo/store/Memory",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/widget"
],function(declare, ViewLite, ModifyCommand, ComboBox, TextBox, Memory, veNLS, commonNLS, widgetUtils){
	return declare("davinci.ve.widgets.WidgetToolBar", ViewLite, {
	
		widgetDescStart:"",
		widgetDescUnselectEnd:"",

		_oldIDName: null,
		_oldClassName: null,

		idTextBox: null,
		classComboBox: null,
		descNode: null,
		
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

		postCreate: function() {
			// create description row
			var descDiv = dojo.doc.createElement("div");
			descDiv.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
			this.descNode = this.domNode.appendChild(descDiv);

			// create class row
			var classDiv = dojo.doc.createElement("div");
			classDiv.className = "propClassInputRow";

			var classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName', style: "float: left; width:30px; text-align: right; padding-right: 10px"});
			var langObj = veNLS;
			classLabelElement.innerHTML = langObj.toolBarClass;
			classDiv.appendChild(classLabelElement);

			var classInputElement = dojo.create("input", {type:'text',value:"",className:'propClassInput', size:8});
			classDiv.appendChild(classInputElement);

			this.classComboBox = new ComboBox({value: "", searchAttr: "name", store: null}, classInputElement);
			dojo.connect(this.classComboBox, "onChange", this, "_onChangeClassAttribute");
			dojo.connect(this.classComboBox, "onFocus", this, "_onFieldFocus");
			dojo.connect(this.classComboBox, "onBlur", this, "_onFieldBlur");

			this.domNode.appendChild(classDiv);

			// create the id row
			var idDiv = dojo.doc.createElement("div");
			idDiv.className = "propIdInputRow";
			classLabelElement = dojo.create("label", {className:'propClassLabel propertyDisplayName', style: "float: left; width:30px; text-align: right; padding-right: 10px"});
			classLabelElement.innerHTML = "ID:";
			idDiv.appendChild(classLabelElement);

			var idInputElement = dojo.create("input", {type:'text',value:"",className:'propClassInput'});
			idDiv.appendChild(idInputElement);
			this.idTextBox = new TextBox({value: ""}, idInputElement);
			dojo.connect(this.idTextBox, "onChange", this, "_onChangeIDAttribute");
			dojo.connect(this.idTextBox, "onFocus", this, "_onFieldFocus");
			dojo.connect(this.idTextBox, "onBlur", this, "_onFieldBlur");

			this.domNode.appendChild(idDiv);
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
				this.context = this._widget.getContext();
			}else{
				this.descNode.innerHTML = this.widgetDescStart+this.widgetDescUnselectEnd;
				dojo.removeClass(this.domNode, "propertiesSelection");
				this.context = null;
				return;
			}

			this.changing = true;

			// clear out
			this._oldIDName = null;
			this._oldClassName = null;
			
			dojo.addClass(this.domNode, "propertiesSelection");
			this.descNode.innerHTML= this.widgetDescStart + displayName;

			if (this._editor && this._editor.declaredClass === "davinci.ve.PageEditor"){
				// Provide a type-in box for the 'class' and ID attribute
				var srcElement = this._widget._srcElement;
				if(srcElement){
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
					this.classComboBox.set("store", memstore);

					var classAttr = srcElement.getAttribute("class");
					var className = (classAttr && dojo.trim(classAttr)) || "";
					this.classComboBox.set("value", className);
					this._oldClassName = className;

					// id
					var idAttr = this._widget.getId();
					var idName = (idAttr && dojo.trim(idAttr)) || "";
					this._oldIDName = idName;
					this.idTextBox.attr("value", idName); 
				}
			}

			this.changing = false;
		},

		_onChangeIDAttribute : function(){
			if(!this._widget || this.changing){
				return;
			}
			var inputElement = this.idTextBox;
			if(!inputElement){
				return;
			}
			if(this.context)
				this.context.blockChange(false);
			
			var value = inputElement.attr("value");
			if(value !== this._oldIDName ){
				this._oldIDName = value;
				var valuesObject = {};
				valuesObject['id'] = value;
				var command = new ModifyCommand(this._widget, valuesObject, null);
				dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
			}	
		},
		
		_onChangeClassAttribute : function(){
			if(!this._widget || this.changing){
				return;
			}
			var inputElement = this.classComboBox;
			if(!inputElement){
				return;
			}
			if(this.context)
				this.context.blockChange(false);
			
			var className = inputElement.attr("value");
			if(className !== this._oldClassName ){
				this._oldClassName = className;
				var valuesObject = {};
				valuesObject['class'] = className;
				var command = new davinci.ve.commands.ModifyCommand(this._widget, valuesObject, null);
				dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
			}	
		},

		_onFieldFocus: function() {
			if (this.context) {
				this.context.blockChange(true);
			}
		},

		_onFieldBlur: function() {
			if (this.context) {
				this.context.blockChange(false);
			}
		}
	});
});