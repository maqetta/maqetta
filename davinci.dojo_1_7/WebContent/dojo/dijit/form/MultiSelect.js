define(["dojo", "..", "./_FormWidget"], function(dojo, dijit){

// module:
//		dijit/form/MultiSelect
// summary:
//		Widget version of a <select multiple=true> element,
//		for selecting multiple options.

dojo.declare("dijit.form.MultiSelect", dijit.form._FormValueWidget, {
	// summary:
	//		Widget version of a <select multiple=true> element,
	//		for selecting multiple options.

	// size: Number
	//		Number of elements to display on a page
	//		NOTE: may be removed in version 2.0, since elements may have variable height;
	//		set the size via style="..." or CSS class names instead.
	size: 7,

	templateString: "<select multiple='true' ${!nameAttrSetting} dojoAttachPoint='containerNode,focusNode' dojoAttachEvent='onchange: _onChange'></select>",

	addSelected: function(/*dijit.form.MultiSelect*/ select){
		// summary:
		//		Move the selected nodes of a passed Select widget
		//		instance to this Select widget.
		//
		// example:
		// |	// move all the selected values from "bar" to "foo"
		// | 	dijit.byId("foo").addSelected(dijit.byId("bar"));

		select.getSelected().forEach(function(n){
			this.containerNode.appendChild(n);
			// scroll to bottom to see item
			// cannot use scrollIntoView since <option> tags don't support all attributes
			// does not work on IE due to a bug where <select> always shows scrollTop = 0
			this.domNode.scrollTop = this.domNode.offsetHeight; // overshoot will be ignored
			// scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
			var oldscroll = select.domNode.scrollTop;
			select.domNode.scrollTop = 0;
			select.domNode.scrollTop = oldscroll;
		},this);
		this._set('value', this.get('value'));
	},

	getSelected: function(){
		// summary:
		//		Access the NodeList of the selected options directly
		return dojo.query("option",this.containerNode).filter(function(n){
			return n.selected; // Boolean
		}); // dojo.NodeList
	},

	_getValueAttr: function(){
		// summary:
		//		Hook so get('value') works.
		// description:
		//		Returns an array of the selected options' values.
		return this.getSelected().map(function(n){
			return n.value;
		});
	},

	multiple: true, // for Form

	_setValueAttr: function(/*Array*/ values, /*Boolean?*/ priorityChange){
		// summary:
		//		Hook so set('value', values) works.
		// description:
		//		Set the value(s) of this Select based on passed values
		dojo.query("option",this.containerNode).forEach(function(n){
			n.selected = (dojo.indexOf(values,n.value) != -1);
		});
		this.inherited(arguments);
	},

	invertSelection: function(/*Boolean?*/ onChange){
		// summary:
		//		Invert the selection
		// onChange: Boolean
		//		If false, onChange is not fired.
		var val = [];
		dojo.query("option",this.containerNode).forEach(function(n){
			if(!n.selected){ val.push(n.value); }
		});
		this._setValueAttr(val, !(onChange === false || onChange == null));
	},

	_onChange: function(/*Event*/ e){
		this._handleOnChange(this.get('value'), true);
	},

	// for layout widgets:
	resize: function(/*Object*/ size){
		if(size){
			dojo.marginBox(this.domNode, size);
		}
	},

	postCreate: function(){
		this._set('value', this.get('value'));
		this.inherited(arguments);
	}
});


return dijit.form.MultiSelect;
});
