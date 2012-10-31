define([
    "dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"dijit/form/CheckBox",
	"dijit/form/TextBox",
	"dojo/i18n!../nls/common"
], function(declare, ContentPane, TemplatedMixin, CheckBox, TextBox, commonNls) {

return declare([ContentPane, TemplatedMixin], {

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
		//"<tr><td>${_loc.flowLayout}:</td><td><div dojoAttachPoint='flowBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.snapToNearestWidget}:</td><td><div dojoAttachPoint='snapNode'></div></td></tr>" +
		"<tr><td>${_loc.showPossibleParents}:</td><td><div dojoAttachPoint='showPossibleParentsNode'></div></td></tr>" +
		"<tr><td>${_loc.warnOnCSSOverride}:</td><td><div dojoAttachPoint='cssOverrideWarn'></div></td></tr>" +
		"<tr><td>${_loc.absoluteWidgetsZindex}:</td><td><div dojoAttachPoint='absoluteWidgetsZindex'></div></td></tr>" +
		"<tr><td>${_loc.zazl}:</td><td><div dojoAttachPoint='zazl'></div></td></tr>" +
		"</tbody></table></div>",

	postMixInProperties: function(){
		this._loc = commonNls;
	},	

	postCreate: function(){
		//this._flowBox = new CheckBox({}, this.flowBoxNode);
		this._snap = new CheckBox({}, this.snapNode);
		this._showPossibleParents = new CheckBox({}, this.showPossibleParentsNode);
		this._cssOverrideWarn = new CheckBox({}, this.cssOverrideWarn);
		this._absoluteWidgetsZindex = new TextBox({}, this.absoluteWidgetsZindex);
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
