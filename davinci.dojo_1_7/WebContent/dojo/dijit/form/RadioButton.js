define([
	"dojo/_base/kernel",
	"..",
	"./CheckBox",
	"./_RadioButtonMixin",
	"dojo/_base/declare" // dojo.declare
], function(dojo, dijit){

	// module:
	//		dijit/form/RadioButton
	// summary:
	//		Radio button widget


	dojo.declare(
		"dijit.form.RadioButton",
		[dijit.form.CheckBox, dijit.form._RadioButtonMixin],
		{
			// summary:
			// 		Same as an HTML radio, but with fancy styling.

			baseClass: "dijitRadio"
		}
	);

	return dijit.form.RadioButton;
});
