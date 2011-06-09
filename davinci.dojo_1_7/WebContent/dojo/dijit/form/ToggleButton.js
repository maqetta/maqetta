define([
	"dojo/_base/kernel", // dojo.deprecated
	"..",
	"./Button",
	"./_ToggleButtonMixin",
	"dojo/_base/declare" // dojo.declare
], function(dojo, dijit){

	// module:
	//		dijit/form/ToggleButton
	// summary:
	//		A templated button widget that can be in two states (checked or not).


	dojo.declare("dijit.form.ToggleButton", [dijit.form.Button, dijit.form._ToggleButtonMixin], {
		// summary:
		//		A templated button widget that can be in two states (checked or not).
		//		Can be base class for things like tabs or checkbox or radio buttons

		baseClass: "dijitToggleButton",

		setChecked: function(/*Boolean*/ checked){
			// summary:
			//		Deprecated.  Use set('checked', true/false) instead.
			dojo.deprecated("setChecked("+checked+") is deprecated. Use set('checked',"+checked+") instead.", "", "2.0");
			this.set('checked', checked);
		}
	});

	return dijit.form.ToggleButton;
});
