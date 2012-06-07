define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/workbench/ViewLite",
        "davinci/ve/commands/ModifyCommand",
        "dijit/form/ComboBox",
        "dijit/form/TextBox",
        "dojo/store/Memory",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/widget",
        "dojo/text!./templates/WidgetToolBar.html",
],function(declare, _Templated, _Widget, ViewLite, ModifyCommand, ComboBox, TextBox, Memory, veNLS, commonNLS, widgetUtils, templateString){
	return declare("davinci.ve.widgets.WidgetToolBar", [ViewLite, _Widget, _Templated], {
	
		templateString: templateString,
		widgetsInTemplate: true,

		// attach points
		descNode: null,
		idTextBox: null,
		classComboBox: null,

		widgetDescStart:"",
		widgetDescUnselectEnd:"",

		_oldIDName: null,
		_oldClassName: null,

		veNLS: veNLS,
	
		postCreate: function() {
			dojo.subscribe("/davinci/ui/widget/replaced", dojo.hitch(this, this._widgetReplaced));
		},
		
		onEditorSelected : function(){
			this.domNode.style.display = "block";

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
				this.descNode.innerHTML = veNLS.noSelection;
				dojo.removeClass(this.domNode, "propertiesSelection");
				this.context = null;
				return;
			}

			this.changing = true;

			// clear out
			this._oldIDName = null;
			this._oldClassName = null;
			
			dojo.addClass(this.domNode, "propertiesSelection");
			this.descNode.innerHTML = displayName;

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
		},

		_onKeyPress: function(e) {
			// dijit textbox doesn't fire onChange for enter
			if (e.keyCode == dojo.keys.ENTER) {
				this._onChangeIDAttribute();
			}
		}
	});
});