define([
	"dojo/_base/declare",
	"dojox/widget/_CalendarBase",
	"dojox/widget/_CalendarMonthYear"
], function(declare, _CalendarBase, _CalendarMonthYear){
	return declare("dojox.widget.MonthAndYearlyCalendar", [_CalendarBase, _CalendarMonthYear], {
		// summary: A calendar withonly a daily view.
	});
});

