define([
	"dojo/_base/lang",
	"./_PickerChooser!TimePicker"
], function(lang, TimePicker){

	// module:
	//		dojox/mobile/TimePicker
	// summary:
	//		A wrapper widget around SpinWheelTimePicker or ValuePickerTimePicker.
	//		Returns ValuePickerTimePicker when the current theme is "android".
	//		Returns SpinWheelTimePicker otherwise.

	return lang.setObject("dojox.mobile.TimePicker", TimePicker);
});
