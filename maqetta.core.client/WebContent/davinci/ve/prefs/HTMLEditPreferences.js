define([
    "dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"dijit/form/CheckBox",
	"dojo/i18n!davinci/ve/nls/common"
], function(declare, ContentPane, TemplatedMixin, CheckBox, commonNls) {

return declare("davinci.ve.prefs.HTMLEditPreferences", [ContentPane, TemplatedMixin], {

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
		//"<tr><td>${_loc.flowLayout}:</td><td><div dojoAttachPoint='flowBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.snapToNearestWidget}:</td><td><div dojoAttachPoint='snapNode'></div></td></tr>" +
		"<tr><td>${_loc.showPossibleParents}:</td><td><div dojoAttachPoint='showPossibleParentsNode'></div></td></tr>" +
		"<tr><td>${_loc.warnOnCSSOverride}:</td><td><div dojoAttachPoint='cssOverrideWarn'></div></td></tr>" +
		"</tbody></table></div>",

	postMixInProperties: function(){
		this._loc = commonNls;
	},	

	postCreate: function(){
		//this._flowBox = new CheckBox({}, this.flowBoxNode);
		this._snap = new CheckBox({}, this.snapNode);
		this._showPossibleParents = new CheckBox({}, this.showPossibleParentsNode);
		this._cssOverrideWarn = new CheckBox({}, this.cssOverrideWarn);
		
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
		var preferences = {
			//flowLayout: this._flowBox.checked,
			snap: this._snap.checked,
			showPossibleParents: this._showPossibleParents.checked,
			cssOverrideWarn: this._cssOverrideWarn.checked
		};
		return preferences;
	},

	setPreferences: function(preferences){
		preferences = (preferences || {});
		//this._check(this._flowBox, !!preferences.flowLayout);
		this._check(this._snap, !!preferences.snap);
		this._check(this._showPossibleParents, !!preferences.showPossibleParents);
		this._check(this._cssOverrideWarn, !!preferences.cssOverrideWarn);
	},

	_check: function(widget, checked){
		widget.set("checked", checked);
	},
	
	save: function(prefs){
		davinci.ve._preferences = prefs; //FIXME: missing dependency
	}

});
});
