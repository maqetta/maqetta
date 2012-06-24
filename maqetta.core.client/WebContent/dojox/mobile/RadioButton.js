define([
	"dojo/_base/declare",
	"dijit/form/_RadioButtonMixin",
	"./CheckBox"
], function(declare, RadioButtonMixin, CheckBox){

	return declare("dojox.mobile.RadioButton", [CheckBox, RadioButtonMixin], {
		// summary:
		//		A non-templated radiobutton widget that can be in two states (checked or not).

		// Override automatic assigning type --> node, it causes exception on IE8.
		// Instead, type must be specified as this.type when the node is created, as part of the original DOM
		_setTypeAttr: null,

		baseClass: "mblRadioButton"
	});
});
