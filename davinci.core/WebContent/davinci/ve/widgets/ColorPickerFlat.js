dojo.provide("davinci.ve.widgets.ColorPickerFlat");

dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.ComboBox");
dojo.require("dojox.widget.ColorPicker");
dojo.require("davinci.ve.widgets.ColorStore");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.Button");

dojo.requireLocalization("dijit", "common");

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