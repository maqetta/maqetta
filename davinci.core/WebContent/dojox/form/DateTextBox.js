dojo.provide("dojox.form.DateTextBox");
dojo.experimental("dojox.form.DateTextBox");

dojo.require("dojox.widget.Calendar");
dojo.require("dojox.widget.CalendarViews");
dojo.require("dijit.form._DateTimeTextBox");

dojo.declare(
	"dojox.form.DateTextBox",
	dijit.form._DateTimeTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar

		// popupClass: String
		//  The popup widget to use. In this case, a calendar with Day, Month and Year views.
		popupClass: "dojox.widget.Calendar",
		_selector: "date",

		openDropDown: function(){
			this.inherited(arguments);
			dojo.style(this.dropDown.domNode.parentNode, "position", "absolute");
		}
	}
);


dojo.declare(
	"dojox.form.DayTextBox",
	dojox.form.DateTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains just months.

		// popupClass: String
		//  The popup widget to use. In this case, a calendar with just a Month view.
		popupClass: "dojox.widget.DailyCalendar",

		parse: function(displayVal){
			return displayVal;
		},

		format: function(value){
			return value.getDate ? value.getDate() : value;
		},
		validator: function(value) {
			var num = Number(value);
			var isInt = /(^-?\d\d*$)/.test(String(value));
			return value == "" || value == null || (isInt && num >= 1 && num <= 31);
		},

		_setValueAttr: function(value, priorityChange, formattedValue){
			if(value){
				if(value.getDate){
					value = value.getDate();
				}
			}
			dijit.form.TextBox.prototype._setValueAttr.call(this, value, priorityChange, formattedValue);
		},

		openDropDown: function(){
			this.inherited(arguments);

			this.dropDown.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				setTimeout(dojo.hitch(this, "closeDropDown"), 1); // allow focus time to take

				dijit.form.TextBox.prototype._setValueAttr.call(this, String(value.getDate()), true, String(value.getDate()));
			});
		}
	}
);

dojo.declare(
	"dojox.form.MonthTextBox",
	dojox.form.DateTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains only years

		// popupClass: String
		//  The popup widget to use. In this case, a calendar with just a Year view.
		popupClass: "dojox.widget.MonthlyCalendar",

		selector: "date",

		postMixInProperties: function(){
			this.inherited(arguments);
			this.constraints.datePattern = "MM";
		},

		format: function(value) {
			if(!value && value !== 0){
				return 1;
			}
			if(value.getMonth){
				return value.getMonth() + 1;
			}
			return Number(value) + 1;
		},

		parse: function(value, constraints){
			return Number(value) - 1;
		},

		serialize: function(value, constraints) {
			return String(value);
		},

		validator: function(value) {
			var num = Number(value);
			var isInt = /(^-?\d\d*$)/.test(String(value));
			return value == "" || value == null || (isInt && num >= 1 && num <= 12);
		},

		_setValueAttr: function(value, priorityChange, formattedValue){
			if(value){
				if(value.getMonth){
					value = value.getMonth();
				}
			}
			dijit.form.TextBox.prototype._setValueAttr.call(this, value, priorityChange, formattedValue);
		},

		openDropDown: function(){
			this.inherited(arguments);

			this.dropDown.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				setTimeout(dojo.hitch(this, "closeDropDown"), 1); // allow focus time to take
				dijit.form.TextBox.prototype._setValueAttr.call(this, value, true, value);
			});
		}
	}
);


dojo.declare(
	"dojox.form.YearTextBox",
	dojox.form.DateTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains only years

		popupClass: "dojox.widget.YearlyCalendar",

		format: function(value) {
			console.log('Year format ' + value);
			if (typeof value == "string"){
				return value;
			}
			else if (value.getFullYear){
				return value.getFullYear();
			}
			return value;
		},

		validator: function(value) {
			return value == "" || value == null || /(^-?\d\d*$)/.test(String(value));
		},

		_setValueAttr: function(value, priorityChange, formattedValue){
			if(value){
				if(value.getFullYear){
					value = value.getFullYear();
				}
			}
			dijit.form.TextBox.prototype._setValueAttr.call(this, value, priorityChange, formattedValue);
		},

		openDropDown: function(){
			this.inherited(arguments);
			console.log('yearly openDropDown and value = ' + this.get('value'));

			this.dropDown.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				setTimeout(dojo.hitch(this, "closeDropDown"), 1); // allow focus time to take
				dijit.form.TextBox.prototype._setValueAttr.call(this,value, true, value);
			});
		},

		parse: function(/*String*/value, /*dojo.date.locale.__FormatOptions*/constraints) {
			return value || (this._isEmpty(value) ? null : undefined); // Date
		},

		filter: function(val) {
			if (val && val.getFullYear){
				return val.getFullYear().toString();
			}
			return this.inherited(arguments);
		}
	}
);
