
define(["dojo/_base/declare",
        "davinci/workbench/ViewLite",
        "davinci/ve/metadata",
        "davinci/ve/commands/ModifyCommand",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/widgets/HTMLStringUtil"
],function(declare,   ViewLite, Metadata, ModifyCommand, veNLS,commonNLS, HTMLStringUtil){
	return declare("davinci.ve.widgets.WidgetProperties", [ViewLite], {
		
		displayName:"Widget-specific", // FIXME: This string is hard-coded in two different places
	
		buildRendering: function(){
			this.domNode = this.propDom = dojo.doc.createElement("div");
			dojo.addClass(this.domNode, "propGroup");
			dojo.attr(this.domNode, "propGroup", this.displayName);
			this.inherited(arguments);
		},

		onWidgetSelectionChange: function(){
			
			if(!this._widget){
				this._disconnectAll();
				this._destroyProperties();
				return;
			}
			
			var metadata = davinci.ve.metadata.query(this._widget);
			/* check to see if this widget is a child of a widget */
			if (this._widget.parent && this._widget.parent.isWidget) {
				var parentMetadata = Metadata.query(this._widget.parent);
				/* check the parent widget for extra props to add if it is a child of that widget */
				if (parentMetadata && parentMetadata.childProperties){
					if (!metadata.property) {
						metadata.property = parentMetadata.childProperties;
					} else {
						for (prop in parentMetadata.childProperties){
							metadata.property[prop] = parentMetadata.childProperties[prop];
						}
					}
				}
			}
			if(!metadata || !metadata.property) {
				return;
			}
			this._disconnectAll();
			this._destroyProperties();
	
			this.propDom.innerHTML = this._createWidgetRows(metadata.property);
			if(this.propDom.innerHTML.indexOf('dojoType')) {
				dojo.parser.parse(this.propDom);
			}
			this._setValues();
			this._connectAll();
		},
		
		onEditorSelected : function(editorChange){
			if(editorChange==null){
				this._widget = null;
				this.context = null;
			}else{
			
				if(editorChange.editorID == "davinci.ve.HTMLPageEditor"){ // not all editors have a context
					this.context = editorChange.getContext();
					this._widget = this.context.getSelection()[0];
				}else{
					this.context = null;
					this._widget = null;
				}
				
			}
			this.onWidgetSelectionChange();
		 },	
	
		 _createWidgetRows: function (properties){
			this._pageLayout = [];
			for(var name in properties){
				var property = properties[name];
				if(property.hidden){
					continue;
				}
				this._pageLayout.push({display:(property.title || name),
									   type: property.datatype,
									   target:name,
									   hideCascade:true});
			
				if(property.option){
					this._pageLayout[this._pageLayout.length-1].values = dojo.map(property.option, function(option){ return option.value; });
					
					if(property.unconstrained){
						this._pageLayout[this._pageLayout.length-1].type = "comboEdit";
					}else{
						this._pageLayout[this._pageLayout.length-1].type = "combo";
					}
				}
			}
			return HTMLStringUtil.generateTable(this._pageLayout);
		},
		
		
		_destroyProperties: function(){
			var containerNode = (this.propDom);
			dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
				w.destroy();
			});
			while(containerNode.firstChild){
				dojo._destroyElement(containerNode.firstChild);
			}
		},
		
		_connectAll: function(){
			
			function makeOnChange(target){
				return function(){
					return this._onChange({target:target});
				};
			}
			for(var i in this._pageLayout){
			    //NOTE: This comment was present here and the "var widget..." and "if(!widget){" lines 
			    //were commented out:
			    //
				//               FIXME: Probably can remove commented out code, but leaving
				//               it in for now in case there is a case where widget==null
				//               The way things are coded now, widget is always null
			    //
			    //HOWEVER, I found a case where the assumption widget would always be null is _wrong_. The
			    //case is when the property is unconstrained and a comboEdit is in place. So, I've uncommented the 
			    //aforementioned lines.
				var widget = dijit.byId(this._pageLayout[i].id); 
				if(!widget){
					/* onchange is lowercase for DOM/non dijit */
					var box = dojo.byId(this._pageLayout[i].id);
					this._connect(box, "onchange", this, makeOnChange(i));
					this._connect(box, "onfocus", this, "_onFieldFocus");
					this._connect(box, "onblur", this, "_onFieldBlur");
					//dojo.connect(widget, "onfocus", this, "_onFieldFocus");
					//dojo.connect(widget, "onblur", this, "_onFieldBlur");
				}else{
					dojo.connect(widget, "onFocus", this, "_onFieldFocus");
					dojo.connect(widget, "onBlur", this, "_onFieldBlur");
					this._connect(widget, "onChange", this, makeOnChange(i));
				}
			}
		},
		
		_connect: function(target,method,scope,targetFunction,dontFix){
			if(!this._connects)
				this._connects = [];
			
			this._connects.push(dojo.connect(target,method,scope,targetFunction,dontFix));
		},
		_disconnectAll: function(){
			if(!this._connects){ return; }
			this._connects.forEach(dojo.disconnect);
		},
		_onChange: function(a){
			var index = a.target;
			var box = dojo.byId(this._pageLayout[index].id);
			var value = null;
			
			if(this.context)
				this.context.blockChange(false);
			
			if(box){
				if(box.type=='checkbox'){
					value = dojo.attr(box, 'checked');
				}else{
					value = dojo.attr(box, 'value');	
				}
			}else{
				 box = dijit.byId(this._pageLayout[index]['id']);
				 if(box) {
					 value = box.get('value');
				 }
			}
	
			if(this._pageLayout[index].value != value ){
				this._pageLayout[index].value = value;
				var valuesObject = {};
				valuesObject[this._pageLayout[index].target] = value;
				var command = new ModifyCommand(this._widget, valuesObject, null);
				dojo.publish("/davinci/ui/widgetPropertiesChanges",[{source:this._editor.editor_id, command:command}]);
			}	
		},
		_onFieldFocus : function(){
			if(this.context)
				this.context.blockChange(true);
		},
		_onFieldBlur : function(){
			if(this.context)
				this.context.blockChange(false);		
		},
		_setValues: function() {
			
			for(var i=0;i< this._pageLayout.length;i++){
				var widget = this._widget;
				var targetProp = this._pageLayout[i].target;
				var propValue = null;
				
				if(targetProp=="_children"){
					propValue =   this._widget.getChildrenData();
					if(propValue && propValue.length == 1){
						propValue = propValue[0];
					}else{
						// need to account for this case?
						propValue = this._widget.getPropertyValue(targetProp);
					}
				}else{
					propValue = this._widget.getPropertyValue(targetProp);
				}
				if(this._pageLayout[i].value != propValue){
					this._pageLayout[i].value = propValue;
					if(this._pageLayout[i].type=='boolean')
						dojo.attr( this._pageLayout[i].id, "checked",  this._pageLayout[i].value);
					else
						dojo.attr( this._pageLayout[i].id, "value",  this._pageLayout[i].value);
				}
			}
		}
	});
});