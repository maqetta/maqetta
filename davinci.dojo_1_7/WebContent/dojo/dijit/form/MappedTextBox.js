define([
	"dojo/_base/kernel",
	"..",
	"./ValidationTextBox",
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/html" // dojo.place
], function(dojo, dijit){

	// module:
	//		dijit/form/MappedTextBox
	// summary:
	//		A dijit.form.ValidationTextBox subclass which provides a base class for widgets that have
	//		a visible formatted display value, and a serializable
	//		value in a hidden input field which is actually sent to the server.

	dojo.declare("dijit.form.MappedTextBox", dijit.form.ValidationTextBox, {
		// summary:
		//		A dijit.form.ValidationTextBox subclass which provides a base class for widgets that have
		//		a visible formatted display value, and a serializable
		//		value in a hidden input field which is actually sent to the server.
		// description:
		//		The visible display may
		//		be locale-dependent and interactive.  The value sent to the server is stored in a hidden
		//		input field which uses the `name` attribute declared by the original widget.  That value sent
		//		to the server is defined by the dijit.form.MappedTextBox.serialize method and is typically
		//		locale-neutral.
		// tags:
		//		protected

		postMixInProperties: function(){
			this.inherited(arguments);

			// we want the name attribute to go to the hidden <input>, not the displayed <input>,
			// so override _FormWidget.postMixInProperties() setting of nameAttrSetting
			this.nameAttrSetting = "";
		},

		// Override default behavior to assign name to focusNode
		_setNameAttr: null,

		serialize: function(/*anything*/ val, /*Object?*/ options){
			// summary:
			//		Overridable function used to convert the get('value') result to a canonical
			//		(non-localized) string.  For example, will print dates in ISO format, and
			//		numbers the same way as they are represented in javascript.
			// tags:
			//		protected extension
			return val.toString ? val.toString() : ""; // String
		},

		toString: function(){
			// summary:
			//		Returns widget as a printable string using the widget's value
			// tags:
			//		protected
			var val = this.filter(this.get('value')); // call filter in case value is nonstring and filter has been customized
			return val != null ? (typeof val == "string" ? val : this.serialize(val, this.constraints)) : ""; // String
		},

		validate: function(){
			// Overrides `dijit.form.TextBox.validate`
			this.valueNode.value = this.toString();
			return this.inherited(arguments);
		},

		buildRendering: function(){
			// Overrides `dijit._TemplatedMixin.buildRendering`

			this.inherited(arguments);

			// Create a hidden <input> node with the serialized value used for submit
			// (as opposed to the displayed value).
			// Passing in name as markup rather than calling dojo.create() with an attrs argument
			// to make dojo.query(input[name=...]) work on IE. (see #8660)
			this.valueNode = dojo.place("<input type='hidden'" + (this.name ? " name='" + this.name.replace(/'/g, "&quot;") + "'" : "") + "/>", this.textbox, "after");
		},

		reset: function(){
			// Overrides `dijit.form.ValidationTextBox.reset` to
			// reset the hidden textbox value to ''
			this.valueNode.value = '';
			this.inherited(arguments);
		}
	});

	return dijit.form.MappedTextBox;
});
