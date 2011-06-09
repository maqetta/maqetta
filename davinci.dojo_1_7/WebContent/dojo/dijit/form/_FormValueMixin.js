define([
	"dojo/_base/kernel",
	"..",
	"./_FormWidgetMixin",
	"dojo/_base/connect", // dojo.keys.ESCAPE
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/html", // dojo.attr
	"dojo/_base/sniff" // dojo.isIE dojo.isQuirks
], function(dojo, dijit){

	// module:
	//		dijit/form/_FormValueMixin
	// summary:
	//		Mixin for widgets corresponding to native HTML elements such as <input> or <select> that have user changeable values.

	return dojo.declare("dijit.form._FormValueMixin", dijit.form._FormWidgetMixin, {
		// summary:
		//		Mixin for widgets corresponding to native HTML elements such as <input> or <select> that have user changeable values.
		// description:
		//		Each _FormValueMixin represents a single input value, and has a (possibly hidden) <input> element,
		//		to which it serializes it's input value, so that form submission (either normal submission or via FormBind?)
		//		works as expected.

		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,

		_setReadOnlyAttr: function(/*Boolean*/ value){
			dojo.attr(this.focusNode, 'readOnly', value);
			this.focusNode.setAttribute("aria-readonly", value);
			this._set("readOnly", value);
		},

		postCreate: function(){
			this.inherited(arguments);

			if(dojo.isIE){ // IE won't stop the event with keypress
				this.connect(this.focusNode || this.domNode, "onkeydown", this._onKeyDown);
			}
			// Update our reset value if it hasn't yet been set (because this.set()
			// is only called when there *is* a value)
			if(this._resetValue === undefined){
				this._lastValueReported = this._resetValue = this.value;
			}
		},

		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', value) works.
			// description:
			//		Sets the value of the widget.
			//		If the value has changed, then fire onChange event, unless priorityChange
			//		is specified as null (or false?)
			this._handleOnChange(newValue, priorityChange);
		},

		_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Called when the value of the widget has changed.  Saves the new value in this.value,
			//		and calls onChange() if appropriate.   See _FormWidget._handleOnChange() for details.
			this._set("value", newValue);
			this.inherited(arguments);
		},

		undo: function(){
			// summary:
			//		Restore the value to the last value passed to onChange
			this._setValueAttr(this._lastValueReported, false);
		},

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this._hasBeenBlurred = false;
			this._setValueAttr(this._resetValue, true);
		},

		_onKeyDown: function(e){
			if(e.keyCode == dojo.keys.ESCAPE && !(e.ctrlKey || e.altKey || e.metaKey)){
				var te;
				if(dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)){
					e.preventDefault(); // default behavior needs to be stopped here since keypress is too late
					te = document.createEventObject();
					te.keyCode = dojo.keys.ESCAPE;
					te.shiftKey = e.shiftKey;
					e.srcElement.fireEvent('onkeypress', te);
				}
			}
		}
	});
});
