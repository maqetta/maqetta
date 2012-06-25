define("dojox/widget/CalendarFx", [
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojox/widget/CalendarFisheye",
	"dojox/widget/_FisheyeFX",
], function(kernel, declare, CalendarFisheye, _FisheyeFX){
	kernel.experimental("dojox/widget/CalendarFx");
	// summary:
	//		The Root class for Calendar effects
	return declare("dojox.widget.CalendarFx", [CalendarFisheye, _FisheyeFX], {
		// summary:
		//	The visual effects extensions for dojox/widget/Calendar.
	});
});