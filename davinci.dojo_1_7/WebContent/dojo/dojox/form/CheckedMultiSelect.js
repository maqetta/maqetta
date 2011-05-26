define([
	"dojo",
	"dijit",
	"dojo/i18n",
	"dijit/_Templated",
	"dijit/_Widget",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/Tooltip",
	"dijit/form/_FormSelectWidget",
	"dijit/form/CheckBox",
	"dijit/form/ComboButton",
	"dojo/i18n!dojox/form/nls/CheckedMultiSelect"], function(dojo, dijit) {

	//	module:
	//		dojox/form/CheckedMultiSelect
	//	summary:
	//		Extends the core dojox.form.CheckedMultiSelect to provide a "checkbox" selector
	//
	
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
		this._type = this.parent.multiple ?
			{type: "checkbox", baseClass: "dijitCheckBox"} :
			{type: "radio", baseClass: "dijitRadio"};
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

dojo.declare("dojox.form._CheckedMultiSelectMenu", dijit.Menu, {
	// summary:
	//		An internally-used menu for dropdown that allows us a vertical scrollbar
	multiple: false,
	
	// summary:
	//		An internally-used menu for dropdown that allows us a vertical scrollbar
	buildRendering: function(){
		// summary:
		//		Stub in our own changes, so that our domNode is not a table
		//		otherwise, we won't respond correctly to heights/overflows
		this.inherited(arguments);
		var o = (this.menuTableNode = this.domNode),
		n = (this.domNode = dojo.create("div", {style: {overflowX: "hidden", overflowY: "scroll"}}));
		if(o.parentNode){
			o.parentNode.replaceChild(n, o);
		}
		dojo.removeClass(o, "dijitMenuTable");
		n.className = o.className + " dojoxCheckedMultiSelectMenu";
		o.className = "dijitReset dijitMenuTable";
		dijit.setWaiRole(o,"listbox");
		dijit.setWaiRole(n,"presentation");
		n.appendChild(o);
	},
	
	resize: function(/*Object*/ mb){
		// summary:
		//		Overridden so that we are able to handle resizing our
		//		internal widget.  Note that this is not a "full" resize
		//		implementation - it only works correctly if you pass it a
		//		marginBox.
		//
		// mb: Object
		//		The margin box to set this dropdown to.
		if(mb){
			dojo.marginBox(this.domNode, mb);
			if("w" in mb){
				// We've explicitly set the wrapper <div>'s width, so set <table> width to match.
				// 100% is safer than a pixel value because there may be a scroll bar with
				// browser/OS specific width.
				this.menuTableNode.style.width = "100%";
			}
		}
	},
	
	onClose: function(){
		this.inherited(arguments);
		if(this.menuTableNode){
			// Erase possible width: 100% setting from _SelectMenu.resize().
			// Leaving it would interfere with the next openDropDown() call, which
			// queries the natural size of the drop down.
			this.menuTableNode.style.width = "";
		}
	},
	
	onItemClick: function(/*dijit._Widget*/ item, /*Event*/ evt){
		// summary:
		//		Handle clicks on an item.
		// tags:
		//		private
		// this can't be done in _onFocus since the _onFocus events occurs asynchronously
		if(typeof this.isShowingNow == 'undefined'){ // non-popup menu
			this._markActive();
		}
		
		this.focusChild(item);
		
		if(item.disabled || item.readOnly){ return false; }
		
		if(!this.multiple){
			// before calling user defined handler, close hierarchy of menus
			// and restore focus to place it was when menu was opened
			this.onExecute();
		}
		// user defined handler for click
		item.onClick(evt);
	}
});

dojo.declare("dojox.form._CheckedMultiSelectMenuItem", dijit.MenuItem, {
	// summary:
	//		A checkbox-like menu item for toggling on and off

	templateString: dojo.cache("dojox.form", "resources/_CheckedMultiSelectMenuItem.html"),
	
	// option: dojox.form.__SelectOption
	//		The option that is associated with this item
	option: null,
	
	// reference of dojox.form._CheckedMultiSelectMenu
	parent: null,
	
	// icon of the checkbox/radio button
	_iconClass: "",
	
	postMixInProperties: function(){
	// summary:
	//		Set the appropriate _subClass value - based on if we are multi-
	//		or single-select
		if(this.parent.multiple){
			this._iconClass = "dojoxCheckedMultiSelectMenuCheckBoxItemIcon";
			this._type = {type: "checkbox"};
		}else{
			this._iconClass = "";
			this._type = {type: "hidden"};
		}
		this.disabled = this.option.disabled;
		this.checked = this.option.selected;
		this.label = this.option.label;
		this.readOnly = this.option.readOnly;
		this.inherited(arguments);
	},

	onChange: function(/*Boolean*/ checked){
		// summary:
		//		User defined function to handle check/uncheck events
		// tags:
		//		callback
	},
	
	_updateBox: function(){
		// summary:
		//		Called to force the box to match the state of the select
		dojo.toggleClass(this.domNode, "dojoxCheckedMultiSelectMenuItemChecked", !!this.option.selected);
		dijit.setWaiState(this.domNode, "checked", this.option.selected);
		this.inputNode.checked = this.option.selected;
		if(!this.parent.multiple){
			dojo.toggleClass(this.domNode, "dijitSelectSelectedOption", !!this.option.selected);
		}
	},
	
	_onClick: function(/*Event*/ e){
		// summary:
		//		Clicking this item just toggles its state
		// tags:
		//		private
		if(!this.disabled && !this.readOnly){
			if(this.parent.multiple){
				this.option.selected = !this.option.selected;
				this.parent.onChange();
				this.onChange(this.option.selected);
			}else{
				if(!this.option.selected){
					dojo.forEach(this.parent.getChildren(), function(item){ 
						item.option.selected = false;
					});
					this.option.selected = true;
					this.parent.onChange();
					this.onChange(this.option.selected);
				}
			}
		}
		this.inherited(arguments);
	}
});

dojo.declare("dojox.form.CheckedMultiSelect", dijit.form._FormSelectWidget, {
	// summary:
	//		Extends the core dijit MultiSelect to provide a "checkbox" selector

	templateString: dojo.cache("dojox.form", "resources/CheckedMultiSelect.html"),

	baseClass: "dojoxCheckedMultiSelect",
	
	// required: Boolean
	//		User is required to check at least one item.
	required: false,
	
	// invalidMessage: String
	//		The message to display if value is invalid.
	invalidMessage: "$_unset_$",
	
	// _message: String
	//		Currently displayed message
	_message: "",
	
	// dropDown: Boolean
	//		Drop down version or not
	dropDown: false,
	
	// labelText: String
	//		Label of the drop down button
	labelText: "",
	
	// tooltipPosition: String[]
	//		See description of `dijit.Tooltip.defaultPosition` for details on this parameter.
	tooltipPosition: [],
	
	setStore: function(store, selectedValue, fetchArgs){
		// summary:
		//		If there is any items selected in the store, the value
		//		of the widget will be set to the values of these items.
		this.inherited(arguments);
		var setSelectedItems = function(items){
			var value = dojo.map(items, function(item){ return item.value[0]; });
			if(value.length){
				this.set("value", value);
			}
		};
		this.store.fetch({query:{selected: true}, onComplete: setSelectedItems, scope: this});
	},
	
	postMixInProperties: function(){
		this.inherited(arguments);
		this._nlsResources = dojo.i18n.getLocalization("dojox.form", "CheckedMultiSelect", this.lang);
		if(this.invalidMessage == "$_unset_$"){ this.invalidMessage = this._nlsResources.invalidMessage; }
	},
	
	_fillContent: function(){
		// summary:
		//		Set the value to be the first, or the selected index
		this.inherited(arguments);
	
		// set value from selected option
		if(this.options.length && !this.value && this.srcNodeRef){
			var si = this.srcNodeRef.selectedIndex || 0; // || 0 needed for when srcNodeRef is not a SELECT
			this.value = this.options[si >= 0 ? si : 0].value;
		}
		if(this.dropDown){
			dojo.toggleClass(this.selectNode, "dojoxCheckedMultiSelectHidden");
			this.dropDownMenu = new dojox.form._CheckedMultiSelectMenu({
				id: this.id + "_menu",
				style: "display: none;",
				multiple: this.multiple,
				onChange: dojo.hitch(this, "_updateSelection")
			});
		}
	},
	
	startup: function(){
		// summary:
		//		Set the value to be the first, or the selected index
		this.inherited(arguments);
		if(this.dropDown){
			this.dropDownButton = new dijit.form.ComboButton({
				label: this.labelText,
				dropDown: this.dropDownMenu,
				baseClass: "dojoxCheckedMultiSelectButton",
				maxHeight: this.maxHeight
			}, this.comboButtonNode);
		}
	},
	
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
		if(!this.required){ return true; }
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
		var item;
		if(this.dropDown){
			item = new dojox.form._CheckedMultiSelectMenuItem({
				option: option,
				parent: this.dropDownMenu
			});
			this.dropDownMenu.addChild(item);
		}else{
			item = new dojox.form._CheckedMultiSelectItem({
				option: option,
				parent: this
			});
			this.wrapperDiv.appendChild(item.domNode);
		}
		this.onAfterAddOptionItem(item, option);
	},
	
	_refreshState: function(){
		// summary:
		//		Validate if selection changes.
		this.validate(this.focused);
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
		dojo.forEach(this._getChildren(), function(item){ 
			item._updateBox(); 
		});
		if(this.dropDown && this.dropDownButton){
			var i = 0, label = "";
			dojo.forEach(this.options, function(option){
				if(option.selected){
					i++;
					label = option.label;
				}
			});
			this.dropDownButton.set("label", this.multiple ?
				dojo.replace(this._nlsResources.multiSelectLabelText, {num: i}) :
				label);
		}
	},
	
	_getChildren: function(){
		if(this.dropDown){
			return this.dropDownMenu.getChildren();
		}else{
			return dojo.map(this.wrapperDiv.childNodes, function(n){
				return dijit.byNode(n);
			});
		}
	},

	invertSelection: function(onChange){
		// summary: Invert the selection
		// onChange: Boolean
		//		If null, onChange is not fired.
		if(this.multiple){
			dojo.forEach(this.options, function(i){
				i.selected = !i.selected;
			});
			this._updateSelection();
		}
	},

	_setDisabledAttr: function(value){
		// summary:
		//		Disable (or enable) all the children as well
		this.inherited(arguments);
		if(this.dropDown){
			this.dropDownButton.set("disabled", value);
		}
		dojo.forEach(this._getChildren(), function(node){
			if(node && node.set){
				node.set("disabled", value);
			}
		});
	},
	
	_setReadOnlyAttr: function(value){
		// summary:
		//		Sets read only (or unsets) all the children as well
		this.inherited(arguments);
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

return dojox.form.CheckedMultiSelect;
});