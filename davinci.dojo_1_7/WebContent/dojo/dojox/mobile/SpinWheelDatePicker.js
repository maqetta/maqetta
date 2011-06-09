define(["dojo/date","dojo/date/locale","./SpinWheel","./SpinWheelSlot"],function(ddate,datelocale,SpinWheel,SpinWheelSlot){
	// module:
	//		dojox/mobile/SpinWheelDatePicker
	// summary:
	//		TODOC

	var SpinWheelYearSlot = dojo.declare(dojox.mobile.SpinWheelSlot, {
		buildRendering: function(){
			this.labels = [];
			if(this.labelFrom !== this.labelTo){
				var dtA = new Date(this.labelFrom, 0, 1);
				var i, idx;
				for(i = this.labelFrom, idx = 0; i <= this.labelTo; i++, idx++){
					dtA.setFullYear(i);
					this.labels.push(dojo.date.locale.format(dtA,{datePattern:"yyyy", selector:"date"}));
				}
			}
			this.inherited(arguments);
		}
	});

	var SpinWheelMonthSlot = dojo.declare(dojox.mobile.SpinWheelSlot, {
		buildRendering: function(){
			this.labels = [];
			var dtA = new Date(2000, 0, 1);
			var monthStr;
			for(var i = 0; i < 12; i++){
				dtA.setMonth(i);
				monthStr = dojo.date.locale.format(dtA,{datePattern:"MMM", selector:"date"});
				this.labels.push(monthStr);
			}
			this.inherited(arguments);
		}
	});

	var SpinWheelDaySlot = dojo.declare(dojox.mobile.SpinWheelSlot, {});



	return dojo.declare("dojox.mobile.SpinWheelDatePicker", dojox.mobile.SpinWheel, {
		slotClasses: [
			SpinWheelYearSlot,
			SpinWheelMonthSlot,
			SpinWheelDaySlot
		],
		slotProps: [
			{labelFrom:1970, labelTo:2038},
			{},
			{labelFrom:1, labelTo:31}
		],

		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "mblSpinWheelDatePicker");
			this.connect(this.slots[1], "onFlickAnimationEnd", "onMonthSet");
			this.connect(this.slots[2], "onFlickAnimationEnd", "onDaySet");
		},

		reset: function(){
			// goto today
			var slots = this.slots;
			var now = new Date();
			var monthStr = dojo.date.locale.format(now, {datePattern:"MMM", selector:"date"});
			this.setValue([now.getFullYear(), monthStr, now.getDate()]);
		},

		onMonthSet: function(){
			var daysInMonth = this.onDaySet();
			var disableValuesTable = {28:[29,30,31], 29:[30,31], 30:[31], 31:[]};
			this.slots[2].disableValues(disableValuesTable[daysInMonth]);
		
		},

		onDaySet: function(){
			var y = this.slots[0].getValue();
			var m = this.slots[1].getValue();
			var newMonth = dojo.date.locale.parse(y+"/"+m, {datePattern:'yyyy/MMM', selector:'date'});
			var daysInMonth = dojo.date.getDaysInMonth(newMonth);
			var d = this.slots[2].getValue();
			if(daysInMonth < d){
				this.slots[2].setValue(daysInMonth);
			}
			return daysInMonth;
		}
	});
});
