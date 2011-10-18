dojo.provide("davinci.de.widgets.NewDijit");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");

dojo.require("dojox.widget.Standby");

dojo.declare("davinci.de.widgets.NewDijit",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.de.widgets", "templates/NewDijit.html"),
	_okButton: null,
	_dijitName : null,
	
	postMixInProperties : function() {
		this.inherited(arguments);
	},
	
	postCreate : function(){
		this.inherited(arguments);
		dojo.connect(this._dijitName, "onkeyup", this, '_checkValid');
		
	},
	
	
	_checkValid : function(){
		// make sure the Dijit name is OK.
		var name = dojo.attr(this._dijitName, "value");
		var valid = (name!=null);
		this._okButton.set( 'disabled', !valid);
	},
	
	okButton : function(){
		this.value = dojo.attr(this._dijitName, "value");
		this.onClose();
	},
	

	
	_getValueAttr : function(){
		return this.value;
	},
	cancelButton: function(){
		this.onClose();
	},

	onClose : function(){}


	


});