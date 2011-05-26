define([
	"dojo",
	".",
	"dojo/text!./templates/CheckedMenuItem.html", "./hccss",
	"./MenuItem"], function(dojo, dijit, template){

	// module:
	//		dijit/CheckedMenuItem
	// summary:
	//		A checkbox-like menu item for toggling on and off

	dojo.declare("dijit.CheckedMenuItem", dijit.MenuItem, {
		// summary:
		//		A checkbox-like menu item for toggling on and off

		templateString: template,

		// checked: Boolean
		//		Our checked state
		checked: false,
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			dojo.toggleClass(this.domNode, "dijitCheckedMenuItemChecked", checked);
			this.domNode.setAttribute("aria-checked", checked);
			this._set("checked", checked);
		},

		onChange: function(/*Boolean*/ checked){
			// summary:
			//		User defined function to handle check/uncheck events
			// tags:
			//		callback
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(!this.disabled){
				this.set("checked", !this.checked);
				this.onChange(this.checked);
			}
			this.inherited(arguments);
		}
	});

	return dijit.CheckedMenuItem;
});
