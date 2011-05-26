define(["dojo/_base/html", "./ToggleButton", "dijit/form/_CheckBoxMixin"], function(dhtml,ToggleButton,CheckBoxMixin) {

	return dojo.declare("dojox.mobile.CheckBox", [dojox.mobile.ToggleButton, dijit.form._CheckBoxMixin], {
		// summary:
		//		A non-templated checkbox widget that can be in two states (checked or not).

		baseClass: "mblCheckBox",

		_setTypeAttr: function(){}, // cannot be changed: IE complains w/o this

		buildRendering: function(){
			if(!this.srcNodeRef){
				// The following doesn't work on IE < 8 if the default state is checked.
				// You have to use "<input checked>" instead but it's not worth the bytes here.
				this.srcNodeRef = dojo.create("input", {type: this.type});
			}
			this.inherited(arguments);
			this.focusNode = this.domNode;
		}
	});
});
