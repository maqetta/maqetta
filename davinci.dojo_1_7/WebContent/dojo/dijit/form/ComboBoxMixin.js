define([
	"dojo/_base/kernel", // dojo.mixin
	"..",
	"dojo/text!./templates/DropDownBox.html",
	"./_AutoCompleterMixin",
	"./_ComboBoxMenu",
	"../_HasDropDown",
	"dojo/store/DataStore", // dojo.store.DataStore
	"dojo/_base/declare" // dojo.declare
], function(dojo, dijit, template){

	// module:
	//		dijit/form/ComboBoxMixin
	// summary:
	//		Provides main functionality of ComboBox widget

	dojo.declare("dijit.form.ComboBoxMixin", [dijit._HasDropDown, dijit.form._AutoCompleterMixin], {
		// summary:
		//		Provides main functionality of ComboBox widget

		// dropDownClass: [protected extension] String
		//		Name of the dropdown widget class used to select a date/time.
		//		Subclasses should specify this.
		dropDownClass: "dijit.form._ComboBoxMenu",

		// hasDownArrow: Boolean
		//		Set this textbox to have a down arrow button, to display the drop down list.
		//		Defaults to true.
		hasDownArrow: true,

		templateString: template,

		baseClass: "dijitTextBox dijitComboBox",

		/*=====
		// store: [const] dojo.store.api.Store || dojo.data.api.Read
		//		Reference to data provider object used by this ComboBox.
		//
		//		Should be dojo.store.api.Store, but dojo.data.api.Read supported
		//		for backwards compatibility.
		store: null,
		=====*/

		// Set classes like dijitDownArrowButtonHover depending on
		// mouse action over button node
		cssStateNodes: {
			"_buttonNode": "dijitDownArrowButton"
		},

		_setHasDownArrowAttr: function(/*Boolean*/ val){
			this._set("hasDownArrow", val);
			this._buttonNode.style.display = val ? "" : "none";
		},

		_showResultList: function(){
			// hide the tooltip
			this.displayMessage("");
			this.inherited(arguments);
		},

		postMixInProperties: function(){
			// For backwards-compatibility, accept dojo.data store in addition to dojo.store.store.  Remove in 2.0
			var labelAttr = (this.store && this.store._labelAttr) || "label";
			if(this.store && !this.store.get){
				this.store = new dojo.store.DataStore({store: this.store});
			}
			this.inherited(arguments);

			// Also, user may try to access this.store.getValue(), like in a custom labelFunc() function.
			dojo.mixin(this.store, {
				getValue: function(item, attr){
					return item[attr];
				},
				getLabel: function(item){
					return item[labelAttr];
				}
			});

		}
	});

	return dijit.form.ComboBoxMixin;
});
