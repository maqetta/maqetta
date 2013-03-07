define([
    "dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"dijit/form/CheckBox",
	"dijit/form/TextBox",
	"dijit/form/Select",
	"dojo/i18n!../nls/common",
	"dojo/text!./HtmlEditPreferences.html"
], function(
	declare,
	ContentPane,
	TemplatedMixin,
	CheckBox,
	TextBox,
	Select,
	commonNls,
	templateString
) {

return declare([ContentPane, TemplatedMixin], {

	templateString: templateString,

	postMixInProperties: function(){
		this._loc = commonNls;
	},	

	postCreate: function(){
		//this._flowBox = new CheckBox({}, this.flowBoxNode);
		this._snap = new CheckBox({}, this.snapNode);
		this._showPossibleParents = new CheckBox({}, this.showPossibleParentsNode);
		this._cssOverrideWarn = new CheckBox({}, this.cssOverrideWarn);
		this._absoluteWidgetsZindex = new TextBox({}, this.absoluteWidgetsZindex);
/*FIXME: Disabled for now. Ultimately, UI for this option should go to widget palette
		this._widgetPaletteLayout = new Select({
			options:[
				{ label:commonNls.widgetPaletteShow_Icons,  value:'icons' },
				{ label:commonNls.widgetPaletteShow_List,  value:'list' }
			]
		}, this.widgetPaletteLayout);
*/
		this._zazl = new CheckBox({}, this.zazl);
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},

	getDefaults: function () {
	},
	
	setDefaults: function () {
	},
	
	doApply: function () {
	},
	
	getPreferences: function(){
		return {
			//flowLayout: this._flowBox.checked,
			snap: this._snap.checked,
			showPossibleParents: this._showPossibleParents.checked,
			cssOverrideWarn: this._cssOverrideWarn.checked,
			absoluteWidgetsZindex: this._absoluteWidgetsZindex.value,
/*FIXME: Disabled for now. Ultimately, UI for this option should go to widget palette
			widgetPaletteLayout: this._widgetPaletteLayout.value,
*/
			zazl: this._zazl.checked
		};
	},

	setPreferences: function(preferences){
		preferences = preferences || {};
		//this._check(this._flowBox, !!preferences.flowLayout);
		this._check(this._snap, !!preferences.snap);
		this._check(this._showPossibleParents, !!preferences.showPossibleParents);
		this._check(this._cssOverrideWarn, !!preferences.cssOverrideWarn);
		this._absoluteWidgetsZindex.set("value", preferences.absoluteWidgetsZindex);
/*FIXME: Disabled for now. Ultimately, UI for this option should go to widget palette
		this._widgetPaletteLayout.set("value", preferences.widgetPaletteLayout);
*/
		this._check(this._zazl, !!preferences.zazl);
	},

	_check: function(widget, checked){
		widget.set("checked", checked);
	},
	
	save: function(prefs){
		davinci.ve._preferences = prefs; //FIXME: missing dependency
	}
});
});
