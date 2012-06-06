define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase"
], function(array, declare, Contained, Container, WidgetBase){

	// module:
	//		dojox/mobile/_PickerBase
	// summary:
	//		A base class for picker classes (e.g. SpinWheel, ValuePicker)

	return declare("dojox.mobile._PickerBase", [WidgetBase, Container, Contained], {
		// summary:
		//		dojox/mobile/_PickerBase

		/* internal properties */

		// slotClasses: [protected] Array
		//		An array of slot classes. This property is intended to be used
		//		when you create a subclass of this widget that has specific slots.
		slotClasses: [],

		// slotProps: [protected] Array
		//		An array of property objects for each slot class specified in
		//		slotClasses. This property is intended to be used when you
		//		create a subclass of this widget that has specific slots.
		slotProps: [],

		// slotOrder: [protected] Array
		//		An array of index of slotClasses and slotProps.
		//		If there are three slots and slotOrder=[2,1,0], the slots are
		//		displayed in reverse order. This property is intended to be used
		//		when you create a subclass of this widget that has specific slots.
		slotOrder: [],

		buildRendering: function(){
			this.inherited(arguments);
			this.slots = [];
			for(var i = 0; i < this.slotClasses.length; i++){
				var idx = this.slotOrder.length ? this.slotOrder[i] : i;
				var slot = new this.slotClasses[idx](this.slotProps[idx]);
				this.addChild(slot);
				this.slots[idx] = slot;
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			this.reset();
		},

		getSlots: function(){
			// summary:
			//		Returns an array of child slot widgets.
			return this.slots.length ? this.slots :
				array.filter(this.getChildren(), function(c){
					return c.declaredClass.indexOf("Slot") !== -1;
				});
		},

		_getValuesAttr: function(){
			// summary:
			//		Returns an array of slot values.
			return array.map(this.getSlots(), function(w){
				return w.get("value");
			});
		},

		_setValuesAttr: function(/*Array*/a){
			// summary:
			//		Sets the slot values.
			array.forEach(this.getSlots(), function(w, i){
				w.set("value", a[i]);
			});
		},

		_setColorsAttr: function(/*Array*/a){
			// summary:
			//		Sets the slot colors.
			array.forEach(this.getSlots(), function(w, i){
				w.setColor && w.setColor(a[i]);
			});
		},

		reset: function(){
			// summary:
			//		Resets the picker to show the initial values.
			array.forEach(this.getSlots(), function(w){
				w.setInitialValue();
			});
		}
	});
});
