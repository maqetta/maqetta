define([
	"dojo/_base/kernel", // dojo.deprecated
	".",
	"dojo/date",
	"dojo/date/locale",
	"./CalendarLite",
	"./_CssStateMixin",
	"./hccss",
	"./form/DropDownButton",
	"dojo/_base/array", // dojo.map
	"dojo/_base/connect", // dojo.keys
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/event", // dojo.stopEvent
	"dojo/_base/html", // dojo.addClass dojo.attr dojo.hasClass dojo.removeClass dojo.toggleClass
	"dojo/_base/lang", // dojo.hitch
	"dojo/_base/sniff" // dojo.isIE
], function(dojo, dijit){

	// module:
	//		dijit/Calendar
	// summary:
	//		A simple GUI for choosing a date in the context of a monthly calendar.

	dojo.declare("dijit.Calendar", [dijit.CalendarLite, dijit._CssStateMixin], {
		// summary:
		//		A simple GUI for choosing a date in the context of a monthly calendar.
		//
		// description:
		//		See CalendarLite for general description.   Calendar extends CalendarLite, adding:
		//			- month drop down list
		//			- keyboard navigation
		//			- CSS classes for hover/mousepress on date, month, and year nodes
		//			- support of deprecated methods (will be removed in 2.0)

		// Set node classes for various mouse events, see dijit._CssStateMixin for more details
		cssStateNodes: {
			"decrementMonth": "dijitCalendarArrow",
			"incrementMonth": "dijitCalendarArrow",
			"previousYearLabelNode": "dijitCalendarPreviousYear",
			"nextYearLabelNode": "dijitCalendarNextYear"
		},

		setValue: function(/*Date*/ value){
			// summary:
			//      Deprecated.   Use set('value', ...) instead.
			// tags:
			//      deprecated
			dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
			this.set('value', value);
		},

		_createMonthWidget: function(){
			// summary:
			//		Creates the drop down button that displays the current month and lets user pick a new one

			return new dijit.Calendar._MonthDropDownButton({
				id: this.id + "_mddb",
				tabIndex: -1,
				onMonthSelect: dojo.hitch(this, "_onMonthSelect"),
				lang: this.lang,
				dateLocaleModule: this.dateLocaleModule
			}, this.monthNode);
		},

		buildRendering: function(){
			this.inherited(arguments);

			// Events specific to Calendar, not used in CalendarLite
			this.connect(this.domNode, "onkeypress", "_onKeyPress");
			this.connect(this.dateRowsNode, "onmouseover", "_onDayMouseOver");
			this.connect(this.dateRowsNode, "onmouseout", "_onDayMouseOut");
			this.connect(this.dateRowsNode, "onmousedown", "_onDayMouseDown");
			this.connect(this.dateRowsNode, "onmouseup", "_onDayMouseUp");
		},

		_onDayMouseOver: function(/*Event*/ evt){
			// summary:
			//      Handler for mouse over events on days, sets hovered style
			// tags:
			//      protected

			// event can occur on <td> or the <span> inside the td,
			// set node to the <td>.
			var node =
				dojo.hasClass(evt.target, "dijitCalendarDateLabel") ?
				evt.target.parentNode :
				evt.target;

			if(node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode) ){
				dojo.addClass(node, "dijitCalendarHoveredDate");
				this._currentNode = node;
			}
		},

		_onDayMouseOut: function(/*Event*/ evt){
			// summary:
			//      Handler for mouse out events on days, clears hovered style
			// tags:
			//      protected

			if(!this._currentNode){ return; }

			// if mouse out occurs moving from <td> to <span> inside <td>, ignore it
			if(evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode){ return; }
			var cls = "dijitCalendarHoveredDate";
			if(dojo.hasClass(this._currentNode, "dijitCalendarActiveDate")){
				cls += " dijitCalendarActiveDate";
			}
			dojo.removeClass(this._currentNode, cls);
			this._currentNode = null;
		},

		_onDayMouseDown: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue){
				dojo.addClass(node, "dijitCalendarActiveDate");
				this._currentNode = node;
			}
		},

		_onDayMouseUp: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue){
				dojo.removeClass(node, "dijitCalendarActiveDate");
			}
		},

		handleKey: function(/*Event*/ evt){
			// summary:
			//		Provides keyboard navigation of calendar.
			// description:
			//		Called from _onKeyPress() to handle keypress on a stand alone Calendar,
			//		and also from `dijit.form._DateTimeTextBox` to pass a keypress event
			//		from the `dijit.form.DateTextBox` to be handled in this widget
			// returns:
			//		False if the key was recognized as a navigation key,
			//		to indicate that the event was handled by Calendar and shouldn't be propogated
			// tags:
			//		protected
			var dk = dojo.keys,
				increment = -1,
				interval,
				newValue = this.currentFocus;
			switch(evt.charOrCode){
				case dk.RIGHT_ARROW:
					increment = 1;
					//fallthrough...
				case dk.LEFT_ARROW:
					interval = "day";
					if(!this.isLeftToRight()){ increment *= -1; }
					break;
				case dk.DOWN_ARROW:
					increment = 1;
					//fallthrough...
				case dk.UP_ARROW:
					interval = "week";
					break;
				case dk.PAGE_DOWN:
					increment = 1;
					//fallthrough...
				case dk.PAGE_UP:
					interval = evt.ctrlKey || evt.altKey ? "year" : "month";
					break;
				case dk.END:
					// go to the next month
					newValue = this.dateFuncObj.add(newValue, "month", 1);
					// subtract a day from the result when we're done
					interval = "day";
					//fallthrough...
				case dk.HOME:
					newValue = new this.dateClassObj(newValue);
					newValue.setDate(1);
					break;
				case dk.ENTER:
				case " ":
					this.set("value", this.currentFocus);
					break;
				default:
					return true;
			}

			if(interval){
				newValue = this.dateFuncObj.add(newValue, interval, increment);
			}

			this._setCurrentFocusAttr(newValue);

			return false;
		},

		_onKeyPress: function(/*Event*/ evt){
			// summary:
			//		For handling keypress events on a stand alone calendar
			if(!this.handleKey(evt)){
				dojo.stopEvent(evt);
			}
		},

		onValueSelected: function(/*Date*/ date){
			// summary:
			//		Deprecated.   Notification that a date cell was selected.  It may be the same as the previous value.
			// description:
			//      Formerly used by `dijit.form._DateTimeTextBox` (and thus `dijit.form.DateTextBox`)
			//      to get notification when the user has clicked a date.  Now onExecute() (above) is used.
			// tags:
			//      protected
		},
		onChange: function(value){
			this.onValueSelected(value);	// remove in 2.0
		},

		getClassForDate: function(/*Date*/ dateObject, /*String?*/ locale){
			// summary:
			//		May be overridden to return CSS classes to associate with the date entry for the given dateObject,
			//		for example to indicate a holiday in specified locale.
			// tags:
			//      extension

/*=====
			return ""; // String
=====*/
		}
	});

	dojo.declare("dijit.Calendar._MonthDropDownButton", dijit.form.DropDownButton, {
		// summary:
		//		DropDownButton for the current month.    Displays name of current month
		//		and a list of month names in the drop down

		onMonthSelect: function(){ },

		postCreate: function(){
			this.inherited(arguments);
			this.dropDown = new dijit.Calendar._MonthDropDown({
				id: this.id + "_mdd",
				onChange: this.onMonthSelect
			});
		},
		_setMonthAttr: function(month){
			// summary:
			//		Set the current month to display as a label
			var monthNames = this.dateLocaleModule.getNames('months', 'wide', 'standAlone', this.lang, month);
			this.dropDown.set("months", monthNames);

			// Set name of current month and also fill in spacer element with all the month names
			// (invisible) so that the maximum width will affect layout.   But not on IE6 because then
			// the center <TH> overlaps the right <TH> (due to a browser bug).
			this.containerNode.innerHTML =
				(dojo.isIE == 6 ? "" : "<div class='dijitSpacer'>" + this.dropDown.domNode.innerHTML + "</div>") +
				"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" +  monthNames[month.getMonth()] + "</div>";
		}
	});

	dojo.declare("dijit.Calendar._MonthDropDown", [dijit._Widget, dijit._TemplatedMixin], {
		// summary:
		//		The list-of-months drop down from the MonthDropDownButton

		// months: String[]
		//		List of names of months, possibly w/some undefined entries for Hebrew leap months
		//		(ex: ["January", "February", undefined, "April", ...])
		months: [],

		templateString: "<div class='dijitCalendarMonthMenu dijitMenu' " +
			"dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",

		_setMonthsAttr: function(/*String[]*/ months){
			this.domNode.innerHTML = dojo.map(months, function(month, idx){
					return month ? "<div class='dijitCalendarMonthLabel' month='" + idx +"'>" + month + "</div>" : "";
				}).join("");
		},

		_onClick: function(/*Event*/ evt){
			this.onChange(dojo.attr(evt.target, "month"));
		},

		onChange: function(/*Number*/ month){
			// summary:
			//		Callback when month is selected from drop down
		},

		_onMenuHover: function(evt){
			dojo.toggleClass(evt.target, "dijitCalendarMonthLabelHover", evt.type == "mouseover");
		}
	});

	return dijit.Calendar;
});
