define([
	"dojo/_base/lang",
	"dojo/_base/window"
], function(lang, win){

	// module:
	//		dojox/mobile/_PickerChooser
	// summary:
	//		This widget chooses a picker class according to the current theme.
	//		Returns ValuePicker-based date/time picker when the current theme is "android".
	//		Returns SpinWheel-based date/time picker otherwise.

	return{
		load: function (id, parentRequire, loaded){
			var dm = win.global._no_dojo_dm || lang.getObject("dojox.mobile", true);
			parentRequire([(dm.currentTheme === "android" ? "./ValuePicker" : "./SpinWheel") + id], loaded);
		}
	};
});
