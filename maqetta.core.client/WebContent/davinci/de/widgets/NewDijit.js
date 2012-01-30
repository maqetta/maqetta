define(["dojo/_base/declare",
        "dijit/_Widget",
        "dijit._Templated",
        "dojo/text!./templates/NewDijit.html",
        "dijit/form/RadioButton",
        "dijit/form/TextBox",
        "dijit/form/Button"
        
       
],function(declare,  _Widget, _Templated, templateString){
	return declare("davinci.de.widgets.NewDijit",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
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
});