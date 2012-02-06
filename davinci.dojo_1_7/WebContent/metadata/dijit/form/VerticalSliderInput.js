define(
[
	"dojo/_base/declare", 
	"./HorizontalSliderInput", 
	"dijit/form/VerticalSlider", 
	"dijit/form/VerticalRule", 
	"dijit/form/VerticalRuleLabels",
	"dojo/i18n!../nls/dijit"
],
function(declare, HorizontalSliderInput, VerticalSlider, VerticalRule, VerticalRuleLabels, langObj) {

return declare("davinci.libraries.dojo.dijit.form.VerticalSliderInput", HorizontalSliderInput, {	
	
	_getDialogTitle: function() {
		return langObj.verticalSliderDialog;
	},
	
	_getDialogDimensions: function() {
		return { 
			"width": 550,
			"height": 350
		};
	},
	
	_getWidgetTypeForSlider: function() {
		return "dijit.form.VerticalSlider";
	},
	
	_getWidgetStyleForSlider: function() {
		return "height: 200px;";
	},
	
	_getWidgetTypeForRule: function() {
		return "dijit.form.VerticalRule";
	},
	
	_getWidgetTypeForRuleLabels: function() {
		return "dijit.form.VerticalRuleLabels";
	},
	
	_getPropertiesForNewChildData: function(type) {
		var props = null;
		if (type === this._getWidgetTypeForRule()) {
			props = {
				"style": "width:5px;",
				"container": "rightDecoration"
			};
		} else {
			props = {
				"container": "rightDecoration",
				"style": "width:3em;",
			};
		}
		return props;
	},
	

	_getContainerOptions: function() {
		return [
			"rightDecoration", "leftDecoration"
		];
	}
});
});