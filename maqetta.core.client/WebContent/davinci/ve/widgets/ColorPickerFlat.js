dojo.provide("davinci.ve.widgets.ColorPickerFlat");

dojo.require("dijit.TooltipDialog");
dojo.require("dojox.widget.ColorPicker");
dojo.require("davinci.ve.widgets.ColorStore");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "ve");

dojo.declare("davinci.ve.widgets.ColorPickerFlat", [dijit._Widget], {
	
	/* change increment for spinners */
	numberDelta : 1,
	insertPosition : 1,
	data : null,
	
	postCreate : function(){
		
		this.inherited(arguments);
		var top = dojo.doc.createElement("div");
		this._colorPicker = new dojox.widget.ColorPicker({});
		top.appendChild(this._colorPicker.domNode);
		var bd = dojo.doc.createElement("div");
		
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		var okButton = dijit.form.Button({label:dijitLangObj.buttonOk});
		okButton.innerHtml = "OK";
		bd.appendChild(okButton.domNode);
		var cancelButton = dijit.form.Button({label:dijitLangObj.buttonCancel})
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
		this._value = this._colorPicker.attr('value');
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
davinci.ve.widgets.ColorPickerFlat.show = function(content, initialValue, parentWidget, isLeftToRight){				
	var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
	var	dialog = new dijit.TooltipDialog({title: langObj.selectColor, content: content});
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
						//var oldValue = target._dropDown.attr("value");
						var oldValue = parentWidget.attr("value");
						//target._dropDown.attr("value", colorpicker.attr("value"));
						parentWidget.attr("value", colorpicker.attr("value"));
					}
					
					closePopup();
					/*
					if(!colorpicker.canceled && oldValue!=colorpicker.attr("value")) 
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
		content.attr('value', value.toHex());
	}else{
		content.attr('value', initialValue || "", true);
	}
	popup()();
};
