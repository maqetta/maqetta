dojo.provide("davinci.ve.prefs.HTMLEditPreferences");

dojo.require("davinci.workbench.PreferencePane");
dojo.require("dijit.form.CheckBox");


dojo.declare("davinci.ve.prefs.HTMLEditPreferences",davinci.workbench.PreferencePane, {

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
		"<tr><td>${_loc.flowLayout}:</td><td><div dojoAttachPoint='flowBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.snapToGrid}:</td><td><div dojoAttachPoint='snapBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.showGrid}:</td><td><div dojoAttachPoint='showBoxNode'></div></td></tr>" +
		"<tr><td>Warn on CSS Override:</td><td><div dojoAttachPoint='cssOverrideWarn'></div></td></tr>" +
		"</tbody></table></div>",

	postMixInProperties: function(){
		this._loc = dojo.i18n.getLocalization("davinci.ve", "common");
	},	

	postCreate: function(){
		this._flowBox = new dijit.form.CheckBox({}, this.flowBoxNode);
		this._snapBox = new dijit.form.CheckBox({}, this.snapBoxNode);
		this._showBox = new dijit.form.CheckBox({}, this.showBoxNode);
		this._cssOverrideWarn = new dijit.form.CheckBox({}, this.cssOverrideWarn);
		
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},

	setPreferences: function(preferences){
		preferences = (preferences || {});
		this._check(this._flowBox, !!preferences.flowLayout);
		this._check(this._snapBox, !!preferences.snapToLayoutGrid);
		this._check(this._showBox, !!preferences.showLayoutGrid);
		this._check(this._cssOverrideWarn, !!preferences.cssOverrideWarn);
	},

	getPreferences: function(){
		var preferences = {
			flowLayout: this._flowBox.checked,
			snapToLayoutGrid: this._snapBox.checked,
			showLayoutGrid: this._showBox.checked,
			cssOverrideWarn: this._cssOverrideWarn.checked
		};
		return preferences;
	},

	_check: function(widget, checked){
		if (widget.attr) {//dojo1.2
			widget.attr("checked", checked);
		}else {
			widget.setAttribute("checked", checked)
		}
	}

});
