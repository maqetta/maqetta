dojo.provide("davinci.libraries.dojo.dijit.CalendarInput");
dojo.require("davinci.ve.input.SmartInput");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dijit", "dijit");

dojo.declare("davinci.libraries.dojo.dijit.CalendarInput", davinci.ve.input.SmartInput, {


	property: "value",
	supportsHTML: "false",
	displayOnCreate: "false",
	helpText: "",
	
	constructor : function() {
		var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dijit", "dijit");
		this.helpText = langObj.calendarInputHelp;
	},
	
	serialize: function(widget, updateEditBoxValue, value) {
		// TODO: Add code to simplify the initial text
	   // don't use the udateEditBoxValue function that is passed in use our local override.
		this.updateEditBoxValue(value); 
	},
	
	parse: function(input) {
		var date = new Date(input);
		return date;
	},
	
	updateEditBoxValue: function(value){
		this._inline.style.display = "block";
		//this._inline.eb.attr('value', String(value));
		this.setFormat(value);
//		var customMap = [
//		                  ["\u0026","amp"], 
//		                  ["\u0022","quot"],
//		                  ["\u003C","lt"], 
//		                  ["\u003E","gt"]/*,
//		                  ["\u00A0","nbsp"]*/
//	                     ]; 
//		value = dojox.html.entities.decode(value, customMap);
		this._inline.eb.attr('value', String(value));
		this.updateFormats();
		this.help(false);  // first time, don't display help but resize as needed
		dijit.selectInputText(this._inline.eb.textbox);
		this.updateSimStyle();
	}
});