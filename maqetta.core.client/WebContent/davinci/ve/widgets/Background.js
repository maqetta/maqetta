dojo.provide("davinci.ve.widgets.Background");
dojo.require("dijit.form.ComboBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("davinci.ve.widgets.BackgroundDialog");
dojo.require("davinci.ve.widgets.MutableStore");
dojo.require("davinci.ve.utils.CssUtils");
dojo.require("davinci.ve.widgets.ColorStore");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("davinci.ve", "ve");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.ve.widgets.Background", [davinci.workbench.WidgetLite], {

	data : null,
	
	buildRendering: function(){
		this.domNode =   dojo.doc.createElement("div",{style:"width:100%"});
		this._textFieldId = davinci.ve.widgets.HTMLStringUtil.getId();
		this._buttonId = davinci.ve.widgets.HTMLStringUtil.getId();

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
		}
		
		var comboDiv = dojo.create("div", {className:'bgPropComboDiv', style:'margin-right:' + marginRight + 'px;padding:1px 0;'});
 		var values = dojo.isArray(this.data) ? this.data : [''];
 		if(colorswatch){
			//FIXME: Following code is mostly a copy/paste from ColorPicker.js
			//Should be refactored into a shared utility
			var langObjVE = dojo.i18n.getLocalization("davinci.ve", "ve");
			this._statics = ["", davinci.ve.widgets.ColorPicker.divider, langObjVE.colorPicker, langObjVE.removeValue];
			this._run = {};
			if(!this.data ){
				this.data=[{value:this._statics[0]}];
				this.data.push({value:this._statics[2],run:this._chooseColorValue});
				this.data.push({value:this._statics[3],run:function(){this.attr('value','');}});
				this.data.push({value:this._statics[1]});   
				this.data.push({value:'transparent'});
				this.data.push({value:'black'});
				this.data.push({value:'white'});
				this.data.push({value:'red'});
				this.data.push({value:'green'});
				this.data.push({value:'blue'});
			}else{
				this.data.push({value:davinci.ve.widgets.ColorPicker.divider});
				this.data.push({value:langObj.removeValue,run:function(){this.attr('value','');}});
			}
			var displayValues = [];
			for(var i = 0;i<this.data.length;i++){
				displayValues.push(this.data[i].value);
				if(this.data[i].run){
					this._run[this.data[i].value] = this.data[i].run;
				}
			}
			this._store = new davinci.ve.widgets.ColorStore({values:displayValues, noncolors:this._statics});
 		}else{
 			this._store = new davinci.ve.widgets.MutableStore({values:values});
 		}
		this._comboBox = new dijit.form.ComboBox({store:this._store, id:this._textFieldId, style:'width:100%;'});
		comboDiv.appendChild(this._comboBox.domNode);
		this.domNode.appendChild(buttonDiv);

		if(colorswatch){
			this.domNode.appendChild(buttonDiv2);
			this._colorPickerFlat = new davinci.ve.widgets.ColorPickerFlat({});
			dojo.connect(buttonDiv2,'onclick',dojo.hitch(this,function(event){
				dojo.stopEvent(event);
				if(this._isReadOnly){
					return;
				}
				var initialValue = this._comboBox.get("value");
				var isLeftToRight = this.isLeftToRight();
				davinci.ve.widgets.ColorPickerFlat.show(this._colorPickerFlat, initialValue, this, isLeftToRight);
			}));
			buttonDiv2.appendChild(this._selectedColor);
		}

		this.domNode.appendChild(comboDiv);
		//dojo.connect(this._comboBox, "onChange", this, "_onChange");
	
		if(typeof this.propname == 'string' && this._comboBox){
			// Add to cross-reference table for all of the background properties.
			// This table is used by Background palette.
			davinci.ve.widgets.Background.BackgroundWidgets[this.propname] = {
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

			var background = new davinci.ve.widgets.BackgroundDialog({});	
			var executor = dojo.hitch(this, function(background){
				// Call buildBackgroundImage to convert the bgddata object
				// into an array of background-image property declarations
				// which cause gradients to magically work across different browsers.
				if(!background.cancel){
					var xref = davinci.ve.widgets.Background.BackgroundWidgets;
					for(var propname in xref){
						var o = xref[propname];
						if(o.bgdWidget){
							var newValue = o.bgdWidget.attr('value');
							o.propPaletteWidget.attr('value', newValue);
							o.propPaletteWidget.onChange(newValue);
						}
					}
					var o = xref['background-image'];
					var a = davinci.ve.utils.CssUtils.buildBackgroundImage(background.bgddata);
					var val;
					if(a.length == 0){
						val = '';
					}else{
						val = a[a.length-1];
					}
					// Hack: put the values array onto the cascade object with assumption
					// that cascade object's onChange callback will know how to deal with the array
					// Used by Cascade.js:_onFieldChange()
					if(o.propPaletteWidget._cascade){
						o.propPaletteWidget._cascade._valueArrayNew = a;
					}
					o.propPaletteWidget.attr('value', val);
					o.propPaletteWidget.onChange();
				}
			}, background);
			var xref = davinci.ve.widgets.Background.BackgroundWidgets;
			for(var propname in xref){
				var o = xref[propname];
				var cascade = o.propPaletteWidget._cascade;
				if(cascade){
					// Before launching dialog, make sure all _valueArrayNew properties
					// are equivalenced to existing _valueArray so that we don't trigger
					// changes when no changes have actually been made.
					cascade._valueArrayNew = cascade._valueArray;
				}
			}
			background.attr('baseLocation', this._baseLocation);
			davinci.Workbench.showModal(background, "Background", 'opacity:0', executor);
		});
		this.connect(this._comboBox, 'onChange', dojo.hitch(this, function(event){
			this._onChange(event);
		}));
	},
	/*
	 * This is the base location for the file in question.  Used to caluclate relativity for url(...)
	 */
	_setBaseLocationAttr : function(baseLocation){
		this._baseLocation = baseLocation;
		
	},
	_setValueAttr : function(value){
		 
		// value is now an array if there are more than one of a given property for the selected rule
		
		if(this.value!= value ){
			this.value = value;
			if(this._colorswatch){
				dojo.style(this._selectedColor, "backgroundColor", value);
			}
			/* check if array or single value.  If its a single value we'll just set the text box to that value */
			if(!dojo.isArray(value)){
				this._comboBox.set('value', value);
				this._onChange();
			}else{
				// JON- this is where your regular expression will need to pick a value, and manipulate it for whatever format.
			}
		 }

	},
	_onChange : function(event){
		//FIXME: First part of this routine is largely copied/pasted code from ColorPicker.js
		//Maybe consolidate?
		if(this._colorswatch && typeof event == 'string'){
			if(event in this._run){
				dojo.hitch(this,this._run[event])();
			}else if (event == davinci.ve.widgets.ColorPicker.divider){
				this._comboBox.attr("value", this._store.getItemNumber(0));
			//}else if(!this._store.contains(event)){
				//this._store.insert(this.insertPosition, event);
				//dojo.style(this._selectedColor, "backgroundColor", event);
			}else{
				dojo.style(this._selectedColor, "backgroundColor", event);
			}
		}

		var value = this._comboBox.get("value");
		if(this.value != value){
			this.value = value;
		}
		this.onChange(event);
	},
	
	onChange : function(event){},
	
	_getValueAttr : function(){
		return this._comboBox.get("value");
		
	},
	
	_setReadOnlyAttr: function(isReadOnly){
		this._isReadOnly = isReadOnly;
		this._comboBox.attr("disabled", isReadOnly);
		this._button.disabled = isReadOnly;
	}

	
});

// Table of all background properties and their corresponding widgets.
davinci.ve.widgets.Background.BackgroundWidgets={};
