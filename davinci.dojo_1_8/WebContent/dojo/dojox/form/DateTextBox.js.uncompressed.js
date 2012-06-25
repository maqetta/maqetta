define("dojox/form/DateTextBox", [
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojox/widget/Calendar",
	"dojox/widget/CalendarViews",
	"dijit/form/_DateTimeTextBox",
	"dijit/form/TextBox",
	"dojo/_base/declare"
	], function(kernel, lang, domStyle, Calendar, CalendarViews, _DateTimeTextBox, 
		TextBox, declare){
	kernel.experimental("dojox/form/DateTextBox");
	return declare( "dojox.form.DateTextBox", [Calendar, _DateTimeTextBox, TextBox],
		{
			// summary:
			//		A validating, serializable, range-bound date text box with a popup calendar

			// popupClass: String
			//  	The popup widget to use. In this case, a calendar with Day, Month and Year views.
			popupClass: "dojox/widget/Calendar",

			_selector: "date",

			openDropDown: function(){
				this.inherited(arguments);
				domStyle.set(this.dropDown.domNode.parentNode, "position", "absolute");
			}
		}
	);
});
