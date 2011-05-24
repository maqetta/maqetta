dojo.provide("dojox.form.CheckedMultiSelect");

dojo.require("dijit.form.CheckBox");
dojo.require("dijit.Tooltip");
dojo.require("dijit.form._FormSelectWidget");

dojo.declare("dojox.form._CheckedMultiSelectItem",
	[dijit._Widget, dijit._Templated],
	{
	// summary:
	//		The individual items for a CheckedMultiSelect

	widgetsInTemplate: true,
	templateString: dojo.cache("dojox.form", "resources/_CheckedMultiSelectItem.html"),

	baseClass: "dojoxMultiSelectItem",

	// option: dojox.form.__SelectOption
	//		The option that is associated with this item
	option: null,
	parent: null,
	
	// disabled: boolean
	//		Whether or not this widget is disabled
	disabled: false,

	// readOnly: boolean
	//		Whether or not this widget is readOnly
	readOnly: false,

	postMixInProperties: function(){
		// summary:
		//		Set the appropriate _subClass value - based on if we are multi-
		//		or single-select
		if(this.parent.multiple){
			this._type = {type: "checkbox", baseClass: "dijitCheckBox"};
		}else{
			this._type = {type: "radio", baseClass: "dijitRadio"};
		}
		this.disabled = this.option.disabled = this.option.disabled||false;
		this.inherited(arguments);
	},

	postCreate: function(){
		// summary:
		//		Set innerHTML here - since the template gets messed up sometimes
		//		with rich text
		this.inherited(arguments);
		this.labelNode.innerHTML = this.option.label;
	},

	_changeBox: function(){
		// summary:
		//		Called to force the select to match the state of the check box
		//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
		//		instead.
		if(this.get("disabled") || this.get("readOnly")){ return; }
		if(this.parent.multiple){
			this.option.selected = this.checkBox.get('value') && true;
		}else{
			this.parent.set('value', this.option.value);
		}
		// fire the parent's change
		this.parent._updateSelection();
		
		// refocus the parent
		this.parent.focus();
	},
	
	_onClick: function(e){
		// summary:
		//		Sets the click state (passes through to the check box)
		if(this.get("disabled") || this.get("readOnly")){
			dojo.stopEvent(e);
		}else{
			this.checkBox._onClick(e);
		}
	},
	
	_updateBox: function(){
		// summary:
		//		Called to force the box to match the state of the select
		this.checkBox.set('value', this.option.selected);
	},
	
	_setDisabledAttr: function(value){
		// summary:
		//		Disables (or enables) all the children as well
		this.disabled = value||this.option.disabled;
		this.checkBox.set("disabled", this.disabled);
		dojo.toggleClass(this.domNode, "dojoxMultiSelectDisabled", this.disabled);
	},
	
	_setReadOnlyAttr: function(value){
		// summary:
		//		Sets read only (or unsets) all the children as well
		this.checkBox.set("readOnly", value);
		this.readOnly = value;
	}
});

dojo.declare("dojox.form.CheckedMultiSelect", dijit.form._FormSelectWidget, {
	// summary:
	//		Extends the core dijit MultiSelect to provide a "checkbox" selector

	templateString: dojo.cache("dojox.form", "resources/CheckedMultiSelect.html"),

	baseClass: "dojoxMultiSelect",
	
	// required: Boolean
	//		User is required to check at least one item.
	required: false,
	
	// invalidMessage: String
	//		The message to display if value is invalid.
	invalidMessage: "At least one item must be selected.",
	
	// _message: String
	//		Currently displayed message
	_message: "",
	
	// tooltipPosition: String[]
	//		See description of `dijit.Tooltip.defaultPosition` for details on this parameter.
	tooltipPosition: [],

	_onMouseDown: function(e){
		// summary:
		//		Cancels the mousedown event to prevent others from stealing
		//		focus
		dojo.stopEvent(e);
	},
	
	validator: function() {
		// summary:
		//		Overridable function used to validate that an item is selected if required =
		//		true.
		// tags:
		//		protected
		if (!this.required){ return true; }
		return dojo.some(this.getOptions(), function(opt){
			return opt.selected && opt.value != null && opt.value.toString().length != 0;
		});
	},
	
	validate: function(isFocused) {
		dijit.hideTooltip(this.domNode);
		var isValid = this.isValid(isFocused);
		if(!isValid){ this.displayMessage(this.invalidMessage); }
		return isValid;
	},
	
	isValid: function(/*Boolean*/ isFocused) {
		// summary:
		//		Tests if the required items are selected.
		//		Can override with your own routine in a subclass.
		// tags:
		//		protected
		return this.validator();
	},

	getErrorMessage: function(/*Boolean*/ isFocused) {
		// summary:
		//		Return an error message to show if appropriate
		// tags:
		//		protected
		return this.invalidMessage;
	},
	
	displayMessage: function(/*String*/ message) {
		// summary:
		//		Overridable method to display validation errors/hints.
		//		By default uses a tooltip.
		// tags:
		//		extension
		dijit.hideTooltip(this.domNode);
		if(message){
			dijit.showTooltip(message, this.domNode, this.tooltipPosition);
		}
	},
	
	onAfterAddOptionItem: function(item, option){
		// summary:
		//		a function that can be connected to in order to receive a
		//		notification that an item as been added to this dijit.
	},
	
	_addOptionItem: function(/* dojox.form.__SelectOption */ option){
		var item = new dojox.form._CheckedMultiSelectItem({
			option: option,
			parent: this
		});
		this.wrapperDiv.appendChild(item.domNode);
		this.onAfterAddOptionItem(item, option);
	},
	
	_refreshState: function(){
		// summary:
		//		Validate if selection changes.
		this.validate(this._focused);
	},

	onChange: function(newValue){
		// summary:
		//		Validate if selection changes.
		this._refreshState();
	},
	
	reset: function(){
		// summary: Overridden so that the state will be cleared.
		this.inherited(arguments);
		dijit.hideTooltip(this.domNode);
	},
	
	_updateSelection: function(){
		this.inherited(arguments);
		this._handleOnChange(this.value);
		dojo.forEach(this._getChildren(), function(c){ c._updateBox(); });
	},
	
	_getChildren: function(){
		return dojo.map(this.wrapperDiv.childNodes, function(n){
			return dijit.byNode(n);
		});
	},

	invertSelection: function(onChange){
		// summary: Invert the selection
		// onChange: Boolean
		//		If null, onChange is not fired.
		dojo.forEach(this.options, function(i){
			i.selected = !i.selected;
		});
		this._updateSelection();
	},

	_setDisabledAttr: function(value){
		// summary:
		//		Disable (or enable) all the children as well
		this.inherited(arguments);
		dojo.forEach(this._getChildren(), function(node){
			if(node && node.set){
				node.set("disabled", value);
			}
		});
	},
	
	_setReadOnlyAttr: function(value){
		// summary:
		//		Sets read only (or unsets) all the children as well
		if("readOnly" in this.attributeMap){
			this._attrToDom("readOnly", value);
		}
		this.readOnly = value;
		dojo.forEach(this._getChildren(), function(node){
			if(node && node.set){
				node.set("readOnly", value);
			}
		});
	},

	uninitialize: function(){
		dijit.hideTooltip(this.domNode);
		// Make sure these children are destroyed
		dojo.forEach(this._getChildren(), function(child){
			child.destroyRecursive();
		});
		this.inherited(arguments);
	}
});
