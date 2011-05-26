define([
	"dojo",
	"..",
	"./HorizontalSlider",
	"./VerticalSlider",
	"./HorizontalRule",
	"./VerticalRule",
	"./HorizontalRuleLabels",
	"./VerticalRuleLabels"], function(dojo, dijit){

	// module:
	//		dijit/form/Slider
	// summary:
	//		Rollup of all the the Slider related widgets
	//		For back-compat, remove for 2.0

	dojo.deprecated("Call require() for HorizontalSlider / VerticalRule, explicitly rather than 'dijit.form.Slider' itself", "", "2.0");

	return dijit.form.HorizontalSlider;
});
