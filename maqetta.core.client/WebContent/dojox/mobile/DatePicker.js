define([
	"dojo/_base/lang",
	"./_PickerChooser!DatePicker"
], function(lang, DatePicker){

	// module:
	//		dojox/mobile/DatePicker
	// summary:
	//		A wrapper widget around SpinWheelDatePicker or ValuePickerDatePicker.
	//		Returns ValuePickerDatePicker when the current theme is "android".
	//		Returns SpinWheelDatePicker otherwise.

	return lang.setObject("dojox.mobile.DatePicker", DatePicker);
});
