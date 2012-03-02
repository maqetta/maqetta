define([
	"dojo/_base/declare",
	"dojo/_base/connect",
    "davinci/workbench/ViewLite",
    "davinci/ve/metadata",
    "davinci/ve/commands/ModifyCommand",
    "dojo/i18n!davinci/ve/nls/ve",
    "dojo/i18n!dijit/nls/common",
    "davinci/ve/widgets/HTMLStringUtil"
], function(
	declare,
	connect,
	ViewLite,
	Metadata,
	ModifyCommand,
	veNLS,
	commonNLS,
	HTMLStringUtil
) {

	return declare("davinci.ve.widgets.WidgetProperties", [ViewLite], {
		
		displayName: "Widget-specific", // FIXME: This string is hard-coded in two different places

		_connects: null,
	
		buildRendering: function(){
			this.domNode = this.propDom = dojo.doc.createElement("div");
			dojo.addClass(this.domNode, "propGroup");
			dojo.attr(this.domNode, "propGroup", this.displayName);
			this._connects = [];
			this.inherited(arguments);
		},

		onWidgetSelectionChange: function() {
			if (!this._widget) {
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
						for (var prop in parentMetadata.childProperties) {
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
	
			var rows = this.propDom.innerHTML = this._createWidgetRows(metadata.property);
			if (rows.indexOf('dojoType') !== -1) {
				dojo.parser.parse(this.propDom);
			}
			this._setValues();
			this._connectAll();
		},
		
		onEditorSelected: function(editorChange) {
			if (editorChange && editorChange.editorID == "davinci.ve.HTMLPageEditor") {
				// not all editors have a context
				//FIXME: test for context instead?
				this.context = editorChange.getContext();
				this._widget = this.context.getSelection()[0];
			} else {
				this.context = null;
				this._widget = null;
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
					this._pageLayout[this._pageLayout.length-1].type = property.unconstrained ? "comboEdit" : "combo";
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
		
		_connectAll: function() {
			function makeOnChange(target){
				return function(){
					return this._onChange({target:target});
				};
			}

			for (var i = 0, len = this._pageLayout.length; i < len; i++) {
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
				var row = this._pageLayout[i],
					widget = dijit.byId(row.id),
					obj = widget || dojo.byId(row.id),
					// onchange, et al, are lowercase for DOM/non dijit
					onchange = widget ? 'onChange' : 'change',
					onfocus = widget ? 'onFocus' : 'focus',
					onblur = widget ? 'onBlur' : 'blur';
				this._connect(obj, onchange, this, makeOnChange(i));
				this._connect(obj, onfocus, this, "_onFieldFocus");
				this._connect(obj, onblur, this, "_onFieldBlur");
			}
		},

		_connect: function(target, method, scope, targetFunction, dontFix) {
			this._connects.push(connect.connect.apply(null, arguments));
		},

		_disconnectAll: function() {
			this._connects.forEach(connect.disconnect);
			this._connects = [];
		},

		_onChange: function(a) {
			var index = a.target,
				row = this._pageLayout[index],
				box = dojo.byId(row.id),
				value;
			
			if (this.context) {
				this.context.blockChange(false);
			}
			
			if (box) {
				var attr = box.type === 'checkbox' ? 'checked' : 'value';
				value = dojo.attr(box, attr);
			} else {
				box = dijit.byId(row.id);
				if (box) {
					value = box.get('value');
				}
			}
	
			if (row.value != value) { // keep '!=', we want type coersion from strings
				row.value = value;
				var valuesObject = {};
				valuesObject[row.target] = value;
				var command = new ModifyCommand(this._widget, valuesObject, null);
				dojo.publish("/davinci/ui/widgetPropertiesChanges", [
					{
						source: this._editor.editor_id,
						command: command
					}
				]);
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

		_setValues: function() {
			for (var i = 0, len = this._pageLayout.length; i < len; i++) {
				var row = this._pageLayout[i],
					propNode = dojo.byId(row.id);
				// Verify that DOM element actually exists
				if (!propNode) {
					continue;
				}

				var widget = this._widget,
					targetProp = row.target,
					propValue;

				if (targetProp === "_children") {
					propValue = widget.getChildrenData();
					if (propValue && propValue.length === 1) {
						propValue = propValue[0];
					} else {
						// need to account for this case?
						propValue = widget.getPropertyValue(targetProp);
					}
				} else {
					propValue = widget.getPropertyValue(targetProp);
				}
				if (row.value != propValue) { // keep '!=', we want type coersion from strings
					row.value = propValue;
					var attr = row.type === 'boolean' ? 'checked' : 'value';
					dojo.attr(propNode, attr, row.value);
				}
			}
		}
	});
});