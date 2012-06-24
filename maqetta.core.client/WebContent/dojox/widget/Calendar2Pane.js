define([
	"dojo/_base/declare",
	"dojox/widget/_CalendarBase",
	"dojox/widget/_CalendarDay",
	"dojox/widget/_CalendarMonthYear"
	], function(declare, _CalendarBase, _CalendarDay, _CalendarMonthYear){
		return declare("dojox.widget.Calendar2Pane", [_CalendarBase, _CalendarDay, _CalendarMonthYear], {
			// summary:
			//	A Calendar with two panes, the second one containing both month and year
	});
});
