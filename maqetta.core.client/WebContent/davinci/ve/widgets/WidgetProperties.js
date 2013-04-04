define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"davinci/workbench/ViewLite",
	"davinci/ve/metadata",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/ModifyCommand",
	"./HTMLStringUtil",
	"dijit/form/DateTextBox",
	"dijit/form/TimeTextBox",
], function(
	declare,
	connect,
	ViewLite,
	Metadata,
	CompoundCommand,
	ModifyCommand,
	HTMLStringUtil,
	DateTextBox,
	TimeTextBox
) {

	return declare("davinci.ve.widgets.WidgetProperties", [ViewLite], {
		
		key: "widgetSpecific", // Must match section key in SwitchingStylingViews table

		_connects: null,
	
		buildRendering: function(){
			this.domNode = this.propDom = dojo.doc.createElement("div");
			dojo.addClass(this.domNode, "propGroup");
			dojo.attr(this.domNode, "propGroup", this.key);
			this._connects = [];
			this.inherited(arguments);
		},

		onWidgetSelectionChange: function() {
			if (!this._widget || !this._editor || this._editor.editorID != "davinci.ve.HTMLPageEditor") {
				this._disconnectAll();
				this._destroyProperties();
				return;
			}
			
			// NOTE: In logic below, we use metadata.$ownproperty instead of metadata.property
			// $ownproperty contains only those properties that were explicitly defined in oam.json file
			// property also contains hidden properties 'class', 'style', 'title', etc.
			// Need to use $ownproperty in order to add HTML 'title' attribute at top of list
			// for any widgets that don't explicitly define their own title property
			
			var metadata = davinci.ve.metadata.query(this._widget);
			/* check to see if this widget is a child of a widget */
			var parentWidget = this._widget.getParent();
			if (parentWidget && parentWidget.isWidget) {
				var parentMetadata = Metadata.query(parentWidget);
				/* check the parent widget for extra props to add if it is a child of that widget */
				if (parentMetadata && parentMetadata.childProperties){
					if (!metadata.$ownproperty) {
						metadata.$ownproperty = parentMetadata.childProperties;
					} else {
						for (var prop in parentMetadata.childProperties) {
							metadata.$ownproperty[prop] = parentMetadata.childProperties[prop];
						}
					}
				}
			}
			if(!metadata || !metadata.$ownproperty) {
				return;
			}
			this._disconnectAll();
			this._destroyProperties();
	
			// put the HTML 'title' attribute at the top of the list of widget-specific properties
			// if the widget doesn't already have a title property
			var props = {};
			if(!metadata.$ownproperty.title){
				props.title = {datatype:'string'};
			}
			for(var prop in metadata.$ownproperty){
				props[prop] = metadata.$ownproperty[prop];
			}
			
			var rows = this.propDom.innerHTML = this._createWidgetRows(props);
			if (rows.indexOf('data-dojo-type') !== -1 || rows.indexOf('dojoType') !== -1) {
				dojo.parser.parse(this.propDom);
			}
			this._setValues();
			this._connectAll();
		},
		
		onEditorSelected: function(editorChange) {
			this._editor = editorChange;
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

				var prop = {display:(property.title || name),
						type: property.datatype,
						format: property.format,
						target:name,
						hideCascade:true
				};

				if (property.dropdownQueryValues && property.dropdownQueryAttribute) {
					var values = [];

					dojo.forEach(property.dropdownQueryValues, dojo.hitch(this, function(query) {
						var results = dojo.query(query, this.context.rootNode);
						dojo.forEach(results, function(node) {
								values.push(node.getAttribute(property.dropdownQueryAttribute));
						});
					}));

					// store the values into the prop
					prop.values = values;

					// we want a comboEdit here, so force it
					prop.type = "comboEdit";
				}

				if (dojo.isArray(property.mustHaveAncestor)) {
					var found = false;
					var w = this._widget;

					while (!found && w && w.getParent() != this.context.rootWidget) {
						w = w.getParent();
						if (w && dojo.indexOf(property.mustHaveAncestor, w.type) > -1) {
							found = true;
						}
					}

					if (found) {
					} else {
						prop.disabled = true;
					}
				}
										
				this._pageLayout.push(prop);
			
				if(property.option){
					this._pageLayout[this._pageLayout.length-1].values = dojo.map(property.option, function(option){ return option;/*.value;*/ });
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
				widget = dijit.byId(row.id),
				value;
			
			if (this.context) {
				this.context.blockChange(false);
			}
			
			if (widget) {
				value = widget.get('value');
				if (value && (value instanceof Date)) { // Date
					if (widget instanceof DateTextBox ) {
							value = value.toISOString().substring(0, 10);
					} else if (widget instanceof TimeTextBox ) {
							value = "T" + value.toTimeString().substring(0, 8);
					}
				}
			} else {
				var box = dojo.byId(row.id);
				var attr = box.type === 'checkbox' ? 'checked' : 'value';
				value = dojo.attr(box, attr);
			}
	
			if (row.value != value) { // keep '!=', we want type coercion from strings
				row.value = value;
				var valuesObject = {};
				valuesObject[row.target] = value;
				var compoundCommand = new CompoundCommand();
				var command = new ModifyCommand(this._widget, valuesObject, null);
				compoundCommand.add(command);
				var helper = this._widget.getHelper();
				if(helper && helper.onWidgetPropertyChange){
					helper.onWidgetPropertyChange({widget:this._widget, compoundCommand:compoundCommand, modifyCommand:command});
				}
				dojo.publish("/davinci/ui/widgetPropertiesChanges", [
					{
						source: this._editor.editor_id,
						compoundCommand: compoundCommand,
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
				if (propValue && (propValue.toISOString)) { // Date
					var format = widget.metadata.property[targetProp].format;
					if (format) {
						if (format == "date") {
							propValue = propValue.toISOString().substring(0, 10);
						} else if (format == "time" ) {
							propValue = "T" + propValue.toTimeString().substring(0, 8);
						}
					}
				}
				if (row.value != propValue) { // keep '!=', we want type coercion from strings
					row.value = propValue;
					var attr = row.type === 'boolean' ? 'checked' : 'value';

					// check if we have a dijit
					var dijitwidget = dijit.byId(row.id);
					if (dijitwidget) {
						dijitwidget.attr(attr, row.value);
					} else {
						dojo.attr(propNode, attr, row.value);
					}
				}
			}
		}
	});
});