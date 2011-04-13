dojo.provide("dojox.form.CheckedMultiSelect");

dojo.require("dijit.form.CheckBox");
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
		//		(only on click of the checkbox)  Radio-based calls _setValueAttr
		//		instead.
		if(this.get("disabled") || this.get("readOnly")){ return; }
		if(this.parent.multiple){
			this.option.selected = this.checkBox.attr('value') && true;
		}else{
			this.parent.attr('value', this.option.value);
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
		this.checkBox.attr('value', this.option.selected);
	},
	
	_setDisabledAttr: function(value){
		// summary:
		//		Disables (or enables) all the children as well
		this.disabled = value||this.option.disabled;
		this.checkBox.attr("disabled", this.disabled);
		dojo.toggleClass(this.domNode, "dojoxMultiSelectDisabled", this.disabled);
	},
	
	_setReadOnlyAttr: function(value){
		// summary:
		//		Sets read only (or unsets) all the children as well
		this.checkBox.attr("readOnly", value);
		this.readOnly = value;
	}
});

dojo.declare("dojox.form.CheckedMultiSelect", dijit.form._FormSelectWidget, {
	// summary:
	//		Extends the core dijit MultiSelect to provide a "checkbox" selector

	templateString: dojo.cache("dojox.form", "resources/CheckedMultiSelect.html"),

	baseClass: "dojoxMultiSelect",

	_onMouseDown: function(e){
		// summary:
		//		Cancels the mousedown event to prevent others from stealing
		//		focus
		dojo.stopEvent(e);
	},
	
	_addOptionItem: function(/* dojox.form.__SelectOption */ option){
		this.wrapperDiv.appendChild(new dojox.form._CheckedMultiSelectItem({
			option: option,
			parent: this
		}).domNode);
	},
	
	_updateSelection: function(){
		this.inherited(arguments);
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
			if(node && node.attr){
				node.attr("disabled", value);
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
			if(node && node.attr){
				node.attr("readOnly", value);
			}
		});
	},

	uninitialize: function(){
		// Make sure these children are destroyed
		dojo.forEach(this._getChildren(), function(child){
			child.destroyRecursive();
		});
		this.inherited(arguments);
	}
});
