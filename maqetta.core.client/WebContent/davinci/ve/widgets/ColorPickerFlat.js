define(["dojo/_base/declare",
        "dijit/_Widget",
        "dijit/TooltipDialog",
        "dijit/form/Button",
        "dojox/widget/ColorPicker",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare,  _Widget, TooltipDialog, Button, DojoxColorPicker, veNLS,commonNLS){
	var colorPickerProto= declare("davinci.ve.widgets.ColorPickerFlat", [_Widget], {
		
		/* change increment for spinners */
		numberDelta : 1,
		insertPosition : 1,
		data : null,
		
		postCreate : function(){
			
			this.inherited(arguments);
			var top = dojo.doc.createElement("div");
			this._colorPicker = new DojoxColorPicker({});
			top.appendChild(this._colorPicker.domNode);
			var bd = dojo.doc.createElement("div");
			
			var dijitLangObj = commonNLS;
			var okButton = Button({label:dijitLangObj.buttonOk});
			okButton.innerHtml = "OK";
			bd.appendChild(okButton.domNode);
			var cancelButton = Button({label:dijitLangObj.buttonCancel})
			bd.appendChild(cancelButton.domNode);
			top.appendChild(bd);
			
			this.domNode.appendChild(top);
			dojo.connect(okButton, "onClick", this, "_onOk");
			dojo.connect(cancelButton, "onClick", this, "onCancel");
			delete this.canceled ;
		},
	
		onClose : function(){
			
		
			
		},
		onCancel : function(){
			
			this._value = null;
			this.canceled = true;
			
		},
		_onOk : function(){
			
			delete this.canceled;
			this._value = this._colorPicker.get('value');
			this.onClose();
		},
	
		_getValueAttr : function(){
			
			return this._value;
			
			
		}, 
		
		_setValueAttr : function(value){
			// have to sanatize these values so that the color picker doesn't freak out
			var color = new dojo.Color(value);
			this._colorPicker.setColor(color.toHex());
		}
	
	});
	
	/**
	 * Static function to create a tooltip dialog that contains a ColorPickerFlat widget.
	 * @param {object} content  A ColorPickerFlat widget
	 * @param {string} initialValue  Initial color value
	 * @param {object} parentWidget  Widget with ultimately will receive color value
	 * @param {boolean} isLeftToRight  For internalization
	 */
	return dojo.mixin(colorPickerProto, {show:  function(content, initialValue, parentWidget, isLeftToRight){				
		var langObj = veNLS;
		var dialog = new TooltipDialog({id: 'maqetta_prop_tooltip_color_picker', title: langObj.selectColor, content: content});
		dijit.popup.moveOffScreen(dialog.domNode);
		var opened = false;
		
		var closePopup = function(target){ return function(){
			if(opened){
				opened = false;
				dijit.popup.close(dialog);
				//this.box.focus();
			}
		};
		}();
		
		dialog.connect(content, "onCancel", closePopup);
		dialog.connect(content, "onClose", closePopup);
		
		var colorpicker = dijit.byNode(dojo.query("[widgetId]", dialog.domNode)[0]);
		
		var popup = function(target) {
			return function(){
	//FIXME: Research _isReadOnly - take care of it at a higher level?
				//OLD if(this._isReadOnly){
				//OLD return;
				//OLD }
				dijit.popup.open({
					//parent: target._dropDown,
					parent: parentWidget,
					popup: dialog,
					//around: target._dropDown.domNode,
					around: parentWidget.domNode,
					orient:
						// TODO: add user-defined positioning option, like in Tooltip.js
						isLeftToRight ? {'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'}
						: {'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'},
					onClose: function(){
						if(!colorpicker.canceled){
							// This is part of some convoluted logic to deal with complex interactions
							// between Background.js, BackgroundDialog.js and Cascade.js.
							// The onChange function in Background.js needs to know whether an onChange
							// event was due to Maqetta logic changing the value or user changing
							// value. If Maqetta is changing value, then Cascade.js shouldn't prompt
							// user for read-only themes or global theme changes to read/write themes.
							if(parentWidget._colorPickerFlat_comboBoxUpdateDueTo){
								parentWidget._comboBoxUpdateDueTo = parentWidget._colorPickerFlat_comboBoxUpdateDueTo;
							}
							//var oldValue = target._dropDown.get("value");
							var oldValue = parentWidget.get("value");
							//target._dropDown.set("value", colorpicker.get("value"));
							parentWidget.set("value", colorpicker.get("value"));
						}
						
						closePopup();
						dialog.destroy();
						/*
						if(!colorpicker.canceled && oldValue!=colorpicker.get("value")) 
							target.onChange();
					    */
					}
				});
		
				opened = true;
		
				dijit.focus(dialog.containerNode);
			};
		};
		
		if(initialValue in dojo.Color.named){
			
			var value = dojo.colorFromString(initialValue);
			content.set('value', value.toHex());
		}else{
			content.set('value', initialValue || "", true);
		}
		popup()();
	}});
});
