define("dojox/widget/CalendarFisheye", [
	"dojo/_base/declare",
	"dojox/widget/Calendar",
	"dojox/widget/_FisheyeFX"
], function(declare, Calendar, _FisheyeFX) {
	return declare("dojox.widget.CalendarFisheye", [ Calendar, _FisheyeFX ], {
		// summary: The standard Calendar. It includes day, month and year views.
		//  FisheyeLite effects are included.
	})
})