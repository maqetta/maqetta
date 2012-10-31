define(["dojo/_base/declare",
        "dojo/Deferred",
        "davinci/workbench/WidgetLite",
        "davinci/ve/widgets/ColorPickerFlat",
        "davinci/ve/widgets/ColorStore",
        "davinci/ve/widgets/MutableStore",
        "dijit/form/ComboBox",
        "davinci/ve/widgets/BackgroundDialog",
        "davinci/Workbench",
        "davinci/ve/utils/URLRewrite",
        "davinci/model/Path",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/utils/CssUtils",
        "davinci/ve/widgets/ColorPicker"
        

],function(declare, Deferred, WidgetLite, ColorPickerFlat, ColorStore, MutableStore, ComboBox,BackgroundDialog, Workbench, URLRewrite, Path, veNLS, commonNLS, CssUtils, ColorPicker){
	var idPrefix = "davinci_ve_widgets_properties_border_generated"
	var	__id=0,
		getId = function(){
			return idPrefix + (__id++);
		};

	return declare("davinci.ve.widgets.Background", [WidgetLite], {
		__id: 0,

		data: null,

		buildRendering: function(){
			this.domNode =   dojo.doc.createElement("div",{style:"width:100%"});
			this._textFieldId = getId();
			this._buttonId = getId();
	
			var buttonDiv = dojo.create("div", {className:'bgPropButtonDiv', style:'float:right; width:28px;'});
			var button = dojo.create("button", {innerHTML:'...', id:this._buttonId, className:'bgPropButton', style:'font-size:1em;'}, buttonDiv);
	
			var marginRight = 38;
			var colorswatch = this._colorswatch = (this.colorswatch == 'true');
			
			if(colorswatch){
				marginRight = 56;
				var buttonDiv2 = dojo.doc.createElement("div");
				dojo.addClass(buttonDiv2, 'colorPicker');
				this._selectedColor = dojo.doc.createElement("div");
				this._selectedColor.innerHTML = "&nbsp;";
				dojo.addClass(this._selectedColor, 'colorPickerSelected');
				dojo.addClass(this._selectedColor, 'colorPickerSelectedSkinny');
				
				this._colorPickerFlat = new ColorPickerFlat({});
			}
			
			var comboDiv = dojo.create("div", {className:'bgPropComboDiv', style:'margin-right:' + marginRight + 'px;padding:1px 0;'});
	 		var values = dojo.isArray(this.data) ? this.data : [''];
			var langObjVE = this.langObjVE = veNLS;
			
	 		if(colorswatch){
				//FIXME: Following code is mostly a copy/paste from ColorPicker.js
				//Should be refactored into a shared utility
				this._statics = ["", davinci.ve.widgets.ColorPicker.divider, langObjVE.colorPicker, langObjVE.removeValue];
				this._run = {};
				if(!this.data ){
					this.data=[{value:this._statics[0]}];
					this.data.push({value:this._statics[2],run:this._chooseColorValue});
					this.data.push({value:this._statics[3],run:function(){
						this.set('value','');
					}});
					this.data.push({value:this._statics[1]});   
					this.data.push({value:'transparent'});
					this.data.push({value:'black'});
					this.data.push({value:'white'});
					this.data.push({value:'red'});
					this.data.push({value:'green'});
					this.data.push({value:'blue'});
				}else{
					this.data.push({value:davinci.ve.widgets.ColorPicker.divider});
					this.data.push({value:langObj.removeValue,run:function(){
						this.set('value','');
					}});
				}
				var displayValues = [];
				for(var i = 0;i<this.data.length;i++){
					displayValues.push(this.data[i].value);
					if(this.data[i].run){
						this._run[this.data[i].value] = this.data[i].run;
					}
				}
				this._store = new ColorStore({values:displayValues, noncolors:this._statics});
	 		}else{
	 			this._store = new MutableStore({values:values});
	 		}
			this._comboBox = new ComboBox({store:this._store, id:this._textFieldId, style:'width:100%;'});
			comboDiv.appendChild(this._comboBox.domNode);
			this.domNode.appendChild(buttonDiv);
	
			if(colorswatch){
				this.domNode.appendChild(buttonDiv2);
				dojo.connect(buttonDiv2,'onclick',dojo.hitch(this,function(event){
					dojo.stopEvent(event);
					this._chooseColorValue();
				}));
				buttonDiv2.appendChild(this._selectedColor);
				// Part of convoluted logic to make sure onChange logic doesn't trigger
				// ask user prompts for read-only themes or global theme changes to read/write themes
				// ColorPickerFlat.js uses this long-winded property
				this._colorPickerFlat_comboBoxUpdateDueTo = 'colorSwatch';
			}
	
			this.domNode.appendChild(comboDiv);
		
			if(typeof this.propname == 'string' && this._comboBox){
				if(!davinci.ve._BackgroundWidgets){
					davinci.ve._BackgroundWidgets = {};
				}
				// Add to cross-reference table for all of the background properties.
				// This table is used by Background palette.
				davinci.ve._BackgroundWidgets[this.propname] = {
						propPaletteWidget: this,
						comboBox: this._comboBox
				};
			}
			this.inherited(arguments);
		},
	
		startup : function(){
			this.inherited(arguments);
		
			this._button = dojo.byId(this._buttonId);
			dojo.connect(this._button,"onclick",this,function(){
				//FIXME: this._valueArray = widget._valueArrayNew;
				var context = (this._cascade && this._cascade._widget && this._cascade._widget.getContext)
						? this._cascade._widget.getContext() : null;
	
				var background = new BackgroundDialog({context:context});	
				var executor = dojo.hitch(this, function(background){
					if(!context){
						console.error('Background.js. no context');
						return;
					}
					
					// Variables used to deal with complexities around attempting to change
					// multiple properties at once given that the property changes might
					// be targeting read-only CSS files or read-write theme CSS files,
					// both of which generate an (async) modal dialog in Cascade.js.
					// The logic in this routine ensures that each of the N properties
					// that are changed are processed in a particular order, thus ensuring
					// Cascade.js has prompted user (if necessary) on first property before we
					// invoke logic to update other properties.
					// There are actually two bits of async logic that make things difficult.
					// First, dojo's onchange handlers are launched in a timeout.
					// Second, Cascade.js modal dialogs are also async.
					var cascadeBatch = context.cascadeBatch = {};
					var propNum = 0;
					var propList = cascadeBatch.propList = [];	// Array of properties whose values actually changed
					var actions = cascadeBatch.actions = {};	// per-prop: logic to change the combox box on properties palette
					var deferreds = cascadeBatch.deferreds = {};	// per-prop: Deferred objects to help with managing async issues
					cascadeBatch.askUserResponse = undefined;
					
					// Call buildBackgroundImage to convert the bgddata object
					// into an array of background-image property declarations
					// which cause gradients to magically work across different browsers.
					if(!background.cancel){
						var xref = davinci.ve._BackgroundWidgets;
						for(var propName in xref){
							var o = xref[propName];
							if(o.bgdWidget){
								var newValue = o.bgdWidget.get('value');
								var oldValue = o.propPaletteWidget.get('value');
								if(newValue !== oldValue){
									propList.push(propName);
									actions[propName] = dojo.hitch(this, function(o, newValue){
										o.propPaletteWidget._comboBoxUpdateDueTo = 'backgroundDialog';
										o.propPaletteWidget.set('value', newValue);
									}, o, newValue);
									deferreds[propName] = new Deferred();
								}
							}
						}
						var propName = 'background-image';
						var o = xref[propName];
						var a = CssUtils.buildBackgroundImage(background.bgddata);
						for(var i=0; i<a.length; i++){
							var val = a[i];
							if(URLRewrite.containsUrl(val) && !URLRewrite.isAbsolute(val)){
								var urlInside = URLRewrite.getUrl(val);
								if(urlInside){
									var urlPath = new Path(urlInside);
									var relativeUrl = urlPath.toString();
									val = 'url(\'' + relativeUrl + '\')';
								}
								a[i] = val;
							}
						}
						var newValue;
						if(a.length == 0){
							newValue = '';
						}else{
							newValue = a[a.length-1];
						}
						var oldValue = o.propPaletteWidget.get('value');
						if(newValue !== oldValue){
							// Hack: put the values array onto the cascade object with assumption
							// that cascade object's onChange callback will know how to deal with the array
							// Used by Cascade.js:_onFieldChange()
							if(o.propPaletteWidget._cascade){
								o.propPaletteWidget._cascade._valueArrayNew = a;
							}
							propList.push(propName);
							actions[propName] = dojo.hitch(this, function(i, newValue){
								o.propPaletteWidget._comboBoxUpdateDueTo = 'backgroundDialog';
								o.propPaletteWidget.set('value', newValue);
							}, o, newValue);
							deferreds[propName] = new Deferred();
						}
						for(var i=0; i<propList.length; i++){
							var propName = propList[i];
							var deferred = deferreds[propName];
							deferred.then(dojo.hitch(this, function(propNum){
								// Trigger change in next property
								var propName = propList[propNum+1];
								if(propName){
									actions[propName].apply();
								}else{
									// All done with all properties
									delete context.cascadeBatch;
								}
							}, i));
						}
						// Trigger change in first property
						if(propList.length > 0){
							var propName = propList[0];
							actions[propName].apply();
						}
					}
					return true;
				}, background);
				var xref = davinci.ve._BackgroundWidgets;
				for(var propName in xref){
					var o = xref[propName];
					var cascade = o.propPaletteWidget._cascade;
					if(cascade){
						// Before launching dialog, make sure all _valueArrayNew properties
						// are equivalenced to existing _valueArray so that we don't trigger
						// changes when no changes have actually been made.
						cascade._valueArrayNew = cascade._valueArray;
					}
				}
				background.set('baseLocation', this._baseLocation);
				Workbench.showModal(background, "Background", '', executor);
			});
			this.connect(this._comboBox, 'onChange', dojo.hitch(this, function(event){
				// If new value is divider or color picker, reset the value in the ComboBox to previous value
				//FIXME: This is a hack to overcome fact that choosing value in ComboBox menu
				//causes the textbox to get whatever was selected in menu, even when it doesn't represent
				//a valid color vlaue. Resetting it here resets the value before Cascade.js gets invoked 
				//due to call to this.onChange() 
				if(event == davinci.ve.widgets.ColorPicker.divider || event == this.langObjVE.colorPicker){
					this._comboBox.set('value', this.value);
				}
				// If onChange was triggered by an internal update to the text field,
				// don't invoke onChange() function (which triggers update logic in Cascade.js).
				// You see, Cascade.js logic can't tell difference between user changes to a field
				// versus software updates to the field, such as due to a new widget selection.
				var dueTo = this._comboBoxUpdateDueTo;
				this._comboBoxUpdateDueTo = undefined;
				if(dueTo == 'setAttr'){
					return;
				}
				this._onChange(event);
			}));
			this.connect(this._comboBox, 'onFocus', dojo.hitch(this, function(event){
				// If focus goes into any of the background text fields, then
				// clear out any leftover _valueArrayNew values on cascade objects
				var xref = davinci.ve._BackgroundWidgets;
				for(var propName in xref){
					var o = xref[propName];
					var cascade = o.propPaletteWidget._cascade;
					if(cascade){
						cascade._valueArrayNew = undefined;
					}
				}
				var context = (this._cascade && this._cascade._widget && this._cascade._widget.getContext)
						? this._cascade._widget.getContext() : null;
				if(context){
					delete context.cascadeBatch;
				}
			}));
			this._maqStartupComplete = true;
		},
		/*
		 * This is the base location for the file in question.  Used to caluclate relativity for url(...)
		 */
		_setBaseLocationAttr : function(baseLocation){
			this._baseLocation = baseLocation;
			
		},
		_setValueAttr : function(value){
			 
			// value is now an array if there are more than one of a given property for the selected rule
			
			var oldComboBoxValue = this._comboBox.get('value');
			var newComboBoxValue;
			//this.value = value;
			if(this._colorswatch){
				dojo.style(this._selectedColor, "backgroundColor", value);
			}
			/* check if array or single value.  If its a single value we'll just set the text box to that value */
			if(!dojo.isArray(value)){
				newComboBoxValue = value;
			}else if(value.length>0){
				newComboBoxValue = value[value.length-1];
			}else{
				newComboBoxValue = '';
			}
			if(oldComboBoxValue !== newComboBoxValue){
				// Flag to tell onChange handler to not invoke onChange logic
				// within Cascade.js
				if(this._comboBoxUpdateDueTo !== 'backgroundDialog' && this._comboBoxUpdateDueTo !== 'colorSwatch' ){
					this._comboBoxUpdateDueTo = 'setAttr';	
				}
				this._comboBox.set('value', newComboBoxValue);
			}
	
		},
		_onChange : function(event){
			//FIXME: First part of this routine is largely copied/pasted code from ColorPicker.js
			//Maybe consolidate?
			if(this._colorswatch && typeof event == 'string'){
				if(event in this._run){
					dojo.hitch(this,this._run[event])();
				}else if (event == davinci.ve.widgets.ColorPicker.divider){
					this._comboBox.set("value", this._store.getItemNumber(0));
				//}else if(!this._store.contains(event)){
					//this._store.insert(this.insertPosition, event);
					//dojo.style(this._selectedColor, "backgroundColor", event);
				}else{
					dojo.style(this._selectedColor, "backgroundColor", event);
				}
			}
	
			var value = this._comboBox.get("value");
			this.value = value;
			this.onChange(event);
		},
		
		onChange : function(event){},
		
		_getValueAttr : function(){
			return this._comboBox.get("value");
			
		},
		
		_setReadOnlyAttr: function(isReadOnly){
			if(!this._maqStartupComplete){
				return;
			}
			this._isReadOnly = isReadOnly;
			this._comboBox.set("disabled", isReadOnly);
			this._button.disabled = isReadOnly;
		},
		
		_chooseColorValue: function() {
			if(this._isReadOnly){
				return;
			}
			var initialValue = this._comboBox.get("value");
			var isLeftToRight = this.isLeftToRight();
			davinci.ve.widgets.ColorPickerFlat.show(this._colorPickerFlat, initialValue, this, isLeftToRight);
		}
	
		
	});

	
});
