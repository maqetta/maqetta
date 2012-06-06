define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojox/widget/_CalendarBase",
	"dojox/widget/_CalendarDay",
	"dojox/widget/_CalendarMonthYear"
], function(kernel, declare, _CalendarBase, _CalendarDay, _CalendarMonthYear){
	kernel.experimental("dojox/widget/Calendar");
	// summary:
	//		The Root class for all _Calendar extensions
	return declare("dojox.widget.Calendar", [_CalendarBase, _CalendarDay, _CalendarMonthYear], {
		// summary:
		//	The standard Calendar. It includes day and month/year views.
		//	No visual effects are included.
	});
});
